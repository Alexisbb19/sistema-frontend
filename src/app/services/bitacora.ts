import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Maniobra {
  id: string;
  nombre: string;
  categoria: string;
}

export interface BitacoraVuelo {
  id_bitacora: number;
  vuelo_id: number;
  calificacion_general?: number;
  calificacion_despegue?: number;
  calificacion_vuelo?: number;
  calificacion_aterrizaje?: number;
  calificacion_comunicacion?: number;
  maniobras_realizadas?: string[];
  observaciones_tecnicas?: string;
  observaciones_generales?: string;
  areas_mejorar?: string;
  logros?: string;
  condiciones_climaticas?: string;
  visibilidad?: string;
  viento?: string;
  horas_vuelo_real?: number;
  horas_vuelo_simulador?: number;
  numero_aterrizajes?: number;
  numero_despegues?: number;
  hubo_incidente?: boolean;
  descripcion_incidente?: string;
  created_at?: string;
  updated_at?: string;
  vuelo?: any;
}

export interface BitacoraCreate {
  calificacion_general?: number;
  calificacion_despegue?: number;
  calificacion_vuelo?: number;
  calificacion_aterrizaje?: number;
  calificacion_comunicacion?: number;
  maniobras_realizadas?: string[];
  observaciones_tecnicas?: string;
  observaciones_generales?: string;
  areas_mejorar?: string;
  logros?: string;
  condiciones_climaticas?: string;
  visibilidad?: string;
  viento?: string;
  horas_vuelo_real?: number;
  horas_vuelo_simulador?: number;
  numero_aterrizajes?: number;
  numero_despegues?: number;
  hubo_incidente?: boolean;
  descripcion_incidente?: string;
}

export interface BitacoraResponse {
  message: string;
  bitacora: BitacoraVuelo;
}

export interface HistorialAlumnoResponse {
  bitacoras: BitacoraVuelo[];
  estadisticas: {
    total_vuelos: number;
    promedio_calificacion: number;
    total_horas: number;
    total_aterrizajes: number;
    total_despegues: number;
    maniobras_totales: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getBitacora(vueloId: number): Observable<BitacoraVuelo> {
    return this.http.get<BitacoraVuelo>(`${this.apiUrl}/tutor/bitacora/vuelo/${vueloId}`);
  }

  guardarBitacora(vueloId: number, bitacora: BitacoraCreate): Observable<{ message: string; bitacora: BitacoraVuelo }> {
    return this.http.post<{ message: string; bitacora: BitacoraVuelo }>(
      `${this.apiUrl}/tutor/bitacora/vuelo/${vueloId}`, 
      bitacora
    );
  }

  getHistorialAlumno(alumnoId: number): Observable<{ bitacoras: BitacoraVuelo[]; estadisticas: any }> {
    return this.http.get<{ bitacoras: BitacoraVuelo[]; estadisticas: any }>(
      `${this.apiUrl}/tutor/bitacora/alumno/${alumnoId}`
    );
  }

  getManiobras(): Observable<Maniobra[]> {
    return this.http.get<Maniobra[]>(`${this.apiUrl}/tutor/maniobras`);

  }
}