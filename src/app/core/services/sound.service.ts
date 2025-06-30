import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  playSound(type: 'alarm' | 'chat'): void {
    const audio = new Audio();

    // Define o caminho do arquivo de som com base no tipo
    switch (type) {
      case 'alarm':
        audio.src = 'https://vemprogamehub.com/painel/app/pages/admin/layout/assets/alarm.mp3';
        break;
      case 'chat':
        audio.src = 'https://vemprogamehub.com/painel/app/pages/admin/layout/assets/chat.mp3';
        break;
    }

    // Carrega e toca o áudio
    audio.load();

    // O play() retorna uma Promise, que podemos usar para tratar erros de autoplay
    audio.play().catch(error => {
      // Navegadores modernos podem bloquear o autoplay se não houver interação do usuário.
      // O console.error ajuda a depurar isso se o som não tocar.
      console.error(`Erro ao tocar o som '${type}':`, error);
    });
  }
}
