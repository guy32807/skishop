import { Component, inject, signal } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog'; // Add MatDialogModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-dialog',
  standalone: true, 
  imports: [
    MatDividerModule,
    MatListModule,    
    MatButtonModule,  
    MatDialogModule, 
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss',
})
export class FiltersDialogComponent {
  private shopService = inject(ShopService);
  private dialogRef = inject(MatDialogRef<FiltersDialogComponent>);
  protected data = inject(MAT_DIALOG_DATA); 

  brands = this.shopService.brandsResource.value;
  types = this.shopService.typesResource.value;

  selectedBrands = signal<string[]>([...(this.data?.selectedBrands ?? [])]);
  selectedTypes = signal<string[]>([...(this.data?.selectedTypes ?? [])]);

  applyFilters() {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands(),
      selectedTypes: this.selectedTypes()
    });
  }
}