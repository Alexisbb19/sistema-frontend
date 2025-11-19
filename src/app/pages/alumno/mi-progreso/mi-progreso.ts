import { Component as Comp, OnInit as Init } from '@angular/core';
import { AlumnoService, ProgresoAlumno } from '../../../services/alumno';
import { CommonModule as Common } from '@angular/common';

@Comp({
  selector: 'app-alumno-mi-progreso',
  imports: [Common],
  standalone: true,
  template: `
    <div class="progreso-container">
      <div *ngIf="loading" class="loading"><div class="spinner"></div><p>Cargando progreso...</p></div>

      <div *ngIf="!loading && progreso" class="progreso-content">
        <div class="stats-overview">
          <div class="stat-box">
            <h3>{{ progreso.estadisticas.horas_totales | number:'1.1-1' }}</h3>
            <p>Horas de Vuelo</p>
          </div>
          <div class="stat-box">
            <h3>{{ progreso.estadisticas.promedio_calificacion_general | number:'1.1-1' }}</h3>
            <p>Promedio General</p>
          </div>
          <div class="stat-box">
            <h3>{{ progreso.estadisticas.total_despegues }}</h3>
            <p>Despegues</p>
          </div>
          <div class="stat-box">
            <h3>{{ progreso.estadisticas.total_aterrizajes }}</h3>
            <p>Aterrizajes</p>
          </div>
        </div>

        <div class="section-card">
          <h3>Calificaciones Detalladas</h3>
          <div class="calificaciones-grid">
            <div class="cal-item">
              <span class="cal-label">Despegue</span>
              <div class="cal-bar">
                <div class="cal-fill" [style.width.%]="(progreso.estadisticas.promedio_despegue/5)*100"></div>
              </div>
              <span class="cal-value">{{ progreso.estadisticas.promedio_despegue | number:'1.1-1' }}</span>
            </div>
            <div class="cal-item">
              <span class="cal-label">Vuelo</span>
              <div class="cal-bar">
                <div class="cal-fill" [style.width.%]="(progreso.estadisticas.promedio_vuelo/5)*100"></div>
              </div>
              <span class="cal-value">{{ progreso.estadisticas.promedio_vuelo | number:'1.1-1' }}</span>
            </div>
            <div class="cal-item">
              <span class="cal-label">Aterrizaje</span>
              <div class="cal-bar">
                <div class="cal-fill" [style.width.%]="(progreso.estadisticas.promedio_aterrizaje/5)*100"></div>
              </div>
              <span class="cal-value">{{ progreso.estadisticas.promedio_aterrizaje | number:'1.1-1' }}</span>
            </div>
            <div class="cal-item">
              <span class="cal-label">Comunicación</span>
              <div class="cal-bar">
                <div class="cal-fill" [style.width.%]="(progreso.estadisticas.promedio_comunicacion/5)*100"></div>
              </div>
              <span class="cal-value">{{ progreso.estadisticas.promedio_comunicacion | number:'1.1-1' }}</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h3>Maniobras Dominadas ({{ progreso.maniobras_dominadas.length }})</h3>
          <div class="maniobras-list">
            <span *ngFor="let m of progreso.maniobras_dominadas" class="maniobra-badge">{{ m }}</span>
          </div>
        </div>

        <div class="section-card">
          <h3>Tutores</h3>
          <div class="tutores-list">
            <div *ngFor="let t of progreso.tutores" class="tutor-item">
              <span class="tutor-nombre">{{ t.nombre }}</span>
              <span class="tutor-vuelos">{{ t.vuelos }} vuelos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progreso-container { max-width: 1200px; margin: 0 auto; }
    .loading { text-align: center; padding: 3rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .stat-box h3 { font-size: 2.5rem; font-weight: 700; color: #3b82f6; margin: 0 0 0.5rem 0; }
    .stat-box p { font-size: 0.875rem; color: #6b7280; margin: 0; }
    .section-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
    .section-card h3 { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 0 0 1.5rem 0; }
    .calificaciones-grid { display: grid; gap: 1.5rem; }
    .cal-item { display: flex; align-items: center; gap: 1rem; }
    .cal-label { min-width: 100px; font-size: 0.875rem; font-weight: 600; color: #374151; }
    .cal-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .cal-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); }
    .cal-value { min-width: 40px; font-size: 0.875rem; font-weight: 700; color: #1f2937; text-align: right; }
    .maniobras-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .maniobra-badge { padding: 0.5rem 1rem; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .tutores-list { display: grid; gap: 0.75rem; }
    .tutor-item { display: flex; justify-content: space-between; padding: 1rem; background: #f9fafb; border-radius: 8px; }
    .tutor-nombre { font-weight: 600; color: #1f2937; }
    .tutor-vuelos { font-size: 0.875rem; color: #6b7280; }
  `]
})
export class AlumnoMiProgresoComponent implements Init {
  progreso: ProgresoAlumno | null = null;
  loading = false;

  constructor(private alumnoService: AlumnoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.alumnoService.getMiProgreso().subscribe({
      next: (data) => {
        this.progreso = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
}