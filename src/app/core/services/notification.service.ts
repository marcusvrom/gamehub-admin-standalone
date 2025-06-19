import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  show(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    this.notificationSubject.next({ message, type });
  }

  hide(): void {
    this.notificationSubject.next(null);
  }
}
