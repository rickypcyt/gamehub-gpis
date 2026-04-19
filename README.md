# GameHub & Services Ecosystem

Plataforma web completa para la industria del videojuego. Proyecto académico de Ingeniería del Software.

## Descripción

GameHub centraliza noticias, rankings de videojuegos, calendario de eventos, contenido multimedia y espacios de opinión en una única plataforma web moderna y responsive.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Backend | Next.js API Routes |
| Base de datos | Neon (PostgreSQL) |
| Autenticación | NextAuth.js v5 + bcrypt |
| Validación | Zod |
| Internacionalización | next-intl |

## Requisitos Funcionales Implementados

- **RF-01**: Sistema de autenticación con 4 roles (Admin, Redactor, Colaborador, Suscriptor)
- **RF-02**: Panel de usuario con funciones específicas por rol
- **RF-03**: Catálogo de videojuegos con rankings (nota prensa/comunidad)
- **RF-04**: Módulo de noticias y actualidad
- **RF-05**: Blog de opinión con sistema de comentarios
- **RF-06**: Hub multimedia (videos, streams, trailers)
- **RF-07**: Agenda de eventos y lanzamientos
- **RF-08**: Página del equipo de redacción
- **RF-09**: Formulario de contacto
- **RF-10**: Soporte ES/EN (estructura i18n lista)
- **RF-11**: Diseño responsive (mobile-first)

## Estructura del Proyecto

```
├── app/                    # Rutas de Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Página de autenticación
│   ├── dashboard/         # Panel de usuario
│   ├── games/             # Catálogo de juegos
│   ├── news/              # Noticias
│   ├── blog/              # Blog de opinión
│   ├── multimedia/        # Hub multimedia
│   ├── events/            # Calendario de eventos
│   ├── team/              # Equipo de redacción
│   ├── contact/           # Formulario de contacto
│   └── page.tsx           # Landing page
├── components/ui/         # Componentes reutilizables
├── lib/                   # Utilidades y clientes
│   ├── neon.ts            # Cliente Neon + tipos
│   └── utils.ts           # Utilidades (cn, etc)
├── types/                 # Tipos globales
├── messages/              # Traducciones i18n
├── neon/                  # Schema SQL
└── middleware.ts          # Autenticación y roles
```

## Configuración de Neon

1. Crear proyecto en [Neon](https://neon.tech)
2. Ejecutar el schema SQL en `neon/schema.sql`
3. Configurar variables de entorno:

```bash
DATABASE_URL=postgresql://user:password@host/database
NEXTAUTH_SECRET=secreto_random
NEXTAUTH_URL=http://localhost:3000
```

## Instalación y Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Gestión completa: usuarios, mensajes, configuración |
| **Redactor** | Crear noticias, gestionar juegos, multimedia, eventos |
| **Colaborador** | Escribir en el blog de opinión |
| **Suscriptor** | Comentar en posts, editar perfil |

## Seguridad Implementada

- Autenticación JWT con NextAuth.js
- Hash de contraseñas con bcrypt
- Validación de formularios con Zod
- Middleware de protección de rutas por rol
- Protección contra XSS (escapado automático de React)

## Licencia

Proyecto académico - Ingeniería del Software 2025-2026
