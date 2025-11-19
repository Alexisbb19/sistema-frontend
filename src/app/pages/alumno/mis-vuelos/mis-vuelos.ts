import { Component, OnInit } from '@angular/core';
import { AlumnoService, HorarioSemanal } from '../../../services/alumno';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alumno-mis-vuelos',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div class="mis-vuelos-alumno">
      <div class="header-semana">
        <button class="btn-nav-semana" (click)="semanaAnterior()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 class="titulo-semana">
          {{ horario?.semana_inicio | date:'d MMM' }} - {{ horario?.semana_fin | date:'d MMM yyyy' }}
        </h2>
        <button class="btn-nav-semana" (click)="semanaSiguiente()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando horario...</p>
      </div>

      <div *ngIf="!loading && horario" class="calendario-semanal">
        <div *ngFor="let dia of horario.horario" class="dia-card" [class.tiene-vuelos]="dia.vuelos.length > 0">
          <div class="dia-header">
            <span class="dia-nombre">{{ dia.dia_nombre }}</span>
            <span class="dia-fecha">{{ dia.fecha | date:'d/MM' }}</span>
          </div>
          <div class="vuelos-dia">
            <div *ngFor="let vuelo of dia.vuelos" class="vuelo-item">
              <div class="vuelo-hora">{{ vuelo.hora_inicio }}</div>
              <div class="vuelo-info">
                <div class="vuelo-tutor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ vuelo.tutor?.nombre }} {{ vuelo.tutor?.apellido }}
                </div>
                <div class="vuelo-avioneta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2 22L12 2l10 20H2z" transform="rotate(90 12 12)"/>
                  </svg>
                  {{ vuelo.avioneta?.codigo }}
                </div>
              </div>
            </div>
            <div *ngIf="dia.vuelos.length === 0" class="sin-vuelos">
              Sin vuelos programados
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mis-vuelos-alumno { max-width: 1200px; margin: 0 auto; }
    .header-semana { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .titulo-semana { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0; }
    .btn-nav-semana { width: 40px; height: 40px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-nav-semana:hover { background: #bfdbfe; }
    .btn-nav-semana svg { width: 20px; height: 20px; stroke: #1e40af; }
    .loading { text-align: center; padding: 3rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .calendario-semanal { display: grid; gap: 1rem; }
    .dia-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
    .dia-card.tiene-vuelos { border-left: 4px solid #3b82f6; }
    .dia-header { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #f3f4f6; }
    .dia-nombre { font-size: 1.125rem; font-weight: 700; color: #1f2937; text-transform: capitalize; }
    .dia-fecha { font-size: 0.875rem; color: #6b7280; font-weight: 600; }
    .vuelo-item { display: flex; gap: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.75rem; }
    .vuelo-hora { font-size: 1.25rem; font-weight: 700; color: #3b82f6; min-width: 60px; }
    .vuelo-info { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .vuelo-tutor, .vuelo-avioneta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #4b5563; }
    .vuelo-tutor svg, .vuelo-avioneta svg { width: 16px; height: 16px; }
    .sin-vuelos { text-align: center; padding: 2rem; color: #9ca3af; font-style: italic; }
  `]
})
export class AlumnoMisVuelosComponent implements OnInit {
  horario: HorarioSemanal | null = null;
  loading = false;
  fechaActual: Date = new Date();

  constructor(private alumnoService: AlumnoService) {}

  ngOnInit(): void {
    this.loadHorario();
  }

  loadHorario(): void {
    this.loading = true;
    const fechaInicio = this.getFechaInicioSemana(this.fechaActual);
    this.alumnoService.getHorarioSemanal(fechaInicio).subscribe({
      next: (data) => {
        this.horario = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  semanaAnterior(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() - 7);
    this.loadHorario();
  }

  semanaSiguiente(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() + 7);
    this.loadHorario();
  }

  getFechaInicioSemana(fecha: Date): string {
    const d = new Date(fecha);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }
}