import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/catalogo/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/neon', () => ({
  query: vi.fn(),
}));

describe('Catalogo API Integration Tests', () => {
  it('TC-19: Visualización del ranking', async () => {
    const { query } = await import('@/lib/neon');
    (query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 'game-1',
        title: 'Game 1',
        nota_prensa: 9.5,
        nota_comunidad: 8.5,
        total_valoraciones: 10,
      },
      {
        id: 'game-2',
        title: 'Game 2',
        nota_prensa: 8.0,
        nota_comunidad: 7.5,
        total_valoraciones: 5,
      },
    ]);

    const request = new NextRequest('http://localhost:3000/api/catalogo', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].nota_comunidad).toBeDefined();
  });
});
