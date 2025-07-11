import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HoursMinutesPipe } from '../../../core/pipes/hours-minutes-pipe';
import { CpfPipe } from '../../../core/pipes/cpf-pipe';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HoursMinutesPipe, CpfPipe, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  // Propriedades de Dados
  clientId!: number;
  client: any = null;
  sessionHistory: any[] = [];
  transactionHistory: any[] = [];
  settings: any = {};
  packages: any[] = [];
  availableStations: any[] = [];

  // Propriedades para controle dos Modais
  showAddHoursModal = false;
  showUpgradeModal = false;
  showRenewModal = false;
  showBuyPackageModal = false;
  showCheckInModal = false;
  showAdjustBalanceModal = false;

  // Forms para os Modais
  addHoursForm: FormGroup;
  upgradeForm: FormGroup;
  renewForm: FormGroup;
  buyPackageForm: FormGroup;
  adjustBalanceForm: FormGroup;

  // Propriedade para o cálculo de custo
  calculatedCost: number | null = null;

  // Propriedades para ordenação das tabelas
  sessionHistorySort = { column: 'entry_time', direction: 'desc' as 'asc' | 'desc' };
  transactionHistorySort = { column: 'transaction_date', direction: 'desc' as 'asc' | 'desc' };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addHoursForm = this.fb.group({
      hours: [0, [Validators.required, Validators.min(0)]],
      minutes: [30, [Validators.required, Validators.min(0), Validators.max(59)]],
      payment_method: ['PIX', Validators.required]
    });

    this.upgradeForm = this.fb.group({
      next_billing_date: ['', Validators.required]
    });
    this.renewForm = this.fb.group({
      new_next_billing_date: ['', Validators.required]
    });
    this.buyPackageForm = this.fb.group({
      package_id: ['', Validators.required],
      payment_method: ['PIX', Validators.required]
    });
    this.adjustBalanceForm = this.fb.group({
      hours: [0, [Validators.required, Validators.min(0)]],
      minutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    forkJoin({
      client: this.apiService.getClientById(this.clientId),
      sessions: this.apiService.getClientSessionHistory(this.clientId),
      transactions: this.apiService.getTransactionHistory(this.clientId),
      settings: this.apiService.getSettings(),
      packages: this.apiService.getActivePackages()
    }).subscribe(data => {
      this.client = data.client;
      this.sessionHistory = data.sessions;
      this.transactionHistory = data.transactions;
      this.settings = data.settings;
      this.packages = data.packages;

      // Aplica a ordenação inicial aos dados carregados
      this.sortSessionHistory();
      this.sortTransactionHistory();
    });
  }

  // --- Lógica de Ordenação ---

  private sortSessionHistory(): void {
    this.sessionHistory.sort((a, b) => {
      const valA = a[this.sessionHistorySort.column];
      const valB = b[this.sessionHistorySort.column];
      if (valA < valB) return this.sessionHistorySort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return this.sessionHistorySort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- Lógica de Ordenação ---
  onSortSessionHistory(columnName: string): void {
    if (this.sessionHistorySort.column === columnName) {
      this.sessionHistorySort.direction = this.sessionHistorySort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sessionHistorySort.column = columnName;
      this.sessionHistorySort.direction = 'desc';
    }
    // Cria uma nova referência de array para forçar a atualização do Angular
    this.sessionHistory = [...this.sessionHistory].sort((a, b) => {
      const valA = a[this.sessionHistorySort.column] ?? '';
      const valB = b[this.sessionHistorySort.column] ?? '';
      if (valA < valB) return this.sessionHistorySort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return this.sessionHistorySort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  onSortTransactionHistory(columnName: string): void {
    if (this.transactionHistorySort.column === columnName) {
      this.transactionHistorySort.direction = this.transactionHistorySort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.transactionHistorySort.column = columnName;
      this.transactionHistorySort.direction = 'desc';
    }
    // Cria uma nova referência de array para forçar a atualização do Angular
    this.transactionHistory = [...this.transactionHistory].sort((a, b) => {
      const valA = a[this.transactionHistorySort.column] ?? '';
      const valB = b[this.transactionHistorySort.column] ?? '';
      if (valA < valB) return this.transactionHistorySort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return this.transactionHistorySort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private sortTransactionHistory(): void {
    this.transactionHistory.sort((a, b) => {
      const valA = a[this.transactionHistorySort.column];
      const valB = b[this.transactionHistorySort.column];
      if (valA < valB) return this.transactionHistorySort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return this.transactionHistorySort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- Lógica dos Modais ---
  calculateCost(): void {
    if (this.addHoursForm.invalid || !this.client) {
      this.calculatedCost = null;
      return;
    }

    // Combina horas e minutos em um único valor decimal de horas
    const hours = this.addHoursForm.value.hours || 0;
    const minutes = this.addHoursForm.value.minutes || 0;
    const totalHours = hours + (minutes / 60);

    if (totalHours <= 0) {
        this.calculatedCost = null;
        return;
    }

    const rate = this.client.client_type === 'CLUBE'
      ? this.settings.hourly_rate_club
      : this.settings.hourly_rate_regular;

    this.calculatedCost = totalHours * rate;
  }

  confirmAddHours(): void {
    if (this.addHoursForm.invalid || this.calculatedCost === null) return;

    const hours = this.addHoursForm.value.hours || 0;
    const minutes = this.addHoursForm.value.minutes || 0;
    const totalHours = hours + (minutes / 60);

    if (totalHours <= 0) {
        alert("Por favor, adicione um tempo maior que zero.");
        return;
    }

    const rate = this.client.client_type === 'CLUBE' ? this.settings.hourly_rate_club : this.settings.hourly_rate_regular;
    const transactionData = {
      hours_to_add: totalHours, // Envia o valor decimal combinado para a API
      amount_paid: this.calculatedCost,
      rate_used: rate,
      payment_method: this.addHoursForm.value.payment_method
    };

    this.apiService.addHoursTransaction(this.clientId, transactionData).subscribe(() => {
      alert('Horas adicionadas com sucesso!');
      this.closeAddHoursModal();
      this.loadData();
    });
  }

  closeAddHoursModal(): void {
    this.showAddHoursModal = false;
    this.calculatedCost = null;
    this.addHoursForm.reset({ hours: 0, minutes: 30, payment_method: 'PIX' });
  }

  onUpgradeToClub(): void {
    if (this.upgradeForm.invalid) return;
    const data = { next_billing_date: this.upgradeForm.value.next_billing_date };
    this.apiService.upgradeToClub(this.clientId, data).subscribe({
      next: () => {
        alert('Cliente atualizado para membro do Clube com sucesso!');
        this.showUpgradeModal = false;
        this.upgradeForm.reset();
        this.loadData();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onRenewSubscription(): void {
    if (this.renewForm.invalid) return;
    const data = { new_next_billing_date: this.renewForm.value.new_next_billing_date };
    this.apiService.renewSubscription(this.clientId, data).subscribe({
      next: () => {
        alert('Assinatura renovada com sucesso!');
        this.showRenewModal = false;
        this.renewForm.reset();
        this.loadData();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onBuyPackage(): void {
    if (this.buyPackageForm.invalid) return;
    const { package_id, payment_method } = this.buyPackageForm.value;
    if (confirm('Você confirma a compra deste pacote para o cliente?')) {
      this.apiService.buyPackageForClient(this.clientId, { package_id: package_id, payment_method: payment_method }).subscribe({
        next: () => {
          alert('Pacote comprado com sucesso!');
          this.showBuyPackageModal = false;
          this.buyPackageForm.reset();
          this.loadData();
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }

  // --- LÓGICA DE CHECK-IN (RESTAURADA) ---
  openCheckInModal(): void {
    if (this.client.hours_balance <= 0) {
      alert('Este cliente não possui saldo de horas para iniciar uma sessão.');
      return;
    }
    this.apiService.getStations().subscribe(stations => {
      this.availableStations = stations.filter(s => s.status === 'AVAILABLE');
      this.showCheckInModal = true;
    });
  }

  confirmCheckIn(stationId: number): void {
    if (confirm('Confirmar check-in nesta estação?')) {
      this.apiService.checkIn(this.clientId, stationId).subscribe({
        next: () => {
          alert('Check-in realizado com sucesso!');
          this.showCheckInModal = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }

  openAdjustBalanceModal(): void {
    if (!this.client) return;

    const currentBalance = this.client.hours_balance || 0;

    // Converte o saldo decimal em horas e minutos
    const hours = Math.floor(currentBalance);
    const minutes = Math.round((currentBalance % 1) * 60);

    // Define os valores no formulário
    this.adjustBalanceForm.setValue({ hours, minutes });

    this.showAdjustBalanceModal = true;
  }

  // Envia o novo saldo para a API
  onConfirmAdjustBalance(): void {
    if (this.adjustBalanceForm.invalid) return;

    const { hours, minutes } = this.adjustBalanceForm.value;
    const newBalance = (hours || 0) + ((minutes || 0) / 60);

    if (confirm(`Deseja definir o saldo de ${this.client.name} para ${hours}h e ${minutes}m?`)) {
      this.apiService.setClientBalance(this.clientId, newBalance).subscribe({
        next: () => {
          alert('Saldo ajustado com sucesso!');
          this.showAdjustBalanceModal = false;
          this.loadData(); // Recarrega os dados para mostrar o novo saldo
        },
        error: (err) => alert(`Erro ao ajustar saldo: ${err.error.message}`)
      });
    }
  }

}
