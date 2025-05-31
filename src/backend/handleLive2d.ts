import path from 'path';

export async function handleLive2d(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;
  const filePath = path.join(process.cwd(), pathname.replace('/live2d', '/models'));
  const file = Bun.file(filePath);
  const fileExists = await file.exists();
  if (fileExists) {
    return new Response(file);
  }
  return new Response(`live2d model ${pathname} not found`, { status: 404 });
}
