import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'highlight.js/styles/github-dark.css';
import { ArticleContent } from '@/types/article';
import { ApiResponse } from '@/types/api';
import './toc.css';
import { toast } from 'sonner';
import useMdArticleRender from '@/frontend/hooks/useMdArticleRender';
import { Helmet } from 'react-helmet-async';

export function Article() {
  const { aid } = useParams<{ aid: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    error,
    htmlContent,
    setError,
    articleRef,
  } = useMdArticleRender(article?.content || '');

  const fetchArticle = useCallback(
    () => {
      if (!aid) return;

      setIsLoading(true);
      setError(null);

      fetch(`/api/article/${aid}`)
        .then((res) => res.json())
        .then((data: ApiResponse<ArticleContent>) => {
          if (data.code === 404) {
            navigate(`/404?aid=${aid}`);
          } else if (!data.code && data.data) {
            setArticle(data.data);
          } else {
            setError(data.msg);
          }
        })
        .catch((err) => {
          console.error(`加载文章 ${aid} 失败`, err);
          toast.error(`加载文章 ${aid} 失败`);
          setError(`加载文章 ${aid} 失败`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [aid, navigate, setError]
  );

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (error) {
    return (
      <div className="text-red-500 text-center flex flex-col items-center gap-4">
        <div>{error}</div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 cursor-pointer"
          onClick={fetchArticle}
          disabled={isLoading}
        >
          {isLoading ? '重试中...' : '重试'}
        </button>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{article.title}</title>
      </Helmet>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-[800] mb-8">{article.title}</h1>
        <article
          ref={articleRef}
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </>
  );
}
