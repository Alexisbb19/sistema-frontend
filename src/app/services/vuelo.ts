import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vuelo {
  id_vuelo: number;
  alumno_id: number;
  tutor_id: number;
  avioneta_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  estado: 'Programado' | 'En Curso' | 'Completado' | 'Cancelado';
  observaciones?: string;
  horas_voladas?: number;
  alumno?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  tutor?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  avioneta?: {
    id_avioneta: number;
    codigo: string;
    modelo: string;
    estado: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface VueloCreate {
  alumno_id: number;
  tutor_id: number;
  avioneta_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  observaciones?: string;
}

export interface VueloResponse {
  message: string;
  vuelo: Vuelo;
}


export interface VueloEstadisticas {
  total: number;
  programados: number;
  en_curso: number;
  completados: number;
  cancelados: number;
  horas_totales: number;
}

export interface EstadisticasVuelos {
  total: number;
  programados: number;
  en_curso: number;
  completados: number;
  cancelados: number;
  horas_totales: number;
}

@Injectable({
  providedIn: 'root'
})
export class VueloService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getVuelos(filters?: { 
    estado?: string; 
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    alumno_id?: number;
    tutor_id?: number;
    avioneta_id?: number;
  }): Observable<Vuelo[]> {
    let params = new HttpParams();
    
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.fecha) params = params.set('fecha', filters.fecha);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.alumno_id) params = params.set('alumno_id', filters.alumno_id.toString());
    if (filters?.tutor_id) params = params.set('tutor_id', filters.tutor_id.toString());
    if (filters?.avioneta_id) params = params.set('avioneta_id', filters.avioneta_id.toString());

    return this.http.get<Vuelo[]>(`${this.apiUrl}/vuelos`, { params });
  }

  getVuelo(id: number): Observable<Vuelo> {
    return this.http.get<Vuelo>(`${this.apiUrl}/vuelos/${id}`);
  }

  createVuelo(vuelo: VueloCreate): Observable<{ message: string; vuelo: Vuelo }> {
    return this.http.post<{ message: string; vuelo: Vuelo }>(`${this.apiUrl}/vuelos`, vuelo);
  }

  updateVuelo(id: number, vuelo: Partial<VueloCreate> & { estado?: string }): Observable<{ message: string; vuelo: Vuelo }> {
    return this.http.put<{ message: string; vuelo: Vuelo }>(`${this.apiUrl}/vuelos/${id}`, vuelo);
  }

  deleteVuelo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/vuelos/${id}`);
  }

  cambiarEstado(id: number, estado: string): Observable<{ message: string; vuelo: Vuelo }> {
    return this.http.post<{ message: string; vuelo: Vuelo }>(`${this.apiUrl}/vuelos/${id}/cambiar-estado`, { estado });
  }

  getEstadisticas(): Observable<VueloEstadisticas> {
    return this.http.get<VueloEstadisticas>(`${this.apiUrl}/vuelos-estadisticas`);
  }

  // Métodos específicos para tutores
  getMisVuelos(filters?: any): Observable<Vuelo[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Vuelo[]>(`${this.apiUrl}/tutor/mis-vuelos`, { params });
  }

  actualizarEstadoTutor(
      id: number,
      data: { 
        estado: string; 
        observaciones?: string;
        hora_fin?: string;    // <── AGREGAR ESTO
      }
    ): Observable<{ message: string; vuelo: Vuelo }> {
      return this.http.put<{ message: string; vuelo: Vuelo }>(
        `${this.apiUrl}/vuelos/${id}/actualizar-estado-tutor`,
        data
      );
  }


}