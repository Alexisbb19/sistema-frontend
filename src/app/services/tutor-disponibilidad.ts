import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Disponibilidad {
  id_disponibilidad?: number;
  tutor_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReporteFalla {
  id_reporte?: number;
  avioneta_id: number;
  reportado_por?: number;
  tipo_falla: string;
  severidad: string;
  descripcion: string;
  requiere_atencion_inmediata: boolean;
  estado?: string;
  notas_resolucion?: string;
  fecha_resolucion?: string;
  avioneta?: any;
  reportadoPor?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DisponibilidadResponse {
  message: string;
  disponibilidad: Disponibilidad;
}

export interface ReporteFallaResponse {
  message: string;
  reporte: ReporteFalla;
}

@Injectable({
  providedIn: 'root'
})
export class TutorDisponibilidadService {
  
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Disponibilidad
  getDisponibilidad(): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/tutor/disponibilidad`);
  }

  updateDisponibilidad(data: any): Observable<DisponibilidadResponse> {
    return this.http.post<DisponibilidadResponse>(`${this.apiUrl}/tutor/disponibilidad`, data);
  }

  // Reportes de fallas
  getMisReportes(): Observable<ReporteFalla[]> {
    return this.http.get<ReporteFalla[]>(`${this.apiUrl}/tutor/reportes-fallas`);
  }

  getReporte(id: number): Observable<ReporteFalla> {
    return this.http.get<ReporteFalla>(`${this.apiUrl}/tutor/reportes-fallas/${id}`);
  }

  reportarFalla(data: any): Observable<ReporteFallaResponse> {
    return this.http.post<ReporteFallaResponse>(`${this.apiUrl}/tutor/reportar-falla`, data);
  }

  getAvionetasDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tutor/avionetas-disponibles`);
  }
} 