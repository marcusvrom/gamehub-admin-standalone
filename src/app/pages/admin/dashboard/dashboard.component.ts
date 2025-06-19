import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HoursMinutesPipe } from '../../../core/pipes/hours-minutes-pipe';
import { MsToTimePipe } from '../../../core/pipes/ms-to-time-pipe';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HoursMinutesPipe, MsToTimePipe, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dados do Resumo
  summaryData: any = {};

  // Dados e Configurações do Gráfico
  peakHoursData: any[] = [];
  colorScheme: any = { domain: ['#0066ff'] }; // Cor das barras

  // Lógica existente de sessões ativas
  private allActiveSessions: any[] = [];
  filteredActiveSessions: any[] = [];

  searchTerm: string = '';
  sortColumn: string = 'entry_time';
  sortDirection: 'asc' | 'desc' = 'asc';

  private refreshDataIntervalId: any;
  private updateTimersIntervalId: any;

  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.refreshDataIntervalId = setInterval(() => this.loadActiveSessions(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshDataIntervalId) clearInterval(this.refreshDataIntervalId);
    if (this.updateTimersIntervalId) clearInterval(this.updateTimersIntervalId);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    // Carrega tanto o resumo quanto as sessões ativas
    this.apiService.getDashboardSummary().subscribe(data => {
      this.summaryData = data
      this.isLoading = false
    });

    this.apiService.getPeakHours().subscribe(data => {
        // Formata os dados para o formato que o ngx-charts espera
        this.peakHoursData = data.map(item => ({
            name: `${String(item.hour).padStart(2, '0')}:00`,
            value: Number(item.session_count)
        }));
    });
    this.loadActiveSessions();
  }

  loadActiveSessions(): void {
    this.isLoading = true;
    this.apiService.getActiveSessions().subscribe((data: any[]) => {
      this.allActiveSessions = data;
      this.applyFiltersAndSort();
      this.startTimers();
    });
  }

  applyFiltersAndSort(): void {
    let sessions = [...this.allActiveSessions]; // Cria uma cópia

    if (this.searchTerm) {
        sessions = sessions.filter(session =>
        session.client_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        session.station_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    sessions.sort((a, b) => {
      const valA = a[this.sortColumn] ?? '';
      const valB = b[this.sortColumn] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredActiveSessions = sessions;
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

  startTimers(): void {
    if (this.updateTimersIntervalId) clearInterval(this.updateTimersIntervalId);

    this.updateSessionTimers(); // Roda uma vez imediatamente
    this.updateTimersIntervalId = setInterval(() => this.updateSessionTimers(), 60000);
  }

  updateSessionTimers(): void {
    const now = new Date().getTime();
    this.filteredActiveSessions.forEach(session => {
      const entryTime = new Date(session.entry_time).getTime();
      const initialBalanceMs = parseFloat(session.hours_balance) * 60 * 60 * 1000;
      session.dynamic_elapsed_ms = now - entryTime;
      session.dynamic_remaining_ms = initialBalanceMs - session.dynamic_elapsed_ms;
    });
  }

  onCheckOut(clientId: number, clientName: string): void {
    if (confirm(`Deseja fazer o check-out de ${clientName}?`)) {
      this.apiService.checkOut(clientId).subscribe(() => {
        alert('Check-out realizado com sucesso!');
        this.loadActiveSessions();
      });
    }
  }
}
