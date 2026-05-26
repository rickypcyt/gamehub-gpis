// Helper para tests de integración con fetch directo
// Next.js App Router no requiere Supertest, podemos usar fetch nativo

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  return {
    status: response.status,
    ok: response.ok,
    data: await response.json().catch(() => null),
    headers: response.headers,
  };
}

export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: unknown) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  put: (endpoint: string, body: unknown) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  patch: (endpoint: string, body: unknown) => apiRequest(endpoint, { 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};
