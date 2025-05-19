import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest(method: string, endpoint: string, data?: any, options: ApiRequestOptions = {}) {
  const token = localStorage.getItem('token');
  const url = new URL(endpoint, window.location.origin);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expirée');
    }
    throw new Error(await response.text());
  }

  if (response.headers.get('Content-Type')?.includes('application/json')) {
    return response.json();
  }

  return response;
}