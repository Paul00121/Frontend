import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  estado: 'Pendiente' | 'En Reparación' | 'Solucionado';
  fechaCreacion: Date | string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface Comentario {
  id: string;
  nota: string;
  fecha: string;
  reporteId: string;
  usuarioId: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);

  private readonly API_URL = `${environment.apiUrl}/reportes`;

  getAll(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.API_URL).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  getById(id: string): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.API_URL}/${id}`);
  }

  create(reporte: Partial<Reporte>): Observable<Reporte> {
    return this.http.post<Reporte>(this.API_URL, reporte).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  update(id: string, reporte: Partial<Reporte>): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.API_URL}/${id}`, reporte);
  }

  delete(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.API_URL}/${id}`);
  }

  cambiarEstado(id: string, nuevoEstado: string): Observable<Reporte> {
    return this.http.patch<Reporte>(`${this.API_URL}/${id}`, { estado: nuevoEstado });
  }

  getComentarios(reporteId: string): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.API_URL}/${reporteId}/comentarios`);
  }

  crearComentario(reporteId: string, nota: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.API_URL}/${reporteId}/comentarios`, { nota });
  }

}
