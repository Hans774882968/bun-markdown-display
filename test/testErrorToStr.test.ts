import { describe, it, expect } from 'bun:test';
import { errorToStr } from '@/common/errorToStr';

describe('errorToStr', () => {
  it('should return the correct string representation of an error', () => {
    const error = new Error('Test error');
    const result = errorToStr(error);
    expect(result).toBe('Test error');
  });

  it('should return the correct string representation of an error with stack', () => {
    const error = new Error('Test error');
    const result = errorToStr(error, true);
    expect(result).toContain('Test error');
    expect(result).toContain('at');
    expect(result).toContain('test\\testErrorToStr.test.ts');
  });

  it('error is null', () => {
    const result = errorToStr(null, true);
    expect(result).toBe('null');
  });

  it('error is undefined', () => {
    const result = errorToStr(undefined, true);
    expect(result).toBe('undefined');
  });

  it('error is a string', () => {
    const result = errorToStr('test', true);
    expect(result).toBe('test');
  });

  it('error is a number', () => {
    const result = errorToStr(123, true);
    expect(result).toBe('123');
  });

  it('error is an object', () => {
    const result = errorToStr({ a: 1, b: 2 }, true);
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('error is an object with a message property', () => {
    const result = errorToStr({ message: 'Test error message' }, true);
    expect(result).toBe('Test error message');
  });

  it('error is a promise rejection', async () => {
    try {
      await Promise.reject(new Error('Test promise rejection error'));
    } catch(e) {
      const result = errorToStr(e, true);
      expect(result).toContain('Test promise rejection error');
      expect(result).toContain('at');
      expect(result).toContain('test\\testErrorToStr.test.ts');
    }
  });
});
