import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shimmer-loader',
  imports: [CommonModule],
  templateUrl: './shimmer-loader.component.html',
  styleUrl: './shimmer-loader.component.scss'
})
export class ShimmerLoaderComponent {
  // Inputs para tornar o componente dinâmico
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = '4px';
  @Input() className: string = '';
}
