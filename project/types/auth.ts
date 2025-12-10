// Types for authentication

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    token: string;
  };
  error?: string;
}

