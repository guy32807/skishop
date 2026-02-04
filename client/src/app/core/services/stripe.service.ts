import { inject, Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements } from '@stripe/stripe-js';
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

      const options: StripeAddressElementOptions = {
        mode: 'shipping',
        defaultValues: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          address: {
            line1: user?.address?.line1 || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            postal_code: user?.address?.zipCode || '',
            country: user?.address?.country || 'US',
          }
        }
      }
       this.addressElement = elements.create('address', options);
    }
    return this.addressElement;
  }

  // New helper for the Payment Step later
  async createPaymentElement() {
    const elements = await this.initializeElements();
    return elements.create('payment');
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart.');

    return this.http.post<Cart>(this.baseUrl + 'payments/' + cart.id, {}).pipe(
      tap((updatedCart) => this.cartService.cart.set(updatedCart))
    );
  }

  disposeElements() {
  this.elements = undefined;
  this.addressElement = undefined;
}
}
