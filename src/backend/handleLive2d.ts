import path from 'path';

const cubism5Prefix = path.join('models', 'cubism5');

export function getFilePath(pathname: string): string {
  const filePath = path.join(process.cwd(), pathname.replace('/live2d', '/models'));
  if (filePath.includes(cubism5Prefix)) {
    const jsFilePath = filePath.endsWith('.js') ? filePath : `${filePath}.js`;
    return jsFilePath;
  }
  return filePath;
}

export async function handleLive2d(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;
  const filePath = getFilePath(pathname);
  const file = Bun.file(filePath);
  const fileExists = await file.exists();
  if (fileExists) {
    return new Response(file);
  }
  return new Response(`live2d model ${pathname} not found`, { status: 404 });
}
