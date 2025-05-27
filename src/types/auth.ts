export interface User {
  uname: string;
  pwd: string;
}

export interface AuthConfig {
  users: User[];
  salt1: string;
  salt2: string;
}

export interface LoginResponse {
  token: string;
}

export interface LogoutResponse {
  success: boolean;
}
