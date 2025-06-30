import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ShimmerLoaderComponent } from '../../../shared/components/shimmer-loader/shimmer-loader.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-game-library',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ShimmerLoaderComponent],
  templateUrl: './game-library.component.html',
  styleUrls: ['./game-library.component.scss']
})
export class GameLibraryComponent implements OnInit {
  isLoading = true;
  private allGames: any[] = [];
  filteredGames: any[] = [];
  stations: any[] = [];

  totalGames = 0;
  totalValue = 0;

  searchTerm: string = '';
  sortColumn: string = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  showModal = false;
  isEditMode = false;
  gameForm: FormGroup;
  currentGameId: number | null = null;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      station_id: ['', Validators.required],
      media_type: ['Físico', Validators.required],
      purchase_price: [0, [Validators.required, Validators.min(0)]],
      purchase_date: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      games: this.apiService.getGames(),
      stations: this.apiService.getStations()
    }).subscribe(({ games, stations }) => {
      this.allGames = games;
      this.stations = stations;
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  applyFiltersAndSort(): void {
    let games = [...this.allGames].filter(g =>
      g.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      g.station_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    games.sort((a, b) => {
      const valA = a[this.sortColumn] ?? '';
      const valB = b[this.sortColumn] ?? '';
      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * (this.sortDirection === 'asc' ? 1 : -1);
      } else {
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

    this.filteredGames = games;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalGames = this.filteredGames.length;
    this.totalValue = this.filteredGames.reduce((sum, game) => sum + Number(game.purchase_price || 0), 0);
  }

  onSearch(): void { this.applyFiltersAndSort(); }

  onSort(columnName: string): void {
    if (this.sortColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  openModal(game: any | null = null): void {
    this.isEditMode = !!game;
    this.gameForm.reset();
    if (game) {
      this.currentGameId = game.id;
      const gameData = { ...game, purchase_date: game.purchase_date ? new Date(game.purchase_date).toISOString().split('T')[0] : null };
      this.gameForm.patchValue(gameData);
    } else {
      this.currentGameId = null;
      this.gameForm.patchValue({ media_type: 'Físico', purchase_price: 0 });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSaveGame(): void {
    if (this.gameForm.invalid) return;
    const gameData = this.gameForm.value;
    const request$ = this.isEditMode && this.currentGameId
      ? this.apiService.updateGame(this.currentGameId, gameData)
      : this.apiService.createGame(gameData);

    request$.subscribe({
      next: () => {
        alert(`Jogo ${this.isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`);
        this.closeModal();
        this.loadInitialData();
      },
      error: (err) => alert(`Erro: ${err.error.message}`)
    });
  }

  onDeleteGame(game: any): void {
    if (confirm(`Tem certeza que deseja excluir o jogo "${game.title}"?`)) {
      this.apiService.deleteGame(game.id).subscribe({
        next: () => {
          alert('Jogo excluído com sucesso!');
          this.loadInitialData();
        },
        error: (err) => alert(`Erro: ${err.error.message}`)
      });
    }
  }
}
