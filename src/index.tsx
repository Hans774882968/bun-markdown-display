import { serve } from "bun";
import { join } from "path";
import { readFileSync } from "fs";
import index from "./index.html";
import { ArticleInfo } from "./types/article";

function readArticlesJson() {
  const articlesJsonPath = join("mds", "articles.json");
  return JSON.parse(readFileSync(articlesJsonPath, "utf-8"));
}

// TODO: 解决 build 产物不能执行的问题
const server = serve({
  port: process.env.NODE_ENV === "development" ? 5202 : 5201,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/api/allArticles": handleAllArticles,
    "/api/article/:aid": handleArticle,
  },
  // 使用 fetch 处理所有路由
  async fetch(req) {
    const url = new URL(req.url);

    // 处理 API 路由
    if (url.pathname.startsWith("/api")) {
      if (url.pathname === "/api/allArticles") {
        return handleAllArticles(req);
      }
      if (url.pathname.startsWith("/api/article/")) {
        return handleArticle(req);
      }
    }

    // 默认返回 index.html
    return new Response(index, {
      headers: { "Content-Type": "text/html" },
    });
  },

  // 开发配置
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

// 抽离 API 处理函数
async function handleAllArticles(req: Request): Promise<Response> {
  try {
    const articlesData = readArticlesJson();
    const articles = articlesData.articles.map((article: ArticleInfo) => ({
      url: `/article/${article.aid}`,
      title: article.title,
    }));
    return Response.json({ code: 200, msg: "success", data: articles });
  } catch (error) {
    return Response.json({ code: 500, msg: "Internal server error", data: null });
  }
}

async function handleArticle(req: Request): Promise<Response> {
  try {
    const aid = parseInt(new URL(req.url).pathname.split("/").pop() || "");
    const articlesData = readArticlesJson();
    const article = articlesData.articles.find((a: ArticleInfo) => a.aid === aid);

    if (!article) {
      return Response.json({ code: 404, msg: "Article not found", data: null });
    }

    const mdPath = join("mds", `${article.title}.md`);
    try {
      const content = readFileSync(mdPath, "utf-8");
      return Response.json({ code: 200, msg: "success", data: { content, title: article.title } });
    } catch (error) {
      return Response.json({ code: 404, msg: "Markdown file not found", data: null });
    }
  } catch (error) {
    return Response.json({ code: 500, msg: "Internal server error", data: null });
  }
}
