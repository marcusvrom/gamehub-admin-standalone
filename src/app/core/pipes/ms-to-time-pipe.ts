import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'msToTime',
  standalone: true
})
export class MsToTimePipe implements PipeTransform {

  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return '0h 0m';
    }

    const hours = Math.floor(value / 3600000); // 1h = 3600000ms
    const minutes = Math.floor((value % 3600000) / 60000); // 1m = 60000ms

    return `${hours}h ${minutes}m`;
  }
}
