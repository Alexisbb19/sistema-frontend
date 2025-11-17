import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  ReporteService, 
  VueloPorTutor, 
  VueloPorAlumno, 
  UsoAvioneta, 
  MapaCalor,
  TopAlumno,
  TendenciaVuelo
} from '../../../services/reporte';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {
  activeTab = 'general';

  // Datos
  vuelosPorTutor: VueloPorTutor[] = [];
  vuelosPorAlumno: VueloPorAlumno[] = [];
  usoAvionetas: UsoAvioneta[] = [];
  mapaCalor: MapaCalor | null = null;
  topAlumnos: TopAlumno[] = [];
  tendenciaVuelos: TendenciaVuelo[] = [];

  // Loading states
  loadingTutores = false;
  loadingAlumnos = false;
  loadingAvionetas = false;
  loadingHeatmap = false;
  loadingTopAlumnos = false;
  loadingTendencia = false;

  // Configuración del mapa de calor
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  horas = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.loadTopAlumnos();
    this.loadTendenciaVuelos();
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'tutores':
        if (this.vuelosPorTutor.length === 0) {
          this.loadVuelosPorTutor();
        }
        break;
      case 'alumnos':
        if (this.vuelosPorAlumno.length === 0) {
          this.loadVuelosPorAlumno();
        }
        break;
      case 'avionetas':
        if (this.usoAvionetas.length === 0) {
          this.loadUsoAvionetas();
        }
        break;
      case 'heatmap':
        if (!this.mapaCalor) {
          this.loadMapaCalor();
        }
        break;
    }
  }

  loadVuelosPorTutor(): void {
    this.loadingTutores = true;
    this.reporteService.getVuelosPorTutor().subscribe({
      next: (data) => {
        this.vuelosPorTutor = data;
        this.loadingTutores = false;
      },
      error: (error) => {
        console.error('Error al cargar vuelos por tutor:', error);
        this.loadingTutores = false;
      }
    });
  }

  loadVuelosPorAlumno(): void {
    this.loadingAlumnos = true;
    this.reporteService.getVuelosPorAlumno().subscribe({
      next: (data) => {
        this.vuelosPorAlumno = data;
        this.loadingAlumnos = false;
      },
      error: (error) => {
        console.error('Error al cargar vuelos por alumno:', error);
        this.loadingAlumnos = false;
      }
    });
  }

  loadUsoAvionetas(): void {
    this.loadingAvionetas = true;
    this.reporteService.getUsoAvionetas().subscribe({
      next: (data) => {
        this.usoAvionetas = data;
        this.loadingAvionetas = false;
      },
      error: (error) => {
        console.error('Error al cargar uso de avionetas:', error);
        this.loadingAvionetas = false;
      }
    });
  }

  loadMapaCalor(): void {
    this.loadingHeatmap = true;
    this.reporteService.getMapaCalorHorarios().subscribe({
      next: (data) => {
        this.mapaCalor = data;
        this.loadingHeatmap = false;
      },
      error: (error) => {
        console.error('Error al cargar mapa de calor:', error);
        this.loadingHeatmap = false;
      }
    });
  }

  loadTopAlumnos(): void {
    this.loadingTopAlumnos = true;
    this.reporteService.getTopAlumnos(10).subscribe({
      next: (data) => {
        this.topAlumnos = data;
        this.loadingTopAlumnos = false;
      },
      error: (error) => {
        console.error('Error al cargar top alumnos:', error);
        this.loadingTopAlumnos = false;
      }
    });
  }

  loadTendenciaVuelos(): void {
    this.loadingTendencia = true;
    this.reporteService.getTendenciaVuelos().subscribe({
      next: (data) => {
        this.tendenciaVuelos = data;
        this.loadingTendencia = false;
      },
      error: (error) => {
        console.error('Error al cargar tendencia de vuelos:', error);
        this.loadingTendencia = false;
      }
    });
  }

  getHeatValue(dia: string, hora: string): number {
    if (!this.mapaCalor || !this.mapaCalor[dia] || !this.mapaCalor[dia][hora]) {
      return 0;
    }
    return this.mapaCalor[dia][hora];
  }

  getPromedio(total: number | null, cantidad: number): string {
    if (!total || cantidad === 0) return '0.00';
    return (total / cantidad).toFixed(2);
  }

  getMaxTendencia(): number {
    if (this.tendenciaVuelos.length === 0) return 1;
    return Math.max(...this.tendenciaVuelos.map(t => t.total));
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  }
}