import { Component, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { AuthService, Usuario } from '../../../services/auth';
import { NotificacionService } from '../../../services/notificacion';
import { filter } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alumno-layout',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class AlumnoLayoutComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarCollapsed = false;
  currentRoute = '';
  notificacionesCount = 0;

  private pageTitles: { [key: string]: string } = {
    '/alumno/dashboard': 'Mi Dashboard',
    '/alumno/mis-vuelos': 'Mis Vuelos',
    '/alumno/historial': 'Historial de Vuelos',
    '/alumno/mi-progreso': 'Mi Progreso'
  };

  private pageSubtitles: { [key: string]: string } = {
    '/alumno/dashboard': 'Resumen de tu actividad y próximos vuelos',
    '/alumno/mis-vuelos': 'Consulta tu horario semanal de vuelos',
    '/alumno/historial': 'Revisa tus vuelos completados y bitácoras',
    '/alumno/mi-progreso': 'Visualiza tu evolución y estadísticas'
  };

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser?.rol !== 'Alumno') {
      this.router.navigate(['/unauthorized']);
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    this.currentRoute = this.router.url;

    this.notificacionService.contarNoLeidas().subscribe();
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
    return this.pageTitles[this.currentRoute] || 'Panel de Alumno';
  }

  getPageSubtitle(): string {
    return this.pageSubtitles[this.currentRoute] || '';
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}