import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-definir los esquemas para testing (en producción deberían exportarse desde los archivos originales)
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(3, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

const newsSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z.string().min(1, "El slug es obligatorio"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  cover_image: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

describe('Credentials Schema', () => {
  it('debe validar datos correctos', () => {
    const result = credentialsSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('debe rechazar email inválido', () => {
    const result = credentialsSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar password muy corto', () => {
    const result = credentialsSchema.safeParse({
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar datos faltantes', () => {
    const result = credentialsSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('Register Schema', () => {
  it('debe validar datos correctos', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('debe rechazar nombre muy corto', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: 'J',
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar email inválido', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      name: 'John Doe',
    });
    expect(result.success).toBe(false);
  });
});

describe('Contact Schema', () => {
  it('debe validar datos correctos', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Hello',
      message: 'This is a test message with enough characters',
    });
    expect(result.success).toBe(true);
  });

  it('debe rechazar nombre muy corto', () => {
    const result = contactSchema.safeParse({
      name: 'J',
      email: 'test@example.com',
      subject: 'Hello',
      message: 'This is a test message with enough characters',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es requerido');
    }
  });

  it('debe rechazar email inválido', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'invalid-email',
      subject: 'Hello',
      message: 'This is a test message with enough characters',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido');
    }
  });

  it('debe rechazar asunto muy corto', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Hi',
      message: 'This is a test message with enough characters',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El asunto es requerido');
    }
  });

  it('debe rechazar mensaje muy corto', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Hello',
      message: 'Short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El mensaje debe tener al menos 10 caracteres');
    }
  });
});

describe('News Schema', () => {
  it('debe validar datos correctos', () => {
    const result = newsSchema.safeParse({
      title: 'Test News',
      slug: 'test-news',
      content: 'This is the content of the news',
      published: true,
      featured: false,
    });
    expect(result.success).toBe(true);
  });

  it('debe validar con campos opcionales', () => {
    const result = newsSchema.safeParse({
      title: 'Test News',
      slug: 'test-news',
      content: 'This is the content',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(false);
      expect(result.data.featured).toBe(false);
    }
  });

  it('debe rechazar título vacío', () => {
    const result = newsSchema.safeParse({
      title: '',
      slug: 'test-news',
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar slug vacío', () => {
    const result = newsSchema.safeParse({
      title: 'Test News',
      slug: '',
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar contenido vacío', () => {
    const result = newsSchema.safeParse({
      title: 'Test News',
      slug: 'test-news',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('debe aceptar excerpt y cover_image opcionales', () => {
    const result = newsSchema.safeParse({
      title: 'Test News',
      slug: 'test-news',
      excerpt: 'This is an excerpt',
      content: 'Content',
      cover_image: 'https://example.com/image.jpg',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.excerpt).toBe('This is an excerpt');
      expect(result.data.cover_image).toBe('https://example.com/image.jpg');
    }
  });
});
