import { describe, expect, it, vi } from 'vitest';

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/register/route';

// Mock de la base de datos para testing
vi.mock('@/lib/neon', () => ({
  queryOne: vi.fn(),
}));

describe('Register API Integration Tests', () => {
  it('TC-03: Registro con campos vacíos', async () => {
    const request = new NextRequest('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        password: '',
        name: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-04: Registro con contraseña débil', async () => {
    const request = new NextRequest('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-02: Registro con email inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Test1234!',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });
});
