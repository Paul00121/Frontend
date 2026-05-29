import { Injectable, OnDestroy, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private loggingInitialized = false;

  logs = signal<string[]>([]);

  private addLog(texto: string): void {
    const timestamp = new Date().toLocaleTimeString('es-BO', { hour12: false });
    this.logs.update((lista) => [`[${timestamp}] ${texto}`, ...lista.slice(0, 199)]);
  }

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const serverUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      const msg = `[SOCKET] Conectado exitosamente al servidor (ID: ${this.socket?.id})`;
      console.log(msg);
      this.addLog(msg);
    });

    this.socket.on('disconnect', (reason) => {
      const msg = `[ERROR] Conexión perdida con el servidor de Sockets. Reintentando... (${reason})`;
      console.warn(msg);
      this.addLog(msg);
    });

    this.socket.on('connect_error', (err) => {
      const msg = `[ERROR] Fallo al conectar: ${err.message}`;
      console.error(msg);
      this.addLog(msg);
    });

    if (!this.loggingInitialized) {
      this.socket.on('reporte.creado', (data: any) =>
        this.addLog(`[EVENTO] Reporte de infraestructura modificado en tiempo real — Creado: ${data.titulo}`)
      );
      this.socket.on('reporte.actualizado', (data: any) =>
        this.addLog(`[EVENTO] Reporte de infraestructura modificado en tiempo real — Actualizado: ${data.titulo}`)
      );
      this.socket.on('reporte.eliminado', (data: any) =>
        this.addLog(`[EVENTO] Reporte de infraestructura modificado en tiempo real — Eliminado ID: ${data.id}`)
      );
      this.socket.on('usuario.creado', (data: any) =>
        this.addLog(`[EVENTO] Usuario creado en tiempo real — ${data.nombre} (${data.rol})`)
      );
      this.socket.on('usuario.actualizado', (data: any) =>
        this.addLog(`[EVENTO] Usuario actualizado en tiempo real — ${data.nombre} (${data.rol})`)
      );
      this.socket.on('usuario.eliminado', (data: any) =>
        this.addLog(`[EVENTO] Usuario eliminado en tiempo real — ID: ${data.id}`)
      );
      this.socket.on('usuario-conectado', (data: any) =>
        this.addLog(`[SESION] ${data.nombre} (${data.email}) ha iniciado sesión`)
      );
      this.loggingInitialized = true;
    }

    return this.socket;
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.loggingInitialized = false;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
