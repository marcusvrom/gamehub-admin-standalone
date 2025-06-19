import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-station-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './station-management.component.html',
  styleUrls: ['./station-management.component.scss']
})
export class StationManagementComponent implements OnInit {
  stations: any[] = [];
  showModal = false;
  isEditMode = false;
  stationForm: FormGroup;
  currentStationId: number | null = null;

  // Opções para os dropdowns
  stationTypes = ['PS5', 'XBOX', 'SWITCH', 'PC', 'OUTRO'];
  stationStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.stationForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      status: ['AVAILABLE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.apiService.getStations().subscribe(data => {
      this.stations = data;
    });
  }

  openModal(station: any | null = null): void {
    this.isEditMode = !!station;
    this.stationForm.reset();
    if (station) {
      this.currentStationId = station.id;
      this.stationForm.patchValue(station);
    } else {
      this.currentStationId = null;
      this.stationForm.patchValue({ type: '', status: 'AVAILABLE' });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSaveStation(): void {
    if (this.stationForm.invalid) return;

    const stationData = this.stationForm.value;
    const request$ = this.isEditMode && this.currentStationId
      ? this.apiService.updateStation(this.currentStationId, stationData)
      : this.apiService.createStation(stationData);

    request$.subscribe({
      next: () => {
        alert(`Estação ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
        this.closeModal();
        this.loadStations();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onDeleteStation(station: any): void {
    if (confirm(`Tem certeza que deseja excluir a estação "${station.name}"? Agendamentos associados podem ser perdidos.`)) {
      this.apiService.deleteStation(station.id).subscribe({
        next: () => {
          alert('Estação excluída com sucesso!');
          this.loadStations();
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
