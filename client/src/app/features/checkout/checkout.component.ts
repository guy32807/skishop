import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import {
  ConfirmationToken,
  StripeAddressElement,
  StripeAddressElementChangeEvent,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { firstValueFrom, throwError } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatAnchor,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private stripeService = inject(StripeService);
  private snackBar = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  loading = false;
  cartService = inject(CartService);
  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;
  addressElementRef = viewChild.required<ElementRef>('addressElementContainer');
  paymentElementRef = viewChild.required<ElementRef>('paymentElement');
  saveAddress = false;
  addressComplete = signal(false);
  paymentComplete = signal(false);
  deliveryComplete = computed(() => {
    const cart = this.cartService.cart();
    return !!(cart && cart.deliveryMethodId);
  });
  completionStatus = signal<{ address: boolean; card: boolean; delivery: boolean }>({
    address: false,
    card: false,
    delivery: false,
  });
  confirmationToken?: ConfirmationToken;

  constructor() {
    effect(async () => {
      const user = this.accountService.currentUser();
      const addressContainer = this.addressElementRef().nativeElement;
      const paymentContainer = this.paymentElementRef().nativeElement;
      if (!user || !addressContainer || !paymentContainer) return;

      try {
        this.addressElement = await this.stripeService.createAddressElement();
        this.paymentElement = await this.stripeService.createPaymentElement();
        if (addressContainer.innerHTML === '') {
          this.addressElement.mount(addressContainer);
          this.addressElement.on('change', (event) => {
            this.addressComplete.set(event.complete);
            return this.completionStatus.update((state) => ({
              ...state,
              address: event.complete,
            }));
          });
        }
        if (paymentContainer.innerHTML === '') {
          this.paymentElement.mount(paymentContainer);
          this.paymentElement.on('change', (event) => {
            this.paymentComplete.set(event.complete);
            return this.completionStatus.update((state) => ({
              ...state,
              card: event.complete,
            }));
          });
        }
      } catch (error: any) {
        this.snackBar.error(error.message);
      }
    });
    this.destroyRef.onDestroy(() => {
      this.stripeService.disposeElements();
    });
  }

  handleDelivery(event: boolean) {
    this.completionStatus.update((state) => {
      state.delivery = event;
      return state;
    });
  }

  async getConfirmationToken() {
    try {
      if (Object.values(this.completionStatus()).every((status) => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) {
          throw new Error(result.error.message);
        }
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
    } catch (error: any) {
      this.snackBar.error(error.message);
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripe() as Address;
        address && firstValueFrom(this.accountService.updateUserAddress(address));
      }
    }
    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
    if(event.selectedIndex === 3){
      await this.getConfirmationToken();
    }
  }

  async confirmPayment(stepper: MatStepper){
    this.loading = true;
    try {
      if(this.confirmationToken){
        const result = await this.stripeService.confirmPayment(this.confirmationToken);

        if(result.paymentIntent?.status === 'succeeded'){
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));
          if(orderResult){
          this.cartService.clearCart();
          this.cartService.selectedDelivery.set(null);
          this.router.navigateByUrl('/checkout/success');
          }else{
            throw new Error('Order creation failed.');
          }
        }else if(result.error){
          throw new Error(result.error.message);
        }else{
          throw new Error('Something went wrong');
        }
      }
    } catch (error: any) {
      this.snackBar.error(error.message || "something went wrong");
      stepper.previous();
    } finally{
      this.loading = false;
    }
  }

  private async createOrderModel() : Promise<OrderToCreate>{
    const cart = this.cartService.cart();
    const shippingAddress = await this.getAddressFromStripe() as ShippingAddress;
    const card = this.confirmationToken?.payment_method_preview.card;

    if(!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress){
      throw new Error('Problem creating order.');
    }

    return {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      },
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress
    }
  }

  private async getAddressFromStripe(): Promise<Address | ShippingAddress | null> {
    const result = await this.addressElement?.getValue();

    if (!result || !result.value || !result.value.address) return null;
    const address = result?.value.address;

    if (address) {
      return {
        name: result.value.name,
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
