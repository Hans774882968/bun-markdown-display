import { describe, it, expect } from 'bun:test';
import { getPageNumbers } from '@/frontend/utils/getPageNumbers';
import type { PageOption } from '@/frontend/utils/getPageNumbers';

describe('getPageNumbers', () => {
  it('totalPages <= 5', () => {
    for (let totalPages = 1; totalPages <= 5; totalPages++) {
      for (let i = 1; i <= totalPages; i++) {
        const expected: PageOption[] = Array.from({ length: totalPages }, (_, idx) => ({
          key: idx + 1,
          value: idx + 1,
        }));
        expect(getPageNumbers(i, totalPages)).toEqual(expected);
      }
    }
  });

  it('currentPage <= 3', () => {
    for (let totalPages = 6; totalPages <= 8; totalPages++) {
      for (let currentPage = 1; currentPage <= 3; currentPage++) {
        const expected: PageOption[] = [
          { key: 1, value: 1 },
          { key: 2, value: 2 },
          { key: 3, value: 3 },
          { key: 4, value: 4 },
          { key: totalPages + 1, value: '...' },
          { key: totalPages, value: totalPages },
        ];
        expect(getPageNumbers(currentPage, totalPages)).toEqual(expected);
      }
    }
  });

  it('4 <= currentPage <= totalPages - 3', () => {
    for (let totalPages = 6; totalPages <= 8; totalPages++) {
      for (let currentPage = 4; currentPage <= totalPages - 3; currentPage++) {
        const expected: PageOption[] = [
          { key: 1, value: 1 },
          { key: totalPages + 1, value: '...' },
          { key: currentPage - 1, value: currentPage - 1 },
          { key: currentPage, value: currentPage },
          { key: currentPage + 1, value: currentPage + 1 },
          { key: totalPages + 2, value: '...' },
          { key: totalPages, value: totalPages },
        ];
        expect(getPageNumbers(currentPage, totalPages)).toEqual(expected);
      }
    }
  });

  it('totalPages - 2 <= currentPage <= totalPages', () => {
    for (let totalPages = 6; totalPages <= 8; totalPages++) {
      for (let currentPage = totalPages - 2; currentPage <= totalPages; currentPage++) {
        const expected: PageOption[] = [
          { key: 1, value: 1 },
          { key: totalPages + 1, value: '...' },
          { key: totalPages - 3, value: totalPages - 3 },
          { key: totalPages - 2, value: totalPages - 2 },
          { key: totalPages - 1, value: totalPages - 1 },
          { key: totalPages, value: totalPages },
        ];
        expect(getPageNumbers(currentPage, totalPages)).toEqual(expected);
      }
    }
  });
});
