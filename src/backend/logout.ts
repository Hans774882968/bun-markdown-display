import { errorResponse } from './utils/apiResponse';

export async function handleLogout(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      errorResponse(405, 'Method Not Allowed')
    );
  }
  return Response.json({ code: 114514, msg: '暂未实现', data: null });
}
