import { Component, DestroyRef, effect, ElementRef, inject, viewChild } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-checkout',
  imports: [OrderSummaryComponent, MatStepperModule, RouterLink, MatAnchor],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private stripeService = inject(StripeService);
  private snackBar = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);
  addressElement?: StripeAddressElement;
  addressElementRef = viewChild.required<ElementRef>('addressElementContainer');

  constructor() {
    effect(async () => {
      const container = this.addressElementRef().nativeElement;

      try {
        const addressElement = await this.stripeService.createAddressElement();
    
        if (container && container.innerHTML ==='') {
          addressElement.mount(container);
        }
      } catch (error: any) {
        this.snackBar.error(error.message || 'Failed to load address element');
      }
    });
    this.destroyRef.onDestroy(() => {
      this.stripeService.disposeElements();
    })
  }
}
