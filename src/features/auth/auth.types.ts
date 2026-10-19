export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}
