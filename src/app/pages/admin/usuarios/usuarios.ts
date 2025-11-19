import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../services/usuario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  tutores: Usuario[] = [];
  loading = false;
  submitting = false;
  showModal = false;
  isEditMode = false;
  selectedUsuario: Usuario | null = null;

  // Filtros
  searchTerm = '';
  filterRol = '';
  filterActivo = '';

  usuarioForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [
        Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)
      ]],
      rol: ['', Validators.required],
      tutor_asignado_id: [''],
      password: [''],
      notas: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadTutores();
  }

  loadUsuarios(): void {
    this.loading = true;
    const filters = {
      rol: this.filterRol || undefined,
      activo: this.filterActivo ? this.filterActivo === 'true' : undefined,
      search: this.searchTerm || undefined
    };

    this.usuarioService.getUsuarios(filters).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
        alert('Error al cargar los usuarios');
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

  onSearch(): void {
    this.loadUsuarios();
  }

  onFilterChange(): void {
    this.loadUsuarios();
  }

  openModal(usuario?: Usuario): void {
    this.showModal = true;
    this.isEditMode = !!usuario;
    this.selectedUsuario = usuario || null;

    if (usuario) {
      // Modo edición
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol,
        tutor_asignado_id: usuario.tutor_asignado_id || '',
        notas: usuario.notas,
        activo: usuario.activo
      });
      // Contraseña opcional en edición
      this.usuarioForm.get('password')?.clearValidators();
    } else {
      // Modo creación
      this.usuarioForm.reset({ activo: true });
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset({ activo: true });
  }

  onRolChange(): void {
    const rol = this.usuarioForm.get('rol')?.value;
    if (rol !== 'Alumno') {
      this.usuarioForm.patchValue({ tutor_asignado_id: '' });
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.usuarioForm.value;

    // Limpiar campos vacíos
    const data = {
      ...formValue,
      tutor_asignado_id: formValue.tutor_asignado_id || null,
      telefono: formValue.telefono || null,
      notas: formValue.notas || null
    };

    // Si es edición y no hay password, eliminarlo
    if (this.isEditMode && !data.password) {
      delete data.password;
    }

    const request = this.isEditMode
      ? this.usuarioService.updateUsuario(this.selectedUsuario!.id_usuario, data)
      : this.usuarioService.createUsuario(data);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.closeModal();
        this.loadUsuarios();
        alert(response.message);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error:', error);
        const message = error.error?.message || 'Error al guardar el usuario';
        alert(message);
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    if (!confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      return;
    }

    this.usuarioService.deleteUsuario(usuario.id_usuario).subscribe({
      next: (response) => {
        this.loadUsuarios();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al desactivar el usuario');
      }
    });
  }

  activateUsuario(usuario: Usuario): void {
    if (!confirm(`¿Está seguro de activar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      return;
    }

    this.usuarioService.activateUsuario(usuario.id_usuario).subscribe({
      next: (response) => {
        this.loadUsuarios();
        alert(response.message);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al activar el usuario');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(rol: string): string {
    const colors = {
      'Administrador': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Tutor': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Alumno': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
    return colors[rol as keyof typeof colors] || colors['Alumno'];
  }

  getRolClass(rol: string): string {
    const classes = {
      'Administrador': 'badge-admin',
      'Tutor': 'badge-tutor',
      'Alumno': 'badge-alumno'
    };
    return classes[rol as keyof typeof classes] || '';
  }
}