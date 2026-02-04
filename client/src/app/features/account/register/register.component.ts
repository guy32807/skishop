import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { passwordValidators } from '../../../shared/utils/password-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TextInputComponent,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  validationErrors?: string[];

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      passwordValidators
    ],
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snack.success('Registration successful');
        this.router.navigateByUrl('/account/login');
      },
      error: (err) => {
        if (err.error.errors) {
          // Identity API usually puts errors here
          this.validationErrors = err.error.errors.map((e: any) => e.description);
        } else if (err.error) {
          this.validationErrors = err.error.errors?.map((e: any) => e.description) || [];
        }
      },
    });
  }
}
