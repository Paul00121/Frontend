# StudySync Frontend

Frontend Angular 21 para el Sistema de Reportes de Incidentes de Infraestructura Universitaria, construido como guía pedagógica para la asignatura **Programación IV — UPDS 2026**.

**Producción:** https://bucolic-basbousa-1de35b.netlify.app  
**API Backend:** https://studysync-api-l59a.onrender.com/api  
**Documentación Swagger:** https://studysync-api-l59a.onrender.com/api-docs

---

## Stack tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| Framework | Angular 21 (standalone) | SPA moderna con Signals |
| Lenguaje | TypeScript 5.9 | Tipado estricto |
| Estilos | Tailwind CSS 3.4 | Utility-first responsive |
| Tiempo real | Socket.io Client 4.8 | Notificaciones WebSocket |
| HTTP | Angular HttpClient + Interceptor | Consumo REST + JWT Bearer |
| Testing | Vitest | Pruebas unitarias |
| Despliegue | Netlify | Hosting estático con CDN |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│  Angular 21 SPA (Netlify)                                    │
│                                                              │
│  src/app/                                                    │
│  ├── app.ts / app.html         ← Root component              │
│  │   ├── Login / Register      ← Auth forms                  │
│  │   ├── Dashboard             ← KPIs (pendientes, etc.)     │
│  │   ├── Reportes              ← CRUD tabla + modal          │
│  │   ├── Comentarios           ← Panel inline por reporte    │
│  │   ├── Configuración         ← Perfil + preferencias       │
│  │   ├── Gestión Usuarios      ← CRUD admin (admin-usuarios) │
│  │   └── Monitoreo Sockets     ← Terminal WS en vivo         │
│  ├── services/                                                │
│  │   ├── auth.service.ts       ← JWT + señales usuario/rol   │
│  │   ├── auth.interceptor.ts   ← Inyecta Bearer token        │
│  │   ├── reporte.service.ts    ← CRUD reportes + comentarios │
│  │   └── socket.service.ts     ← Cliente Socket.io + logs    │
│  └── components/                                              │
│      ├── admin-usuarios/       ← Tabla + modales CRUD        │
│      └── monitoreo-sockets/    ← Consola terminal WS         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Conexiones externas                                 │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │    │
│  │  │ HTTP (REST) │  │ WebSocket    │  │ JWT Token  │  │    │
│  │  │ reports API │  │ Socket.io    │  │ almacenado │  │    │
│  │  │ auth API    │  │ eventos WS   │  │ localStorage│  │    │
│  │  └──────┬──────┘  └──────┬───────┘  └────────────┘  │    │
│  └─────────┼───────────────┼────────────────────────────┘    │
└────────────┼───────────────┼─────────────────────────────────┘
             │               │
             ▼               ▼
     Render (Backend)   Render (Socket.io)
```

---

## Funcionalidades

| Módulo | Descripción |
|---|---|
| **Login / Register** | Autenticación con JWT, formularios validados |
| **Dashboard** | KPIs: reportes pendientes, en reparación, solucionados |
| **Reportes** | CRUD completo con tabla, búsqueda, filtros, edición modal |
| **Comentarios** | Panel inline por reporte, lista con autor/fecha, crear nuevo |
| **Configuración** | Perfil (nombre/email), modo oscuro, multi-idioma (ES/EN/PT) |
| **Gestión de Usuarios** | CRUD admin: crear, editar, eliminar usuarios con roles |
| **Monitoreo Sockets** | Consola terminal con logs de eventos WS en tiempo real |

---

## Instalación local

```bash
# Clonar el repositorio
git clone <repo-url>
cd studysync-front

# Instalar dependencias
npm install

# Iniciar en desarrollo
ng serve

# Abrir en navegador
# http://localhost:4200
```

---

## Configuración de entorno

Editar `src/environments/` según el entorno:

| Archivo | Entorno | API URL |
|---|---|---|
| `environment.ts` | Producción | `https://studysync-api-l59a.onrender.com/api` |
| `environment.development.ts` | Desarrollo | `https://studysync-api-l59a.onrender.com/api` |
| `environment.prod.ts` | Producción alterna | `https://studysync-back.onrender.com/api` |

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://studysync-api-l59a.onrender.com/api'
};
```

El `SocketService` deriva automáticamente la URL del servidor WebSocket: `environment.apiUrl.replace('/api', '')`.

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `ng serve` | Servidor de desarrollo en `http://localhost:4200` |
| `ng build` | Build de producción en `dist/studysync-front/browser` |
| `ng test` | Ejecutar pruebas unitarias (Vitest) |
| `ng watch` | Build en modo watch (development) |

---

## Estructura del proyecto

```
studysync-front/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Auth + JWT + señales
│   │   │   ├── auth.interceptor.ts      # Inyecta Bearer en cada petición
│   │   │   ├── reporte.service.ts       # CRUD reportes + comentarios
│   │   │   └── socket.service.ts        # Cliente Socket.io + logs
│   │   ├── admin-usuarios/
│   │   │   ├── admin-usuarios.component.ts
│   │   │   └── admin-usuarios.component.html
│   │   ├── monitoreo-sockets/
│   │   │   ├── monitoreo-sockets.component.ts
│   │   │   └── monitoreo-sockets.component.html
│   │   ├── app.ts                       # Componente raíz (toda la lógica)
│   │   ├── app.html                     # Template raíz (layout completo)
│   │   ├── app.css                      # Override sidebar desktop
│   │   ├── app.config.ts                # Providers globales
│   │   └── app.routes.ts                # Rutas (vacías, SPA inline)
│   ├── environments/
│   │   ├── environment.ts               # Producción
│   │   ├── environment.development.ts   # Desarrollo
│   │   └── environment.prod.ts          # Producción alterna
│   ├── index.html                       # Entry point HTML
│   ├── main.ts                          # Bootstrap Angular
│   └── styles.css                       # Tailwind directives
├── angular.json                         # Configuración Angular CLI
├── tailwind.config.js                   # Configuración Tailwind CSS
├── postcss.config.js                    # PostCSS + Autoprefixer
├── netlify.toml                         # Configuración despliegue Netlify
├── vercel.json                          # Configuración despliegue Vercel
└── package.json
```

---

## Despliegue en Netlify

El proyecto incluye `netlify.toml` con la configuración lista:

```toml
[build]
  command = "npm run build"
  publish = "dist/studysync-front/browser"
```

1. Conectar repositorio a [Netlify](https://netlify.com).
2. Netlify detecta automáticamente `netlify.toml`.
3. En cada push a `main`, se ejecuta `npm run build` y se publica `dist/studysync-front/browser`.
4. Para forzar deploy limpio: **Deploys → Trigger deploy → Clear cache and deploy site**.

---

## Distribución de responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `app.ts` | Señales de estado, métodos CRUD, lógica de comentarios, traducciones |
| `app.html` | Template completo: sidebar, header, todos los módulos, modal, comentarios |
| `auth.service.ts` | Login, registro, perfil, CRUD admin usuarios, persistencia localStorage |
| `auth.interceptor.ts` | Intercepta HTTP y agrega `Authorization: Bearer <token>` |
| `reporte.service.ts` | Peticiones HTTP a `/api/reportes` y `/api/reportes/:id/comentarios` |
| `socket.service.ts` | Conexión Socket.io, señal `logs` para monitoreo, eventos WS |

---

## Tiempo real (Socket.io)

El `SocketService` se conecta automáticamente al backend y escucha estos eventos:

| Evento | Descripción |
|---|---|
| `reporte.creado` | Nuevo reporte creado por otro usuario |
| `reporte.actualizado` | Reporte modificado |
| `reporte.eliminado` | Reporte eliminado |
| `usuario.creado` | Admin creó un usuario |
| `usuario.actualizado` | Admin modificó un usuario |
| `usuario.eliminado` | Admin eliminó un usuario |
| `usuario-conectado` | Alguien inició sesión |

El módulo **Monitoreo Sockets** muestra todos estos eventos en una consola terminal en vivo con timestamps.

---

*Documentación generada el 2026-06-01 por el **Grupo Detoneitors** — Programación IV, UPDS.*
