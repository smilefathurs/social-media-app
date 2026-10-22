import { getUserPosts } from '@/features/users/users-profile.service';
import type { Post } from './posts.types';

const GUEST_POST_LIMIT = 20;

export async function getGuestFeed(username: string): Promise<Post[]> {
  const response = await getUserPosts(username, {
    page: 1,
    limit: GUEST_POST_LIMIT,
  });

  return [...response.data.posts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}
