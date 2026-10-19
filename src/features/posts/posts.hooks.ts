"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addPostComment,
  deletePostComment,
  getPostComments,
  getFeed,
  likePost,
  unlikePost,
  type FeedParams,
} from "./posts.service";
import type { CommentsParams } from "./posts.types";

export function useFeedQuery(
  params: FeedParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["feed", params.page ?? 1, params.limit ?? 20],
    queryFn: () => getFeed(params),
    enabled,
  });
}

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUnlikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function usePostCommentsQuery(
  postId: number,
  params: CommentsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["comments", postId, params.page ?? 1, params.limit ?? 10],
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
        queryKey: ["comments", postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["feed"],
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
        queryKey: ["comments", postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
}
