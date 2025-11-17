import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TutorAlumnoService, AlumnoEstadisticas } from '../../../services/tutor-alumno';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-mis-alumnos',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './mis-alumnos.html',
  styleUrls: ['./mis-alumnos.css']
})
export class TutorMisAlumnosComponent implements OnInit {
  alumnos: AlumnoEstadisticas[] = [];
  alumnosFiltrados: AlumnoEstadisticas[] = [];
  loading = false;
  searchTerm = '';

  // Estadísticas generales
  totalAlumnos = 0;
  alumnosActivos = 0;
  promedioGeneral = 0;
  horasTotales = 0;

  constructor(
    private tutorAlumnoService: TutorAlumnoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAlumnos();
  }

  loadAlumnos(): void {
    this.loading = true;
    this.tutorAlumnoService.getMisAlumnos().subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos;
        this.alumnosFiltrados = alumnos;
        this.calculateGeneralStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
        this.loading = false;
        alert('Error al cargar los alumnos');
      }
    });
  }

  calculateGeneralStats(): void {
    this.totalAlumnos = this.alumnos.length;
    this.alumnosActivos = this.alumnos.filter(a => 
      a.estadisticas.vuelos_programados > 0
    ).length;
    
    const calificaciones = this.alumnos
      .map(a => a.estadisticas.promedio_calificacion)
      .filter(c => c > 0);
    
    this.promedioGeneral = calificaciones.length > 0
      ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
      : 0;
    
    this.horasTotales = this.alumnos
      .reduce((sum, a) => sum + a.estadisticas.horas_totales, 0);
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.alumnosFiltrados = this.alumnos;
      return;
    }

    this.alumnosFiltrados = this.alumnos.filter(alumno =>
      alumno.nombre.toLowerCase().includes(term) ||
      alumno.apellido.toLowerCase().includes(term) ||
      alumno.correo.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.alumnosFiltrados = this.alumnos;
  }

  verProgreso(alumnoId: number): void {
    this.router.navigate(['/tutor/alumno', alumnoId]);
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getCalificacionClass(calificacion: number): string {
    if (calificacion >= 4.5) return 'calificacion-excelente';
    if (calificacion >= 3.5) return 'calificacion-buena';
    if (calificacion >= 2.5) return 'calificacion-regular';
    return 'calificacion-baja';
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