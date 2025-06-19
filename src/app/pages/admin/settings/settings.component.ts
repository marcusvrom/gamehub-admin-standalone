import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.settingsForm = this.fb.group({
      hourly_rate_regular: [''],
      hourly_rate_club: ['']
    });
  }

  ngOnInit(): void {
    this.apiService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.apiService.updateSettings(this.settingsForm.value).subscribe(() => {
        alert('Configurações salvas com sucesso!');
      });
    }
  }
}
