import { hashPassword } from '@/backend/utils/crypto';
import { describe, it, expect } from 'bun:test';

describe('hashPassword', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword';
    const salt1 = 'salt1';
    const salt2 = 'salt2';

    const hashedPassword = await hashPassword(password, salt1, salt2);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.length).toBe(64);
    expect(hashedPassword).toBe('7fce48637777013271a4ffb02594b4f2db59cf0f4520cc7dc17fca81b8a62d63');
  });
});
