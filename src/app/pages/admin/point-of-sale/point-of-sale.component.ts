import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-point-of-sale',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.scss']
})
export class PointOfSaleComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';

  cart: any[] = [];
  totalAmount = 0;

  clients: any[] = [];
  selectedClientId: number | null = null;
  paymentMethod: string = 'DINHEIRO';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getProducts().subscribe(data => {
      this.products = data.filter(p => p.is_active);
      this.filteredProducts = this.products;
      this.categories = ['all', ...Array.from(new Set(this.products.map(p => p.category)))];
    });
    this.apiService.getClients().subscribe(data => this.clients = data);
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
  }

  addProductToCart(product: any): void {
    const itemInCart = this.cart.find(item => item.product_id === product.id);
    if (itemInCart) {
      itemInCart.quantity++;
    } else {
      this.cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    this.calculateTotal();
  }

  updateQuantity(item: any, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(cartItem => cartItem.product_id !== item.product_id);
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  finalizeSale(): void {
    if (this.cart.length === 0) {
      alert('O carrinho está vazio.');
      return;
    }

    const saleData = {
      client_id: this.selectedClientId,
      payment_method: this.paymentMethod,
      items: this.cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    if (confirm(`Confirmar venda no valor de ${this.totalAmount.toFixed(2)}?`)) {
      this.apiService.createSale(saleData).subscribe({
        next: () => {
          alert('Venda registrada com sucesso!');
          this.resetSale();
          this.ngOnInit(); // Recarrega os produtos para atualizar o estoque
        },
        error: (err) => alert(`Erro ao registrar venda: ${err.error.message}`)
      });
    }
  }

  resetSale(): void {
    this.cart = [];
    this.totalAmount = 0;
    this.selectedClientId = null;
    this.paymentMethod = 'DINHEIRO';
  }
}
