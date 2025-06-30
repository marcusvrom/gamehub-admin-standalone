import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatWidgetComponent } from '../../../shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ChatWidgetComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  private monitoringInterval: any;
  private notifiedSessionIds: number[] = [];
  // 1. Variável para controlar o estado do menu
  isSidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.startSessionMonitoring();
  }

  ngOnDestroy(): void {
    // Limpa o intervalo quando o admin faz logout ou fecha a aba
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // 2. Função para alternar o estado
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  startSessionMonitoring(): void {
    // Roda a verificação a cada minuto
    this.monitoringInterval = setInterval(() => {
      console.log('--- [MONITORAMENTO] Verificando sessões... ---'); // Log 1: O timer está rodando?

      this.apiService.getActiveSessions().subscribe(sessions => {
        if (sessions.length === 0) {
          console.log('[MONITORAMENTO] Nenhuma sessão ativa encontrada.');
          return;
        }
        console.log(`[MONITORAMENTO] ${sessions.length} sessões ativas encontradas.`); // Log 2: A API retornou dados?

        const now = new Date().getTime();

        sessions.forEach(session => {
          const initialBalanceMs = parseFloat(session.hours_balance) * 60 * 60 * 1000;
          const entryTime = new Date(session.entry_time).getTime();
          const remainingMs = initialBalanceMs - (now - entryTime);
          const remainingMinutes = Math.round(remainingMs / 60000);

          // Log 3: O cálculo está correto?
          console.log(`[MONITORAMENTO] Cliente: ${session.client_name}, Tempo Restante: ${remainingMinutes} minutos.`);

          const FIVE_MINUTES_IN_MS = 300000;

          // Log 4: A condição está sendo atendida?
          if (remainingMs > 0 && remainingMs < FIVE_MINUTES_IN_MS && !this.notifiedSessionIds.includes(session.id)) {

            console.log(`%c[MONITORAMENTO] CONDIÇÃO ATINGIDA! Disparando notificação para ${session.client_name}.`, 'color: lightgreen; font-weight: bold;');

            this.notificationService.show(
              `Atenção: A sessão de ${session.client_name} termina em menos de ${remainingMinutes + 1} minutos!`,
              'warning'
            );

            this.notifiedSessionIds.push(session.id);
          }
        });

        const activeSessionIds = sessions.map(s => s.id);
        this.notifiedSessionIds = this.notifiedSessionIds.filter(id => activeSessionIds.includes(id));
      });
    }, 60000);
  }
}
