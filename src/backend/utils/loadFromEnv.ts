import { AuthConfig } from '@/types/auth';
import fs from 'fs';

export function loadAuthConfig() {
  // 不能用 Bun.env.AUTH_CONFIG 因为每次启动服务器都只加载一次
  try {
    const envFileContent = fs.readFileSync('.env', 'utf-8');
    const authConfigLine = envFileContent.split('\n').find((line) => line.startsWith('AUTH_CONFIG='));
    if (!authConfigLine) throw new Error('AUTH_CONFIG not found in .env');
    return JSON.parse(authConfigLine.split('=')[1]) as AuthConfig;
  } catch (error) {
    console.error('Error loading auth config:', error);
    throw error;
  }
}

export function loadJwtSecret(authConfig: AuthConfig) {
  try {
    const JWT_SECRET_RAW = authConfig.JWT_SECRET || '';
    if (!JWT_SECRET_RAW) throw new Error('JWT_SECRET shouldn\'t be empty');
    return new TextEncoder().encode(JWT_SECRET_RAW);
  } catch (error) {
    console.error('Error loading JWT_SECRET:', error);
    throw error;
  }
}
