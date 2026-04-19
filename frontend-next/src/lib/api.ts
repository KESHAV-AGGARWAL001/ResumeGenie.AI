'use client';

import { auth } from '@/lib/firebase/config';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(false);
  } catch (error) {
    console.error('[API] Failed to get ID token:', error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(`${BACKEND_URL}${path}`, {
    method: 'GET',
    headers: { ...authHeaders, ...(options.headers as Record<string, string>) },
    ...options,
  });
}

export async function apiPost(path: string, body: unknown, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    },
    body: JSON.stringify(body),
    ...options,
  });
}

export async function apiPostFile(path: string, formData: FormData, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders, ...(options.headers as Record<string, string>) },
    body: formData,
    ...options,
  });
}

export { BACKEND_URL };
