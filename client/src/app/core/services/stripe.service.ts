import { inject, Injectable } from '@angular/core';
import {
  ConfirmationToken,
  loadStripe,
  Stripe,
  StripeAddressElement,
  StripeAddressElementOptions,
  StripeElements,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../../shared/models/cart';
import { CartService } from './cart.service';
import { firstValueFrom, tap } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  private stripePromise = loadStripe(environment.stripePublicKey);
  baseUrl = environment.apiUrl;

  private elements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  getStripeInstance() {
    return this.stripePromise;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();
      if (!stripe) throw new Error('Stripe has not been loaded');

      const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());

      this.elements = stripe.elements({
        clientSecret: cart.clientSecret,
        appearance: { labels: 'floating' },
      });
    }
    return this.elements;
  }

  async createAddressElement() {
    if (!this.addressElement) {
      const elements = await this.initializeElements();
      const user = this.accountService.currentUser();
      const fullName =
        user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '';
      console.log('User from stripe service', user);
      console.log('Is user null?', user, 'How about full name?', fullName);

      const options: StripeAddressElementOptions = {
        mode: 'shipping',
        defaultValues: {
          name: fullName,
          address: {
            line1: user?.address?.line1 || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            postal_code: user?.address?.postalCode || '',
            country: user?.address?.country || 'US',
          },
        },
      };
      this.addressElement = elements.create('address', options);
    }
    return this.addressElement;
  }

  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.initializeElements();
      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Element instance has not been initialized');
      }
    }
    return this.paymentElement;
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);
    if (stripe) {
      return await stripe.createConfirmationToken({ elements });
    } else {
      throw new Error('Stripe is not available');
    }
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);

    const clientSecret = this.cartService.cart()?.clientSecret;
    if (stripe && clientSecret) {
        return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: { confirmation_token: confirmationToken.id }, redirect: 'if_required'
      });
    }else{
      throw new Error('Unable to confirm.')
    }
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart.');

    return this.http
      .post<Cart>(this.baseUrl + 'payments/' + cart.id, {})
      .pipe(tap((updatedCart) => this.cartService.cart.set(updatedCart)));
  }

  disposeElements() {
    this.elements = undefined;
    this.addressElement = undefined;
    this.paymentElement = undefined;
  }
}
