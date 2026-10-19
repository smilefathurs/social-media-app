import type { AuthUser } from './auth.types';

const AUTH_STORAGE_KEY = 'social-media-app-auth';

export interface StoredAuthSession {
  token: string;
  user: AuthUser;
}

export function saveAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function loadAuthSession(): StoredAuthSession | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) return null;

  try {
    const session: unknown = JSON.parse(stored);

    if (
      typeof session !== 'object' ||
      session === null ||
      !('token' in session) ||
      typeof session.token !== 'string' ||
      !('user' in session) ||
      typeof session.user !== 'object' ||
      session.user === null
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session as StoredAuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
