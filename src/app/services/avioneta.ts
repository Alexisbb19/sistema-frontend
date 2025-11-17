import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Avioneta {
  id_avioneta: number;
  codigo: string;
  modelo: string;
  horas_vuelo: number;
  estado: 'Activo' | 'Mantenimiento';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AvionetaCreate {
  codigo: string;
  modelo: string;
  horas_vuelo?: number;
  estado: 'Activo' | 'Mantenimiento';
  observaciones?: string;
}

export interface AvionetaEstadisticas {
  total: number;
  activas: number;
  mantenimiento: number;
  horas_totales: number;
  promedio_horas: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvionetaService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getAvionetas(filters?: { estado?: string; search?: string }): Observable<Avioneta[]> {
    let params = new HttpParams();
    
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Avioneta[]>(`${this.apiUrl}/avionetas`, { params });
  }

  getAvioneta(id: number): Observable<Avioneta> {
    return this.http.get<Avioneta>(`${this.apiUrl}/avionetas/${id}`);
  }

  createAvioneta(avioneta: AvionetaCreate): Observable<{ message: string; avioneta: Avioneta }> {
    return this.http.post<{ message: string; avioneta: Avioneta }>(`${this.apiUrl}/avionetas`, avioneta);
  }

  updateAvioneta(id: number, avioneta: Partial<AvionetaCreate>): Observable<{ message: string; avioneta: Avioneta }> {
    return this.http.put<{ message: string; avioneta: Avioneta }>(`${this.apiUrl}/avionetas/${id}`, avioneta);
  }

  deleteAvioneta(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/avionetas/${id}`);
  }

  cambiarEstado(id: number, estado: 'Activo' | 'Mantenimiento'): Observable<{ message: string; avioneta: Avioneta }> {
    return this.http.post<{ message: string; avioneta: Avioneta }>(`${this.apiUrl}/avionetas/${id}/cambiar-estado`, { estado });
  }

  getEstadisticas(): Observable<AvionetaEstadisticas> {
    return this.http.get<AvionetaEstadisticas>(`${this.apiUrl}/avionetas-estadisticas`);
  }
}