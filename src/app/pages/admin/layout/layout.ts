import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd } from '@angular/router';
import { AuthService, Usuario } from '../../../services/auth';
import { NotificacionService } from '../../../services/notificacion';
import { filter } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class AdminLayoutComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarCollapsed = false;
  currentRoute = '';
  notificacionesCount = 0;

  private pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Panel de Administración',
    '/admin/usuarios': 'Gestión de Usuarios',
    '/admin/avionetas': 'Gestión de Avionetas',
    '/admin/vuelos': 'Gestión de Vuelos',
    '/admin/reportes': 'Reportes y Análisis'
  };

  private pageSubtitles: { [key: string]: string } = {
    '/admin/dashboard': 'Bienvenido al sistema de gestión aeronáutica',
    '/admin/usuarios': 'Administra usuarios, asigna roles y controla accesos',
    '/admin/avionetas': 'Administra la flota de avionetas y su mantenimiento',
    '/admin/vuelos': 'Programa y gestiona los vuelos de práctica',
    '/admin/reportes': 'Visualiza estadísticas detalladas y métricas de rendimiento' 
  };

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar que el usuario sea administrador
    if (this.currentUser?.rol !== 'Administrador') {
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
    return this.pageTitles[this.currentRoute] || 'Administración';
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