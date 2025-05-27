#!/usr/bin/env bun

import { AuthConfig, User } from '@/types/auth';
import { hashPassword } from '@/backend/utils/crypto';
import { errorToStr } from '@/common/errorToStr';

const log = (...message: string[]) => console.log('[bun-markdown-display]', ...message);

const loadConfig = (): AuthConfig => {
  try {
    const env = Bun.env.AUTH_CONFIG;
    if (!env) throw new Error('AUTH_CONFIG not found in .env');
    return JSON.parse(env);
  } catch (error) {
    log('Error loading auth config:', errorToStr(error, true));
    process.exit(1);
  }
};

const validateConfig = (config: AuthConfig) => {
  if (!config.users || !Array.isArray(config.users)) {
    log('用户表格式错误');
    process.exit(1);
  }

  if (!config.salt1) {
    log('salt1不存在');
    process.exit(1);
  }

  if (!config.salt2) {
    log('salt2不存在');
    process.exit(1);
  }

  for (const user of config.users) {
    if (!user.uname || !user.pwd) {
      log('用户表格式错误');
      process.exit(1);
    }
  }
};

const main = async () => {
  const config = loadConfig();
  validateConfig(config);

  const uname = process.argv[2];
  const pwd = process.argv[3];

  if (!uname || !pwd) {
    log('Usage: bun scripts/addUser.ts <username> <password>');
    process.exit(1);
  }

  if (uname.length > 30 || pwd.length > 30) {
    log('用户名和密码不能超过30个字符');
    process.exit(1);
  }

  if (config.users.some(u => u.uname === uname)) {
    log(`用户 ${uname} 已存在`);
    process.exit(1);
  }

  try {
    const hashedPwd = await hashPassword(pwd, config.salt1, config.salt2);
    const newUser: User = { uname, pwd: hashedPwd };

    const updatedConfig = {
      ...config,
      users: [...config.users, newUser]
    };

    await Bun.write('.env', `AUTH_CONFIG=${JSON.stringify(updatedConfig)}\n`);
    log(`用户 ${uname} 添加成功`);
  } catch (error) {
    log('添加用户失败:', errorToStr(error, true));
    process.exit(1);
  }
};

main();
