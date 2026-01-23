import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { finalize, map, of } from 'rxjs';

interface ProductParams {
  id: string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  searchTerm = signal<string>('');
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
  isAdding = signal(false);
  addError = signal<string | null>(null);
  selectedBrands = signal<string[]>([]);
  selectedTypes = signal<string[]>([]);
  sort = signal<string>('name');
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  selectedProductId = signal<string | null>(null);

  productsResource = rxResource({
    params: () => ({
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      brands: this.selectedBrands(),
      types: this.selectedTypes(),
      sort: this.sort(),
      search: this.searchTerm(),
    }),

    stream: ({ params }) => {
      let httpParams = new HttpParams()
        .set('pageIndex', params.pageIndex.toString())
        .set('pageSize', params.pageSize.toString())
        .set('sort', params.sort);

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

      params.brands.forEach((brand) => (httpParams = httpParams.append('brand', brand)));
      params.types.forEach((type) => (httpParams = httpParams.append('type', type)));

      return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {
        params: httpParams,
      });
    },
    defaultValue: { pageIndex: 1, pageSize: 6, count: 0, data: [] } as Pagination<Product>,
  });

  productDetailResource = rxResource<Product | null, ProductParams>({
    params: () => ({
      id: this.selectedProductId() ?? undefined,
    }),
    stream: ({ params }) => {
      if (!params.id) return of(null);

      return this.http.get<Product>(`${this.baseUrl}products/${params.id}`);
    },
    defaultValue: null,
  });

  brandsResource = rxResource({
    stream: () => this.http.get<string[]>(this.baseUrl + 'products/brands'),
    defaultValue: [],
  });

  typesResource = rxResource({
    stream: () => this.http.get<string[]>(this.baseUrl + 'products/types'),
    defaultValue: [],
  });

  getProductResource(idSignal: () => string | undefined) {
    return rxResource({
      params: () => ({ id: idSignal() }),
      stream: ({ params }) => {
        if (!params.id) return of(null);
        return this.http.get<Product>(`${this.baseUrl}products/${params.id}`);
      },
    });
  }

  addProduct(product: any) {
    this.isAdding.set(true);
    this.addError.set(null);

    return this.http
      .post<any>(this.baseUrl + 'products', product)
      .pipe(finalize(() => this.isAdding.set(false)));
  }
}
