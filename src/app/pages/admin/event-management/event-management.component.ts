import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShimmerLoaderComponent, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  isLoading = true;
  events: any[] = [];
  showModal = false;
  isEditMode = false;
  eventForm: FormGroup;
  currentEventId: number | null = null;

  eventStatuses = ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      ticket_price: [0, [Validators.required, Validators.min(0)]],
      capacity: [null, Validators.min(1)],
      status: ['AGENDADO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.apiService.getEvents().subscribe(data => {
      this.events = data;
      this.isLoading = false;
    });
  }

  openModal(event: any | null = null): void {
    this.isEditMode = !!event;
    this.eventForm.reset();
    if (event) {
      this.currentEventId = event.id;
      // Formata as datas para o input datetime-local
      const eventData = {
        ...event,
        start_time: this.formatDateForInput(event.start_time),
        end_time: this.formatDateForInput(event.end_time)
      };
      this.eventForm.patchValue(eventData);
    } else {
      this.currentEventId = null;
      this.eventForm.patchValue({ status: 'AGENDADO', ticket_price: 0 });
    }
    this.showModal = true;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Remove os segundos e milissegundos para o formato 'YYYY-MM-DDTHH:mm'
    date.setSeconds(0, 0);
    return date.toISOString().slice(0, 16);
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSaveEvent(): void {
    if (this.eventForm.invalid) return;
    const eventData = this.eventForm.value;
    const request$ = this.isEditMode && this.currentEventId
      ? this.apiService.updateEvent(this.currentEventId, eventData)
      : this.apiService.createEvent(eventData);

    request$.subscribe({
      next: () => {
        alert(`Evento ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
        this.closeModal();
        this.loadEvents();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onDeleteEvent(event: any): void {
    if (confirm(`Tem certeza que deseja excluir o evento "${event.name}"? Esta ação não pode ser desfeita.`)) {
      this.apiService.deleteEvent(event.id).subscribe({
        next: () => {
          alert('Evento excluído com sucesso!');
          this.loadEvents();
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
