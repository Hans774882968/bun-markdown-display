import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from '@/common/markedInit';
import sanitizeHtml from 'sanitize-html';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css';
import { ArticleContent } from '@/types/article';
import { ApiResponse } from '@/types/api';

export function Article() {
  const { aid } = useParams<{ aid: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
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
        // Handle both Promise and string return types from marked()
        const result = marked(article.content);
        const html = typeof result === 'string' ? result : await result;
        
        const sanitizedHtml = sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'code': ['class'],
            'pre': ['class'],
            // 关键修复：允许 span 的 class 属性（hljs 生成的元素）
            'span': ['class'],
            'div': ['class'] // Allow class attribute for mermaid divs
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
      }
    }
  }, [htmlContent]);

  useEffect(() => {
    if (!aid) return;

    fetch(`/api/article/${aid}`)
      .then((res) => res.json())
      .then((data: ApiResponse<ArticleContent>) => {
        if (data.code === 404) {
          navigate(`/404?aid=${aid}`);
        } else if (data.code === 200 && data.data) {
          setArticle(data.data);
        } else {
          setError(data.msg);
        }
      })
      .catch((err) => {
        console.error('Failed to load article', err);
        setError('Failed to load article');
      });
  }, [aid, navigate]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!article) {
    return <div>Loading...</div>;
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
