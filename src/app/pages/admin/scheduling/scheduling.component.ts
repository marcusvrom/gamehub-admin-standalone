import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class SchedulingComponent implements OnInit {
  stations: any[] = [];
  bookings: any[] = [];
  clients: any[] = [];

  selectedDate: string;
  timeSlots: string[] = [];

  showBookingModal = false;
  bookingForm: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    const today = new Date();
    this.selectedDate = this.formatDate(today);

    this.bookingForm = this.fb.group({
      client_id: ['', Validators.required],
      station_id: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    this.loadInitialData();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadInitialData(): void {
    forkJoin({
      stations: this.apiService.getStations(),
      clients: this.apiService.getClients(),
      bookings: this.apiService.getBookingsByDate(this.selectedDate)
    }).subscribe(data => {
      this.stations = data.stations;
      this.clients = data.clients;
      this.bookings = data.bookings;
    });
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.apiService.getBookingsByDate(this.selectedDate).subscribe(data => {
      this.bookings = data;
    });
  }

  generateTimeSlots(): void {
    for (let i = 9; i <= 22; i++) { // Horário de funcionamento: 9h às 22h
      this.timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    }
  }

  getBookingsForStation(stationId: number): any[] {
    return this.bookings.filter(b => b.station_id === stationId);
  }

  calculateBookingStyle(booking: any): object {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    const startHour = start.getHours() + (start.getMinutes() / 60);
    const endHour = end.getHours() + (end.getMinutes() / 60);

    const left = ((startHour - 9) / (22 - 9)) * 100;
    const width = ((endHour - startHour) / (22 - 9)) * 100;


    return {
      'left': `${left}%`,
      'width': `${width}%`
    };
  }

  openBookingModal(stationId: number, time: string): void {
    const startTime = `${this.selectedDate}T${time}:00`;
    const endTimeDate = new Date(startTime);
    endTimeDate.setHours(endTimeDate.getHours() + 1);
    const endTime = endTimeDate.toISOString().substring(0, 16);

    this.bookingForm.reset({
        station_id: stationId,
        start_time: startTime.substring(0, 16),
        end_time: endTime
    });
    this.showBookingModal = true;
  }

  onSaveBooking(): void {
    if (this.bookingForm.invalid) return;

    this.apiService.createBooking(this.bookingForm.value).subscribe({
        next: () => {
            alert('Agendamento criado com sucesso!');
            this.showBookingModal = false;
            // Recarrega os agendamentos do dia
            this.onDateChange({ target: { value: this.selectedDate } } as any);
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onDeleteBooking(bookingId: number): void {
      if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
          this.apiService.deleteBooking(bookingId).subscribe(() => {
              alert('Agendamento cancelado com sucesso!');
              this.onDateChange({ target: { value: this.selectedDate } } as any);
          });
      }
  }
}
