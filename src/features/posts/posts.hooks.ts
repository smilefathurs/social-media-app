'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPostComment,
  createPost,
  deletePost,
  deletePostComment,
  getPostComments,
  getFeed,
  likePost,
  unlikePost,
  getSavedPosts,
  savePost,
  unsavePost,
  type FeedParams,
} from './posts.service';
import type { CommentsParams } from './posts.types';

export function useFeedQuery(params: FeedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['feed', params.page ?? 1, params.limit ?? 20],
    queryFn: () => getFeed(params),
    enabled,
  });
}

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnlikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function usePostCommentsQuery(
  postId: number,
  params: CommentsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: ['comments', postId, params.page ?? 1, params.limit ?? 10],
    queryFn: () => getPostComments(postId, params),
    enabled: enabled && postId > 0,
  });
}

export function useAddPostCommentMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => addPostComment(postId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', postId],
      });
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

export function useDeletePostCommentMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deletePostComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', postId],
      });
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ image, caption }: { image: File; caption: string }) =>
      createPost(image, caption),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
    },
  });
}

export function useSavedPostsQuery(params: FeedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['saved-posts', params.page ?? 1, params.limit ?? 20],
    queryFn: () => getSavedPosts(params),
    enabled,
  });
}

export function useSavePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => savePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['saved-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ]);
    },
  });
}

export function useUnsavePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unsavePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['saved-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ]);
    },
  });
}
