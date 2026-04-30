export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
  profileImageUrl?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  profileImageUrl?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}
