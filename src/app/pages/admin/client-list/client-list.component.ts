import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HoursMinutesPipe } from '../../../core/pipes/hours-minutes-pipe';
import { CpfPipe } from '../../../core/pipes/cpf-pipe';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';


@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HoursMinutesPipe, CpfPipe, ShimmerLoaderComponent],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  private allClients: any[] = [];
  filteredClients: any[] = [];
  searchTerm: string = '';
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = true;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.apiService.getClients().subscribe((data: any[]) => {
      this.allClients = data;
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  applyFiltersAndSort(): void {
    let tempClients = [...this.allClients]; // Cria uma cópia para não modificar a lista original

    // Aplica o filtro de pesquisa
    if (this.searchTerm) {
      tempClients = tempClients.filter(client =>
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.cpf.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Aplica a ordenação
    tempClients.sort((a, b) => {
      const valA = a[this.sortColumn] ?? '';
      const valB = b[this.sortColumn] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredClients = tempClients; // Atribui a nova lista ordenada e filtrada
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

  deleteClient(id: number, name: string): void {
    if (confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) {
      this.apiService.deleteClient(id).subscribe(() => {
        alert('Cliente excluído com sucesso!');
        this.loadClients();
      });
    }
  }
}
