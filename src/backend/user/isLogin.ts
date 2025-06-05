import { verifyAuth } from '../service/auth';
import { errorResponse, successResponse } from '../utils/apiResponse';

export async function handleIsLogin(req: Request): Promise<Response> {
  try {
    const authCheckResult = await verifyAuth(req);
    if (authCheckResult instanceof Response) {
      return Response.json(
        successResponse({ isLogin: false })
      );
    }
    return Response.json(
      successResponse({ isLogin: true })
    );
  } catch (error) {
    console.error('IsLogin check error:', error);
    return Response.json(
      errorResponse(500, '检查登录状态时出错')
    );
  }
}
