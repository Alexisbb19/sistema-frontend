import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
   standalone: true, // 👈 IMPORTANTE: marca el componente como standalone
  imports: [CommonModule, ReactiveFormsModule], // 👈 IMPORTANTE: importa los módulos necesarios aquí
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }

    // Obtener URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { correo, password } = this.loginForm.value;

    this.authService.login(correo, password).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Redirigir según el returnUrl o el rol del usuario
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.redirectToDashboard();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en login:', error);
        
        if (error.status === 422) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        } else if (error.status === 403) {
          this.errorMessage = error.error.message || 'Usuario inactivo.';
        } else {
          this.errorMessage = 'Error al conectar con el servidor. Intenta nuevamente.';
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return;
    }

    switch (user.rol) {
      case 'Administrador':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Tutor':
        this.router.navigate(['/tutor/mis-vuelos']);
        break;
      case 'Alumno':
        this.router.navigate(['/alumno/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}