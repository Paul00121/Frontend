import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'monitoreo-sockets',
  imports: [CommonModule],
  templateUrl: './monitoreo-sockets.component.html',
  standalone: true
})
export class MonitoreoSocketsComponent {
  private socketService = inject(SocketService);

  darkMode = input.required<boolean>();

  logs = this.socketService.logs;
}
