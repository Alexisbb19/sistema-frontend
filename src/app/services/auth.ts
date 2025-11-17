import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: 'Administrador' | 'Tutor' | 'Alumno';
  nombre_completo: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
          this.currentUserSubject.next(response.usuario);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error loading user from storage', e);
      }
    }
  }

  me(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.apiUrl}/me`)
      .pipe(
        tap(response => {
          localStorage.setItem('user', JSON.stringify(response.usuario));
          this.currentUserSubject.next(response.usuario);
        })
      );
  }
}