import { Component, effect, inject, input } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [
    MatProgressSpinner,
    MatIcon,
    CurrencyPipe,
    MatDivider,
    RouterLink,
    MatAnchor,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent {
  private shopService = inject(ShopService);
 cartService = inject(CartService);
  product?: Product;
  id = input.required<any>();
  quantityInCart = 0;
  quantity = 1;
  productResource = this.shopService.productDetailResource;
  constructor() {
    effect(() => {
      this.shopService.selectedProductId.set(this.id());
          this.quantityInCart = this.cartService.cart()?.items.find(item => item.productId == this.id())?.quantity ?? 0;
    this.quantity = this.quantityInCart > 0 ? this.quantityInCart : 1;   
    });
  }

updateCart() {
  const product = this.productResource.value(); 
  if (product) {
    this.cartService.addItemToCart(product, this.quantity);
  }
}

  updateQuantityInCart() {
    this.quantityInCart = this.cartService.cart()?.items.find(item => item.productId == this.id())?.quantity ?? 0;
    this.quantity = this.quantityInCart > 0 ? this.quantityInCart : 1;
  }

  getButtonText(){
    return this.quantityInCart > 0 ? 'Update cart' : 'Add to cart';
  }
}
