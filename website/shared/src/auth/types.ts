export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN" | "DELIVERY_PERSON";

export interface UserInfo {
  id: string;
  email: string;
  roles: UserRole[];
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
