import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlumnoEstadisticas {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  estadisticas: {
    total_vuelos: number;
    vuelos_completados: number;
    vuelos_programados: number;
    horas_totales: number;
    promedio_calificacion: number;
    ultimo_vuelo?: {
      fecha: string;
      estado: string;
    };
    proximo_vuelo?: {
      id_vuelo: number;
      fecha: string;
      hora_inicio: string;
      avioneta?: string;
    };
  };
}

export interface ProgresoAlumno {
  alumno: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  estadisticas: {
    total_vuelos: number;
    vuelos_completados: number;
    vuelos_programados: number;
    horas_totales: number;
    promedio_calificacion_general: number;
    promedio_despegue: number;
    promedio_vuelo: number;
    promedio_aterrizaje: number;
    promedio_comunicacion: number;
    total_despegues: number;
    total_aterrizajes: number;
  };
  maniobras_dominadas: string[];
  progresion_calificaciones: any[];
  ultimas_bitacoras: any[];
  proximos_vuelos: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TutorAlumnoService {
  
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getMisAlumnos(): Observable<AlumnoEstadisticas[]> {
    return this.http.get<AlumnoEstadisticas[]>(`${this.apiUrl}/tutor/mis-alumnos`);
  }

  getProgresoAlumno(alumnoId: number): Observable<ProgresoAlumno> {
    return this.http.get<ProgresoAlumno>(`${this.apiUrl}/tutor/alumno/${alumnoId}/progreso`);
  }
}