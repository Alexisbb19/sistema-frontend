import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export interface Notificacion {
  id_notificacion: number;
  usuario_id: number;
  vuelo_id?: number;
  tipo: 'Vuelo Asignado' | 'Vuelo Cancelado' | 'Vuelo Modificado' | 'Recordatorio' | 'Alerta';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_leida?: string;
  created_at: string;
  vuelo?: {
    id_vuelo: number;
    fecha: string;
    hora_inicio: string;
    alumno?: {
      nombre: string;
      apellido: string;
    };
    tutor?: {
      nombre: string;
      apellido: string;
    };
    avioneta?: {
      codigo: string;
      modelo: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:8000/api/notificaciones';
  private notificacionesNoLeidasSubject = new BehaviorSubject<number>(0);
  public notificacionesNoLeidas$ = this.notificacionesNoLeidasSubject.asObservable();

  constructor(private http: HttpClient) {
    // Actualizar contador cada 30 segundos
    interval(30000).pipe(
      switchMap(() => this.contarNoLeidas())
    ).subscribe();
  }

  getNotificaciones(leida?: boolean): Observable<Notificacion[]> {
    let params = new HttpParams();
    if (leida !== undefined) params = params.set('leida', leida.toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}`, { params });
  }

  contarNoLeidas(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/no-leidas/count`)
      .pipe(
        tap(response => this.notificacionesNoLeidasSubject.next(response.count))
      );
  }

  marcarComoLeida(id: number): Observable<{ message: string; notificacion: Notificacion }> {
    return this.http.post<{ message: string; notificacion: Notificacion }>(
      `${this.apiUrl}/${id}/marcar-leida`, {}
    ).pipe(
      tap(() => this.contarNoLeidas().subscribe())
    );
  }

  marcarTodasComoLeidas(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/marcar-todas-leidas`, {})
      .pipe(
        tap(() => this.contarNoLeidas().subscribe())
      );
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.contarNoLeidas().subscribe())
      );
  }
}