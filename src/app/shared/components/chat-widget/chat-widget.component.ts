import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ChatService } from '../../../core/services/chat.service';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  isOpen = false;
  messages: any[] = [];
  newMessage = '';
  currentUserId: number | null = null;
  private messageSubscription!: Subscription;

  public unreadCount$!: Observable<number>;

  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService, private apiService: ApiService, private authService: AuthService) {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.id;
    }
  }

  ngOnInit(): void {
    this.unreadCount$ = this.chatService.unreadCount$;

    this.messageSubscription = this.chatService.getNewMessages().subscribe((message: any) => {
      this.messages.push(message);
      this.scrollToBottom();
      this.shouldScrollToBottom = true;
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.chatService.setChatWindowState(this.isOpen);

    if (this.isOpen && this.messages.length === 0) {
      this.apiService.getChatHistory().subscribe(history => {
        this.messages = history;
        this.shouldScrollToBottom = true;
      });
    } else if (this.isOpen) {
        this.shouldScrollToBottom = true;
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      } catch(err) {
        console.error("Erro ao tentar rolar o chat:", err);
      }
    }, 10);
  }
}
