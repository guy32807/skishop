import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MatAnchor } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/select";
import { CartService } from '../../../core/services/cart.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, RouterLink, MatAnchor, MatFormField, MatLabel, MatFormFieldModule, MatInputModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
 cartService = inject(CartService);
}
