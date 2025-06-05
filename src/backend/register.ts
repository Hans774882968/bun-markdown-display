import { User } from '@/types/auth';
import { hashPassword } from './utils/crypto';
import { successResponse, errorResponse } from './utils/apiResponse';
import { validateLoginInput } from '../common/validateLoginInput';
import FlakeId from 'flake-idgen';
import { loadAuthConfig } from './utils/loadFromEnv';
import { adminRequired } from './service/auth';

const flakeIdGen = new FlakeId();

export const handleRegister = adminRequired(
  async (req: Request) => {
    try {
      const { uname, pwd } = await req.json();

      const validationError = validateLoginInput(uname, pwd);
      if (validationError) {
        return Response.json(
          errorResponse(400, validationError)
        );
      }

      const authConfig = loadAuthConfig();
      if (authConfig.users.some((u) => u.uname === uname)) {
        return Response.json(
          errorResponse(400, `用户 ${uname} 已存在`)
        );
      }

      const uid = flakeIdGen.next().toString('hex');
      const hashedPwd = await hashPassword(pwd, authConfig.salt1, authConfig.salt2, uid);
      const newUser: User = {
        uname,
        pwd: hashedPwd,
        isAdmin: false,
        uid,
        personalizedSign: '',
      };

      const updatedConfig = {
        ...authConfig,
        users: [...authConfig.users, newUser],
      };

      await Bun.write('.env', `AUTH_CONFIG=${JSON.stringify(updatedConfig)}\n`);

      return Response.json(
        successResponse({ message: `用户 ${uname} 注册成功` })
      );
    } catch (error) {
      console.error('Register error:', error);
      return Response.json(
        errorResponse(500, '注册接口出错')
      );
    }
  }
);
