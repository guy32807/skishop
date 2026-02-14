import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Order, OrderToCreate } from '../../shared/models/order';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  orders = signal<Order[]>([]);

  createOrder(orderToCreate: OrderToCreate) {
    return this.http.post<Order>(this.baseUrl + 'orders', orderToCreate);
  }

  getOrdersForUser() {
    return this.http
      .get<Order[]>(this.baseUrl + 'orders')
      .pipe(tap((orders) => this.orders.set(orders)));
  }

  getOrderDetails(id: number) {
    return this.http.get<Order>(this.baseUrl + 'orders/' + id);
  }
}
