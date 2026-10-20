export interface PostAuthor {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface Post {
  id: number;
  imageUrl: string | null;
  caption: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface FeedResponse {
  success: boolean;
  message: string;
  data: {
    items: Post[];
    [key: string]: unknown;
  };
}

export interface PostComment {
  id: number;
  text: string;
  createdAt: string;
  author: PostAuthor;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: PostComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: PostComment;
}

export interface CommentsParams {
  page?: number;
  limit?: number;
}

export interface SavedPostsParams {
  page?: number;
  limit?: number;
}

export interface SavedPost {
  id: number;
  imageUrl: string | null;
  caption: string;
  createdAt: string;
}

export interface SavedPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: SavedPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
