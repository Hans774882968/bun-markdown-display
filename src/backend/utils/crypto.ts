import { timingSafeEqual } from 'node:crypto';

export const hashPassword = async (
  password: string,
  salt1: string,
  salt2: string,
  uid: string,
  iterations = 100000
): Promise<string> => {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${salt1},${uid},${password},${salt2}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt2),
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return Buffer.from(derivedBits).toString('hex');
};

export const comparePasswords = async (
  inputPassword: string,
  storedHash: string,
  salt1: string,
  salt2: string,
  uid: string
): Promise<boolean> => {
  try {
    const inputHash = await hashPassword(inputPassword, salt1, salt2, uid);
    return timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
};
