import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hoursMinutes',
  standalone: true // Pipe também é standalone!
})
export class HoursMinutesPipe implements PipeTransform {

  transform(value: number): string {
    if (value === null || value === undefined || isNaN(value) || value < 0) {
      return '0h 0m';
    }

    // Pega a parte inteira para as horas
    const hours = Math.floor(value);

    // Pega a parte fracionária, multiplica por 60 para obter os minutos
    const decimalPart = value % 1;
    const minutes = Math.round(decimalPart * 60);

    return `${hours}h ${minutes}m`;
  }
}
