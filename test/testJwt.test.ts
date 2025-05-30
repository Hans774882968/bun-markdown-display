// jwt.test.ts
import { describe, expect, test } from 'bun:test';
import { generateToken, verifyToken } from '@/backend/utils/jwt';
import { jwtVerify, SignJWT } from 'jose';

describe('JWT 工具函数', () => {
  const secret = new TextEncoder().encode('test_secret_114514');
  const testUsername = 'test_user';
  const testExpiresIn = '1h';
  const testIsAdmin = true;

  describe('generateToken', () => {
    test('生成有效的 JWT 令牌', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);

      expect(token).toBeString();
      expect(token.split('.').length).toBe(3); // JWT 由三部分组成
    });

    test('生成的令牌应包含正确的用户名和管理员状态', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);
      const payload = (await jwtVerify(token, secret)).payload;
      expect(payload.uname).toBe(testUsername);
      expect(payload.isAdmin).toBe(testIsAdmin);
    });

    test('使用不同的过期时间生成令牌', async () => {
      const shortToken = await generateToken(testUsername, testIsAdmin, secret, '1m');
      const longToken = await generateToken(testUsername, testIsAdmin, secret, '30d');
      expect(shortToken).toBeString();
      expect(longToken).toBeString();
    });
  });

  describe('verifyToken', () => {
    test('验证有效的令牌', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);
      const result = await verifyToken(token, secret);
      expect(result).not.toBeNull();
      expect(result?.payload.uname).toBe(testUsername);
      expect(result?.payload.isAdmin).toBe(testIsAdmin);
    });

    test('拒绝无效的令牌', async () => {
      const invalidToken = 'invalid.token.here';
      const result = await verifyToken(invalidToken, secret);
      expect(result).toBeNull();
    });

    test('拒绝使用错误密钥签名的令牌', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);
      const wrongSecret = new TextEncoder().encode('wrong-secret');
      const result = await verifyToken(token, wrongSecret);
      expect(result).toBeNull();
    });

    test('拒绝过期的令牌', async () => {
      const token = await new SignJWT({ uname: testUsername, isAdmin: testIsAdmin })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('0s')
        .sign(secret);
      const result = await verifyToken(token, secret);
      expect(result).toBeNull();
    });

    test('伪造 payload part1 改 isAdmin', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      payload.uname = 'test_user_114514';
      payload.isAdmin = !testIsAdmin;
      const newToken = `${tokenParts[0]}.${btoa(JSON.stringify(payload))}.${tokenParts[2]}`;
      const resultFake = await verifyToken(newToken, secret);
      expect(resultFake).toBeNull();
      const resultReal = await verifyToken(token, secret);
      expect(resultReal).not.toBeNull();
      expect(resultReal?.payload.uname).toBe(testUsername);
      expect(resultReal?.payload.isAdmin).toBe(testIsAdmin);
    });

    test('伪造 payload part1 不改 isAdmin', async () => {
      const token = await generateToken(testUsername, testIsAdmin, secret, testExpiresIn);
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      payload.uname = 'test_user_1919810';
      const newToken = `${tokenParts[0]}.${btoa(JSON.stringify(payload))}.${tokenParts[2]}`;
      const resultFake = await verifyToken(newToken, secret);
      expect(resultFake).toBeNull();
      const resultReal = await verifyToken(token, secret);
      expect(resultReal).not.toBeNull();
      expect(resultReal?.payload.uname).toBe(testUsername);
      expect(resultReal?.payload.isAdmin).toBe(testIsAdmin);
    });

    test('伪造 payload part2', async () => {
      const testUsernamePart2 = 'test_user_1919810';
      const token = await generateToken(testUsernamePart2, testIsAdmin, secret, testExpiresIn);
      const tokenParts = token.split('.');
      const newToken = `${tokenParts[0]}.${tokenParts[1]}.${'a'.repeat(tokenParts[2].length)}`;
      const resultFake = await verifyToken(newToken, secret);
      expect(resultFake).toBeNull();
      const resultReal = await verifyToken(token, secret);
      expect(resultReal).not.toBeNull();
      expect(resultReal?.payload.uname).toBe(testUsernamePart2);
      expect(resultReal?.payload.isAdmin).toBe(testIsAdmin);
    });
  });
});
