// fix-html-import.ts
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_NAME = 'bun-markdown-display';

// Usage: 项目根目录 bun build:be2
function main() {
  const distFile = join(__dirname, '..', 'dist', 'backend', 'beIndex.js');
  const code = readFileSync(distFile, 'utf-8');

  // import <任意标识符> from ["']@/index.html["']
  const importRegex = /import\s+(\w+)\s+from\s*["']@\/index\.html["']/g;

  // 检查是否匹配成功
  if (!importRegex.test(code)) {
    console.log(`[${PROJECT_NAME}] No matching HTML import found. Skipping fix.`);
    process.exit(0);
  }

  importRegex.lastIndex = 0;

  const fixedCode = code.replace(importRegex, (match, identifier) => {
    console.log(`[${PROJECT_NAME}] Restoring import: ${match}`);
    return `import ${identifier} from "../index.html"`;
  });

  writeFileSync(distFile, fixedCode);
  console.log(`[${PROJECT_NAME}] HTML imports restored successfully!`);
}

main();
