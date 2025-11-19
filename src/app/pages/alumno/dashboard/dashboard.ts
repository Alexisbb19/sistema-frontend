import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlumnoService, DashboardAlumno } from '../../../services/alumno';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alumno-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AlumnoDashboardComponent implements OnInit {
  dashboard: DashboardAlumno | null = null;
  loading = false;

  constructor(
    private alumnoService: AlumnoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.alumnoService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loading = false;
        alert('Error al cargar el dashboard');
      }
    });
  }

  verMisVuelos(): void {
    this.router.navigate(['/alumno/mis-vuelos']);
  }

  verHistorial(): void {
    this.router.navigate(['/alumno/historial']);
  }

  verProgreso(): void {
    this.router.navigate(['/alumno/mi-progreso']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getCalificacionColor(calificacion: number): string {
    if (calificacion >= 4.5) return '#10b981';
    if (calificacion >= 3.5) return '#3b82f6';
    if (calificacion >= 2.5) return '#f59e0b';
    return '#ef4444';
  }

  getStars(calificacion: number): string[] {
    const fullStars = Math.floor(calificacion);
    const hasHalfStar = calificacion % 1 >= 0.5;
    const stars: string[] = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    if (hasHalfStar) {
      stars.push('half');
    }
    
    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }
}