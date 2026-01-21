import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from './product-item/product-item.component';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounce, FormField, form } from '@angular/forms/signals'
import { MatInputModule } from '@angular/material/input'; // Add this

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatMenuModule,
    MatPaginatorModule,
    FormField,
    MatInputModule,
    MatIconButton
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  protected shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  private readonly searchModel = signal({ query: '' });
  productsResource = this.shopService.productsResource;
  isAdding = this.shopService.isAdding;
  sort = this.shopService.sort;

  constructor() {
    effect(() => {
      const currentQuery = this.searchModel().query;
      this.shopService.searchTerm.set(currentQuery);
      this.shopService.pageIndex.set(1); 
    });
  }

  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.query, 300); // 300ms debounce before model updates
  });

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopService.selectedBrands(),
        selectedTypes: this.shopService.selectedTypes(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.shopService.selectedBrands.set(result.selectedBrands);
        this.shopService.selectedTypes.set(result.selectedTypes);
      }
    });
  }

  onAddProduct(newProduct: any) {
    this.shopService.addProduct(newProduct).subscribe({
      next: () => this.productsResource.reload(),
      error: (err) => console.error('Add failed', err),
    });
  }

  sortLabel = computed(() => {
    switch(this.sort()) {
      case 'priceAsc': return 'Price: Low to High';
      case 'priceDesc': return 'Price: High to Low';
      default: return 'Alphabetical';
    }
  });

  handlePageEvent(event: PageEvent) {
    this.shopService.pageIndex.set(event.pageIndex + 1);
    this.shopService.pageSize.set(event.pageSize);
  }
}