#!/usr/bin/env bun

import { AuthConfig, User } from '@/types/auth';
import { hashPassword } from '@/backend/utils/crypto';
import { errorToStr } from '@/common/errorToStr';
import FlakeId from 'flake-idgen';
import { validateLoginInput } from '@/common/validateLoginInput';
import { loadAuthConfig } from '@/backend/utils/loadFromEnv';

const flakeIdGen = new FlakeId();

const log = (...message: string[]) => console.log('[bun-markdown-display]', ...message);

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
    if (!user.uname || !user.pwd || typeof user.isAdmin !== 'boolean' || !user.uid) {
      log('用户表格式错误');
      process.exit(1);
    }
  }
};

const main = async () => {
  const authConfig = loadAuthConfig();
  validateConfig(authConfig);

  const uname = process.argv[2];
  const pwd = process.argv[3];
  const isAdmin = process.argv[4] === '--admin';

  if (!uname || !pwd) {
    log('Usage: bun scripts/addUser.ts <username> <password> [--admin]');
    process.exit(1);
  }

  const validationError = validateLoginInput(uname, pwd);
  if (validationError) {
    log(validationError);
    process.exit(1);
  }

  if (authConfig.users.some(u => u.uname === uname)) {
    log(`用户 ${uname} 已存在`);
    process.exit(1);
  }

  try {
    const uid = flakeIdGen.next().toString('hex');
    const hashedPwd = await hashPassword(pwd, authConfig.salt1, authConfig.salt2, uid);
    const newUser: User = {
      uname,
      pwd: hashedPwd,
      isAdmin,
      uid
    };

    const updatedConfig = {
      ...authConfig,
      users: [...authConfig.users, newUser]
    };

    await Bun.write('.env', `AUTH_CONFIG=${JSON.stringify(updatedConfig)}\n`);
    log(`用户 ${uname} 添加成功${isAdmin ? '（管理员）' : ''}`);
  } catch (error) {
    log('添加用户失败:', errorToStr(error, true));
    process.exit(1);
  }
};

main();
