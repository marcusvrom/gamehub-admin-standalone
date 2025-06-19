import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {

  transform(value: string | number): string {
    let cpf = value.toString().padStart(11, '0'); // Garante que a string tenha 11 caracteres

    if (cpf.length !== 11) {
      return value.toString(); // Retorna o valor original se não for um CPF válido
    }

    // Aplica a máscara usando replace com Expressão Regular
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

}
