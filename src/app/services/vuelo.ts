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

export interface PaginatedVuelos {
  current_page: number;
  data: Vuelo[];
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

export interface UsuarioBusqueda {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

export interface AvionetaBusqueda {
  id_avioneta: number;
  codigo: string;
  modelo: string;
  estado: string;
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
    search?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedVuelos> {
    let params = new HttpParams();
    
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.fecha) params = params.set('fecha', filters.fecha);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.alumno_id) params = params.set('alumno_id', filters.alumno_id.toString());
    if (filters?.tutor_id) params = params.set('tutor_id', filters.tutor_id.toString());
    if (filters?.avioneta_id) params = params.set('avioneta_id', filters.avioneta_id.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedVuelos>(`${this.apiUrl}/vuelos`, { params });
  }

  getVuelo(id: number): Observable<Vuelo> {
    return this.http.get<Vuelo>(`${this.apiUrl}/vuelos/${id}`);
  }

  createVuelo(vuelo: VueloCreate): Observable<VueloResponse> {
    return this.http.post<VueloResponse>(`${this.apiUrl}/vuelos`, vuelo);
  }

  updateVuelo(id: number, vuelo: Partial<VueloCreate> & { estado?: string }): Observable<VueloResponse> {
    return this.http.put<VueloResponse>(`${this.apiUrl}/vuelos/${id}`, vuelo);
  }

  deleteVuelo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/vuelos/${id}`);
  }

  cambiarEstado(id: number, estado: string): Observable<VueloResponse> {
    return this.http.post<VueloResponse>(`${this.apiUrl}/vuelos/${id}/cambiar-estado`, { estado });
  }

  getEstadisticas(): Observable<VueloEstadisticas> {
    return this.http.get<VueloEstadisticas>(`${this.apiUrl}/vuelos-estadisticas`);
  }

  // Búsqueda de usuarios (alumnos/tutores)
  buscarUsuarios(search: string, rol?: 'Alumno' | 'Tutor'): Observable<UsuarioBusqueda[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (rol) params = params.set('rol', rol);
    
    return this.http.get<UsuarioBusqueda[]>(`${this.apiUrl}/buscar-usuarios`, { params });
  }

  // Búsqueda de avionetas
  buscarAvionetas(search: string): Observable<AvionetaBusqueda[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    
    return this.http.get<AvionetaBusqueda[]>(`${this.apiUrl}/buscar-avionetas`, { params });
  }

  // Métodos específicos para tutores
  // Actualiza el método getMisVuelos en vuelo.service.ts:

  getMisVuelos(filters?: {
    estado?: string;
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    paginate?: boolean;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedVuelos | Vuelo[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.fecha) params = params.set('fecha', filters.fecha);
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
      if (filters.paginate !== undefined) params = params.set('paginate', filters.paginate.toString());
      if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
    }
    
    return this.http.get<any>(`${this.apiUrl}/tutor/mis-vuelos`, { params });
  }

  actualizarEstadoTutor(
    id: number,
    data: { 
      estado: string; 
      observaciones?: string;
      hora_fin?: string;
    }
  ): Observable<VueloResponse> {
    return this.http.put<VueloResponse>(
      `${this.apiUrl}/tutor/vuelos/${id}/estado`,
      data
    );
  }
}