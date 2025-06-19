import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './package-management.component.html',
  styleUrls: ['./package-management.component.scss']
})
export class PackageManagementComponent implements OnInit {
  packages: any[] = [];
  settings: any = {};
  showModal = false;
  isEditMode = false;
  packageForm: FormGroup;
  currentPackageId: number | null = null;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      hours_included: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      packages: this.apiService.getAllPackages(),
      settings: this.apiService.getSettings()
    }).subscribe(data => {
      this.packages = data.packages;
      this.settings = data.settings;
    });
  }

  openModal(pkg: any | null = null): void {
    this.isEditMode = !!pkg;
    this.packageForm.reset();
    if (pkg) {
      this.currentPackageId = pkg.id;
      this.packageForm.patchValue(pkg);
    } else {
      this.currentPackageId = null;
      this.packageForm.patchValue({is_active: true, hours_included: 1, price: 0});
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSavePackage(): void {
    if (this.packageForm.invalid) return;

    const packageData = this.packageForm.value;
    const request$ = this.isEditMode && this.currentPackageId
      ? this.apiService.updatePackage(this.currentPackageId, packageData)
      : this.apiService.createPackage(packageData);

    request$.subscribe(() => {
      alert(`Pacote ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
      this.closeModal();
      this.loadData();
    });
  }

  onDeletePackage(pkg: any): void {
    if (confirm(`Tem certeza que deseja excluir o pacote "${pkg.name}"?`)) {
      this.apiService.deletePackage(pkg.id).subscribe(() => {
        alert('Pacote excluído com sucesso!');
        this.loadData();
      });
    }
  }

  calculatePricePerHour(pkg: any): number {
    if (!pkg.hours_included) return 0;
    return pkg.price / pkg.hours_included;
  }
}
