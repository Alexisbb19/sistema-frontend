import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: 'Administrador' | 'Tutor' | 'Alumno';
  activo: boolean;
  tutor_asignado_id?: number;
  notas?: string;
  tutor_asignado?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono?: string;
  rol: string;
  tutor_asignado_id?: number;
  notas?: string;
}

export interface UsuarioEstadisticas {
  total: number;
  administradores: number;
  tutores: number;
  alumnos: number;
  activos: number;
  inactivos: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getUsuarios(filters?: { rol?: string; activo?: boolean; search?: string }): Observable<Usuario[]> {
    let params = new HttpParams();
    
    if (filters?.rol) params = params.set('rol', filters.rol);
    if (filters?.activo !== undefined) params = params.set('activo', filters.activo.toString());
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { params });
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  getTutores(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios-tutores`);
  }

  createUsuario(usuario: UsuarioCreate): Observable<{ message: string; usuario: Usuario }> {
    return this.http.post<{ message: string; usuario: Usuario }>(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: Partial<UsuarioCreate>): Observable<{ message: string; usuario: Usuario }> {
    return this.http.put<{ message: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/usuarios/${id}`);
  }

  activateUsuario(id: number): Observable<{ message: string; usuario: Usuario }> {
    return this.http.post<{ message: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/${id}/activate`, {});
  }

  getEstadisticas(): Observable<UsuarioEstadisticas> {
    return this.http.get<UsuarioEstadisticas>(`${this.apiUrl}/usuarios-estadisticas`);
  }
}