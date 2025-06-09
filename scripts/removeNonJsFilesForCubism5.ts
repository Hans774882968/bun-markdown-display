import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';

async function collectNonJsFiles(dirPath: string): Promise<string[]> {
  const nonJsFiles: string[] = [];

  async function traverse(currentPath: string) {
    const entries = await readdir(currentPath);

    for (const entry of entries) {
      const fullPath = join(currentPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await traverse(fullPath);
      } else if (!entry.endsWith('.js')) {
        nonJsFiles.push(fullPath);
      }
    }
  }

  await traverse(dirPath);
  return nonJsFiles;
}

async function deleteFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await unlink(filePath);
      console.log('[bun-markdown-display]', `Deleted: ${filePath}`);
    } catch (error) {
      console.error('[bun-markdown-display]', `Error deleting ${filePath}:`, error);
    }
  }
}

async function main() {
  const targetDir = 'models/cubism5/framework';

  try {
    console.log('[bun-markdown-display]', 'Collecting non-JS files...');
    const filesToDelete = await collectNonJsFiles(targetDir);

    console.log('[bun-markdown-display]', filesToDelete, `Found ${filesToDelete.length} non-JS files to delete`);

    if (filesToDelete.length > 0) {
      console.log('[bun-markdown-display]', 'Starting deletion process...');
      await deleteFiles(filesToDelete);
      console.log('[bun-markdown-display]', 'Deletion completed.');
    } else {
      console.log('[bun-markdown-display]', 'No files to delete.');
    }
  } catch (error) {
    console.error('[bun-markdown-display]', 'An error occurred:', error);
    process.exit(1);
  }
}

main();
