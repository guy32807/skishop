import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { InitService } from './core/services/init.service';
import { catchError, forkJoin, lastValueFrom, of } from 'rxjs';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AccountService } from './core/services/account.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor, authInterceptor])),
    provideZonelessChangeDetection(),
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      const accountService = inject(AccountService);
      return await lastValueFrom(
        forkJoin({
          init: initService.init(),
          user: accountService.getUserInfo().pipe(catchError(() => of(null))),
        }),
      ).finally(() => {
        const splash = document.getElementById('initial-splash');
        if (splash) {
          splash.remove();
        }
      });
    }),
  ],
};
