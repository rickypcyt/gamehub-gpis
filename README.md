# GameHub & Services Ecosystem

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

## Tablas de la Base de Datos

El proyecto utiliza **8 tablas** en PostgreSQL gestionadas a través de Neon. El schema completo está en `lib/schema.sql`.

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
| post_type | TEXT | Tipo de post ('blog', 'news') |
| parent_id | TEXT (FK) | ID del comentario padre (para respuestas) |

**Índices:**
- `idx_comments_post` en post_id
- `idx_comments_author` en author_id
- `idx_comments_post_type` en post_type
- `idx_comments_parent` en parent_id

**Relaciones:**
- author_id → profiles.id (ON DELETE CASCADE)
- post_id → blog_posts.id (ON DELETE CASCADE)
- parent_id → comments.id (ON DELETE CASCADE)

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

## Proxy / Middleware

El archivo `proxy.ts` es un middleware de Next.js que maneja autenticación, localización y protección de rutas.

### Flujo Principal

1. **next-intl middleware**: Primero aplica el middleware de internacionalización para manejar los locales (es, en) y asegurar que las rutas tengan el prefijo de idioma.

2. **Auth wrapper**: Usa `auth()` de NextAuth para envolver toda la lógica y obtener información del usuario autenticado.

### Protección de Rutas

- **Rutas públicas**: `/`, `/news`, `/games`, `/blog`, `/multimedia`, `/events`, `/team`, `/contact` - accesibles sin autenticación.

- **Rutas de autenticación**: `/api/auth/*` y `/login` - permitidas siempre.

- **API protegidas**: `/api/news` y `/api/games` requieren autenticación. Los métodos POST/PUT/DELETE/PATCH solo para `admin` y `redactor`.

- **Rutas protegidas por autenticación**: Si no está logueado, redirige a `/login`.

### Control de Roles

- **Admin**: Acceso exclusivo a rutas `/admin/*`.

- **Redactor**: Puede escribir noticias, juegos, multimedia y eventos (`/dashboard/write/news`, `/dashboard/games`, etc.).

- **Colaborador**: Solo puede escribir blogs (`/dashboard/write/blog`, `/dashboard/my-posts`).

### Configuración Matcher

El middleware se aplica a todas las rutas excepto: `api`, `_next`, `_vercel`, y archivos con extensión (como imágenes, CSS, etc.).

## Internacionalización (i18n)

El proyecto utiliza `next-intl` para soportar múltiples idiomas (español e inglés).

### Configuración

La configuración de i18n se encuentra en `i18n/config.ts`:

```typescript
export type Locale = "es" | "en";
export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
};
```

### Estructura de Rutas

Las rutas se organizan con el parámetro dinámico `[locale]`:

```
app/
└── [locale]/
    ├── layout.tsx         # Layout por locale
    ├── page.tsx           # Home (/es, /en)
    ├── news/              # Noticias (/es/news, /en/news)
    ├── games/             # Juegos (/es/games, /en/games)
    └── ...
```

### Archivos de Traducción

Las traducciones se almacenan en `messages/`:

- `messages/es.json` - Traducciones en español
- `messages/en.json` - Traducciones en inglés

Ejemplo de estructura:

```json
{
  "home": {
    "hero": {
      "title": "Bienvenido a GameHub",
      "description": "Tu destino para todo sobre videojuegos"
    }
  }
}
```

### Uso en Componentes

**En Server Components:**

```typescript
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("home.hero");
  return <h1>{t("title")}</h1>;
}
```

**En Client Components:**

```typescript
import { useTranslations } from "next-intl";

export default function Component() {
  const t = useTranslations("home.hero");
  return <h1>{t("title")}</h1>;
}
```

### Navegación Internacional

Se utiliza el componente `Link` personalizado de `i18n/navigation`:

```typescript
import { Link } from "@/i18n/navigation";

<Link href="/news">Noticias</Link>  // Automáticamente añade el locale actual
```

### Cambio de Idioma

El componente `LanguageSwitcher` permite cambiar entre idiomas manteniendo la ruta actual.

## Validación con Zod

El proyecto utiliza **Zod** para validar esquemas de datos antes de procesarlos en las APIs. Esto asegura que los datos sean correctos antes de insertarlos en la base de datos.

### Definición de Esquemas

```typescript
import { z } from "zod";

// Esquema de registro de usuario
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// Esquema de formulario de contacto
const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(3, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});
```

### Validación en APIs

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  
  // safeParse valida sin lanzar excepciones
  const parsed = registerSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }
  
  // Si es válido, usar los datos tipados
  const { email, password, name } = parsed.data;
  // ... procesar datos
}
```

### Uso en el Proyecto

Zod se usa activamente en:
- **auth.config.ts**: Valida email y password en el login
- **api/auth/register/route.ts**: Valida registro de usuarios
- **api/contact/route.ts**: Valida formulario de contacto
- **api/comments/route.ts**: Valida comentarios
- **api/news/route.ts**: Valida noticias
- **api/games/route.ts**: Valida juegos
- **api/profile/route.ts**: Valida perfil
- **api/users/[id]/route.ts**: Valida actualización de usuarios

### Ventajas de Zod

- **TypeScript inference**: Los datos validados tienen tipos automáticos
- **Mensajes de error personalizados**: `z.string().min(2, "Mensaje custom")`
- **Validación robusta**: Email, regex, longitud, enums, etc.
- **safeParse**: No lanza excepciones, ideal para APIs
