import { ArticleInfo } from '@/types/article';
import { join } from 'path';
import { readFileSync } from 'fs';
import { successResponse, errorResponse } from '@/backend/utils/apiResponse';

function readArticlesJson() {
  const articlesJsonPath = join('mds', 'articles.json');
  return JSON.parse(readFileSync(articlesJsonPath, 'utf-8'));
}

export async function handleAllArticles(): Promise<Response> {
  try {
    const articlesData = readArticlesJson();
    const articles = articlesData.articles.map((article: ArticleInfo) => ({
      url: `/article/${article.aid}`,
      title: article.title,
    }));
    return Response.json(
      successResponse(articles)
    );
  } catch (error) {
    console.error('Internal server error', error);
    return Response.json(
      errorResponse(500, 'Internal server error')
    );
  }
}

export async function handleArticle(req: Request): Promise<Response> {
  try {
    const aid = parseInt(new URL(req.url).pathname.split('/').pop() || '');
    if (isNaN(aid)) {
      return Response.json(
        errorResponse(400, 'Invalid article ID')
      );
    }

    const articlesData = readArticlesJson();
    const article = articlesData.articles.find((a: ArticleInfo) => a.aid === aid);

    if (!article) {
      return Response.json(
        errorResponse(404, 'Article not found')
      );
    }

    const mdPath = join('mds', `${article.title}.md`);
    try {
      const content = readFileSync(mdPath, 'utf-8');
      return Response.json(
        successResponse({ content, title: article.title })
      );
    } catch (error) {
      console.error('Markdown file not found', error);
      return Response.json(
        errorResponse(404, 'Markdown file not found')
      );
    }
  } catch (error) {
    console.error('Internal server error', error);
    return Response.json(
      errorResponse(500, 'Internal server error')
    );
  }
}
