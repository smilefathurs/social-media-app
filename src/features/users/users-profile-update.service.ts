import api from '@/lib/api';
import type { AuthUser } from '@/features/auth/auth.types';

export interface UpdateMyProfileInput {
  name: string;
  username: string;
  phone: string;
  bio: string;
  avatar?: File | null;
}

export interface UpdateMyProfileResponse {
  success: boolean;
  message: string;
  data?: Partial<AuthUser> & {
    bio?: string | null;
  };
}

export async function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<UpdateMyProfileResponse> {
  const formData = new FormData();

  formData.append('name', input.name);
  formData.append('username', input.username);
  formData.append('phone', input.phone);
  formData.append('bio', input.bio);

  if (input.avatar) {
    formData.append('avatar', input.avatar);
  }

  const response = await api.patch<UpdateMyProfileResponse>(
    '/api/me',
    formData,
  );

  return response.data;
}

