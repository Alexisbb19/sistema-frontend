import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VueloService, Vuelo } from '../../../services/vuelo';
import { UsuarioService, Usuario } from '../../../services/usuario';
import { AvionetaService, Avioneta } from '../../../services/avioneta';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-vuelos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './vuelos.html',
  styleUrls: ['./vuelos.css']
})
export class VuelosComponent implements OnInit {
  vuelos: Vuelo[] = [];
  alumnos: Usuario[] = [];
  tutores: Usuario[] = [];
  avionetasActivas: Avioneta[] = [];
  
  loading = false;
  submitting = false;
  showModal = false;
  isEditMode = false;
  selectedVuelo: Vuelo | null = null;

  // Filtros
  filterFecha = '';
  filterEstado = '';
  filterAlumnoId = '';
  filterTutorId = '';

  vueloForm: FormGroup;

  constructor(
    private vueloService: VueloService,
    private usuarioService: UsuarioService,
    private avionetaService: AvionetaService,
    private fb: FormBuilder
  ) {
    this.vueloForm = this.fb.group({
      alumno_id: ['', Validators.required],
      tutor_id: ['', Validators.required],
      avioneta_id: ['', Validators.required],
      fecha: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: [''],
      estado: ['Programado'],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.loadVuelos();
    this.loadAlumnos();
    this.loadTutores();
    this.loadAvionetasActivas();
  }

  loadVuelos(): void {
    this.loading = true;
    const filters: any = {};
    
    if (this.filterFecha) filters.fecha = this.filterFecha;
    if (this.filterEstado) filters.estado = this.filterEstado;
    if (this.filterAlumnoId) filters.alumno_id = parseInt(this.filterAlumnoId);
    if (this.filterTutorId) filters.tutor_id = parseInt(this.filterTutorId);

    this.vueloService.getVuelos(filters).subscribe({
      next: (vuelos) => {
        this.vuelos = vuelos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vuelos:', error);
        this.loading = false;
        alert('Error al cargar los vuelos');
      }
    });
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios({ rol: 'Alumno', activo: true }).subscribe({
      next: (usuarios) => {
        this.alumnos = usuarios;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
      }
    });
  }

  loadTutores(): void {
    this.usuarioService.getTutores().subscribe({
      next: (tutores) => {
        this.tutores = tutores;
      },
      error: (error) => {
        console.error('Error al cargar tutores:', error);
      }
    });
  }

  loadAlumnos(): void {
    this.usuarioService.getAlumnos().subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos;
      },
      error: (error) => {
        console.error('Error al cargar alumnos:', error);
      }
    });
  }

  loadAvionetasActivas(): void {
    this.avionetaService.getAvionetas({ estado: 'Activo' }).subscribe({
      next: (avionetas) => {
        this.avionetasActivas = avionetas;
      },
      error: (error) => {
        console.error('Error al cargar avionetas:', error);
      }
    });
  }

  onFilterChange(): void {
    this.loadVuelos();
  }

  clearFilters(): void {
    this.filterFecha = '';
    this.filterEstado = '';
    this.filterAlumnoId = '';
    this.filterTutorId = '';
    this.loadVuelos();
  }

  hasActiveFilters(): boolean {
    return !!(this.filterFecha || this.filterEstado || this.filterAlumnoId || this.filterTutorId);
  }

  openModal(vuelo?: Vuelo): void {
    this.showModal = true;
    this.isEditMode = !!vuelo;
    this.selectedVuelo = vuelo || null;

    if (vuelo) {
      this.vueloForm.patchValue({
        alumno_id: vuelo.alumno_id,
        tutor_id: vuelo.tutor_id,
        avioneta_id: vuelo.avioneta_id,
        fecha: vuelo.fecha,
        hora_inicio: vuelo.hora_inicio,
        hora_fin: vuelo.hora_fin || '',
        estado: vuelo.estado,
        observaciones: vuelo.observaciones
      });
    } else {
      this.vueloForm.reset({ estado: 'Programado' });
      // Establecer fecha mínima como hoy
      const today = new Date().toISOString().split('T')[0];
      this.vueloForm.patchValue({ fecha: today });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedVuelo = null;
    this.vueloForm.reset({ estado: 'Programado' });
  }

  onSubmit(): void {
    if (this.vueloForm.invalid) {
      Object.keys(this.vueloForm.controls).forEach(key => {
        this.vueloForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.vueloForm.value;

    const data = {
      ...formValue,
      hora_fin: formValue.hora_fin || null,
      observaciones: formValue.observaciones || null
    };

    const request = this.isEditMode
      ? this.vueloService.updateVuelo(this.selectedVuelo!.id_vuelo, data)
      : this.vueloService.createVuelo(data);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.closeModal();
        this.loadVuelos();
        alert(response.message);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al guardar el vuelo';
        alert(message);
      }
    });
  }

  cambiarEstado(vuelo: Vuelo): void {
    const nuevoEstado = vuelo.estado === 'Programado' ? 'En Curso' : 'Completado';
    const mensaje = nuevoEstado === 'En Curso' 
      ? '¿Iniciar este vuelo?'
      : '¿Marcar este vuelo como completado?';

    if (!confirm(mensaje)) {
      return;
    }

    this.vueloService.cambiarEstado(vuelo.id_vuelo, nuevoEstado).subscribe({
      next: (response) => {
        this.loadVuelos();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al cambiar el estado del vuelo');
      }
    });
  }

  cancelarVuelo(vuelo: Vuelo): void {
    if (!confirm('¿Está seguro de cancelar este vuelo?')) {
      return;
    }

    this.vueloService.cambiarEstado(vuelo.id_vuelo, 'Cancelado').subscribe({
      next: (response) => {
        this.loadVuelos();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al cancelar el vuelo');
      }
    });
  }

  deleteVuelo(vuelo: Vuelo): void {
    if (!confirm('¿Está seguro de eliminar este vuelo? Esta acción no se puede deshacer.')) {
      return;
    }

    this.vueloService.deleteVuelo(vuelo.id_vuelo).subscribe({
      next: (response) => {
        this.loadVuelos();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        const message = error.error?.message || 'Error al eliminar el vuelo';
        alert(message);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vueloForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return d.toLocaleDateString('es-ES', options);
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

  getNextStatusText(estado: string): string {
    if (estado === 'Programado') return 'Iniciar Vuelo';
    if (estado === 'En Curso') return 'Completar Vuelo';
    return '';
  }

  getNextStatusButtonClass(estado: string): string {
    if (estado === 'Programado') return 'btn-start';
    if (estado === 'En Curso') return 'btn-complete';
    return '';
  }
}