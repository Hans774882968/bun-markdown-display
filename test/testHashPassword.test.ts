import { hashPassword } from '@/backend/utils/crypto';
import { describe, it, expect } from 'bun:test';

describe('hashPassword', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword';
    const salt1 = 'salt1';
    const salt2 = 'salt2';
    const uid = '123456789abcdef0';

    const hashedPassword = await hashPassword(password, salt1, salt2, uid);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.length).toBe(64);
    expect(hashedPassword).toBe('4781d9b2a7452b0609fcac9b8f1240f5b14cd47f6908fea846d690c8d8b8dd76');

    // 相同输入应产生相同输出
    const hashedPassword2 = await hashPassword(password, salt1, salt2, uid);
    expect(hashedPassword).toBe(hashedPassword2);
  });

  it('should generate different hashes for same password with different uids', async () => {
    const password = 'testPassword';
    const salt1 = 'salt1';
    const salt2 = 'salt2';
    const uid1 = '123456789abcdef0';
    const uid2 = '0fedcba987654321';

    const hash1 = await hashPassword(password, salt1, salt2, uid1);
    const hash2 = await hashPassword(password, salt1, salt2, uid2);
    expect(hash1).not.toBe(hash2);
  });
});
