import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SoundService } from './sound.service';

export interface Notification {
  message: string;
  type: 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification | null>();
  notification$ = this.notificationSubject.asObservable();

  constructor(private soundService: SoundService) { }

  show(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    this.notificationSubject.next({ message, type });

    if (type === 'warning' || type === 'error') {
      this.soundService.playSound('alarm');
    }
  }

  hide(): void {
    this.notificationSubject.next(null);
  }
}
