import { Link, useSearchParams } from 'react-router-dom';

export function NotFound() {
  const [searchParams] = useSearchParams();
  const aid = searchParams.get('aid');

  return (
    <div className="max-w-2xl mx-auto text-center mt-20">
      <h1 className="text-4xl font-[800] mb-4">404 - 页面未找到</h1>
      {aid && (
        <p className="text-xl mb-8">
          找不到ID为 {aid} 的文章
        </p>
      )}
      <Link to="/" className="text-blue-400 hover:text-blue-300">
        返回首页
      </Link>
    </div>
  );
}
