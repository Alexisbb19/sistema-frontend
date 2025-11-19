import { Component, OnInit } from '@angular/core';
import { AlumnoService } from '../../../services/alumno';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alumno-historial',
  imports: [CommonModule, FormsModule],
  standalone: true,
  template: `
    <div class="historial-container">
      <div class="filtros-section">
        <input type="date" [(ngModel)]="fechaInicio" (change)="aplicarFiltros()" class="filter-input" placeholder="Desde">
        <input type="date" [(ngModel)]="fechaFin" (change)="aplicarFiltros()" class="filter-input" placeholder="Hasta">
        <button class="btn-limpiar" (click)="limpiarFiltros()" *ngIf="fechaInicio || fechaFin">Limpiar</button>
      </div>

      <div *ngIf="loading" class="loading"><div class="spinner"></div><p>Cargando historial...</p></div>

      <div *ngIf="!loading" class="vuelos-grid">
        <div *ngFor="let vuelo of vuelos" class="vuelo-card">
          <div class="vuelo-header">
            <span class="vuelo-fecha">{{ vuelo.fecha | date:'d MMM yyyy' }}</span>
            <span class="vuelo-duracion" *ngIf="vuelo.horas_voladas">{{ vuelo.horas_voladas }}h</span>
          </div>
          <div class="vuelo-body">
            <div class="info-row">
              <span class="label">Tutor:</span>
              <span class="value">{{ vuelo.tutor?.nombre }} {{ vuelo.tutor?.apellido }}</span>
            </div>
            <div class="info-row">
              <span class="label">Avioneta:</span>
              <span class="value">{{ vuelo.avioneta?.codigo }}</span>
            </div>
            <div class="bitacora-badge" *ngIf="vuelo.bitacora" [style.background]="getCalificacionColor(vuelo.bitacora.calificacion_general)">
              <span>★ {{ vuelo.bitacora.calificacion_general }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && vuelos.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>No hay vuelos completados</p>
      </div>
    </div>
  `,
  styles: [`
    .historial-container { max-width: 1200px; margin: 0 auto; }
    .filtros-section { display: flex; gap: 1rem; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .filter-input { flex: 1; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
    .filter-input:focus { outline: none; border-color: #3b82f6; }
    .btn-limpiar { padding: 0.75rem 1.5rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .loading { text-align: center; padding: 3rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .vuelos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .vuelo-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
    .vuelo-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .vuelo-header { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #f3f4f6; }
    .vuelo-fecha { font-weight: 700; color: #1f2937; }
    .vuelo-duracion { font-size: 0.875rem; color: #3b82f6; font-weight: 600; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .label { color: #6b7280; font-weight: 600; }
    .value { color: #1f2937; font-weight: 600; }
    .bitacora-badge { margin-top: 1rem; padding: 0.75rem; border-radius: 8px; color: white; text-align: center; font-weight: 700; }
    .empty { text-align: center; padding: 3rem; }
    .empty svg { width: 60px; height: 60px; margin: 0 auto 1rem; stroke: #d1d5db; }
    .empty p { color: #9ca3af; }
  `]
})
export class AlumnoHistorialComponent implements OnInit {
  vuelos: any[] = [];
  loading = false;
  fechaInicio = '';
  fechaFin = '';

  constructor(private alumnoService: AlumnoService) {}

  ngOnInit(): void {
    this.loadHistorial();
  }

  loadHistorial(): void {
    this.loading = true;
    const filters: any = {};
    if (this.fechaInicio) filters.fecha_inicio = this.fechaInicio;
    if (this.fechaFin) filters.fecha_fin = this.fechaFin;

    this.alumnoService.getHistorialVuelos(filters).subscribe({
      next: (data) => {
        this.vuelos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.loadHistorial();
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.loadHistorial();
  }

  getCalificacionColor(cal: number): string {
    if (cal >= 4.5) return '#10b981';
    if (cal >= 3.5) return '#3b82f6';
    if (cal >= 2.5) return '#f59e0b';
    return '#ef4444';
  }
}