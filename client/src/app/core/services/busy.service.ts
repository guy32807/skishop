import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  loading = false;
  busyCount = 0;

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  isLoading(): boolean {
    return this.loading;
  }

  busy() {
    this.busyCount++;
    this.setLoading(true);
  }

  idle() {
    this.busyCount--;
    if (this.busyCount <= 0) {
      this.setLoading(false);
      this.busyCount = 0;
    }
  }
}
