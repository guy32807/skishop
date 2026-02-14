import { Component, inject, OnInit, resource } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models/order';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-order',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent {
  orderService = inject(OrderService);

  orderResource = resource({
    loader: () => lastValueFrom(this.orderService.getOrdersForUser()),
  });
}
