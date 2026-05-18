import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  estado: 'Pendiente' | 'En Reparación' | 'Solucionado';
  fechaCreacion: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);

  private readonly API_URL = `${environment.apiUrl}/reportes`;

  getAll(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.API_URL);
  }

  getById(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.API_URL}/${id}`);
  }

  create(reporte: Partial<Reporte>): Observable<Reporte> {
    return this.http.post<Reporte>(this.API_URL, reporte);
  }

  update(id: number, reporte: Partial<Reporte>): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.API_URL}/${id}`, reporte);
  }

  delete(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.API_URL}/${id}`);
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<Reporte> {
    return this.http.put<Reporte>(`${this.API_URL}/${id}`, { estado: nuevoEstado });
  }
}