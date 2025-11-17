import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  usuarios: {
    total: number;
    alumnos: number;
    tutores: number;
    activos: number;
  };
  avionetas: {
    total: number;
    activas: number;
    mantenimiento: number;
    horas_totales: number;
  };
  vuelos: {
    total: number;
    programados: number;
    completados: number;
    cancelados: number;
    horas_voladas: number;
    hoy: number;
    esta_semana: number;
  };
}

export interface VueloPorTutor {
  tutor_id: number;
  total_vuelos: number;
  total_horas: number;
  tutor: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
}

export interface VueloPorAlumno {
  alumno_id: number;
  total_vuelos: number;
  total_horas: number;
  alumno: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
}

export interface UsoAvioneta {
  avioneta_id: number;
  total_vuelos: number;
  total_horas: number;
  avioneta: {
    id_avioneta: number;
    codigo: string;
    modelo: string;
  };
}

export interface MapaCalor {
  [dia: string]: {
    [hora: string]: number;
  };
}

export interface VueloPorMes {
  año: number;
  mes: number;
  total_vuelos: number;
  total_horas: number;
}

export interface TopAlumno {
  id_usuario: number;
  nombre: string;
  apellido: string;
  total_horas: number;
  total_vuelos: number;
}

export interface TendenciaVuelo {
  fecha: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8000/api/reportes';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getVuelosPorTutor(fechaInicio?: string, fechaFin?: string): Observable<VueloPorTutor[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<VueloPorTutor[]>(`${this.apiUrl}/vuelos-por-tutor`, { params });
  }

  getVuelosPorAlumno(fechaInicio?: string, fechaFin?: string): Observable<VueloPorAlumno[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<VueloPorAlumno[]>(`${this.apiUrl}/vuelos-por-alumno`, { params });
  }

  getUsoAvionetas(fechaInicio?: string, fechaFin?: string): Observable<UsoAvioneta[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<UsoAvioneta[]>(`${this.apiUrl}/uso-avionetas`, { params });
  }

  getMapaCalorHorarios(fechaInicio?: string, fechaFin?: string): Observable<MapaCalor> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<MapaCalor>(`${this.apiUrl}/mapa-calor-horarios`, { params });
  }

  getVuelosPorMes(): Observable<VueloPorMes[]> {
    return this.http.get<VueloPorMes[]>(`${this.apiUrl}/vuelos-por-mes`);
  }

  getTopAlumnos(limit: number = 10): Observable<TopAlumno[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopAlumno[]>(`${this.apiUrl}/top-alumnos`, { params });
  }

  getTendenciaVuelos(): Observable<TendenciaVuelo[]> {
    return this.http.get<TendenciaVuelo[]>(`${this.apiUrl}/tendencia-vuelos`);
  }
}