import { Component, OnInit } from '@angular/core';
import { AuthService, Usuario } from '../../../services/auth';
import { ReporteService, DashboardData } from '../../../services/reporte';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: Usuario | null = null;
  sidebarCollapsed = false;
  dashboardData: DashboardData | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private reporteService: ReporteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar que el usuario sea administrador
    if (this.currentUser?.rol !== 'Administrador') {
      this.router.navigate(['/unauthorized']);
    }
    this.loadDashboardData();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const initials = `${this.currentUser.nombre.charAt(0)}${this.currentUser.apellido.charAt(0)}`;
    return initials.toUpperCase();
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.reporteService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.loading = false;
      }
    });
  }
}