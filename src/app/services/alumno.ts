import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardAlumno {
  estadisticas: {
    total_vuelos: number;
    vuelos_completados: number;
    vuelos_programados: number;
    horas_totales: number;
    promedio_calificacion: number;
    mejor_calificacion: number;
  };
  proximo_vuelo: any;
  ultimo_vuelo: any;
  vuelos_por_mes: any[];
  progresion_calificaciones: any[];
}

export interface HorarioSemanal {
  semana_inicio: string;
  semana_fin: string;
  horario: Array<{
    fecha: string;
    dia_nombre: string;
    vuelos: any[];
  }>;
}

export interface ProgresoAlumno {
  alumno: {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
  };
  estadisticas: {
    total_vuelos: number;
    vuelos_completados: number;
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
  tutores: any[];
  ultimas_bitacoras: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardAlumno> {
    return this.http.get<DashboardAlumno>(`${this.apiUrl}/alumno/dashboard`);
  }

  getHorarioSemanal(fechaInicio?: string): Observable<HorarioSemanal> {
    let params = new HttpParams();
    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio);
    }
    return this.http.get<HorarioSemanal>(`${this.apiUrl}/alumno/horario-semanal`, { params });
  }

  getHistorialVuelos(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/alumno/historial-vuelos`, { params });
  }

  getVuelo(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alumno/vuelo/${id}`);
  }

  getBitacora(vueloId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alumno/bitacora/${vueloId}`);
  }

  getMiProgreso(): Observable<ProgresoAlumno> {
    return this.http.get<ProgresoAlumno>(`${this.apiUrl}/alumno/mi-progreso`);
  }
}