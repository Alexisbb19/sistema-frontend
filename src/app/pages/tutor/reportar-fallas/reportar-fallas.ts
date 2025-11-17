import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TutorDisponibilidadService, ReporteFalla } from '../../../services/tutor-disponibilidad';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-reportar-fallas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './reportar-fallas.html',
  styleUrls: ['./reportar-fallas.css']
})
export class TutorReportarFallasComponent implements OnInit {
  reporteForm: FormGroup;
  avionetas: any[] = [];
  reportes: ReporteFalla[] = [];
  loading = false;
  submitting = false;
  showModal = false;
  selectedReporte: ReporteFalla | null = null;
  activeTab: 'nuevo' | 'historial' = 'nuevo';

  tiposFalla = [
    'Mecánica',
    'Eléctrica',
    'Estructural',
    'Instrumentos',
    'Otra'
  ];

  severidades = [
    { value: 'Baja', label: 'Baja', color: '#10b981' },
    { value: 'Media', label: 'Media', color: '#f59e0b' },
    { value: 'Alta', label: 'Alta', color: '#ef4444' },
    { value: 'Crítica', label: 'Crítica', color: '#dc2626' }
  ];

  constructor(
    private fb: FormBuilder,
    private tutorDisponibilidadService: TutorDisponibilidadService
  ) {
    this.reporteForm = this.fb.group({
      avioneta_id: ['', Validators.required],
      tipo_falla: ['', Validators.required],
      severidad: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      requiere_atencion_inmediata: [false]
    });
  }

  ngOnInit(): void {
    this.loadAvionetas();
    this.loadReportes();
  }

  loadAvionetas(): void {
    this.tutorDisponibilidadService.getAvionetasDisponibles().subscribe({
      next: (avionetas) => {
        this.avionetas = avionetas;
      },
      error: (error) => {
        console.error('Error al cargar avionetas:', error);
        alert('Error al cargar las avionetas');
      }
    });
  }

  loadReportes(): void {
    this.loading = true;
    this.tutorDisponibilidadService.getMisReportes().subscribe({
      next: (reportes) => {
        this.reportes = reportes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.loading = false;
        alert('Error al cargar los reportes');
      }
    });
  }

  onSubmit(): void {
    if (this.reporteForm.invalid) {
      Object.keys(this.reporteForm.controls).forEach(key => {
        this.reporteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.reporteForm.value;

    this.tutorDisponibilidadService.reportarFalla(formValue).subscribe({
      next: (response) => {
        this.submitting = false;
        alert(response.message);
        this.reporteForm.reset();
        this.reporteForm.patchValue({
          requiere_atencion_inmediata: false
        });
        this.loadReportes();
        this.activeTab = 'historial';
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al reportar la falla';
        alert(message);
      }
    });
  }

  verDetalleReporte(reporte: ReporteFalla): void {
    this.selectedReporte = reporte;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReporte = null;
  }

  selectTab(tab: 'nuevo' | 'historial'): void {
    this.activeTab = tab;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reporteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'Reportado': 'estado-reportado',
      'En Revisión': 'estado-revision',
      'En Reparación': 'estado-reparacion',
      'Resuelto': 'estado-resuelto',
      'Descartado': 'estado-descartado'
    };
    return classes[estado] || 'estado-reportado';
  }

  getSeveridadColor(severidad: string): string {
    const colors: { [key: string]: string } = {
      'Baja': '#10b981',
      'Media': '#f59e0b',
      'Alta': '#ef4444',
      'Crítica': '#dc2626'
    };
    return colors[severidad] || '#6b7280';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}