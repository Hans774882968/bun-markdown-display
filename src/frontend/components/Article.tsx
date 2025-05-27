import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked, processTOC } from '@/common/markedInit';
import sanitizeHtml from 'sanitize-html';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css';
import { ArticleContent } from '@/types/article';
import { ApiResponse } from '@/types/api';
import './toc.css';
import { toast } from 'sonner';
import { errorToStr } from '@/common/errorToStr';

export function Article() {
  const { aid } = useParams<{ aid: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
    });
  }, []);

  // Process markdown content when article changes
  useEffect(() => {
    if (!article) return;

    const processMarkdown = async () => {
      try {
        const mdWithToc = processTOC(article.content);
        // Handle both Promise and string return types from marked()
        const result = marked(mdWithToc);
        const html = typeof result === 'string' ? result : await result;
        
        const sanitizedHtml = sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'code': ['class'],
            'pre': ['class'],
            // 关键修复：允许 span 的 class 属性（hljs 生成的元素）
            'span': ['class'],
            'div': ['class'], // Allow class attribute for mermaid divs
            'li': ['class'], // For TOC
            'h1': ['id'],
            'h2': ['id'],
            'h3': ['id'],
            'h4': ['id'],
            'h5': ['id'],
            'h6': ['id'],
          }
        });

        setHtmlContent(sanitizedHtml);
      } catch (err) {
        console.error('Error processing markdown:', err);
        setError('Failed to process article content');
      }
    };

    processMarkdown();
  }, [article]);

  // TODO: 错误处理
  // Render mermaid diagrams after content loads
  useEffect(() => {
    if (!articleRef.current || !htmlContent) {
      return;
    }
    const mermaidElements = articleRef.current.querySelectorAll<HTMLElement>('.mermaid');
    if (mermaidElements.length > 0) {
      try {
        mermaid.run({
          nodes: mermaidElements,
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        toast.error(errorToStr(error));
      }
    }
  }, [htmlContent]);

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
    [aid, navigate]
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
    <div className="max-w-3xl mx-auto p-6" ref={articleRef}>
      <h1 className="text-4xl font-[800] mb-8">{article.title}</h1>
      <article 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
