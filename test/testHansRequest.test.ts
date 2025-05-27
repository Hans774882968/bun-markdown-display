import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { hansRequest } from '@/common/hansRequest';

// 模拟 fetch 和 console.error
const mockFetch = Object.assign(
  mock(async (_url: string | URL | globalThis.Request, _init?: BunFetchRequestInit) => {
    return new Response();
  }),
  {
    preconnect: mock(() => Promise.resolve()),
  }
);
const mockConsoleError = mock(() => {});

beforeEach(() => {
  global.fetch = mockFetch;
  global.console.error = mockConsoleError;
});

afterEach(() => {
  mockFetch.mockClear();
  mockConsoleError.mockClear();
});

describe('hansRequest', () => {
  describe('GET 请求', () => {
    test('成功请求应返回数据', async () => {
      // 模拟成功响应
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 0, msg: '', data: 'test-data' }))
      );
      const result = await hansRequest.get<string>('https://api.example.com');
      expect(result).toBe('test-data');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('成功请求， data 是 JSON', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 0, msg: '', data: { name: 'hans7', age: 18 } }))
      );
      const result = await hansRequest.get<{ name: string, age: number }>('https://api.example.com');
      expect(result).toEqual({ name: 'hans7', age: 18 });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('HTTP 错误应抛出异常', async () => {
      // 模拟 HTTP 错误
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 404 })
      );
      await expect(hansRequest.get('https://api.example.com')).rejects.toThrow('HTTP error! status: 404');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    test('业务错误应抛出异常', async () => {
      // 模拟业务错误响应
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 114514, msg: 'this is a business error', data: null }))
      );
      await expect(hansRequest.get('https://api.example.com')).rejects.toThrow('this is a business error');
      expect(mockConsoleError).not.toHaveBeenCalled(); // 业务错误默认静默
    });

    test('静默模式不应打印错误日志', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 500 })
      );
      await expect(hansRequest.get('https://api.example.com', { silent: true }))
        .rejects.toThrow();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('POST 请求', () => {
    test('应发送正确的请求头和请求体', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 0, data: 'post-data' }))
      );

      const result = await hansRequest.post('https://api.example.com', { key: 'value' });
      expect(result).toBe('post-data');
      
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toBe('https://api.example.com');
      expect(call[1]?.method).toBe('POST');
      expect(call[1]?.headers).toEqual({
        'Content-Type': 'application/json'
      });
      expect(call[1]?.body).toBe(JSON.stringify({ key: 'value' }));
    });

    test('可以覆盖默认请求头', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 0, data: null }))
      );

      await hansRequest.post('https://api.example.com', null, {
        headers: { 'X-Custom': 'value' }
      });

      const headers = mockFetch.mock.calls[0][1]?.headers;
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-Custom': 'value'
      });
    });
  });

  describe('错误处理', () => {
    test('网络错误应被捕获并打印日志', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(hansRequest.get('https://api.example.com'))
        .rejects.toThrow('Network error');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    test('自定义错误上下文应显示在日志中', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error'));

      await expect(hansRequest.get('https://api.example.com', {
        errorCtx: '[Custom Context]'
      })).rejects.toThrow();
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Custom Context]',
        expect.any(Error)
      );
    });
  });

  describe('响应处理', () => {
    test('无效 JSON 响应应抛出错误', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('invalid-json')
      );

      await expect(hansRequest.get('https://api.example.com'))
        .rejects.toThrow();
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    test('空响应应抛出错误', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null)
      );

      await expect(hansRequest.get('https://api.example.com'))
        .rejects.toThrow();
    });
  });
});
