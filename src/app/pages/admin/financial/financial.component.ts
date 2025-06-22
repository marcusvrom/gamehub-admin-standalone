import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';
import { ApiService } from '../../../core/services/api.service';
import { CashFlowComponent } from '../../../shared/components/cash-flow/cash-flow.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-financial',
  imports: [CommonModule, ReactiveFormsModule, ShimmerLoaderComponent, CurrencyPipe, CashFlowComponent, NgxChartsModule],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.scss'
})
export class FinancialComponent implements OnInit {
  isLoading = true;
  cashFlow: any = null;
  reportData: any = null;

  openForm: FormGroup;
  closeForm: FormGroup;
  reportForm: FormGroup

  // Configurações do Gráfico
  colorScheme: any = { domain: ['#0066ff', '#28a745', '#ffc107', '#dc3545'] };

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Primeiro dia do mês atual

    this.reportForm = this.fb.group({
      startDate: [this.formatDate(startDate)],
      endDate: [this.formatDate(today)]
    });

    this.openForm = this.fb.group({
      opening_balance: [50.00, [Validators.required, Validators.min(0)]]
    });
    this.closeForm = this.fb.group({
      revenue_cash: [0, [Validators.required, Validators.min(0)]],
      expenses: [0, [Validators.required, Validators.min(0)]],
      closing_balance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCashFlowStatus();
  }

  loadCashFlowStatus(): void {
    this.isLoading = true;
    this.apiService.getTodayCashFlow().subscribe((data: any) => {
      this.cashFlow = data;
      this.isLoading = false;
    });
  }

  onOpenCashFlow(): void {
    if (this.openForm.invalid) return;
    this.apiService.openCashFlow(this.openForm.value).subscribe({
      next: () => {
        alert('Caixa aberto com sucesso!');
        this.loadCashFlowStatus();
      },
      error: (err: { error: { message: any; }; }) => alert(`Erro: ${err.error.message}`)
    });
  }

  onCloseCashFlow(): void {
    if (this.closeForm.invalid) return;
    if (confirm('Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.')) {
      this.apiService.closeCashFlow(this.closeForm.value).subscribe({
        next: () => {
          alert('Caixa fechado com sucesso!');
          this.loadCashFlowStatus();
        },
        error: (err: { error: { message: any; }; }) => alert(`Erro: ${err.error.message}`)
      });
    }
  }

  generateReport(): void {
    if (this.reportForm.invalid) return;
    this.isLoading = true;
    this.reportData = null;

    const { startDate, endDate } = this.reportForm.value;
    this.apiService.getFinancialReport(startDate, endDate).subscribe(data => {
      this.reportData = data;
      this.isLoading = false;
    });
  }

  setPeriod(period: 'today' | 'week' | 'month'): void {
    const today = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate = today;
    } else if (period === 'week') {
      startDate.setDate(today.getDate() - today.getDay()); // Início da semana (Domingo)
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    this.reportForm.patchValue({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(today)
    });
    this.generateReport();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
