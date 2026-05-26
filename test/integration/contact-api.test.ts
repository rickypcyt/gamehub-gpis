import { describe, expect, it, vi } from 'vitest';

import { NextRequest } from 'next/server';
import { POST } from '@/app/[locale]/api/contact/route';

// Mock de la base de datos para testing
vi.mock('@/lib/neon', () => ({
  query: vi.fn().mockResolvedValue([]),
}));

describe('Contact API Integration Tests', () => {
  it('TC-29: Formulario de contacto válido', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        subject: 'Consulta de prueba',
        message: 'Este es un mensaje de prueba suficientemente largo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Mensaje enviado correctamente');
  });

  it('debe rechazar nombre muy corto', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'J',
        email: 'test@test.com',
        subject: 'Consulta',
        message: 'Mensaje suficientemente largo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
    expect(data.details).toBeDefined();
  });

  it('debe rechazar email inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Consulta',
        message: 'Mensaje suficientemente largo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });

  it('debe rechazar mensaje muy corto', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        subject: 'Consulta',
        message: 'Corto',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datos inválidos');
  });
});
