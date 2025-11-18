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
  TendenciaVuelo,
  PaginatedResponse,
  FiltrosReporte
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

  // Paginación
  currentPageTutores = 1;
  totalPagesTutores = 1;
  currentPageAlumnos = 1;
  totalPagesAlumnos = 1;
  currentPageAvionetas = 1;
  totalPagesAvionetas = 1;

  // Filtros
  filtros: FiltrosReporte = {
    fecha_inicio: this.getDefaultStartDate(),
    fecha_fin: this.getToday(),
    search: '',
    per_page: 10,
    order_by: 'total_vuelos',
    order_dir: 'desc',
    paginate: true
  };

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

  // Mostrar panel de filtros
  showFilters = false;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.loadTopAlumnos();
    this.loadTendenciaVuelos();
  }

  getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
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

  loadVuelosPorTutor(page: number = 1): void {
  this.loadingTutores = true;
  const filtrosConPagina = { ...this.filtros, page };

  this.reporteService.getVuelosPorTutor(filtrosConPagina).subscribe({
    next: (response: any) => {

      if (response.data) {
        // Convertir promedio_horas a número
        this.vuelosPorTutor = response.data.map((item: any) => ({
          ...item,
          promedio_horas: item.promedio_horas ? Number(item.promedio_horas) : 0
        }));

        this.currentPageTutores = response.current_page;
        this.totalPagesTutores = response.last_page;
      } else {
        // Si viene sin paginación
        this.vuelosPorTutor = response.map((item: any) => ({
          ...item,
          promedio_horas: item.promedio_horas ? Number(item.promedio_horas) : 0
        }));
      }

      this.loadingTutores = false;
    },
    error: (error) => {
      console.error('Error al cargar vuelos por tutor:', error);
      this.loadingTutores = false;
    }
  });
}


  loadVuelosPorAlumno(page: number = 1): void {
  this.loadingAlumnos = true;
  const filtrosConPagina = { ...this.filtros, page };

  this.reporteService.getVuelosPorAlumno(filtrosConPagina).subscribe({
    next: (response: any) => {
      
      const procesar = (lista: any[]) =>
        lista.map((item: any) => ({
          ...item,
          total_vuelos: item.total_vuelos ? Number(item.total_vuelos) : 0,
          total_horas: item.total_horas ? Number(item.total_horas) : 0,
          promedio_horas: item.promedio_horas ? Number(item.promedio_horas) : 0,
        }));

      if (response.data) {
        this.vuelosPorAlumno = procesar(response.data);
        this.currentPageAlumnos = response.current_page;
        this.totalPagesAlumnos = response.last_page;
      } else {
        this.vuelosPorAlumno = procesar(response);
      }

      this.loadingAlumnos = false;
    },
    error: (error) => {
      console.error('Error al cargar vuelos por alumno:', error);
      this.loadingAlumnos = false;
    }
  });
}


  loadUsoAvionetas(page: number = 1): void {
  this.loadingAvionetas = true;
  const filtrosConPagina = { ...this.filtros, page };

  this.reporteService.getUsoAvionetas(filtrosConPagina).subscribe({
    next: (response: any) => {

      const procesar = (lista: any[]) =>
        lista.map((item: any) => ({
          ...item,
          total_vuelos: item.total_vuelos ? Number(item.total_vuelos) : 0,
          total_horas: item.total_horas ? Number(item.total_horas) : 0,
          promedio_horas: item.promedio_horas ? Number(item.promedio_horas) : 0,
          porcentaje_uso: item.porcentaje_uso ? Number(item.porcentaje_uso) : 0,
        }));

      if (response.data) {
        this.usoAvionetas = procesar(response.data);
        this.currentPageAvionetas = response.current_page;
        this.totalPagesAvionetas = response.last_page;
      } else {
        this.usoAvionetas = procesar(response);
      }

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
    this.reporteService.getMapaCalorHorarios(
      this.filtros.fecha_inicio,
      this.filtros.fecha_fin
    ).subscribe({
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
    this.reporteService.getTopAlumnos(
      10, 
      this.filtros.fecha_inicio, 
      this.filtros.fecha_fin
    ).subscribe({
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
    this.reporteService.getTendenciaVuelos(30).subscribe({
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

  applyFilters(): void {
    this.currentPageTutores = 1;
    this.currentPageAlumnos = 1;
    this.currentPageAvionetas = 1;

    if (this.activeTab === 'tutores') {
      this.loadVuelosPorTutor();
    } else if (this.activeTab === 'alumnos') {
      this.loadVuelosPorAlumno();
    } else if (this.activeTab === 'avionetas') {
      this.loadUsoAvionetas();
    } else if (this.activeTab === 'heatmap') {
      this.loadMapaCalor();
    } else if (this.activeTab === 'general') {
      this.loadTopAlumnos();
      this.loadTendenciaVuelos();
    }

    this.showFilters = false;
  }

  resetFilters(): void {
    this.filtros = {
      fecha_inicio: this.getDefaultStartDate(),
      fecha_fin: this.getToday(),
      search: '',
      per_page: 10,
      order_by: 'total_vuelos',
      order_dir: 'desc',
      paginate: true
    };
    this.applyFilters();
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value;
    this.filtros.search = searchTerm;
    
    // Aplicar búsqueda después de un pequeño delay
    setTimeout(() => {
      if (this.filtros.search === searchTerm) {
        this.applyFilters();
      }
    }, 500);
  }

  changeSort(field: string): void {
    if (this.filtros.order_by === field) {
      this.filtros.order_dir = this.filtros.order_dir === 'asc' ? 'desc' : 'asc';
    } else {
      this.filtros.order_by = field;
      this.filtros.order_dir = 'desc';
    }
    this.applyFilters();
  }

  exportPDF(): void {
    const tipo = this.activeTab === 'general' ? 'general' : this.activeTab;
    this.reporteService.exportarPDF(
      tipo,
      this.filtros.fecha_inicio,
      this.filtros.fecha_fin
    );
  }

  exportExcel(): void {
    const tipo = this.activeTab;
    this.reporteService.exportarExcel(
      tipo,
      this.filtros.fecha_inicio,
      this.filtros.fecha_fin
    );
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

  getPageNumbers(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}