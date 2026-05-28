import { Component, signal, inject, OnInit, input, computed, DestroyRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'admin-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  standalone: true
})
export class AdminUsuariosComponent implements OnInit {
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  darkMode = input.required<boolean>();
  t = input.required<(key: string) => string>();

  usuarios = signal<any[]>([]);
  busquedaAdmin = signal('');
  adminLoading = signal(false);
  adminModalAbierto = signal(false);
  adminModalMode = signal<'crear' | 'editar'>('crear');
  adminSelectedUser = signal<any | null>(null);
  adminFormNombre = signal('');
  adminFormEmail = signal('');
  adminFormPassword = signal('');
  adminFormRol = signal<'USUARIO' | 'ADMINISTRADOR'>('USUARIO');
  adminFormLoading = signal(false);
  adminFormError = signal('');
  mensaje = signal('');

  usuariosFiltrados = computed(() => {
    const search = this.busquedaAdmin().toLowerCase().trim();
    if (!search) return this.usuarios();
    return this.usuarios().filter((u: any) =>
      u.nombre.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  ngOnInit() {
    this.cargarUsuarios();
    this.conectarSocketUsuarios();
  }

  private conectarSocketUsuarios() {
    const socket = this.socketService.connect();

    socket.on('usuario.creado', (data: any) => {
      this.ngZone.run(() => this.usuarios.update((lista) => {
        if (lista.some((u: any) => u.id === data.id)) return lista;
        return [data, ...lista];
      }));
    });

    socket.on('usuario.actualizado', (data: any) => {
      this.ngZone.run(() =>
        this.usuarios.update((lista) =>
          lista.map((u: any) => (u.id === data.id ? { ...u, ...data } : u))
        )
      );
    });

    socket.on('usuario.eliminado', (data: any) => {
      this.ngZone.run(() =>
        this.usuarios.update((lista) =>
          lista.filter((u: any) => u.id !== data.id)
        )
      );
    });

    this.destroyRef.onDestroy(() => this.socketService.disconnect());
  }

  cargarUsuarios() {
    this.adminLoading.set(true);
    this.authService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.adminLoading.set(false);
      },
      error: () => {
        this.adminLoading.set(false);
      }
    });
  }

  abrirModalCrearUsuario() {
    this.adminModalMode.set('crear');
    this.adminSelectedUser.set(null);
    this.adminFormNombre.set('');
    this.adminFormEmail.set('');
    this.adminFormPassword.set('');
    this.adminFormRol.set('USUARIO');
    this.adminFormError.set('');
    this.adminModalAbierto.set(true);
  }

  abrirModalEditarUsuario(u: any) {
    this.adminModalMode.set('editar');
    this.adminSelectedUser.set(u);
    this.adminFormNombre.set(u.nombre);
    this.adminFormEmail.set(u.email);
    this.adminFormPassword.set('');
    this.adminFormRol.set(u.rol);
    this.adminFormError.set('');
    this.adminModalAbierto.set(true);
  }

  cerrarModalAdmin() {
    this.adminModalAbierto.set(false);
    this.adminSelectedUser.set(null);
    this.adminFormNombre.set('');
    this.adminFormEmail.set('');
    this.adminFormPassword.set('');
    this.adminFormRol.set('USUARIO');
    this.adminFormError.set('');
    this.adminFormLoading.set(false);
  }

  guardarUsuarioAdmin() {
    const nombre = this.adminFormNombre().trim();
    const email = this.adminFormEmail().trim();
    const rol = this.adminFormRol();

    if (!nombre || !email) {
      this.adminFormError.set('Nombre y email son obligatorios');
      return;
    }

    if (this.adminModalMode() === 'crear' && !this.adminFormPassword().trim()) {
      this.adminFormError.set('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    this.adminFormLoading.set(true);
    this.adminFormError.set('');

    if (this.adminModalMode() === 'crear') {
      this.authService.adminCreateUser({
        nombre,
        email,
        password: this.adminFormPassword().trim(),
        rol
      }).subscribe({
        next: () => {
          this.adminFormLoading.set(false);
          this.cerrarModalAdmin();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.adminFormLoading.set(false);
          this.adminFormError.set(err.error?.error || 'Error al crear usuario');
        }
      });
    } else {
      const id = this.adminSelectedUser()?.id;
      if (!id) return;

      const data: any = { nombre, email, rol };
      this.authService.adminUpdateUser(id, data).subscribe({
        next: () => {
          this.adminFormLoading.set(false);
          this.cerrarModalAdmin();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.adminFormLoading.set(false);
          this.adminFormError.set(err.error?.error || 'Error al actualizar usuario');
        }
      });
    }
  }

  eliminarUsuarioAdmin(id: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Los reportes que creó quedarán sin dueño.')) return;

    this.authService.adminDeleteUser(id).subscribe({
      next: () => {
        this.mensaje.set('✅ Usuario eliminado');
        this.cargarUsuarios();
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        this.mensaje.set('❌ ' + (err.error?.mensaje || err.error?.error || 'Error al eliminar'));
        setTimeout(() => this.mensaje.set(''), 3000);
      }
    });
  }
}
