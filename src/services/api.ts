/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchFilters } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('estatex_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong with the API request');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest<any>('/auth/me'),

  // Properties
  getProperties: (filters: Partial<SearchFilters> & { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    return apiRequest<{ properties: any[]; pagination: any }>(`/properties?${params.toString()}`);
  },
  getFeaturedProperties: () => apiRequest<any[]>('/properties/featured'),
  getPropertyById: (id: string) => apiRequest<{ property: any; related: any[] }>(`/properties/${id}`),
  createProperty: (body: any) => apiRequest<any>('/properties', { method: 'POST', body: JSON.stringify(body) }),
  updateProperty: (id: string, body: any) => apiRequest<any>(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProperty: (id: string) => apiRequest<any>(`/properties/${id}`, { method: 'DELETE' }),

  // Favorites
  getFavorites: () => apiRequest<any[]>('/favorites'),
  toggleFavorite: (propertyId: string) => apiRequest<{ isFavorited: boolean; message: string }>('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  }),

  // Messages
  sendMessage: (body: any) => apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify(body) }),
  getUserMessages: () => apiRequest<any[]>('/messages/user'),
  getAllMessages: () => apiRequest<any[]>('/messages/all'),
  deleteMessage: (id: string) => apiRequest<any>(`/messages/${id}`, { method: 'DELETE' }),

  // AI copywriting
  aiDescribe: (body: { title: string; location: string; propertyType: string; price: number; features?: string }) =>
    apiRequest<{ description: string }>('/ai/describe', { method: 'POST', body: JSON.stringify(body) }),
};
