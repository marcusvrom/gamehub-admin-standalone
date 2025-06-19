import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId: number | null = null;
  pageTitle = 'Novo Cliente';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      // Seção 1
      name: ['', Validators.required],
      birth_date: [''],
      cpf: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      address: [''],
      neighborhood: [''],
      city: [''],
      client_type: ['AVULSO'],
      hours_balance: [0],
      subscription_status: ['N/A'],
      subscription_date: [null],
      next_billing_date: [null],

      // Seção 2
      guardian_name: [''],
      guardian_cpf: [''],
      guardian_phone: [''],
      guardian_relationship: [''],

      // Seção 3
      agreed_to_terms: [false, Validators.requiredTrue],
      agreed_to_marketing: [false]
    });
  }

    ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Cliente';
      this.apiService.getClientById(this.clientId).subscribe((client: any) => { // Tipo adicionado aqui
        if(client.birth_date){
            client.birth_date = client.birth_date.split('T')[0];
        }
        this.clientForm.patchValue(client);
      });
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    // Cria uma cópia dos dados do formulário para não alterar o original
    const formData = { ...this.clientForm.value };

    // Limpa a máscara do CPF, enviando apenas os números
    if (formData.cpf) {
      formData.cpf = formData.cpf.replace(/\D/g, '');
    }

    if (this.isEditMode && this.clientId) {
      this.apiService.updateClient(this.clientId, formData).subscribe(() => {
        alert('Cliente atualizado com sucesso!');
        this.router.navigate(['/admin/clients']);
      });
    } else {
      this.apiService.createClient(formData).subscribe(() => {
        alert('Cliente criado com sucesso!');
        this.router.navigate(['/admin/clients']);
      });
    }
  }
}
