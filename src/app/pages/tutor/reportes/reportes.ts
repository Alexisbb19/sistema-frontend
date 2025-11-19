import { Component, OnInit } from '@angular/core';
import { VueloService } from '../../../services/vuelo';
import { BitacoraService } from '../../../services/bitacora';
import { TutorAlumnoService } from '../../../services/tutor-alumno';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-reportes',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class TutorReportesComponent implements OnInit {
  loading = false;
  
  // Estadísticas generales
  totalVuelos = 0;
  vuelosCompletados = 0;
  vuelosProgramados = 0;
  horasTotales = 0;
  promedioCalificacion = 0;
  
  // Estadísticas por mes
  vuelosPorMes: any[] = [];
  
  // Alumnos con mejor rendimiento
  mejoresAlumnos: any[] = [];
  
  // Estadísticas de maniobras
  maniobrasMasEnsenadas: any[] = [];
  
  // Filtros
  mesSeleccionado = '';
  anioSeleccionado = '';
  
  // Datos para gráficos
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(
    private vueloService: VueloService,
    private bitacoraService: BitacoraService,
    private tutorAlumnoService: TutorAlumnoService
  ) {}

  ngOnInit(): void {
    this.initializeDates();
    this.loadReportes();
  }

  initializeDates(): void {
    const today = new Date();
    this.mesSeleccionado = String(today.getMonth() + 1).padStart(2, '0');
    this.anioSeleccionado = String(today.getFullYear());
  }

  loadReportes(): void {
    this.loading = true;
    
    // Cargar vuelos del tutor
    this.vueloService.getMisVuelos().subscribe({
      next: (resp) => {
        const vuelos = Array.isArray(resp) ? resp : resp.data;
        this.processVuelosData(vuelos);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.loading = false;
        alert('Error al cargar los reportes');
      }
    });

    // Cargar alumnos para estadísticas
    this.tutorAlumnoService.getMisAlumnos().subscribe({
      next: (alumnos) => {
        this.processMejoresAlumnos(alumnos);
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
      }
    });
  }

  processVuelosData(vuelos: any[]): void {
    this.totalVuelos = vuelos.length;
    this.vuelosCompletados = vuelos.filter(v => v.estado === 'Completado').length;
    this.vuelosProgramados = vuelos.filter(v => v.estado === 'Programado').length;
    
    const vuelosCompletados = vuelos.filter(v => v.estado === 'Completado');
    this.horasTotales = vuelosCompletados.reduce((sum, v) => sum + (v.horas_voladas || 0), 0);
    
    // Calcular promedio de calificaciones (esto requeriría cargar bitácoras)
    this.calculatePromedioCalificacion(vuelosCompletados);
    
    // Procesar vuelos por mes
    this.processVuelosPorMes(vuelos);
  }

  calculatePromedioCalificacion(vuelosCompletados: any[]): void {
    // En un caso real, necesitarías cargar las bitácoras
    // Por ahora, usaremos un valor simulado
    this.promedioCalificacion = 4.2;
  }

  processVuelosPorMes(vuelos: any[]): void {
    const vuelosPorMes: { [key: string]: number } = {};
    
    vuelos.forEach(vuelo => {
      const fecha = new Date(vuelo.fecha);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      vuelosPorMes[mesAnio] = (vuelosPorMes[mesAnio] || 0) + 1;
    });

    // Convertir a array y ordenar
    this.vuelosPorMes = Object.entries(vuelosPorMes)
      .map(([mes, cantidad]) => {
        const [anio, mesNum] = mes.split('-');
        return {
          mes: this.meses[parseInt(mesNum) - 1],
          anio: anio,
          cantidad: cantidad
        };
      })
      .sort((a, b) => {
        const fechaA = new Date(`${a.anio}-${this.meses.indexOf(a.mes) + 1}-01`);
        const fechaB = new Date(`${b.anio}-${this.meses.indexOf(b.mes) + 1}-01`);
        return fechaB.getTime() - fechaA.getTime();
      })
      .slice(0, 6);
  }

  processMejoresAlumnos(alumnos: any[]): void {
    this.mejoresAlumnos = alumnos
      .filter(a => a.estadisticas.promedio_calificacion > 0)
      .sort((a, b) => b.estadisticas.promedio_calificacion - a.estadisticas.promedio_calificacion)
      .slice(0, 5)
      .map(alumno => ({
        nombre: `${alumno.nombre} ${alumno.apellido}`,
        calificacion: alumno.estadisticas.promedio_calificacion,
        horas: alumno.estadisticas.horas_totales,
        vuelos: alumno.estadisticas.vuelos_completados
      }));
  }

  onFilterChange(): void {
    this.loadReportes();
  }

  exportarReporte(): void {
    alert('Funcionalidad de exportar reporte en desarrollo');
    // Aquí implementarías la lógica para exportar a PDF o Excel
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

  getProgressWidth(completados: number, total: number): number {
    if (total === 0) return 0;
    return (completados / total) * 100;
  }
}