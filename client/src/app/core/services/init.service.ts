import { inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { forkJoin, of } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService = inject(CartService);
  private accountService = inject(AccountService);

  init(){
    const cartId = localStorage.getItem('cartId');
    return cartId ? this.cartService.getCart(cartId) : of(null);
  }
}
