import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatIcon],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  item = input.required<CartItem>();
  cartService = inject(CartService);

  incrementQuantity() {
this.cartService.removeItemFromCart(this.item().productId, -1);
  }

  decrementQuantity() {
    this.cartService.removeItemFromCart(this.item().productId, 1);
  }

  removeItem() {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }
}
