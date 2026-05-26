import { GET, POST } from '@/app/api/news/route';
import { describe, expect, it, vi } from 'vitest';

import { NextRequest } from 'next/server';

// Mock de la base de datos y auth para testing
vi.mock('@/lib/neon', () => ({
  query: vi.fn().mockResolvedValue([]),
  queryOne: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'test-id', role: 'admin' },
  }),
}));

// Mock de revalidatePath para evitar error en testing
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('News API Integration Tests', () => {
  it('TC-09: Publicar noticia completa como Redactor', async () => {
    const { queryOne } = await import('@/lib/neon');
    // Mock: primero verifica que slug no existe (null), luego devuelve la noticia creada
    (queryOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'test-id',
      title: 'Noticia de prueba',
      slug: 'noticia-prueba',
      content: 'Contenido de la noticia de prueba',
    });

    const request = new NextRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Noticia de prueba',
        slug: 'noticia-prueba',
        content: 'Contenido de la noticia de prueba',
        published: true,
        featured: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toBeDefined();
  });

  it('TC-11: Publicar noticia sin título', async () => {
    const request = new NextRequest('http://localhost:3000/api/news', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        slug: 'noticia-prueba',
        content: 'Contenido',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('GET /api/news debe retornar lista', async () => {
    const request = new NextRequest('http://localhost:3000/api/news', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
