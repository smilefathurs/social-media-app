import api from '@/lib/api';
import type {
  FeedResponse,
  SavedPostsParams,
  SavedPostsResponse,
  LikedPostsParams,
  LikedPostsResponse,
} from './posts.types';

export interface FeedParams {
  page?: number;
  limit?: number;
}

export async function getFeed(params: FeedParams = {}): Promise<FeedResponse> {
  const response = await api.get<FeedResponse>('/api/feed', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  return response.data;
}

export async function likePost(postId: number): Promise<void> {
  await api.post(`/api/posts/${postId}/like`);
}

export async function unlikePost(postId: number): Promise<void> {
  await api.delete(`/api/posts/${postId}/like`);
}

import type {
  CommentsParams,
  CommentsResponse,
  CommentResponse,
} from './posts.types';

export async function getPostComments(
  postId: number,
  params: CommentsParams = {}
): Promise<CommentsResponse> {
  const response = await api.get<CommentsResponse>(
    `/api/posts/${postId}/comments`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }
  );

  return response.data;
}

export async function addPostComment(
  postId: number,
  text: string
): Promise<CommentResponse> {
  const response = await api.post<CommentResponse>(
    `/api/posts/${postId}/comments`,
    { text }
  );

  return response.data;
}

export async function deletePostComment(commentId: number): Promise<void> {
  await api.delete(`/api/comments/${commentId}`);
}

export async function createPost(image: File, caption: string): Promise<void> {
  const formData = new FormData();

  formData.append('image', image);
  formData.append('caption', caption);

  await api.post('/api/posts', formData);
}

export async function deletePost(postId: number): Promise<void> {
  await api.delete(`/api/posts/${postId}`);
}

export const savePost = async (postId: number): Promise<void> => {
  await api.post(`/api/posts/${postId}/save`);
};

export const unsavePost = async (postId: number): Promise<void> => {
  await api.delete(`/api/posts/${postId}/save`);
};

export async function getSavedPosts(
  params: SavedPostsParams = {}
): Promise<SavedPostsResponse> {
  const response = await api.get<SavedPostsResponse>('/api/me/saved', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  return response.data;
}

export async function getLikedPosts(
  params: LikedPostsParams = {}
): Promise<LikedPostsResponse> {
  const response = await api.get<LikedPostsResponse>('/api/me/likes', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  return response.data;
}
