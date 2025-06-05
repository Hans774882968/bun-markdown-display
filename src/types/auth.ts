import { verifyToken } from '@/backend/utils/jwt';

export interface User {
  uname: string;
  pwd: string;
  isAdmin: boolean;
  uid: string;
  personalizedSign: string;
}

// 普通登录用户不能看到 uid ，管理员才可以
export type UserPublicFields = Omit<User, 'pwd' | 'uid'>;
export type UserListRow = Omit<User, 'pwd'>;

export interface AuthConfig {
  users: User[];
  salt1: string;
  salt2: string;
  JWT_SECRET: string;
}

export interface LoginResponse {
  token: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface IsAdminResponse {
  isAdmin: boolean;
}

export interface IsLoginResponse {
  isLogin: boolean;
}

export interface RegisterResponse {
  message: string;
}

export type LoginCheckCtx = {
  authHeader: string
  verifyResult: NonNullable<Awaited<ReturnType<typeof verifyToken>>>
}

export type AdminCheckCtx = LoginCheckCtx & {
  adminUser: User
}

export type RouteMethod = (req: Request) => Response | Promise<Response>;
export type RouteMethodWithLoginCtx = (req: Request, ctx: LoginCheckCtx) => Response | Promise<Response>;
export type RouteMethodWithAdminCtx = (req: Request, ctx: AdminCheckCtx) => Response | Promise<Response>;
