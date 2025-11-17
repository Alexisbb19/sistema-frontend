import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvionetaService, Avioneta } from '../../../services/avioneta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avionetas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './avionetas.html',
  styleUrls: ['./avionetas.css']
})
export class AvionetasComponent implements OnInit {
  avionetas: Avioneta[] = [];
  loading = false;
  submitting = false;
  showModal = false;
  isEditMode = false;
  selectedAvioneta: Avioneta | null = null;

  // Filtros
  searchTerm = '';
  filterEstado = '';

  avionetaForm: FormGroup;

  constructor(
    private avionetaService: AvionetaService,
    private fb: FormBuilder
  ) {
    this.avionetaForm = this.fb.group({
      codigo: ['', Validators.required],
      modelo: ['', Validators.required],
      horas_vuelo: [0, [Validators.min(0)]],
      estado: ['Activo', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvionetas();
  }

  loadAvionetas(): void {
    this.loading = true;
    const filters = {
      estado: this.filterEstado || undefined,
      search: this.searchTerm || undefined
    };

    this.avionetaService.getAvionetas(filters).subscribe({
      next: (avionetas) => {
        this.avionetas = avionetas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar avionetas:', error);
        this.loading = false;
        alert('Error al cargar las avionetas');
      }
    });
  }

  onSearch(): void {
    this.loadAvionetas();
  }

  onFilterChange(): void {
    this.loadAvionetas();
  }

  openModal(avioneta?: Avioneta): void {
    this.showModal = true;
    this.isEditMode = !!avioneta;
    this.selectedAvioneta = avioneta || null;

    if (avioneta) {
      // Modo edición
      this.avionetaForm.patchValue({
        codigo: avioneta.codigo,
        modelo: avioneta.modelo,
        horas_vuelo: avioneta.horas_vuelo,
        estado: avioneta.estado,
        observaciones: avioneta.observaciones
      });
    } else {
      // Modo creación
      this.avionetaForm.reset({
        horas_vuelo: 0,
        estado: 'Activo'
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedAvioneta = null;
    this.avionetaForm.reset({
      horas_vuelo: 0,
      estado: 'Activo'
    });
  }

  onSubmit(): void {
    if (this.avionetaForm.invalid) {
      Object.keys(this.avionetaForm.controls).forEach(key => {
        this.avionetaForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.avionetaForm.value;

    const data = {
      ...formValue,
      observaciones: formValue.observaciones || null
    };

    const request = this.isEditMode
      ? this.avionetaService.updateAvioneta(this.selectedAvioneta!.id_avioneta, data)
      : this.avionetaService.createAvioneta(data);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.closeModal();
        this.loadAvionetas();
        alert(response.message);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al guardar la avioneta';
        alert(message);
      }
    });
  }

  toggleEstado(avioneta: Avioneta): void {
    const nuevoEstado = avioneta.estado === 'Activo' ? 'Mantenimiento' : 'Activo';
    const mensaje = nuevoEstado === 'Mantenimiento' 
      ? `¿Marcar avioneta ${avioneta.codigo} en mantenimiento?`
      : `¿Activar avioneta ${avioneta.codigo}?`;

    if (!confirm(mensaje)) {
      return;
    }

    this.avionetaService.cambiarEstado(avioneta.id_avioneta, nuevoEstado).subscribe({
      next: (response) => {
        this.loadAvionetas();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al cambiar el estado');
      }
    });
  }

  deleteAvioneta(avioneta: Avioneta): void {
    if (!confirm(`¿Está seguro de eliminar la avioneta ${avioneta.codigo}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.avionetaService.deleteAvioneta(avioneta.id_avioneta).subscribe({
      next: (response) => {
        this.loadAvionetas();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al eliminar la avioneta');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.avionetaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}