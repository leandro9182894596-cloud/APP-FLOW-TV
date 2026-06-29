const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

let authTokens: AuthTokens | null = null;
let isRefreshing = false;
let refreshPromise: Promise<AuthTokens> | null = null;

const TOKEN_KEY = "app_flow_tokens";

export function loadTokensFromStorage() {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    authTokens = JSON.parse(stored);
  }
}

export function saveTokensToStorage(tokens: AuthTokens) {
  authTokens = tokens;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokensFromStorage() {
  authTokens = null;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthTokens() {
  return authTokens;
}

async function refreshAccessToken(): Promise<AuthTokens> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    if (!authTokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: authTokens.refreshToken }),
    });

    if (!response.ok) {
      clearTokensFromStorage();
      throw new Error("Failed to refresh token");
    }

    const newTokens = await response.json();
    saveTokensToStorage(newTokens);
    return newTokens;
  })();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authTokens?.accessToken) {
    headers["Authorization"] = `Bearer ${authTokens.accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${url}`, config);

  if (response.status === 401 && authTokens?.refreshToken) {
    try {
      const newTokens = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
      response = await fetch(`${API_BASE_URL}${url}`, { ...config, headers });
    } catch {
      throw new Error("Unauthorized");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
