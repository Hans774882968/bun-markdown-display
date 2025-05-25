import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types/article';
import { ApiResponse } from '../../types/api';

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/allArticles')
      .then((res) => res.json())
      .then((data: ApiResponse<Article[]>) => {
        if (data.code === 200 && data.data) {
          setArticles(data.data);
        } else {
          setError(data.msg);
        }
      })
      .catch((err) => {
        console.error('Failed to load articles', err);
        setError('Failed to load articles');
      });
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
