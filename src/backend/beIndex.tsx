import { serve } from "bun";
import { join } from "path";
import { readFileSync } from "fs";
import index from "@/index.html";
import { ArticleInfo } from "@/types/article";

function readArticlesJson() {
  const articlesJsonPath = join("mds", "articles.json");
  return JSON.parse(readFileSync(articlesJsonPath, "utf-8"));
}

const server = serve({
  port: process.env.NODE_ENV === "production" ? 5202 : 5201,
  routes: {
    // Serve index.html for all unmatched routes. 这样才能渲染前端的自定义404页面。设为 "/" 会返回HTTP状态码404
    "/*": index,
    "/api/allArticles": handleAllArticles,
    "/api/article/:aid": handleArticle,
  },
  // 开发配置
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

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

console.log('[bun-markdown-display] server is running at port', server.port);
