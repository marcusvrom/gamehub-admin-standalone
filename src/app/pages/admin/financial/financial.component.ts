import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';
import { CashFlowComponent } from '../../../shared/components/cash-flow/cash-flow.component';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { ExcelExportService } from '../../../core/services/excel-export.service';
import { HoursMinutesPipe } from '../../../core/pipes/hours-minutes-pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CashFlowComponent, ShimmerLoaderComponent, CurrencyPipe, DatePipe, NgxChartsModule, HoursMinutesPipe, NgxPaginationModule],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss']
})
export class FinancialComponent implements OnInit {
  isReportLoading = true;

  reportForm: FormGroup;
  reportData: any = null;
  dailyRevenueForChart: any[] = [];
  stationUsageForChart: any[] = [];
  stationUsageData: any[] = [];

  colorScheme: any = { domain: ['#0055dd', '#DE007D', '#0ADE00', '#DE9500', '#2E5189'] };

  legendPosition = LegendPosition.Below

  paginationConfig = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private excelService: ExcelExportService
  ) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    this.reportForm = this.fb.group({
      startDate: [this.formatDate(startDate)],
      endDate: [this.formatDate(today)]
    });
  }

  ngOnInit(): void {
    // Agora, geramos o relatório padrão assim que a página carrega
    this.generateReport();
  }

  generateReport(page: number = 1): void {
    if (this.reportForm.invalid) return;
    this.isReportLoading = true;
    this.reportData = null;

    if (page === 1) {
        this.reportData = null;
        this.paginationConfig.currentPage = 1;
    } else {
        this.paginationConfig.currentPage = page;
    }

    const { startDate, endDate } = this.reportForm.value;

    forkJoin({
      financial: this.apiService.getFinancialReport(startDate, endDate, this.paginationConfig.currentPage, this.paginationConfig.itemsPerPage),
      stationUsage: this.apiService.getStationUsageReport(startDate, endDate)
    }).subscribe(({ financial, stationUsage }) => {
      this.reportData = financial;
      this.stationUsageData = stationUsage.map(item => ({
        ...item,
        total_hours_played: item.total_minutes_played / 60,
        average_session_hours: item.average_session_minutes / 60
      }));

      // Formata os dados para o gráfico de linha
      if (financial && financial.dailyRevenue) {
        this.dailyRevenueForChart = [{
          "name": "Faturamento",
          "series": financial.dailyRevenue
        }];
      }

      // Formata os dados para o gráfico de pizza
      this.stationUsageForChart = stationUsage.map(item => ({
        name: item.type,
        value: Number(item.total_minutes_played)
      }));

      this.reportData.transactions = financial.transactions.items;
      this.paginationConfig.totalItems = financial.transactions.totalItems;

      this.isReportLoading = false;
    });
  }

  setPeriod(period: 'today' | 'week' | 'month'): void {
    const today = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate = today;
    } else if (period === 'week') {
      startDate.setDate(today.getDate() - today.getDay());
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    this.reportForm.patchValue({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(today)
    });
    this.generateReport();
  }

  exportTransactionsToExcel(): void {
    if (!this.reportData || !this.reportData.transactions || this.reportData.transactions.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    const formattedData = this.reportData.transactions.map((tx: any) => ({
      'Data e Hora': new Date(tx.transaction_date).toLocaleString('pt-BR'),
      'Cliente': tx.client_name || 'N/A',
      'Tipo de Transação': tx.transaction_type,
      'Método de Pagamento': tx.payment_method,
      'Horas Adicionadas': tx.hours_added,
      'Valor Pago (R$)': tx.amount_paid,
      'Observações': tx.notes
    }));
    this.excelService.exportAsExcelFile(formattedData, 'Relatorio_Financeiro_GameHub');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
