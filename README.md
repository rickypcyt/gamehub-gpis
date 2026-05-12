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

---

# Tecnologías Principales

## Next.js 16

Next.js es el framework principal del proyecto, utilizando su **App Router** (introducido en Next.js 13) que ofrece una arquitectura moderna basada en el sistema de archivos.

### Características Clave Implementadas

- **App Router**: Estructura de rutas basada en el sistema de archivos en el directorio `app/`
- **Server Components**: Por defecto, los componentes se renderizan en el servidor para mejor rendimiento
- **Client Components**: Marcados con `"use client"` cuando se necesita interactividad (hooks, eventos)
- **API Routes**: Endpoints RESTful en `app/api/` para operaciones CRUD
- **Server Actions**: Capacidad de ejecutar código en el servidor directamente desde componentes
- **Middleware**: Protección de rutas basada en roles de usuario
- **Optimización**: Automatic code splitting, image optimization, font optimization

### Estructura de Rutas

```
app/
├── [locale]/              # Internacionalización (en, es)
│   ├── layout.tsx         # Layout principal por locale
│   ├── page.tsx           # Landing page (/)
│   ├── news/              # Sección de noticias (/news)
│   ├── events/            # Sección de eventos (/events)
│   ├── blog/              # Blog de opinión (/blog/[slug])
│   ├── contact/           # Formulario de contacto (/contact)
│   └── dashboard/         # Panel de usuario protegido (/dashboard)
└── api/                   # API Routes
    ├── auth/              # Autenticación (login, registro)
    ├── news/              # CRUD de noticias
    ├── blog/              # CRUD de blog posts
    ├── comments/          # CRUD de comentarios
    ├── games/             # Catálogo de juegos
    ├── profile/           # Gestión de perfil
    ├── users/             # Gestión de usuarios (admin)
    └── contact/           # Mensajes de contacto
```

### API Routes

Las API Routes de Next.js funcionan como endpoints RESTful tradicionales pero con ventajas adicionales:

- **Server-side execution**: Se ejecutan en el servidor (Node.js runtime)
- **Edge runtime support**: Opción de ejecución en edge para menor latencia
- **TypeScript full-stack**: Compartir tipos entre frontend y backend
- **Built-in middleware**: Protección de rutas, rate limiting, etc.

Ejemplo de estructura de una API Route:

```typescript
// app/api/news/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/neon';

export async function GET() {
  const news = await query('SELECT * FROM news_posts WHERE published = true');
  return NextResponse.json(news);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validación y procesamiento
  return NextResponse.json({ success: true });
}
```

---

## Neon (PostgreSQL Serverless)

Neon es una base de datos PostgreSQL serverless que ofrece:

- **Serverless architecture**: Escalado automático según demanda
- **Branching**: Crear branches de desarrollo instantáneos
- **Auto-suspend**: Pausa automática cuando no se usa (ahorro de costes)
- **Connection pooling**: Gestión eficiente de conexiones
- **HTTP API**: Acceso vía HTTP sin necesidad de mantener conexiones persistentes

### Configuración del Cliente

El cliente Neon se configura en `lib/neon.ts`:

```typescript
import { neon } from "@neondatabase/serverless";

// Singleton pattern para reutilizar conexiones
let sql: ReturnType<typeof neon> | null = null;

export function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}
```

**Ventajas del patrón Singleton:**
- Reutiliza la conexión HTTP entre requests
- Reduce overhead de establecimiento de conexión
- Mejora rendimiento en serverless environments

### Helpers de Query

El proyecto incluye helpers para simplificar las consultas:

```typescript
// Query básica
export async function query<T = unknown>(sqlStr: string, params?: unknown[]): Promise<T[]>

// Query con cache (Next.js unstable_cache)
export async function cachedQuery<T = unknown>(
  sqlStr: string,
  params?: unknown[],
  revalidateInSeconds: number = 300
): Promise<T[]>

// Query que devuelve un solo registro
export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>
```

**Uso con cache:**
- Utiliza `unstable_cache` de Next.js para cachear resultados
- `revalidateInSeconds`: Tiempo en segundos antes de refrescar el cache
- Ideal para datos que no cambian frecuentemente (listas de juegos, noticias publicadas)

### Tipado de TypeScript

Todas las tablas tienen interfaces TypeScript definidas en `lib/neon.ts`:

```typescript
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

Esto permite:
- Autocompletado en IDEs
- Detección de errores en tiempo de compilación
- Refactor seguro
- Documentación en vivo

---

# Gestión del Backend

## Arquitectura del Backend

El backend se gestiona integramente a través de **Next.js API Routes**, eliminando la necesidad de un servidor backend separado (Express, Fastify, etc.).

### Flujo de Autenticación

1. **NextAuth.js v5**: Framework de autenticación para Next.js
2. **Credentials Provider**: Autenticación con email/contraseña
3. **JWT Strategy**: Tokens JWT para sesiones sin estado
4. **bcrypt**: Hash de contraseñas para seguridad

**Configuración en `auth.config.ts`:**

```typescript
export default {
  providers: [
    Credentials({
      async authorize(credentials, request) {
        // Validación con Zod
        const parsed = credentialsSchema.safeParse(credentials);
        
        // Rate limiting
        const rateLimit = checkRateLimit(rateLimitKey);
        
        // Consulta a Neon
        const profile = await queryOne<Profile & { password_hash: string }>(
          "SELECT * FROM profiles WHERE email = $1",
          [email]
        );
        
        // Verificación de contraseña
        const isValidPassword = await bcrypt.compare(password, profile.password_hash);
        
        return { id, email, name, role, image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Agregar role al token
      token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      // Exponer role en la sesión
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
```

### Endpoints API

#### Autenticación
- `POST /api/auth/[...nextauth]` - Login/Logout (NextAuth)
- `POST /api/auth/register` - Registro de usuarios

#### Noticias
- `GET /api/news` - Listar noticias
- `GET /api/news/[id]` - Obtener noticia por ID
- `GET /api/news/detail/[slug]` - Obtener noticia por slug
- `POST /api/news` - Crear noticia (redactor+)
- `PUT /api/news/[id]` - Actualizar noticia (redactor+)
- `DELETE /api/news/[id]` - Eliminar noticia (redactor+)

#### Blog
- `GET /api/blog/posts/[slug]` - Obtener post por slug
- `POST /api/blog/posts` - Crear post (colaborador+)
- `PUT /api/blog/posts/[slug]` - Actualizar post (autor+)
- `DELETE /api/blog/posts/[slug]` - Eliminar post (autor+)

#### Comentarios
- `GET /api/comments` - Listar comentarios
- `POST /api/comments` - Crear comentario (suscriptor+)
- `PUT /api/comments/[id]` - Actualizar comentario (autor+)
- `DELETE /api/comments/[id]` - Eliminar comentario (autor+)
- `GET /api/my-comments` - Comentarios del usuario actual

#### Videojuegos
- `GET /api/games` - Listar juegos
- `POST /api/games` - Crear juego (redactor+)
- `PUT /api/games` - Actualizar juego (redactor+)
- `DELETE /api/games` - Eliminar juego (redactor+)

#### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/[id]` - Obtener usuario por ID
- `PUT /api/users/[id]` - Actualizar usuario (admin/self)
- `DELETE /api/users/[id]` - Eliminar usuario (admin)

#### Perfil
- `GET /api/profile` - Obtener perfil propio
- `PUT /api/profile` - Actualizar perfil propio

#### Contacto
- `POST /api/contact` - Enviar mensaje de contacto

### Protección de Rutas

El middleware de Next.js protege las rutas según el rol:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  
  // Rutas protegidas
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Protección por rol
  if (path.startsWith('/admin') && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

---

# Base de Datos - Tablas

## Esquema de la Base de Datos

El proyecto utiliza **8 tablas** en PostgreSQL gestionadas a través de Neon. El schema completo está en `neon/schema.sql`.

### 1. profiles

Almacena la información de los usuarios del sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del perfil |
| email | TEXT (UNIQUE) | Email del usuario (único) |
| name | TEXT | Nombre completo del usuario |
| role | TEXT | Rol: 'admin', 'redactor', 'colaborador', 'suscriptor' |
| bio | TEXT | Biografía del usuario |
| location | TEXT | Ubicación geográfica |
| website | TEXT | Sitio web personal |
| avatar_url | TEXT | URL de la imagen de perfil |
| password_hash | TEXT | Hash de la contraseña (bcrypt) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

**Índices:**
- `idx_profiles_email` en email
- `idx_profiles_role` en role

**Relaciones:**
- Es padre de: news_posts (author_id), blog_posts (author_id), comments (author_id)

---

### 2. games

Catálogo de videojuegos con rankings y metadatos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del juego |
| title | TEXT | Título del juego |
| description | TEXT | Descripción del juego |
| cover_image | TEXT | URL de la imagen de portada |
| release_date | TIMESTAMP | Fecha de lanzamiento |
| genre | TEXT[] | Array de géneros (ej: ['Acción', 'RPG']) |
| platform | TEXT[] | Array de plataformas (ej: ['PS5', 'PC']) |
| press_score | NUMERIC | Nota de prensa (0-100) |
| user_score | NUMERIC | Nota de comunidad (0-100) |
| category | TEXT | Categoría (ej: 'Top de la historia', 'Top 2020-2025') |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

**Características especiales:**
- `genre` y `platform` son arrays de PostgreSQL, permitiendo múltiples valores
- `press_score` y `user_score` permiten rankings duales (crítica vs comunidad)

---

### 3. news_posts

Noticias y artículos de actualidad del sector.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único de la noticia |
| title | TEXT | Título de la noticia |
| slug | TEXT (UNIQUE) | Slug para URL amigable |
| excerpt | TEXT | Extracto/resumen de la noticia |
| content | TEXT | Contenido completo (markdown/HTML) |
| cover_image | TEXT | URL de la imagen destacada |
| published | BOOLEAN | Estado de publicación |
| featured | BOOLEAN | Si es noticia destacada |
| views | INTEGER | Contador de visualizaciones |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| author_id | TEXT (FK) | ID del autor (ref: profiles) |

**Índices:**
- `idx_news_posts_published` en published
- `idx_news_posts_author` en author_id

**Relaciones:**
- author_id → profiles.id (ON DELETE CASCADE)

---

### 4. blog_posts

Artículos de opinión y blog posts.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del post |
| title | TEXT | Título del post |
| slug | TEXT (UNIQUE) | Slug para URL amigable |
| content | TEXT | Contenido completo |
| published | BOOLEAN | Estado de publicación |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| author_id | TEXT (FK) | ID del autor (ref: profiles) |

**Índices:**
- `idx_blog_posts_published` en published
- `idx_blog_posts_author` en author_id

**Relaciones:**
- author_id → profiles.id (ON DELETE CASCADE)
- Es padre de: comments (post_id)

---

### 5. comments

Comentarios en los posts del blog.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del comentario |
| content | TEXT | Contenido del comentario |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| author_id | TEXT (FK) | ID del autor (ref: profiles) |
| post_id | TEXT (FK) | ID del post (ref: blog_posts) |

**Índices:**
- `idx_comments_post` en post_id
- `idx_comments_author` en author_id

**Relaciones:**
- author_id → profiles.id (ON DELETE CASCADE)
- post_id → blog_posts.id (ON DELETE CASCADE)

---

### 6. multimedia

Hub multimedia: videos, streams y trailers.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único |
| title | TEXT | Título del contenido |
| type | TEXT | Tipo: 'video', 'stream', 'trailer' |
| url | TEXT | URL del contenido (YouTube, Twitch, etc.) |
| thumbnail | TEXT | URL de la miniatura |
| platform | TEXT | Plataforma (YouTube, Twitch) |
| featured | BOOLEAN | Si es contenido destacado |
| created_at | TIMESTAMP | Fecha de creación |

**Restricción CHECK:**
- `type` debe ser uno de: 'video', 'stream', 'trailer'

---

### 7. events

Calendario de eventos, lanzamientos y convenciones.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del evento |
| title | TEXT | Título del evento |
| description | TEXT | Descripción del evento |
| type | TEXT | Tipo: 'launch', 'convention', 'expo' |
| start_date | TIMESTAMP | Fecha de inicio |
| end_date | TIMESTAMP | Fecha de fin (opcional) |
| location | TEXT | Ubicación del evento |
| url | TEXT | URL del sitio web del evento |
| created_at | TIMESTAMP | Fecha de creación |

**Restricción CHECK:**
- `type` debe ser uno de: 'launch', 'convention', 'expo'

**Índices:**
- `idx_events_start_date` en start_date (para consultas cronológicas)

---

### 8. contact_messages

Mensajes enviados a través del formulario de contacto.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | TEXT (PK) | Identificador único del mensaje |
| name | TEXT | Nombre del remitente |
| email | TEXT | Email del remitente |
| subject | TEXT | Asunto del mensaje |
| message | TEXT | Contenido del mensaje |
| read | BOOLEAN | Si ha sido leído por admin |
| created_at | TIMESTAMP | Fecha de envío |

---

## Diagrama de Relaciones

```
profiles (1) ────── (N) news_posts
   │                      │
   │                      │
   └── (1) ────── (N) blog_posts
                      │
                      │
                      └── (1) ────── (N) comments
                                   │
                                   │
                                   └── (N) profiles

games (independiente)
multimedia (independiente)
events (independiente)
contact_messages (independiente)
```

---

## Datos de Semilla (Seed Data)

El archivo `neon/seed.sql` contiene datos de prueba realistas:

- **8 perfiles de usuario** (1 admin, 2 redactores, 2 colaboradores, 3 suscriptores)
- **20 videojuegos** (10 históricos + 10 modernos 2020-2025)
- **5 noticias** de actualidad del sector
- **4 posts de blog** de opinión
- **5 comentarios** en los posts
- **8 elementos multimedia** (trailers, videos, streams)
- **5 eventos** (lanzamientos y convenciones)
- **5 mensajes de contacto**

Para ejecutar el seed data:
```bash
# En la consola de Neon o vía psql
psql $DATABASE_URL -f neon/seed.sql
```

---

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
- Rate limiting en login
- Protección contra XSS (escapado automático de React)

## Licencia

Proyecto académico - Ingeniería del Software 2025-2026
