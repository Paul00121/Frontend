import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'USUARIO' | 'ADMINISTRADOR';
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private usuarioSignal = signal<Usuario | null>(JSON.parse(localStorage.getItem('usuario') || 'null'));

  readonly token = this.tokenSignal.asReadonly();
  readonly usuario = this.usuarioSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isAdmin = computed(() => this.usuarioSignal()?.rol === 'ADMINISTRADOR');

  register(data: { nombre: string; email: string; password: string; rol?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  updatePerfil(data: { nombre?: string; email?: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/perfil`, data).pipe(
      tap(usuario => {
        this.usuarioSignal.set(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }

  getUsuarios(params?: { search?: string; rol?: string }): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/usuarios`, { params });
  }

  adminCreateUser(data: { nombre: string; email: string; password: string; rol?: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API_URL}/usuarios`, data);
  }

  adminUpdateUser(id: string, data: { nombre?: string; email?: string; rol?: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/usuarios/${id}`, data);
  }

  adminDeleteUser(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.API_URL}/usuarios/${id}`);
  }

  logoutBackend(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API_URL}/logout`, {});
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.tokenSignal.set(null);
    this.usuarioSignal.set(null);
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.usuario));
    this.tokenSignal.set(res.token);
    this.usuarioSignal.set(res.usuario);
  }
}
