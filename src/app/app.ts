import { Component, signal, inject, OnInit, OnDestroy, computed, NgZone, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService, Reporte } from './services/reporte.service';

interface Translations {
  [key: string]: {
    dashboard: string;
    reportes: string;
    configuracion: string;
    nuevoReporte: string;
    panelControl: string;
    pendientes: string;
    enReparacion: string;
    solucionados: string;
    listaReportes: string;
    buscar: string;
    acciones: string;
    idioma: string;
    darkMode: string;
    notificaciones: string;
    crearReporte: string;
    cancelar: string;
    titulo: string;
    ubicacion: string;
    descripcion: string;
    noReportes: string;
    cargando: string;
    admin: string;
    studySync: string;
    infraestructura: string;
    version: string;
    idiomaLabel: string;
    notificacionesLabel: string;
    infoSistema: string;
    editarReporte: string;
    estado: string;
    guardarCambios: string;
  };
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private reporteService = inject(ReporteService);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  reportes = signal<Reporte[]>([]);

  titulo = signal('');
  descripcion = signal('');
  ubicacion = signal('');

  cargando = signal(false);
  mensaje = signal('');
  mensajeAlerta = signal<string | null>(null);

  // Módulos: dashboard | reportes | configuracion
  moduloActivo = signal<'dashboard' | 'reportes' | 'configuracion'>('dashboard');
  mostrarModal = signal(false);

  // Edición de reportes
  reporteSeleccionado = signal<Reporte | null>(null);
  estadoSeleccionado = signal<string>('Pendiente');

  // Configuración
  darkMode = signal(true);
  idioma = signal<'es' | 'en' | 'pt'>('es');
  notificaciones = signal(true);

  // Búsqueda en tiempo real
  busqueda = signal('');

  // Diccionario de traducciones
  private translations: Translations = {
    es: {
      dashboard: 'Panel de Control',
      reportes: 'Reportes',
      configuracion: 'Configuración',
      nuevoReporte: 'Nuevo Reporte',
      panelControl: 'Panel de Control',
      pendientes: 'Pendientes',
      enReparacion: 'En Reparación',
      solucionados: 'Solucionados',
      listaReportes: 'Lista de Reportes',
      buscar: 'Buscar por título o ubicación...',
      acciones: 'Acciones',
      idioma: 'Idioma',
      darkMode: 'Modo Oscuro',
      notificaciones: 'Notificaciones',
      crearReporte: 'Crear Reporte',
      cancelar: 'Cancelar',
      titulo: 'Título',
      ubicacion: 'Ubicación',
      descripcion: 'Descripción',
      noReportes: 'No hay reportes registrados',
      cargando: 'Cargando...',
      admin: 'Administrador',
      studySync: 'StudySync',
      infraestructura: 'Infraestructura',
      version: 'Versión',
      idiomaLabel: 'Selecciona el idioma de la aplicación',
      notificacionesLabel: 'Recibe alertas sobre nuevos reportes',
      infoSistema: 'Información del Sistema',
      editarReporte: 'Editar Reporte',
      estado: 'Estado',
      guardarCambios: 'Guardar Cambios'
    },
    en: {
      dashboard: 'Dashboard',
      reportes: 'Reports',
      configuracion: 'Settings',
      nuevoReporte: 'New Report',
      panelControl: 'Control Panel',
      pendientes: 'Pending',
      enReparacion: 'In Repair',
      solucionados: 'Solved',
      listaReportes: 'Reports List',
      buscar: 'Search by title or location...',
      acciones: 'Actions',
      idioma: 'Language',
      darkMode: 'Dark Mode',
      notificaciones: 'Notifications',
      crearReporte: 'Create Report',
      cancelar: 'Cancel',
      titulo: 'Title',
      ubicacion: 'Location',
      descripcion: 'Description',
      noReportes: 'No reports registered',
      cargando: 'Loading...',
      admin: 'Administrator',
      studySync: 'StudySync',
      infraestructura: 'Infrastructure',
      version: 'Version',
      idiomaLabel: 'Select the application language',
      notificacionesLabel: 'Receive alerts about new reports',
      infoSistema: 'System Information',
      editarReporte: 'Edit Report',
      estado: 'State',
      guardarCambios: 'Save Changes'
    },
    pt: {
      dashboard: 'Painel',
      reportes: 'Relatórios',
      configuracion: 'Configurações',
      nuevoReporte: 'Novo Relatório',
      panelControl: 'Painel de Controle',
      pendientes: 'Pendentes',
      enReparacion: 'Em Reparo',
      solucionados: 'Solucionados',
      listaReportes: 'Lista de Relatórios',
      buscar: 'Buscar por título ou localização...',
      acciones: 'Ações',
      idioma: 'Idioma',
      darkMode: 'Modo Escuro',
      notificaciones: 'Notificações',
      crearReporte: 'Criar Relatório',
      cancelar: 'Cancelar',
      titulo: 'Título',
      ubicacion: 'Localização',
      descripcion: 'Descrição',
      noReportes: 'Nenhum relatório registrado',
      cargando: 'Carregando...',
      admin: 'Administrador',
      studySync: 'StudySync',
      infraestructura: 'Infraestrutura',
      version: 'Versão',
      idiomaLabel: 'Selecione o idioma do aplicativo',
      notificacionesLabel: 'Receba alertas sobre novos relatórios',
      infoSistema: 'Informações do Sistema',
      editarReporte: 'Editar Relatório',
      estado: 'Estado',
      guardarCambios: 'Salvar Alterações'
    }
  };

  // Método para obtener traducción
  t(key: keyof Translations['es']): string {
    return this.translations[this.idioma()][key] || key;
  }

  get pendientes(): number {
    return this.reportes().filter(r => r.estado === 'Pendiente').length;
  }

  get enReparacion(): number {
    return this.reportes().filter(r => r.estado === 'En Reparación').length;
  }

  get solucionados(): number {
    return this.reportes().filter(r => r.estado === 'Solucionado').length;
  }

  // Computed para reportes filtrados por búsqueda
  reportesFiltrados = computed(() => {
    const search = this.busqueda().toLowerCase().trim();
    if (!search) return this.reportes();
    return this.reportes().filter(r =>
      r.titulo.toLowerCase().includes(search) ||
      r.ubicacion.toLowerCase().includes(search)
    );
  });

  ngOnInit() {
    this.cargarReportes();
    this.conectarStreamSSE();
  }

  private conectarStreamSSE() {
    const sub = this.reporteService.listenToReportStream().subscribe({
      next: (evento) => {
        this.ngZone.run(() => {
          switch (evento.type) {
            case 'reporte.creado':
              this.reportes.update((lista) => [evento.data, ...lista]);
              break;
            case 'reporte.actualizado':
              this.reportes.update((lista) =>
                lista.map((r) => (r.id === evento.data.id ? { ...r, ...evento.data } : r))
              );
              break;
            case 'reporte.eliminado':
              this.reportes.update((lista) =>
                lista.filter((r) => r.id !== evento.data.id)
              );
              break;
          }
        });
      },
      error: () => {
        console.warn('[SSE] Error en el stream — reintentará automáticamente');
      }
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy() {
    // destroyRef se encarga del cleanup del subscription
  }

  cargarReportes() {
    this.cargando.set(true);
    this.reporteService.getAll().subscribe({
      next: (data) => {
        this.reportes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.manejarErrorHttp(err, 'cargar reportes');
        this.cargando.set(false);
      }
    });
  }

  crearReporte() {
    const tituloVal = this.titulo().trim();
    const ubicacionVal = this.ubicacion().trim();

    if (!tituloVal || !ubicacionVal) {
      this.mensaje.set('⚠️ Título y Ubicación son obligatorios');
      return;
    }

    this.reporteService.create({
      titulo: tituloVal,
      descripcion: this.descripcion(),
      ubicacion: ubicacionVal
    }).subscribe({
      next: () => {
        this.mensaje.set('✅ Reporte creado exitosamente');
        this.titulo.set('');
        this.descripcion.set('');
        this.ubicacion.set('');
        this.cerrarModal();
        this.cargarReportes();
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        this.manejarErrorHttp(err, 'crear reporte');
        console.error(err);
      }
    });
  }

  cambiarEstado(reporte: Reporte, nuevoEstado: string) {
    this.reporteService.cambiarEstado(reporte.id, nuevoEstado).subscribe({
      next: () => {
        this.mensaje.set('✅ Estado actualizado');
        this.cargarReportes();
        setTimeout(() => this.mensaje.set(''), 2000);
      },
      error: (err) => {
        this.manejarErrorHttp(err, 'actualizar estado');
        console.error(err);
      }
    });
  }

  eliminarReporte(id: number) {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;

    this.reporteService.delete(id).subscribe({
      next: () => {
        this.mensaje.set('✅ Reporte eliminado');
        this.cargarReportes();
        setTimeout(() => this.mensaje.set(''), 2000);
      },
      error: (err) => {
        this.manejarErrorHttp(err, 'eliminar reporte');
        console.error(err);
      }
    });
  }

  private manejarErrorHttp(err: any, contexto: string): void {
    if (err.status === 429) {
      const msg = err.error?.mensaje || '¡Alerta de Autoataque! Demasiadas peticiones. Inténtalo más tarde.';
      this.mensajeAlerta.set(msg);
      setTimeout(() => this.mensajeAlerta.set(null), 4000);
    } else {
      this.mensaje.set(`❌ Error al ${contexto}`);
    }
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'badge-pendiente';
      case 'En Reparación': return 'badge-reparacion';
      case 'Solucionado': return 'badge-solucionado';
      default: return '';
    }
  }

  getProximoEstado(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'En Reparación';
      case 'En Reparación': return 'Solucionado';
      default: return 'Pendiente';
    }
  }

  cambiarModulo(modulo: 'dashboard' | 'reportes' | 'configuracion') {
    this.moduloActivo.set(modulo);
  }

  abrirModal() {
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.titulo.set('');
    this.descripcion.set('');
    this.ubicacion.set('');
    this.reporteSeleccionado.set(null);
    this.estadoSeleccionado.set('Pendiente');
  }

  toggleDarkMode() {
    this.darkMode.update(v => !v);
  }

  toggleNotificaciones() {
    this.notificaciones.update(v => !v);
  }

  cambiarIdioma(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.idioma.set(select.value as 'es' | 'en' | 'pt');
  }

  abrirModalEdicion(reporte: Reporte) {
    this.reporteSeleccionado.set(reporte);
    this.estadoSeleccionado.set(reporte.estado);
    this.titulo.set(reporte.titulo);
    this.ubicacion.set(reporte.ubicacion);
    this.descripcion.set(reporte.descripcion || '');
    this.mostrarModal.set(true);
  }

  guardarCambiosReporte() {
    const id = this.reporteSeleccionado()?.id;
    if (!id) return;

    const nuevoEstado = this.estadoSeleccionado() as 'Pendiente' | 'En Reparación' | 'Solucionado';

    this.reporteService.update(id, {
      titulo: this.titulo(),
      descripcion: this.descripcion(),
      ubicacion: this.ubicacion(),
      estado: nuevoEstado
    }).subscribe({
      next: () => {
        this.mensaje.set('✅ Reporte actualizado correctamente');
        this.cerrarModal();
        this.cargarReportes();
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        this.manejarErrorHttp(err, 'actualizar reporte');
        console.error(err);
      }
    });
  }
}