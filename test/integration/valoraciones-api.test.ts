import { describe, expect, it, vi } from 'vitest';

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/valoraciones/route';

vi.mock('@/lib/neon', () => ({
  queryOne: vi.fn(),
}));

describe('Valoraciones API Integration Tests', () => {
  it('TC-21: Nota fuera de rango', async () => {
    const request = new NextRequest('http://localhost:3000/api/valoraciones', {
      method: 'POST',
      body: JSON.stringify({
        id_juego: 'game-1',
        nota: 15,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-21b: Nota negativa', async () => {
    const request = new NextRequest('http://localhost:3000/api/valoraciones', {
      method: 'POST',
      body: JSON.stringify({
        id_juego: 'game-1',
        nota: -5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-21c: ID de juego inválido (no UUID)', async () => {
    const request = new NextRequest('http://localhost:3000/api/valoraciones', {
      method: 'POST',
      body: JSON.stringify({
        id_juego: 'not-a-uuid',
        nota: 8.5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });
});
