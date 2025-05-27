/**
 * 将 Error 对象转为字符串表示
 * @param error 可能是 Error 对象、字符串、普通对象或其他类型
 * @param includeStack 是否包含堆栈信息 (默认: false)
 * @returns 可读的错误信息字符串
 */
export function errorToStr(
  error: unknown,
  includeStack = false
): string {
  // 处理 undefined 和 null
  if (error === undefined) return 'undefined';
  if (error === null) return 'null';

  // 处理 Error 对象
  if (error instanceof Error) {
    let message = error.message || '(no error message)';
    if (includeStack && error.stack) {
      message += `\n${error.stack}`;
    }
    return message;
  }

  if (typeof error === 'object' && 'reason' in error) {
    return errorToStr(error.reason, includeStack);
  }

  // 处理普通对象
  if (typeof error === 'object') {
    try {
      // 检查是否是带有 message 属性的对象
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      // 尝试 JSON 序列化
      return JSON.stringify(error);
    } catch (e) {
      return `[Non-serializable object] ${e}`;
    }
  }

  // 处理原始类型
  return String(error);
}
