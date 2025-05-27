import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types/article';
import { hansRequest } from '@/common/hansRequest';
import { toast } from 'sonner';

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArticles = () => {
    setIsLoading(true);
    setError(null);
    hansRequest.get<Article[]>('/api/allArticles')
      .then((data) => {
        setArticles(data);
      })
      .catch(() => {
        toast.error('加载文章列表失败');
        setError('加载文章列表失败');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (error) {
    return (
      <div className="text-red-500 text-center flex flex-col items-center gap-4">
        <div>{error}</div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 cursor-pointer"
          onClick={fetchArticles}
          disabled={isLoading}
        >
          {isLoading ? '重试中...' : '重试'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-[800] mb-6">所有文章</h1>
      <div className="space-y-4">
        {
          articles.map((article) => (
            <div key={article.url} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <Link to={article.url} className="text-xl text-blue-400 hover:text-blue-300">
                {article.title}
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  );
}
