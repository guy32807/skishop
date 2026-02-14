import { Component, inject, input, resource } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../shared/models/order';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymentPipe } from '../../../shared/pipes/payment-pipe';

@Component({
  selector: 'app-order-details',
  imports: [CurrencyPipe, DatePipe, MatProgressSpinner,  PaymentPipe, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent {
  private orderService = inject(OrderService);
  order?: Order;
  id = input.required<string>();

  orderResource = resource({
  loader: async () => {
    const orderId = this.id(); 
    return await lastValueFrom(this.orderService.getOrderDetails(+orderId));
  }
});
}
