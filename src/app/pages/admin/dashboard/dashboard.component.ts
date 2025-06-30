import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';
import { MsToTimePipe } from '../../../core/pipes/ms-to-time-pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MsToTimePipe, DatePipe, NgxChartsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Flags de carregamento separadas para cada seção
  isReportLoading = true;
  isSessionsLoading = true;

  // Dados para os cards e gráficos
  summaryData: any = {};
  heatmapData: any[] = [];

  // Dados para a tabela de sessões ativas
  private allActiveSessions: any[] = [];
  filteredActiveSessions: any[] = [];

  // Controles da tabela
  searchTerm: string = '';
  sortColumn: string = 'entry_time';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Timers
  private refreshSessionsIntervalId: any;
  private updateTimersIntervalId: any;

  // Configurações do Gráfico
  heatmapColorScheme: any = { domain: ['#1A1A1A', '#00429d', '#0066ff', '#85aaff', '#e0e8ff'] };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Chama as funções de carregamento iniciais
    this.loadInitialReportData();
    this.loadActiveSessions();

    // Inicia o ciclo de atualização APENAS para as sessões ativas
    this.refreshSessionsIntervalId = setInterval(() => this.loadActiveSessions(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshSessionsIntervalId) clearInterval(this.refreshSessionsIntervalId);
    if (this.updateTimersIntervalId) clearInterval(this.updateTimersIntervalId);
  }

  // Função responsável APENAS pelos dados dos cards e do gráfico de pico
  loadInitialReportData(): void {
    this.isReportLoading = true;
    forkJoin({
      summary: this.apiService.getDashboardSummary(),
      peakHours: this.apiService.getPeakHoursByDay()
    }).subscribe(({ summary, peakHours }) => {
      this.summaryData = summary;
      this.heatmapData = this.formatDataForHeatmap(peakHours);
      this.isReportLoading = false;
    });
  }

  // Função responsável APENAS pelos dados da tabela de sessões ativas
  loadActiveSessions(): void {
    this.isSessionsLoading = true;
    this.apiService.getActiveSessions().subscribe((data: any[]) => {
      this.allActiveSessions = data;
      this.applyFiltersAndSortToSessions();
      this.startTimersForSessions();
      this.isSessionsLoading = false;
    });
  }

  applyFiltersAndSortToSessions(): void {
    let sessions = [...this.allActiveSessions].filter(session =>
      session.client_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      session.station_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    sessions.sort((a, b) => {
      const valA = a[this.sortColumn] ?? '';
      const valB = b[this.sortColumn] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    this.filteredActiveSessions = sessions;
  }

  startTimersForSessions(): void {
    if (this.updateTimersIntervalId) clearInterval(this.updateTimersIntervalId);
    this.updateSessionTimers();
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

  onSearch(): void {
    this.applyFiltersAndSortToSessions();
  }

  onSort(columnName: string): void {
    if (this.sortColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSortToSessions();
  }

  onCheckOut(clientId: number, clientName: string): void {
    if (confirm(`Deseja fazer o check-out de ${clientName}?`)) {
      this.apiService.checkOut(clientId).subscribe(() => {
        alert('Check-out realizado com sucesso!');
        this.loadActiveSessions(); // Recarrega apenas a lista de sessões
      });
    }
  }

  private formatDataForHeatmap(apiData: any[]): any[] {
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const hoursOfDay = Array.from({ length: 14 }, (_, i) => i + 9);

    const grid = daysOfWeek.map((day, dayIndex) => ({
      name: day,
      series: hoursOfDay.map(hour => {
        const dataPoint = apiData.find(d => d.day_of_week === (dayIndex + 1) && d.hour === hour);
        return { name: `${hour}:00`, value: dataPoint ? Number(dataPoint.value) : 0 };
      })
    }));

    const sunday = grid.pop();
    if (sunday) grid.unshift(sunday);
    return grid;
  }
}
