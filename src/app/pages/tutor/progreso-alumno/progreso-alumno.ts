import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorAlumnoService, ProgresoAlumno } from '../../../services/tutor-alumno';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tutor-progreso-alumno',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './progreso-alumno.html',
  styleUrls: ['./progreso-alumno.css']
})
export class TutorProgresoAlumnoComponent implements OnInit {
  alumnoId!: number;
  progreso: ProgresoAlumno | null = null;
  loading = false;
  selectedTab: 'estadisticas' | 'bitacoras' | 'progresion' | 'proximos' = 'estadisticas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutorAlumnoService: TutorAlumnoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.alumnoId = +params['id'];
      this.loadProgreso();
    });
  }

  loadProgreso(): void {
    this.loading = true;
    this.tutorAlumnoService.getProgresoAlumno(this.alumnoId).subscribe({
      next: (progreso) => {
        this.progreso = progreso;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar progreso:', error);
        this.loading = false;
        alert('Error al cargar el progreso del alumno');
        this.router.navigate(['/tutor/mis-alumnos']);
      }
    });
  }

  selectTab(tab: 'estadisticas' | 'bitacoras' | 'progresion' | 'proximos'): void {
    this.selectedTab = tab;
  }

  volver(): void {
    this.router.navigate(['/tutor/mis-alumnos']);
  }

  getInitials(nombre?: string, apellido?: string): string {
    if (!nombre || !apellido) return '?';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getManiobrasAgrupadas(): { [key: string]: string[] } {
    if (!this.progreso?.maniobras_dominadas) return {};

    const grupos: { [key: string]: string[] } = {
      'Básico': [],
      'Intermedio': [],
      'Avanzado': []
    };

    // Lista de maniobras conocidas con sus categorías
    const maniobrasInfo: { [key: string]: string } = {
      'despegue_normal': 'Básico',
      'despegue_corto': 'Avanzado',
      'aterrizaje_normal': 'Básico',
      'aterrizaje_corto': 'Avanzado',
      'aterrizaje_precision': 'Avanzado',
      'viraje_coordinado': 'Básico',
      'viraje_inclinado': 'Intermedio',
      'perdida_potencia': 'Intermedio',
      'recuperacion_perdida': 'Intermedio',
      'vuelo_lento': 'Básico',
      'navegacion_visual': 'Básico',
      'navegacion_instrumental': 'Avanzado',
      'emergencia_motor': 'Avanzado',
      'toque_y_despegue': 'Básico',
      'circuito_trafico': 'Básico',
      'comunicacion_torre': 'Básico',
      'vuelo_cross_country': 'Intermedio',
      'aproximacion_instrumental': 'Avanzado',
    };

    const nombresLegibles: { [key: string]: string } = {
      'despegue_normal': 'Despegue Normal',
      'despegue_corto': 'Despegue Corto',
      'aterrizaje_normal': 'Aterrizaje Normal',
      'aterrizaje_corto': 'Aterrizaje Corto',
      'aterrizaje_precision': 'Aterrizaje de Precisión',
      'viraje_coordinado': 'Viraje Coordinado',
      'viraje_inclinado': 'Viraje Inclinado (45°)',
      'perdida_potencia': 'Pérdida de Potencia',
      'recuperacion_perdida': 'Recuperación de Pérdida',
      'vuelo_lento': 'Vuelo Lento',
      'navegacion_visual': 'Navegación Visual',
      'navegacion_instrumental': 'Navegación Instrumental',
      'emergencia_motor': 'Simulación de Emergencia de Motor',
      'toque_y_despegue': 'Toque y Despegue',
      'circuito_trafico': 'Circuito de Tráfico',
      'comunicacion_torre': 'Comunicación con Torre',
      'vuelo_cross_country': 'Vuelo Cross-Country',
      'aproximacion_instrumental': 'Aproximación Instrumental',
    };

    this.progreso.maniobras_dominadas.forEach(id => {
      const categoria = maniobrasInfo[id] || 'Básico';
      const nombre = nombresLegibles[id] || id;
      grupos[categoria].push(nombre);
    });

    return grupos;
  }

  getProgressPercentage(completados: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completados / total) * 100);
  }
}