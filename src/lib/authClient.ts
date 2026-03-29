// lib/authClient.ts

export const API_URL = "https://floorapi.ancient-dream-e6cd.workers.dev";

const SESSION_KEY = "session_token";

export function getToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(SESSION_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "b2c" | "b2b";
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  unverified?: boolean; 
}

// ─── Auth Client ─────────────────────────────────────────────────────────────

export const authClient = {
  async register(params: {
    email: string;
    password: string;
    name: string;
    role?: "b2c" | "b2b";
  }): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  },

  async verifyCode(params: { email: string; code: string }): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    setToken(data.token);
    // Sync localStorage details as well for UI convenience
    localStorage.setItem('authUser', JSON.stringify(data.user));
    return { success: true, user: data.user };
  },

  async login(params: { email: string; password: string }): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error, unverified: data.unverified };
    setToken(data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    return { success: true, user: data.user };
  },

  async forgotPassword(email: string): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  },

  async resetPassword(params: { email: string; code: string; newPassword: string }): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  },

  async updateProfile(name: string): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    
    // Update locale storage
    const stored = localStorage.getItem('authUser');
    if (stored) {
      const user = JSON.parse(stored);
      user.name = data.name;
      localStorage.setItem('authUser', JSON.stringify(user));
    }
    return { success: true };
  },

  async requestDelete(): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/request-delete`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  },

  async confirmDelete(code: string): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/api/auth/confirm-delete`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ code }),
    });
    const data = await res.json<any>();
    if (!res.ok) return { success: false, error: data.error };
    
    clearToken();
    localStorage.removeItem('authUser');
    return { success: true };
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
    });
    clearToken();
    localStorage.removeItem('authUser');
  },

  async signOut(): Promise<void> {
    return authClient.logout();
  },

  async getSession(): Promise<AuthUser | null> {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${API_URL}/api/auth/session`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json<any>();
    return data.user ?? null;
  },

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init.headers ?? {}) },
    });
  },
};