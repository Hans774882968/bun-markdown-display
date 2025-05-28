import { describe, expect, test } from 'bun:test';
import {
  getPasswordStrength,
  validatePasswordComplexity,
  validateLoginInput,
  SPECIAL_CHARS
} from '@/common/validateLoginInput';

describe('validateLoginInput', () => {
  describe('getPasswordStrength()', () => {
    test('should return 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0);
    });

    test('should count character types correctly', () => {
      expect(getPasswordStrength(' ')).toBe(0);      // blank
      expect(getPasswordStrength('a')).toBe(1);      // lowercase
      expect(getPasswordStrength('A')).toBe(1);      // uppercase
      expect(getPasswordStrength('1')).toBe(1);      // number
      expect(getPasswordStrength('@')).toBe(1);      // special
      expect(getPasswordStrength('aA')).toBe(2);     // lowercase + uppercase
      expect(getPasswordStrength('a1')).toBe(2);     // lowercase + number
      expect(getPasswordStrength('a~')).toBe(2);     // lowercase + special
      expect(getPasswordStrength('A@')).toBe(2);     // uppercase + special
      expect(getPasswordStrength('1!')).toBe(2);     // number + special
      expect(getPasswordStrength('@1!3~4>')).toBe(2);     // number + special
      expect(getPasswordStrength('aA1@')).toBe(4);   // all types
    });

    test('should recognize all special characters', () => {
      SPECIAL_CHARS.split('').forEach((char) => {
        expect(getPasswordStrength(char)).toBe(1);
      });
    });
  });

  describe('validatePasswordComplexity()', () => {
    test('should reject passwords with less than 2 types', () => {
      expect(validatePasswordComplexity('aaaaaaaa')).toBe(false);  // only lowercase
      expect(validatePasswordComplexity('AAABCAAA')).toBe(false);  // only uppercase
      expect(validatePasswordComplexity('11111111')).toBe(false);  // only number
      expect(validatePasswordComplexity('!!!@~!!!')).toBe(false);  // only special
    });

    test('should accept passwords with 2+ types', () => {
      expect(validatePasswordComplexity('aA')).toBe(true);     // lower + upper
      expect(validatePasswordComplexity('a1')).toBe(true);     // lower + number
      expect(validatePasswordComplexity('a~')).toBe(true);     // lower + special
      expect(validatePasswordComplexity('A@')).toBe(true);     // upper + special
      expect(validatePasswordComplexity('1!')).toBe(true);     // number + special

      expect(validatePasswordComplexity('aA1@')).toBe(true);   // all types
    });

    test('should stop checking once 2 types are found', () => {
      expect(validatePasswordComplexity('aAxxxxxxxx')).toBe(true);
    });
  });

  describe('validateLoginInput()', () => {
    test('should validate username requirements', () => {
      expect(validateLoginInput('', 'validPass1!')).toBe('用户名不能为空');
      expect(validateLoginInput('a'.repeat(3), 'validPass1!')).toBe('用户名至少4个字符');
      expect(validateLoginInput('北京南', 'validPass1!')).toBe('用户名至少4个字符');
      expect(validateLoginInput('a'.repeat(31), 'validPass1!')).toBe('用户名不能超过30个字符');
    });

    test('should validate password requirements', () => {
      expect(validateLoginInput('validUser', '')).toBe('密码不能为空');
      expect(validateLoginInput('validUser', 'short')).toBe('密码至少8个字符');
      expect(validateLoginInput('validUser', 'a'.repeat(31))).toBe('密码不能超过30个字符');
      expect(validateLoginInput('validUser', 'alllowercase')).toBe('密码需至少包含大写字母、小写字母、数字和特殊字符中的两种');
      expect(validateLoginInput('validUser', 'ALLUPPERCASE')).toBe('密码需至少包含大写字母、小写字母、数字和特殊字符中的两种');
      expect(validateLoginInput('validUser', '123456789012')).toBe('密码需至少包含大写字母、小写字母、数字和特殊字符中的两种');
      expect(validateLoginInput('validUser', '!@#$%^&*()')).toBe('密码需至少包含大写字母、小写字母、数字和特殊字符中的两种');
    });

    test('should check for weak passwords', () => {
      expect(validateLoginInput('validUser', 'Football')).toBe('密码过于简单');
      expect(validateLoginInput('validUser', 'Password')).toBe('密码过于简单');
      expect(validateLoginInput('user1235', 'user1235')).toBe('密码不能与用户名相同');
    });

    test('should return null for valid input', () => {
      expect(validateLoginInput('validUser', 'ValidPass1!')).toBeNull();
      expect(validateLoginInput('another_user', 'Secur3P@ss')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle whitespace in inputs', () => {
      expect(validateLoginInput('  ', '  ')).toBe('用户名不能为空');
      expect(validateLoginInput('valid', '   ')).toBe('密码不能为空');
    });

    test('should handle non-ASCII characters', () => {
      expect(validateLoginInput('用户名字', '密码')).toBe('密码至少8个字符');
      expect(validateLoginInput('東京北京', 'T0ky0!!!')).toBeNull();
    });

    test('should handle all special characters in passwords', () => {
      SPECIAL_CHARS.split('').forEach(char => {
        const password = `A1${char.repeat(6)}`;
        expect(validateLoginInput('testUser', password)).toBeNull();
      });
    });
  });
});
