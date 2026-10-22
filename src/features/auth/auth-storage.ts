import type { AuthUser } from './auth.types';

const AUTH_STORAGE_KEY = 'social-media-app-auth';
const LAST_LOGGED_IN_USERNAME_KEY = 'social-media-app-last-username';

export interface StoredAuthSession {
  token: string;
  user: AuthUser;
}

export function saveAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(
    LAST_LOGGED_IN_USERNAME_KEY,
    session.user.username
  );
}

export function loadLastLoggedInUsername(): string | null {
  const username = localStorage
    .getItem(LAST_LOGGED_IN_USERNAME_KEY)
    ?.trim();

  return username || null;
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
  // Hanya hapus sesi aktif; username terakhir tetap disimpan.
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
