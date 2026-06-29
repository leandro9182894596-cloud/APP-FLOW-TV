import { apiRequest, saveTokensToStorage, clearTokensFromStorage, loadTokensFromStorage, getAuthTokens } from './api';

export interface User {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveTokensToStorage(data);
  return data;
}

export async function signUp(email: string, password: string, username?: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
  saveTokensToStorage(data);
  return data;
}

export async function signOut(): Promise<void> {
  const tokens = getAuthTokens();
  if (tokens?.refreshToken) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }
  clearTokensFromStorage();
}

export function getCurrentUser(): User | null {
  loadTokensFromStorage();
  const tokens = getAuthTokens();
  if (!tokens) return null;
  
  try {
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email || '',
      username: payload.username || null,
      avatarUrl: payload.avatarUrl || null,
    };
  } catch {
    return null;
  }
}
