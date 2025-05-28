import { comparePasswords } from './utils/crypto';
import { generateToken } from './utils/jwt';
import { successResponse, errorResponse } from './utils/apiResponse';
import { validateLoginInput } from '../common/validateLoginInput';
import { loadAuthConfig, loadJwtSecret } from './utils/loadFromEnv';

export async function handleLogin(req: Request): Promise<Response> {
  try {
    const { uname, pwd } = await req.json();

    const validationError = validateLoginInput(uname, pwd);
    if (validationError) {
      return Response.json(
        errorResponse(400, validationError)
      );
    }

    const authConfig = loadAuthConfig();
    const JWT_SECRET = loadJwtSecret(authConfig);

    const user = authConfig.users.find((u) => u.uname === uname);
    if (!user) {
      return Response.json(
        errorResponse(401, `用户 ${uname} 不存在`)
      );
    }

    const isValid = await comparePasswords(pwd, user.pwd, authConfig.salt1, authConfig.salt2, user.uid);
    if (!isValid) {
      return Response.json(
        errorResponse(401, `用户 ${uname} 的密码不正确`)
      );
    }

    const token = await generateToken(uname, user.isAdmin, JWT_SECRET);
    return Response.json(
      successResponse({ token })
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      errorResponse(500, '登录接口出错')
    );
  }
}
