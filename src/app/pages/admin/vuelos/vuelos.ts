import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VueloService, Vuelo, UsuarioBusqueda, AvionetaBusqueda } from '../../../services/vuelo';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-vuelos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './vuelos.html',
  styleUrls: ['./vuelos.css']
})
export class VuelosComponent implements OnInit {
  vuelos: Vuelo[] = [];
  
  loading = false;
  submitting = false;
  showModal = false;
  isEditMode = false;
  selectedVuelo: Vuelo | null = null;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  perPage = 10;
  totalVuelos = 0;

  // Filtros
  filterFecha = '';
  filterEstado = '';
  filterSearch = '';

  // Autocompletado
  searchAlumnoSubject = new Subject<string>();
  searchTutorSubject = new Subject<string>();
  searchAvionetaSubject = new Subject<string>();
  
  alumnosResults: UsuarioBusqueda[] = [];
  tutoresResults: UsuarioBusqueda[] = [];
  avionetasResults: AvionetaBusqueda[] = [];
  
  showAlumnosDropdown = false;
  showTutoresDropdown = false;
  showAvionetasDropdown = false;

  selectedAlumno: UsuarioBusqueda | null = null;
  selectedTutor: UsuarioBusqueda | null = null;
  selectedAvioneta: AvionetaBusqueda | null = null;

  searchAlumnoText = '';
  searchTutorText = '';
  searchAvionetaText = '';

  vueloForm: FormGroup;

  constructor(
    private vueloService: VueloService,
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
    this.setupAutocompletado();
  }

  setupAutocompletado(): void {
    // Autocompletado para alumnos
    this.searchAlumnoSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          return of([]);
        }
        return this.vueloService.buscarUsuarios(term, 'Alumno');
      })
    ).subscribe(results => {
      this.alumnosResults = results;
      this.showAlumnosDropdown = results.length > 0;
    });

    // Autocompletado para tutores
    this.searchTutorSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          return of([]);
        }
        return this.vueloService.buscarUsuarios(term, 'Tutor');
      })
    ).subscribe(results => {
      this.tutoresResults = results;
      this.showTutoresDropdown = results.length > 0;
    });

    // Autocompletado para avionetas
    this.searchAvionetaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          return of([]);
        }
        return this.vueloService.buscarAvionetas(term);
      })
    ).subscribe(results => {
      this.avionetasResults = results;
      this.showAvionetasDropdown = results.length > 0;
    });
  }

  loadVuelos(page: number = 1): void {
    this.loading = true;
    const filters: any = {
      page,
      per_page: this.perPage
    };
    
    if (this.filterFecha) filters.fecha = this.filterFecha;
    if (this.filterEstado) filters.estado = this.filterEstado;
    if (this.filterSearch) filters.search = this.filterSearch;

    this.vueloService.getVuelos(filters).subscribe({
      next: (response) => {
        this.vuelos = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalVuelos = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vuelos:', error);
        this.loading = false;
        alert('Error al cargar los vuelos');
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadVuelos();
  }

  onSearchChange(event: any): void {
    this.filterSearch = event.target.value;
    setTimeout(() => {
      if (this.filterSearch === event.target.value) {
        this.onFilterChange();
      }
    }, 500);
  }

  clearFilters(): void {
    this.filterFecha = '';
    this.filterEstado = '';
    this.filterSearch = '';
    this.currentPage = 1;
    this.loadVuelos();
  }

  hasActiveFilters(): boolean {
    return !!(this.filterFecha || this.filterEstado || this.filterSearch);
  }

  // Autocompletado de Alumnos
  onSearchAlumno(event: any): void {
    const term = event.target.value;
    this.searchAlumnoText = term;
    this.searchAlumnoSubject.next(term);
  }

  selectAlumno(alumno: UsuarioBusqueda): void {
    this.selectedAlumno = alumno;
    this.searchAlumnoText = `${alumno.nombre} ${alumno.apellido}`;
    this.vueloForm.patchValue({ alumno_id: alumno.id_usuario });
    this.showAlumnosDropdown = false;
  }

  clearAlumno(): void {
    this.selectedAlumno = null;
    this.searchAlumnoText = '';
    this.vueloForm.patchValue({ alumno_id: '' });
    this.alumnosResults = [];
  }

  // Autocompletado de Tutores
  onSearchTutor(event: any): void {
    const term = event.target.value;
    this.searchTutorText = term;
    this.searchTutorSubject.next(term);
  }

  selectTutor(tutor: UsuarioBusqueda): void {
    this.selectedTutor = tutor;
    this.searchTutorText = `${tutor.nombre} ${tutor.apellido}`;
    this.vueloForm.patchValue({ tutor_id: tutor.id_usuario });
    this.showTutoresDropdown = false;
  }

  clearTutor(): void {
    this.selectedTutor = null;
    this.searchTutorText = '';
    this.vueloForm.patchValue({ tutor_id: '' });
    this.tutoresResults = [];
  }

  // Autocompletado de Avionetas
  onSearchAvioneta(event: any): void {
    const term = event.target.value;
    this.searchAvionetaText = term;
    this.searchAvionetaSubject.next(term);
  }

  selectAvioneta(avioneta: AvionetaBusqueda): void {
    this.selectedAvioneta = avioneta;
    this.searchAvionetaText = `${avioneta.codigo} - ${avioneta.modelo}`;
    this.vueloForm.patchValue({ avioneta_id: avioneta.id_avioneta });
    this.showAvionetasDropdown = false;
  }

  clearAvioneta(): void {
    this.selectedAvioneta = null;
    this.searchAvionetaText = '';
    this.vueloForm.patchValue({ avioneta_id: '' });
    this.avionetasResults = [];
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

      // Precargar datos en los campos de búsqueda
      if (vuelo.alumno) {
        this.selectedAlumno = {
          id_usuario: vuelo.alumno.id_usuario,
          nombre: vuelo.alumno.nombre,
          apellido: vuelo.alumno.apellido,
          correo: vuelo.alumno.correo,
          rol: 'Alumno'
        };
        this.searchAlumnoText = `${vuelo.alumno.nombre} ${vuelo.alumno.apellido}`;
      }

      if (vuelo.tutor) {
        this.selectedTutor = {
          id_usuario: vuelo.tutor.id_usuario,
          nombre: vuelo.tutor.nombre,
          apellido: vuelo.tutor.apellido,
          correo: vuelo.tutor.correo,
          rol: 'Tutor'
        };
        this.searchTutorText = `${vuelo.tutor.nombre} ${vuelo.tutor.apellido}`;
      }

      if (vuelo.avioneta) {
        this.selectedAvioneta = {
          id_avioneta: vuelo.avioneta.id_avioneta,
          codigo: vuelo.avioneta.codigo,
          modelo: vuelo.avioneta.modelo,
          estado: vuelo.avioneta.estado
        };
        this.searchAvionetaText = `${vuelo.avioneta.codigo} - ${vuelo.avioneta.modelo}`;
      }
    } else {
      this.vueloForm.reset({ estado: 'Programado' });
      this.clearAlumno();
      this.clearTutor();
      this.clearAvioneta();
      const today = new Date().toISOString().split('T')[0];
      this.vueloForm.patchValue({ fecha: today });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedVuelo = null;
    this.vueloForm.reset({ estado: 'Programado' });
    this.clearAlumno();
    this.clearTutor();
    this.clearAvioneta();
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
        this.loadVuelos(this.currentPage);
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
        this.loadVuelos(this.currentPage);
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
        this.loadVuelos(this.currentPage);
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
        this.loadVuelos(this.currentPage);
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        const message = error.error?.message || 'Error al eliminar el vuelo';
        alert(message);
      }
    });
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