import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markedHighlight } from "marked-highlight";
import { marked } from "marked";
import hljs from "highlight.js";
import sanitizeHtml from "sanitize-html";
import "highlight.js/styles/github-dark.css";
import { ArticleContent } from "../types/article";
import { ApiResponse } from "../types/api";

// 配置 marked 使用 marked-highlight 和 highlight.js
marked.use(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

export function Article() {
  const { aid } = useParams<{ aid: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to load article");
      });
  }, [aid, navigate]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!article) {
    return <div>Loading...</div>;
  }

  // 使用 sanitize-html 防止 XSS 攻击
  const sanitizedHtml = sanitizeHtml(marked(article.content), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'code': ['class'],
      'pre': ['class'],
      // 关键修复：允许 span 的 class 属性（hljs 生成的元素）
      'span': ['class']
    }
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-[800] mb-8">{article.title}</h1>
      <article 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
