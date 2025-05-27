import { AuthConfig } from '@/types/auth';
import { comparePasswords } from './utils/crypto';
import { generateToken } from './utils/jwt';
import { successResponse, errorResponse } from './utils/apiResponse';

const config = (() => {
  try {
    const env = Bun.env.AUTH_CONFIG;
    if (!env) throw new Error('AUTH_CONFIG not found in .env');
    return JSON.parse(env) as AuthConfig;
  } catch (error) {
    console.error('Error loading auth config:', error);
    throw error;
  }
})();

const JWT_SECRET = (() => {
  try{
    const JWT_SECRET_RAW = Bun.env.JWT_SECRET || '';
    if(!JWT_SECRET_RAW) throw new Error('JWT_SECRET shouldn\'t be empty');
    return new TextEncoder().encode(JWT_SECRET_RAW);
  } catch (error) {
    console.error('Error loading JWT_SECRET:', error);
    throw error;
  }
})();

export async function handleLogin(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      errorResponse(405, 'Method Not Allowed')
    );
  }

  try {
    const { uname, pwd } = await req.json();

    // 输入验证
    const validationError = validateInput(uname, pwd);
    if (validationError) {
      return Response.json(
        errorResponse(400, validationError)
      );
    }

    // 查找用户
    const user = config.users.find((u) => u.uname === uname);
    if (!user) {
      return Response.json(
        errorResponse(401, `用户 ${uname} 不存在`)
      );
    }

    // 验证密码
    const isValid = await comparePasswords(pwd, user.pwd, config.salt1, config.salt2);
    if (!isValid) {
      return Response.json(
        errorResponse(401, `用户 ${uname} 的密码不正确`)
      );
    }
    
    // 生成 token
    const token = await generateToken(uname, JWT_SECRET);
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

function validateInput(uname: string, pwd: string): string | null {
  if (!uname || !pwd) return '用户名、密码不能为空';
  if (uname.length > 30) return '用户名不能超过30个字符';
  if (pwd.length > 30) return '密码不能超过30个字符';
  return null;
}
