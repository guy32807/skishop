import { Component, effect, inject, input } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";
import { CurrencyPipe } from '@angular/common';
import { MatDivider } from "@angular/material/divider";
import { RouterLink } from '@angular/router';
import { MatAnchor } from "@angular/material/button";
import { MatFormField, MatLabel } from "@angular/material/select";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-product-details',
  imports: [MatProgressSpinner, MatIcon, CurrencyPipe, MatDivider, RouterLink, MatAnchor, MatFormField, MatLabel, MatInput],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent {
  private shopService = inject(ShopService);
  id = input.required<string>();
  productResource = this.shopService.productDetailResource;
  constructor() {
    effect(() => {
      this.shopService.selectedProductId.set(this.id());
    });
  }
}
