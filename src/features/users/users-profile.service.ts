import api from '@/lib/api';
import type {
  UserPostsParams,
  UserPostsResponse,
  UserProfileResponse,
} from './users-profile.types';

export async function getUserProfile(
  username: string
): Promise<UserProfileResponse> {
  const response = await api.get<UserProfileResponse>(
    `/api/users/${encodeURIComponent(username)}`
  );

  return response.data;
}

export async function getUserPosts(
  username: string,
  params: UserPostsParams = {}
): Promise<UserPostsResponse> {
  const response = await api.get<UserPostsResponse>(
    `/api/users/${encodeURIComponent(username)}/posts`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    }
  );

  return response.data;
}
