import { useEffect, useState, useRef } from 'react';
import { marked, processTOC } from '@/common/markedInit';
import sanitizeHtml from 'sanitize-html';
import mermaid from 'mermaid';
import { errorToStr } from '@/common/errorToStr';
import { toast } from 'sonner';

export default function useMdArticleRender(content: string) {
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
    if (!content) return;

    const processMarkdown = async () => {
      try {
        const mdWithToc = processTOC(content);
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
          },
        });

        setHtmlContent(sanitizedHtml);
      } catch (err) {
        console.error('Error processing markdown:', err);
        setError('Failed to process article content');
      }
    };

    processMarkdown();
  }, [content]);

  // Render mermaid diagrams after content loads
  useEffect(() => {
    if (!articleRef.current || !htmlContent) {
      return;
    }
    const mermaidElements = articleRef.current.querySelectorAll<HTMLElement>('.mermaid');
    if (mermaidElements.length > 0) {
      mermaid
        .run({
          nodes: mermaidElements,
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          toast.error(errorToStr(error));
        });
    }
  }, [htmlContent]);

  return {
    error,
    htmlContent,
    setError,
    setHtmlContent,
    articleRef,
  };
}
