import { jwtVerify, SignJWT } from 'jose';

// TODO: 改成使用 access token + refresh token 机制来实现登出
// const tokenBlacklist = new Set<string>();

export const generateToken = (uname: string, secret: Uint8Array<ArrayBufferLike>, expiresIn = '7d') => {
  return new SignJWT({ uname })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret);
};

export const verifyToken = async (token: string, secret: Uint8Array<ArrayBufferLike>) => {
  // if (tokenBlacklist.has(token)) return null;
  try {
    return await jwtVerify(token, secret);
  } catch {
    return null;
  }
};

// export const revokeToken = (token: string) => {
//   tokenBlacklist.add(token);
// };
