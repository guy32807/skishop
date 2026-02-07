import { Component, inject, OnInit, output } from '@angular/core';
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
export class CheckoutDeliveryComponent implements OnInit {
  deliveryComplete = output<boolean>();
  checkoutService = inject(CheckoutService);
  private stripeService = inject(StripeService);
  cartService = inject(CartService);

  deliveryMethods = toSignal(this.checkoutService.getDeliveryMethods(), { initialValue: [] });

    ngOnInit() {
        this.checkoutService.getDeliveryMethods().subscribe({
      next: methods => {
        if (this.cartService.cart()?.deliveryMethodId) {
          const method = methods.find(d => d.id === this.cartService.cart()?.deliveryMethodId);
          if (method) {
            this.cartService.selectedDelivery.set(method);
            this.deliveryComplete.emit(true);
          }
        }
      }
    })
  }

  async updateDeliveryMethod(method: DeliveryMethod) {
    this.cartService.selectedDelivery.set(method);
     const cart = this.cartService.cart();
     if (cart){
      cart.deliveryMethodId = method.id;
      this.cartService.setCart(cart);
     }
  }
}
