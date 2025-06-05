import { adminRequired } from '@/backend/service/auth';
import { loadAuthConfig } from '@/backend/utils/loadFromEnv';
import { errorResponse, successResponse } from '@/backend/utils/apiResponse';

export const userAll = adminRequired(() => {
  try {
    const authConfig = loadAuthConfig();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const usersWithoutPwd = authConfig.users.map(({ pwd, ...rest }) => rest);
    return Response.json(successResponse(usersWithoutPwd));
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      errorResponse(500, '接口出错')
    );
  }
});
