const WEAK_PASSWORDS = ['Qwertyui', 'Password', 'Football'];
// 指定的29个特殊字符
export const SPECIAL_CHARS = '~!@#$%^&*()_+`-={}:";\'<>?,.\\/';
export const SPECIAL_CHAR_SET = new Set(SPECIAL_CHARS.split(''));

export function getPasswordStrength(pwd: string): number {
  const checkers = [
    { type: 'lowercase', valid: /[a-z]/.test(pwd) },
    { type: 'uppercase', valid: /[A-Z]/.test(pwd) },
    { type: 'number', valid: /[0-9]/.test(pwd) },
    { type: 'special', valid: pwd.split('').some((c) => SPECIAL_CHAR_SET.has(c)) }
  ];
  const validCount = checkers.filter(c => c.valid).length;
  return validCount;
}

export function validatePasswordComplexity(password: string): boolean {
  let hasLower = false;
  let hasUpper = false;
  let hasNumber = false;
  let hasSpecial = false;

  for (const char of password) {
    if (!hasLower && /[a-z]/.test(char)) hasLower = true;
    else if (!hasUpper && /[A-Z]/.test(char)) hasUpper = true;
    else if (!hasNumber && /[0-9]/.test(char)) hasNumber = true;
    else if (!hasSpecial && SPECIAL_CHAR_SET.has(char)) hasSpecial = true;

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    // 提前终止条件：已满足至少两种类型
    if (strength >= 2) {
      return true;
    }
  }

  return false;
}

export function validateLoginInput(uname: string, pwd: string): string | null {
  if (!uname.trim()) return '用户名不能为空';
  if (!pwd.trim()) return '密码不能为空';

  if (uname.length < 4) return '用户名至少4个字符';
  if (uname.length > 30) return '用户名不能超过30个字符';

  if (pwd.length < 8) return '密码至少8个字符';
  if (pwd.length > 30) return '密码不能超过30个字符';
  if (!validatePasswordComplexity(pwd)) return '密码需至少包含大写字母、小写字母、数字和特殊字符中的两种';

  if (pwd === uname) return '密码不能与用户名相同';
  if (WEAK_PASSWORDS.includes(pwd)) return '密码过于简单';

  return null;
}
