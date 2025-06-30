import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  isLoading = true;
  event: any = null;
  participants: any[] = [];
  allClients: any[] = [];
  selectedClientIdToAdd: number | null = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    const eventId = this.route.snapshot.params['id'];
    this.loadData(eventId);
  }

  loadData(eventId: number): void {
    this.isLoading = true;
    forkJoin({
      eventData: this.apiService.getEventById(eventId),
      clients: this.apiService.getClients()
    }).subscribe(({ eventData, clients }) => {
      this.event = eventData.event;
      this.participants = eventData.participants;
      this.allClients = clients;
      this.isLoading = false;
    });
  }

  addParticipant(): void {
    if (!this.selectedClientIdToAdd) {
      alert('Por favor, selecione um cliente para inscrever.');
      return;
    }
    this.apiService.addParticipant(this.event.id, this.selectedClientIdToAdd).subscribe({
      next: () => {
        alert('Participante inscrito com sucesso!');
        this.selectedClientIdToAdd = null;
        this.loadData(this.event.id);
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  markAsPaid(registration: any): void {
    const paymentMethod = prompt('Qual foi o método de pagamento?', 'PIX');
    if (paymentMethod) {
      this.apiService.markRegistrationAsPaid(registration.id, paymentMethod).subscribe({
        next: () => {
          alert('Pagamento registrado com sucesso!');
          this.loadData(this.event.id);
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }

  removeParticipant(registration: any): void {
    if (confirm(`Tem certeza que deseja remover ${registration.client_name} do evento?`)) {
      this.apiService.removeParticipant(registration.id).subscribe({
        next: () => {
          alert('Participante removido com sucesso.');
          this.loadData(this.event.id);
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
