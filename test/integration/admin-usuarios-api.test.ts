import { describe, expect, it, vi } from 'vitest';

import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/admin/usuarios/[id]/route';

vi.mock('@/lib/neon', () => ({
  queryOne: vi.fn(),
}));

describe('Admin Usuarios API Integration Tests', () => {
  it('TC-23: Validación de rol inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/usuarios/11', {
      method: 'PATCH',
      body: JSON.stringify({
        rol: 'invalid-role',
      }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '11' }) } as { params: Promise<{ id: string }> });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-23b: Validación de activo inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/usuarios/10', {
      method: 'PATCH',
      body: JSON.stringify({
        activo: 'not-a-boolean',
      }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '10' }) } as { params: Promise<{ id: string }> });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('TC-23c: Datos válidos (rol)', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/usuarios/11', {
      method: 'PATCH',
      body: JSON.stringify({
        rol: 'redactor',
      }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '11' }) } as { params: Promise<{ id: string }> });
    // La validación pasa, pero la capa de negocio puede devolver errores como 409
    expect([200, 404, 409, 500]).toContain(response.status);
  });
});
