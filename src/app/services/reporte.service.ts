import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.http.get<Reporte[]>(this.API_URL).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  getById(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.API_URL}/${id}`);
  }

  create(reporte: Partial<Reporte>): Observable<Reporte> {
    return this.http.post<Reporte>(this.API_URL, reporte).pipe(
      catchError((err) => throwError(() => err))
    );
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

  listenToReportStream(): Observable<any> {
    return new Observable((observer) => {
      const eventSource = new EventSource(`${environment.apiUrl}/reportes/stream`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);
      };

      eventSource.onerror = (error) => {
        observer.error(error);
      };

      return () => eventSource.close();
    });
  }
}
