'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
  getLikedPosts,
  type FeedParams,
} from './posts.service';
import type { CommentsParams } from './posts.types';
import { getGuestFeed } from './guest-feed.service';

export function useFeedQuery(params: FeedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['feed', params.page ?? 1, params.limit ?? 20],
    queryFn: () => getFeed(params),
    enabled,
  });
}

export function useInfiniteFeedQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed', 'infinite'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getFeed({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.data.items.length === 20
        ? lastPageParam + 1
        : undefined,
    enabled,
  });
}

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['liked-posts'] }),
      ]);
    },
  });
}

export function useUnlikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unlikePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['liked-posts'] }),
      ]);
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

export function useLikedPostsQuery(params: FeedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['liked-posts', params.page ?? 1, params.limit ?? 20],
    queryFn: () => getLikedPosts(params),
    enabled,
  });
}

export function useGuestFeedQuery(
  username: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: ['guest-feed', username],
    queryFn: () => getGuestFeed(username!),
    enabled: enabled && Boolean(username),
    staleTime: 60 * 1000,
  });
}
