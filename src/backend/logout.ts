import { loginRequired } from './service/auth';

export const handleLogout = loginRequired(
  () => {
    return Response.json({ code: 114514, msg: '暂未实现', data: null });
  }
);
