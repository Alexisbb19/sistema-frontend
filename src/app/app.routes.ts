
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard';
import { AdminLayoutComponent } from './pages/admin/layout/layout';
import { UsuariosComponent } from './pages/admin/usuarios/usuarios';
import { AvionetasComponent } from './pages/admin/avionetas/avionetas';
import { AuthGuard } from './guards/auth-guard';
import { VuelosComponent } from './pages/admin/vuelos/vuelos';
import { ReportesComponent } from './pages/admin/reportes/reportes';
import { TutorLayoutComponent } from './pages/tutor/layout/layout';
import { TutorMisVuelosComponent } from './pages/tutor/mis-vuelos/mis-vuelos';
import { TutorMisAlumnosComponent } from './pages/tutor/mis-alumnos/mis-alumnos';
import { TutorProgresoAlumnoComponent } from './pages/tutor/progreso-alumno/progreso-alumno';
import { TutorReportesComponent } from './pages/tutor/reportes/reportes';
import { TutorReportarFallasComponent } from './pages/tutor/reportar-fallas/reportar-fallas';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'usuarios',
        component: UsuariosComponent
      },
      {
        path: 'avionetas',
        component: AvionetasComponent
      },
      {
        path: 'vuelos',
        component: VuelosComponent
      },
      {
        path: 'reportes',
        component: ReportesComponent
      }
    ]
  },
  {
    path: 'tutor',
    component: TutorLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Tutor'] },
    children: [
      {
        path: '',
        redirectTo: 'mis-vuelos',
        pathMatch: 'full'
      },
      {
        path: 'mis-vuelos',
        component: TutorMisVuelosComponent
      },
      {
        path: 'mis-alumnos',
        component: TutorMisAlumnosComponent
      },
      {
        path: 'alumno/:id',
        component: TutorProgresoAlumnoComponent
      },
      {
        path: 'reportes',
        component: TutorReportesComponent
      },
      {
        path: 'reportar-fallas',
        component: TutorReportarFallasComponent
      }
    ]
  }
  ,
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }