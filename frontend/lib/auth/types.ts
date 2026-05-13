export type AuthUser = {
  id: string;
  email: string;
  status: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  role: {
    name: string;
  };
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type ApiErrorBody = {
  message?: string;
  details?: unknown;
};
