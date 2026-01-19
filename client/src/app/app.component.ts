import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
  protected readonly title = signal('Ski Shop');
   products = signal<any[]>([]); 

  ngOnInit(): void {
    this.http.get<any>(this.baseUrl + 'products').subscribe({
      next: response => {
        this.products.set(response.data || response); 
      },

      error: error => console.log(error),
      complete: () => console.log('complete')
    })
  }

  // productResource = rxResource({
  //   stream: () => this.http.get<any[]>(this.baseUrl + 'products'),
  //   defaultValue: []
  // });

  // products = computed(() => this.productResource.value());
  
  // isLoading = this.productResource.isLoading;
}
