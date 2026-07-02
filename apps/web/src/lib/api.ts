const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('forum_token');
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    console.error('API Error:', res.status, JSON.stringify(error));
    // NestJS HttpExceptionFilter wraps validation errors: { message: { message: [...], error: "Bad Request" } }
    const raw = error.message;
    let finalMsg: string;
    if (typeof raw === 'string') {
      finalMsg = raw;
    } else if (Array.isArray(raw)) {
      finalMsg = raw.join(', ');
    } else if (raw && typeof raw === 'object') {
      const inner = (raw as any).message;
      if (Array.isArray(inner)) finalMsg = inner.join(', ');
      else if (typeof inner === 'string') finalMsg = inner;
      else finalMsg = (raw as any).error || JSON.stringify(raw);
    } else {
      finalMsg = res.statusText || 'Request failed';
    }
    throw new ApiError(res.status, finalMsg, error);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { method: 'GET', ...opts }),
  post: <T>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: <T>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { method: 'DELETE', ...opts }),
};
