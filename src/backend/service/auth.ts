import {
  RouteMethodWithAdminCtx,
  RouteMethodWithLoginCtx,
  LoginCheckCtx,
} from '@/types/auth';
import { errorResponse } from '../utils/apiResponse';
import { verifyToken } from '../utils/jwt';
import { loadAuthConfig } from '../utils/loadFromEnv';
import { loadJwtSecret } from '../utils/loadFromEnv';

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json(
      errorResponse(401, '未登录')
    );
  }

  const token = authHeader.slice(7);

  const authConfig = loadAuthConfig();
  const JWT_SECRET = loadJwtSecret(authConfig);

  const verifyResult = await verifyToken(token, JWT_SECRET);
  if (!verifyResult) {
    return Response.json(
      errorResponse(401, '登录已过期')
    );
  }

  return {
    authHeader,
    verifyResult,
  } as LoginCheckCtx;
}

export function loginRequired(method: RouteMethodWithLoginCtx) {
  return async (req: Request) => {
    const authCheckResult = await verifyAuth(req);
    if (authCheckResult instanceof Response) {
      return authCheckResult;
    }
    return method(req, authCheckResult);
  };
}

export function adminRequired(method: RouteMethodWithAdminCtx) {
  return loginRequired(
    async (req: Request, { authHeader, verifyResult }) => {
      const authConfig = loadAuthConfig();
      const adminUser = authConfig.users.find((u) => u.uname === verifyResult.payload.uname);
      if (!adminUser?.isAdmin) {
        return Response.json(
          errorResponse(403, '需要管理员权限')
        );
      }
      return method(req, { authHeader, verifyResult, adminUser });
    }
  );
}
