import { Component, inject } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout.service';
import { MatRadioModule } from '@angular/material/radio';
import { CurrencyPipe } from '@angular/common';
import { StripeService } from '../../../core/services/stripe.service';
import { CartService } from '../../../core/services/cart.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DeliveryMethod } from '../../../shared/models/deliveryMethod';

@Component({
  selector: 'app-checkout-delivery',
  imports: [MatRadioModule, CurrencyPipe, FormsModule],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.scss',
})
export class CheckoutDeliveryComponent {
  checkoutService = inject(CheckoutService);
  private stripeService = inject(StripeService);
  cartService = inject(CartService);

  deliveryMethods = toSignal(this.checkoutService.getDeliveryMethods(), { initialValue: [] });

  async updateDeliveryMethod(method: DeliveryMethod) {
    this.cartService.selectedDelivery.set(method);
     const cart = this.cartService.cart();
     if (cart){
      cart.deliveryMethodId = method.id;
      this.cartService.setCart(cart);
     }

    // this.cartService.cart.set({
    //   ...cart,
    //   deliveryMethodId: method.id,
    // });

    // await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
  }
}
