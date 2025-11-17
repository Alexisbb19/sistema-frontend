import { Component, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { AuthService, Usuario } from '../../../services/auth';
import { NotificacionService } from '../../../services/notificacion';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-layout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class TutorLayoutComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarCollapsed = false;
  currentRoute = '';
  notificacionesCount = 0;

  private pageTitles: { [key: string]: string } = {
    '/tutor/mis-vuelos': 'Mi Calendario de Vuelos',
    '/tutor/mis-alumnos': 'Mis Alumnos',
    '/tutor/reportes': 'Mis Reportes',
    '/tutor/reportar-fallas': 'Reportar Fallas'
  };

  private pageSubtitles: { [key: string]: string } = {
    '/tutor/mis-vuelos': 'Gestiona tus vuelos programados y actualiza su estado',
    '/tutor/mis-alumnos': 'Consulta el progreso y desempeño de tus alumnos',
    '/tutor/reportes': 'Visualiza tus estadísticas y rendimiento',
    '/tutor/reportar-fallas': 'Reporta problemas técnicos de las avionetas'
  };

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar que el usuario sea tutor
    if (this.currentUser?.rol !== 'Tutor') {
      this.router.navigate(['/unauthorized']);
    }

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    this.currentRoute = this.router.url;

    // Cargar contador de notificaciones
    this.notificacionService.contarNoLeidas().subscribe();
    
    // Suscribirse a cambios en notificaciones
    this.notificacionService.notificacionesNoLeidas$.subscribe(
      count => this.notificacionesCount = count
    );
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const initials = `${this.currentUser.nombre.charAt(0)}${this.currentUser.apellido.charAt(0)}`;
    return initials.toUpperCase();
  }

  getPageTitle(): string {
    // Manejar rutas dinámicas como /tutor/alumno/:id
    if (this.currentRoute.includes('/tutor/alumno/')) {
      return 'Progreso del Alumno';
    }
    return this.pageTitles[this.currentRoute] || 'Panel de Tutor';
  }

  getPageSubtitle(): string {
    // Manejar rutas dinámicas
    if (this.currentRoute.includes('/tutor/alumno/')) {
      return 'Detalle del desempeño y estadísticas del alumno';
    }
    return this.pageSubtitles[this.currentRoute] || '';
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}