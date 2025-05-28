import { successResponse, errorResponse } from '../utils/apiResponse';
import { loadAuthConfig } from '../utils/loadFromEnv';
import { verifyAuth } from '../service/auth';

export async function handleIsAdmin(req: Request): Promise<Response> {
  try {
    const authCheckResult = await verifyAuth(req);
    if (authCheckResult instanceof Response) {
      return authCheckResult;
    }
    const { verifyResult } = authCheckResult;

    const authConfig = loadAuthConfig();

    const user = authConfig.users.find((u) => u.uname === verifyResult.payload.uname);
    return Response.json(
      successResponse({ isAdmin: user?.isAdmin ?? false })
    );
  } catch (error) {
    console.error('IsAdmin check error:', error);
    return Response.json(
      errorResponse(500, '检查管理员权限时出错')
    );
  }
}
