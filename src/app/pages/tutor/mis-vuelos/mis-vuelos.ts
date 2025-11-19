import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VueloService, Vuelo } from '../../../services/vuelo';
import { BitacoraService, Maniobra } from '../../../services/bitacora';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-mis-vuelos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './mis-vuelos.html',
  styleUrls: ['./mis-vuelos.css']
})
export class TutorMisVuelosComponent implements OnInit {
  vuelos: Vuelo[] = [];
  loading = false;
  submitting = false;
  submittingBitacora = false;
  showCompletarModal = false;
  showBitacoraModal = false;
  selectedVuelo: Vuelo | null = null;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  perPage = 10;
  totalVuelos = 0;

  // Maniobras
  maniobrasList: Maniobra[] = [];
  maniobrasSeleccionadas: string[] = [];

  // Estadísticas rápidas
  vuelosHoy = 0;
  vuelosSemana = 0;
  vuelosPendientes = 0;

  // Filtros
  filterFecha = '';
  filterEstado = '';

  completarForm: FormGroup;
  bitacoraForm: FormGroup;

  constructor(
    private vueloService: VueloService,
    private bitacoraService: BitacoraService,
    private fb: FormBuilder
  ) {
    this.completarForm = this.fb.group({
      hora_fin: ['', Validators.required],
      observaciones: ['']
    });

    this.bitacoraForm = this.fb.group({
      calificacion_general: [null],
      calificacion_despegue: [null],
      calificacion_vuelo: [null],
      calificacion_aterrizaje: [null],
      calificacion_comunicacion: [null],
      observaciones_tecnicas: [''],
      observaciones_generales: [''],
      areas_mejorar: [''],
      logros: [''],
      condiciones_climaticas: [''],
      visibilidad: [''],
      viento: [''],
      horas_vuelo_real: [null],
      horas_vuelo_simulador: [null],
      numero_despegues: [0],
      numero_aterrizajes: [0],
      hubo_incidente: [false],
      descripcion_incidente: ['']
    });
  }

  ngOnInit(): void {
    this.loadVuelos();
    this.loadManiobras();
  }

  loadManiobras(): void {
    this.bitacoraService.getManiobras().subscribe({
      next: (maniobras) => {
        this.maniobrasList = maniobras;
      },
      error: (error) => {
        console.error('Error al cargar maniobras:', error);
      }
    });
  }

  loadVuelos(page: number = 1): void {
    this.loading = true;
    const filters: any = {
      paginate: true,
      per_page: this.perPage,
      page
    };
    
    if (this.filterFecha) filters.fecha = this.filterFecha;
    if (this.filterEstado) filters.estado = this.filterEstado;

    this.vueloService.getMisVuelos(filters).subscribe({
      next: (response: any) => {
        if (response.data) {
          // Respuesta paginada
          this.vuelos = response.data;
          this.currentPage = response.current_page;
          this.totalPages = response.last_page;
          this.totalVuelos = response.total;
          this.calculateStatsFromPaginated(response.data);
        } else {
          // Respuesta sin paginar (fallback)
          this.vuelos = response;
          this.calculateStats(response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vuelos:', error);
        this.loading = false;
        alert('Error al cargar los vuelos');
      }
    });
  }

  calculateStats(vuelos: Vuelo[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.vuelosHoy = vuelos.filter(v => {
      const vueloDate = new Date(v.fecha);
      vueloDate.setHours(0, 0, 0, 0);
      return vueloDate.getTime() === today.getTime();
    }).length;

    this.vuelosSemana = vuelos.filter(v => {
      const vueloDate = new Date(v.fecha);
      return vueloDate >= startOfWeek && vueloDate <= endOfWeek;
    }).length;

    this.vuelosPendientes = vuelos.filter(v => v.estado === 'Programado').length;
  }

  calculateStatsFromPaginated(vuelos: Vuelo[]): void {
    // Para datos paginados, solo calculamos sobre la página actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.vuelosHoy = vuelos.filter(v => {
      const vueloDate = new Date(v.fecha);
      vueloDate.setHours(0, 0, 0, 0);
      return vueloDate.getTime() === today.getTime();
    }).length;

    this.vuelosSemana = vuelos.filter(v => {
      const vueloDate = new Date(v.fecha);
      return vueloDate >= startOfWeek && vueloDate <= endOfWeek;
    }).length;

    this.vuelosPendientes = vuelos.filter(v => v.estado === 'Programado').length;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadVuelos();
  }

  clearFilters(): void {
    this.filterFecha = '';
    this.filterEstado = '';
    this.currentPage = 1;
    this.loadVuelos();
  }

  hasActiveFilters(): boolean {
    return !!(this.filterFecha || this.filterEstado);
  }

  // Paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadVuelos(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  iniciarVuelo(vuelo: Vuelo): void {
    if (!confirm(`¿Iniciar el vuelo con ${vuelo.alumno?.nombre} ${vuelo.alumno?.apellido}?`)) {
      return;
    }

    this.vueloService.actualizarEstadoTutor(vuelo.id_vuelo, {
      estado: 'En Curso',
      observaciones: vuelo.observaciones
    }).subscribe({
      next: (response) => {
        this.loadVuelos(this.currentPage);
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al iniciar el vuelo');
      }
    });
  }

  completarVuelo(vuelo: Vuelo): void {
    this.selectedVuelo = vuelo;
    this.showCompletarModal = true;
    
    const now = new Date();
    const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.completarForm.patchValue({
      hora_fin: horaActual,
      observaciones: vuelo.observaciones || ''
    });
  }

  onCompletarSubmit(): void {
    if (this.completarForm.invalid) {
      Object.keys(this.completarForm.controls).forEach(key => {
        this.completarForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.selectedVuelo) return;

    this.submitting = true;
    const formValue = this.completarForm.value;

    this.vueloService.actualizarEstadoTutor(this.selectedVuelo.id_vuelo, {
      estado: 'Completado',
      hora_fin: formValue.hora_fin,
      observaciones: formValue.observaciones || null
    }).subscribe({
      next: (response) => {
        this.submitting = false;
        this.closeModal();
        this.loadVuelos(this.currentPage);
        alert(response.message);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al completar el vuelo';
        alert(message);
      }
    });
  }

  cancelarVuelo(vuelo: Vuelo): void {
    const mensaje = `¿Está seguro de cancelar el vuelo con ${vuelo.alumno?.nombre} ${vuelo.alumno?.apellido}?`;
    const observaciones = prompt(mensaje + '\n\nMotivo de cancelación (opcional):');
    
    if (observaciones === null) return;

    this.vueloService.actualizarEstadoTutor(vuelo.id_vuelo, {
      estado: 'Cancelado',
      observaciones: observaciones || 'Cancelado por el tutor'
    }).subscribe({
      next: (response) => {
        this.loadVuelos(this.currentPage);
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al cancelar el vuelo');
      }
    });
  }

  verDetalles(vuelo: Vuelo): void {
    const detalles = `
Detalles del Vuelo:
------------------
Alumno: ${vuelo.alumno?.nombre} ${vuelo.alumno?.apellido}
Avioneta: ${vuelo.avioneta?.codigo} - ${vuelo.avioneta?.modelo}
Fecha: ${this.formatDate(vuelo.fecha)}
Hora: ${vuelo.hora_inicio} - ${vuelo.hora_fin || 'N/A'}
Estado: ${vuelo.estado}
${vuelo.horas_voladas ? `Horas Voladas: ${vuelo.horas_voladas} hrs` : ''}
${vuelo.observaciones ? `\nObservaciones:\n${vuelo.observaciones}` : ''}
    `;
    alert(detalles);
  }

  closeModal(): void {
    this.showCompletarModal = false;
    this.selectedVuelo = null;
    this.completarForm.reset();
  }

  abrirBitacora(vuelo: Vuelo): void {
    this.selectedVuelo = vuelo;
    this.showBitacoraModal = true;
    this.maniobrasSeleccionadas = [];
    
    this.bitacoraService.getBitacora(vuelo.id_vuelo).subscribe({
      next: (bitacora) => {
        if (bitacora) {
          this.bitacoraForm.patchValue(bitacora);
          this.maniobrasSeleccionadas = bitacora.maniobras_realizadas || [];
        }
      },
      error: (error) => {
        this.bitacoraForm.reset({
          numero_despegues: 0,
          numero_aterrizajes: 0,
          hubo_incidente: false
        });
      }
    });
  }

  closeBitacoraModal(): void {
    this.showBitacoraModal = false;
    this.selectedVuelo = null;
    this.bitacoraForm.reset({
      numero_despegues: 0,
      numero_aterrizajes: 0,
      hubo_incidente: false
    });
    this.maniobrasSeleccionadas = [];
  }

  setCalificacion(campo: string, valor: number): void {
    this.bitacoraForm.patchValue({ [campo]: valor });
  }

  toggleManiobra(maniobraId: string): void {
    const index = this.maniobrasSeleccionadas.indexOf(maniobraId);
    if (index > -1) {
      this.maniobrasSeleccionadas.splice(index, 1);
    } else {
      this.maniobrasSeleccionadas.push(maniobraId);
    }
  }

  isManiobraSelected(maniobraId: string): boolean {
    return this.maniobrasSeleccionadas.includes(maniobraId);
  }

  onBitacoraSubmit(): void {
    if (!this.selectedVuelo) return;

    this.submittingBitacora = true;
    const formValue = this.bitacoraForm.value;

    const bitacoraData = {
      ...formValue,
      maniobras_realizadas: this.maniobrasSeleccionadas
    };

    this.bitacoraService.guardarBitacora(this.selectedVuelo.id_vuelo, bitacoraData).subscribe({
      next: (response) => {
        this.submittingBitacora = false;
        this.closeBitacoraModal();
        alert(response.message);
      },
      error: (error) => {
        this.submittingBitacora = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al guardar la bitácora';
        alert(message);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.completarForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return d.toLocaleDateString('es-ES', options);
  }

  getInitials(nombre?: string, apellido?: string): string {
    if (!nombre || !apellido) return '?';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getCardClass(estado: string): string {
    return `card-${estado.toLowerCase().replace(' ', '-')}`;
  }

  getStatusClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'Programado': 'status-programado',
      'En Curso': 'status-en-curso',
      'Completado': 'status-completado',
      'Cancelado': 'status-cancelado'
    };
    return classes[estado] || '';
  }
}