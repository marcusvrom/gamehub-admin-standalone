import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShimmerLoaderComponent } from '../shimmer-loader/shimmer-loader.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShimmerLoaderComponent, CurrencyPipe],
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent implements OnInit {
  isLoading = true;
  cashFlow: any = null;
  openForm: FormGroup;
  closeForm: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
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
    this.apiService.getTodayCashFlow().subscribe(data => {
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
      error: (err) => alert(`Erro: ${err.error.message}`)
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
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
