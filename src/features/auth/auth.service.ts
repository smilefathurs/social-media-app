import api from '@/lib/api';
import type { LoginFormValues, RegisterFormValues } from './auth.schema';
import type { AuthResponse } from './auth.types';

export async function registerUser(data: RegisterFormValues) {
  const response = await api.post('/api/auth/register', data);
  return response.data;
}

export async function loginUser(data: LoginFormValues): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}
