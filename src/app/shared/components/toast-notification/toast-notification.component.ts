import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss']
})
export class ToastNotificationComponent implements OnInit {
  @Input() message: string = 'Ocorreu um erro.';
  @Input() type: 'success' | 'warning' | 'error' = 'error';
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    // A notificação se fecha sozinha após 7 segundos
    setTimeout(() => this.close.emit(), 7000);
  }
}
