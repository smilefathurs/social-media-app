"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  followUser,
  searchUsers,
  unfollowUser,
} from "./users.service";
import type { UserSearchParams } from "./users.types";

export function useSearchUsersQuery(
  params: UserSearchParams,
  enabled = true,
) {
  const query = params.q.trim();

  return useQuery({
    queryKey: ["users", "search", query, params.page ?? 1, params.limit ?? 20],
    queryFn: () => searchUsers({ ...params, q: query }),
    enabled: enabled && query.length > 0,
  });
}

export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => followUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => unfollowUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
