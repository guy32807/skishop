import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatAnchor,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private stripeService = inject(StripeService);
  private snackBar = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  addressElement?: StripeAddressElement;
  addressElementRef = viewChild.required<ElementRef>('addressElementContainer');
  saveAddress = false;
  savingAddress = signal(false);
  addressComplete = signal(false);

  constructor() {
    effect(async () => {
      const user = this.accountService.currentUser(); 
      const container = this.addressElementRef().nativeElement;
      if (!user || !container) return;

      try {
        this.addressElement = await this.stripeService.createAddressElement();
        if (container.innerHTML === '') {
          this.addressElement.mount(container);
          this.addressElement.on('change', (event) => this.addressComplete.set(event.complete));
        }
      } catch (error: any) {
        this.snackBar.error(error.message);
      }
    });
    this.destroyRef.onDestroy(() => {
      this.stripeService.disposeElements();
    });
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripe();
        address && firstValueFrom(this.accountService.updateUserAddress(address));
      }
    }
    if(event.selectedIndex === 2){
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent())
    }
  }

  async onSaveAddress() {
    const address = await this.getAddressFromStripe();
    if (!address) return;

    this.savingAddress.set(true);

    try {
      await firstValueFrom(this.accountService.updateUserAddress(address));
      this.snackBar.success('Address saved to profile');
    } catch (error) {
      this.snackBar.error('Failed to save address');
    } finally {
      this.savingAddress.set(false);
    }
  }

  private async getAddressFromStripe(): Promise<Address | null> {
    const result = await this.addressElement?.getValue();

    if (!result || !result.value || !result.value.address) return null;
    const address = result?.value.address;
    const fullName = result?.value.name || '';

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    if (address) {
      return {
        firstName,
        lastName,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
      };
    } else {
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }
}
