import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Address, User } from '../../shared/models/user';
import { catchError, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', 'true');
    return this.http
      .post<User>(this.baseUrl + 'account/login', values, { params })
      .pipe(switchMap(() => this.getUserInfo()));
  }

  register(values: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', values);
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info').pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
    );
  }

  logout() {
    return this.http.post(this.baseUrl + 'account/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
      }),
    );
  }

  updateUserAddress(address: Address) {
    return this.http.post(this.baseUrl + 'account/address', address);
  }

  initUser() {
    return () =>
      this.getUserInfo().pipe(
        catchError(() => of(null)), // Prevent app crash if not authenticated
      );
  }
}
