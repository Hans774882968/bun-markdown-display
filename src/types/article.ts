// 前端列表页使用的文章接口
export interface Article {
  url: string;
  title: string;
}

// 后端使用的文章接口
export interface ArticleInfo {
  aid: number;
  title: string;
}

// 文章内容接口
export interface ArticleContent {
  content: string;
  title: string;
} 