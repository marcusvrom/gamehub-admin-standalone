import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private messageSubject = new Subject<any>();
  private currentUserId: number | null = null;

  private isChatOpen = new BehaviorSubject<boolean>(false);
  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  constructor(private authService: AuthService, private soundService: SoundService) {
    const token = this.authService.getToken();
    if (token) {
        const decoded: any = jwtDecode(token);
        this.currentUserId = decoded.id;
    }

    // Conecta ao mesmo endereço da sua API, mas o Socket.IO cuidará da conexão WebSocket
    this.socket = io('https://gamehub-api-lvep.onrender.com'); // Use a URL do seu backend no Render

    // Ouve por novas mensagens vindas do servidor
    this.socket.on('newMessage', (message) => {
      this.messageSubject.next(message);

      if (message.sender_id !== this.currentUserId) {
        this.soundService.playSound('chat');

        if (!this.isChatOpen.getValue()) {
          this.unreadCount.next(this.unreadCount.getValue() + 1);
        }
      }
    });
  }

  setChatWindowState(isOpen: boolean): void {
    this.isChatOpen.next(isOpen);
    if (isOpen) {
      this.unreadCount.next(0);
    }
  }

  getNewMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Envia uma nova mensagem para o servidor
  sendMessage(message: string): void {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const payload = {
        senderId: decodedToken.id,
        senderUsername: decodedToken.username,
        message: message
      };
      this.socket.emit('sendMessage', payload);
    }
  }
}
