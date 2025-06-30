import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShimmerLoaderComponent, FormsModule, CurrencyPipe],
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent implements OnInit {
  isLoading = true;
  private allProducts: any[] = [];
  filteredProducts: any[] = [];

  searchTerm: string = '';
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  showModal = false;
  isEditMode = false;
  productForm: FormGroup;
  currentProductId: number | null = null;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sku: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.apiService.getProducts().subscribe(data => {
      this.allProducts = data;
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  applyFiltersAndSort(): void {
    let products = [...this.allProducts].filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );

    products.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * (this.sortDirection === 'asc' ? 1 : -1);
      } else {
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

    this.filteredProducts = products;
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  onSort(columnName: string): void {
    if (this.sortColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  openModal(product: any | null = null): void {
    this.isEditMode = !!product;
    this.productForm.reset();
    if (product) {
      this.currentProductId = product.id;
      this.productForm.patchValue(product);
    } else {
      this.currentProductId = null;
      this.productForm.patchValue({ is_active: true, price: 0, stock_quantity: 0 });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSaveProduct(): void {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;
    const request$ = this.isEditMode && this.currentProductId
      ? this.apiService.updateProduct(this.currentProductId, productData)
      : this.apiService.createProduct(productData);

    request$.subscribe({
      next: () => {
        alert(`Produto ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onDeleteProduct(product: any): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          alert('Produto excluído com sucesso!');
          this.loadProducts();
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
