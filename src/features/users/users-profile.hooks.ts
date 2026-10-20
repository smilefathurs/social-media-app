'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserPosts, getUserProfile } from './users-profile.service';
import type { UserPostsParams } from './users-profile.types';

export function useUserProfileQuery(username: string, enabled = true) {
  const normalizedUsername = username.trim();

  return useQuery({
    queryKey: ['users', 'profile', normalizedUsername],
    queryFn: () => getUserProfile(normalizedUsername),
    enabled: enabled && normalizedUsername.length > 0,
  });
}

export function useUserPostsQuery(
  username: string,
  params: UserPostsParams = {},
  enabled = true
) {
  const normalizedUsername = username.trim();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: ['users', 'profile', normalizedUsername, 'posts', page, limit],
    queryFn: () => getUserPosts(normalizedUsername, { page, limit }),
    enabled: enabled && normalizedUsername.length > 0,
  });
}
