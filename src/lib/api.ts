
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL belum dikonfigurasi di .env.local'
  );
}

const AUTH_STORAGE_KEY = 'social-media-app-auth';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Ambil token langsung dari session browser pada setiap request.
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);

      if (stored) {
        const session: unknown = JSON.parse(stored);

        if (
          typeof session === 'object' &&
          session !== null &&
          'token' in session &&
          typeof session.token === 'string' &&
          session.token.length > 0
        ) {
          config.headers.set(
            'Authorization',
            `Bearer ${session.token}`
          );
        } else {
          config.headers.delete('Authorization');
        }
      } else {
        config.headers.delete('Authorization');
      }
    } catch {
      config.headers.delete('Authorization');
    }
  }

  // Biarkan browser menentukan Content-Type untuk FormData.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
});

export default api;
