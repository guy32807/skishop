import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map } from 'rxjs';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';
import { CheckoutService } from './checkout.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
   private checkoutService = inject(CheckoutService);
  cart = signal<Cart | null>(null);
  discount = signal<number>(0);
  selectedDelivery = signal<DeliveryMethod | null>(null);
  deliveryMethods = toSignal(this.checkoutService.getDeliveryMethods(), { initialValue: [] });

  itemCount = computed(() => {
    const cart = this.cart();
    return cart?.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  });

  totals = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();
    if (!cart) return null;
    const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

    const shipping = delivery ? delivery.price : 0;
    const discountAmount = this.discount();
    const tax = (subtotal + shipping - discountAmount) * 0.08; // 8% tax
    const total = subtotal + shipping + tax - discountAmount;
    return { 
      subtotal: cart.items.reduce((s, i) => s + (i.price * i.quantity), 0),
    shipping: this.selectedDelivery()?.price ?? 0,
    tax: (cart.tax ?? 0) / 100, 
    total: (cart.total ?? 0) / 100
     };
  });

  applyDiscount(discountCode: string) {
    // Replace with actual API call
    if (discountCode === 'SAVE10') {
      this.discount.set(10);
    } else if (discountCode === 'SAVE20') {
      this.discount.set(20);
    } else {
      this.discount.set(0);
    }
  }

  setCart(cart: Cart) {
    this.cart.set(cart); 
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: (updatedCart) => {
        this.cart.set(updatedCart); 
      },
      error: (error) => {
        console.error('Error updating cart:', error);
      },
    });
  }

  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map((cart) => {
        this.cart.set(cart);
        return cart;
      }),
    );
  }

  clearCart() {
    return this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        this.cart.set(null);
        this.discount.set(0);
        localStorage.removeItem('cartId');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });
  }

  addItemToCart(product: Product, quantity: number = 1) {
    const item: CartItem = this.mapProductToCartItem(product);
    const cart = this.cart() ?? this.createCart();

    const existingItem = cart.items.find((x) => x.productId === product.id);

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      item.quantity = quantity;
      cart.items.push(item);
    }

    return this.setCart(cart);
  }

  removeItemFromCart(productId: number, quantity?: number) {
    const cart = this.cart();
    if (!cart) return;

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

    // If quantity not provided, remove completely
    if (quantity === undefined) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else if (item.quantity > quantity) {
      cart.items = this.addOrUpdateItem(cart.items, item, -quantity);
    } else {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }

    if (cart.items.length === 0) {
      return this.clearCart();
    }

    // Update the signal to trigger navbar reactivity
    this.cart.set(cart);
    return this.setCart(cart);
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const existingItem = items.find((i) => i.productId === item.productId);
    if (existingItem) {
      return items.map((i) =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
      );
    }
    return [...items, { ...item, quantity }];
  }

  private createCart(): Cart {
    const newCart = new Cart();
    localStorage.setItem('cartId', newCart.id);
    return newCart;
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private mapProductToCartItem(product: Product): CartItem {
    return {
      productId: product.id,
      productName: product.name,
      quantity: 0, // This stays 0, addOrUpdateItem handles the actual quantity
      price: product.price,
      pictureUrl: product.pictureUrl,
      brand: product.brand,
      type: product.type,
    };
  }
}
