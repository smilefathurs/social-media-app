export interface User {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

export interface UserSearchResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserSearchParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface FollowResponse {
  success: boolean;
  message: string;
}
