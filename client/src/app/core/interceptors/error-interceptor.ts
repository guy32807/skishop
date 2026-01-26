import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);
  return next(req).pipe(
    // Handle errors globally
    catchError((error: HttpErrorResponse) => {
      if(error.status === 400) {
        if(error.error?.errors) {
          // Aggregate validation errors and show them in a snackbar
          const modelStateErrors = [];
          for (const key in error.error.errors) {
            if (error.error.errors[key]) {
              modelStateErrors.push(error.error.errors[key]);
            }
          }
          snackbarService.error(modelStateErrors.flat().join(' '));
        } else {
          // Show a generic bad request message
          snackbarService.error('Bad Request: ' + (error.error?.message || 'An error occurred. Please try again.'));
        }
      }
      if(error.status === 422) {
        // Show a snackbar message on bad request error
        snackbarService.error('Bad Request: ' + (error.error?.message || 'Please check your input and try again.'));
      }
      if(error.status === 401) {
        // Show a snackbar message on unauthorized error
        snackbarService.error('Unauthorized: You are not authorized to perform this action.');
      }
      if (error.status === 404) {
        // Redirect to not-found page on not found error
        router.navigate(['/not-found']);
      }
      if(error.status === 500) {
        const navigationExtras = { state: { error: error.error } };

        // Redirect to server-error page on server error
        router.navigate(['/server-error'], navigationExtras);
      }
      // Rethrow the error for further handling if needed
      return throwError(() => error);
    })
  );
};
