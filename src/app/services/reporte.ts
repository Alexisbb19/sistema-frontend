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
  promedio_horas: number;
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
  promedio_horas: number;
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
  promedio_horas: number;
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

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  search?: string;
  per_page?: number;
  page?: number;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
  paginate?: boolean;
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

  getVuelosPorTutor(filtros?: FiltrosReporte): Observable<PaginatedResponse<VueloPorTutor> | VueloPorTutor[]> {
    let params = this.buildParams(filtros);
    return this.http.get<any>(`${this.apiUrl}/vuelos-por-tutor`, { params });
  }

  getVuelosPorAlumno(filtros?: FiltrosReporte): Observable<PaginatedResponse<VueloPorAlumno> | VueloPorAlumno[]> {
    let params = this.buildParams(filtros);
    return this.http.get<any>(`${this.apiUrl}/vuelos-por-alumno`, { params });
  }

  getUsoAvionetas(filtros?: FiltrosReporte): Observable<PaginatedResponse<UsoAvioneta> | UsoAvioneta[]> {
    let params = this.buildParams(filtros);
    return this.http.get<any>(`${this.apiUrl}/uso-avionetas`, { params });
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

  getTopAlumnos(limit: number = 10, fechaInicio?: string, fechaFin?: string): Observable<TopAlumno[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<TopAlumno[]>(`${this.apiUrl}/top-alumnos`, { params });
  }

  getTendenciaVuelos(dias: number = 30): Observable<TendenciaVuelo[]> {
    let params = new HttpParams().set('dias', dias.toString());
    return this.http.get<TendenciaVuelo[]>(`${this.apiUrl}/tendencia-vuelos`, { params });
  }

  exportarPDF(tipo: string, fechaInicio?: string, fechaFin?: string): void {
    let params = new HttpParams().set('tipo', tipo);
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    
    const url = `${this.apiUrl}/exportar-pdf?${params.toString()}`;
    window.open(url, '_blank');
  }

  exportarExcel(tipo: string, fechaInicio?: string, fechaFin?: string): void {
    let params = new HttpParams().set('tipo', tipo);
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    
    const url = `${this.apiUrl}/exportar-excel?${params.toString()}`;
    window.open(url, '_blank');
  }

  private buildParams(filtros?: FiltrosReporte): HttpParams {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.search) params = params.set('search', filtros.search);
      if (filtros.per_page) params = params.set('per_page', filtros.per_page.toString());
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.order_by) params = params.set('order_by', filtros.order_by);
      if (filtros.order_dir) params = params.set('order_dir', filtros.order_dir);
      if (filtros.paginate !== undefined) params = params.set('paginate', filtros.paginate.toString());
    }
    
    return params;
  }
}