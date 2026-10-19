import api from "@/lib/api";
import type {
  FollowResponse,
  UserSearchParams,
  UserSearchResponse,
} from "./users.types";

export async function searchUsers(
  params: UserSearchParams,
): Promise<UserSearchResponse> {
  const response = await api.get<UserSearchResponse>("/api/users/search", {
    params: {
      q: params.q,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  return response.data;
}

export async function followUser(
  username: string,
): Promise<FollowResponse> {
  const response = await api.post<FollowResponse>(
    `/api/follow/${encodeURIComponent(username)}`,
  );

  return response.data;
}

export async function unfollowUser(
  username: string,
): Promise<FollowResponse> {
  const response = await api.delete<FollowResponse>(
    `/api/follow/${encodeURIComponent(username)}`,
  );

  return response.data;
}
