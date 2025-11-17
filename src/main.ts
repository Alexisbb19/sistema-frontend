import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app/app';
import { AppRoutingModule, routes } from './app/app.routes';

// Servicios
import { AuthService } from './app/services/auth';
import { UsuarioService } from './app/services/usuario';
import { AvionetaService } from './app/services/avioneta';
import { VueloService } from './app/services/vuelo';
import { ReporteService } from './app/services/reporte';
import { NotificacionService } from './app/services/notificacion';
import { BitacoraService } from './app/services/bitacora'

// Guards
import { AuthGuard } from './app/guards/auth-guard';

// Interceptor
import { AuthInterceptor } from './app/interceptors/auth-interceptor';

// Componentes standalone (si los tenés definidos así)
import { LoginComponent } from './app/pages/login/login';
import { AdminLayoutComponent } from './app/pages/admin/layout/layout';
import { AdminDashboardComponent } from './app/pages/admin/dashboard/dashboard';
import { UsuariosComponent } from './app/pages/admin/usuarios/usuarios';
import { AvionetasComponent } from './app/pages/admin/avionetas/avionetas';
import { VuelosComponent } from './app/pages/admin/vuelos/vuelos';
import { ReportesComponent } from './app/pages/admin/reportes/reportes';
import { TutorLayoutComponent } from './app/pages/tutor/layout/layout';
import { TutorMisVuelosComponent } from './app/pages/tutor/mis-vuelos/mis-vuelos';
;


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      ReactiveFormsModule,
      FormsModule,
      CommonModule
    ),
    // Servicios
    AuthService,
    UsuarioService,
    AvionetaService,
    VueloService,
    ReporteService,
    NotificacionService,
    BitacoraService,
    // Guard
    AuthGuard,
    // Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
