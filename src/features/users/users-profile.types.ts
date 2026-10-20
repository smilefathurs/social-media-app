import type { Post } from '@/features/posts/posts.types';

export interface UserPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserPostsParams {
  page?: number;
  limit?: number;
}

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  counts: {
    post: number;
    followers: number;
    following: number;
    likes: number;
  };
  isFollowing: boolean;
  isMe: boolean;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}
