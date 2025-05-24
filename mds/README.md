[TOC]

## 引言

bun尝鲜。

根据官方文档安装，然后“编辑系统环境变量”找到“admin的用户变量”的Path变量，把bun新增的路径改成`C:\bun\.bun\bin`（仅适用于我个人）。

## 初始化项目

命令：`bun init`。注意，和Vite不同，bun不会问你项目名，而package.json的name默认为“bun-react-template”，所以需要提前建好文件夹。

给 Cursor 的 Prompt：

> 请帮我实现 markdown 展示功能。
>
> 后端：
>
> 接口返回值规范：`Resp<T>: { code: number, msg: string, data: T }`。比如对于 404 的情况，不返回 HTTP 404，而是返回`{ code: 404, msg: 'not found', data: null }`。
>
> GET 接口/allArticles。无入参，返回 JSON：`Array<{ url: string, title: string }>`。
>
> GET 接口`/article/:aid`，获取单篇文章。aid 单调递增，初始值为 114514，每次增加 10 到 20。返回 JSON：`{ content: string, title: string }`。
>
> 为了实现方便，不使用 SQL，而是用 JSON 文件存储文章信息。该文件有 2 个字段，aid 和 title。获取单篇文章的接口读取该文件后，在项目根目录的/mds 文件夹下读取对应标题的 markdown 文件，作为返回值 JSON 的 content 字段。
>
> 前端：
>
> 首页：请求/allArticles，渲染出文章列表。每篇文章有一个 div，div 下有一个 a 标签。
>
> 具体文章：请求单篇文章的接口，接口返回 code: 404 则重定向到 404 页面，404 页面要告知用户，找不到的文章的 ID。否则渲染 markdown 文章为 HTML 并展示。markdown 文章的代码要用 highlight.js 实现高亮功能。
>
> 渲染 markdown 时注意防范 XSS。
>
> 修改 bun 项目配置，开发阶段前端运行在端口 5201，后端运行在端口 5202。如果 bun 项目的前后端默认跑在同一个端口，则都运行在 5201 端口。

生成的代码基本可用，但需要修些小问题。

### highlight.js生成的元素没有类名

`sanitize-html` 默认会过滤掉 `span` 的 `class` 属性，导致`highlight.js`生成的样式类名丢失。

```typescript
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
```

### 没看到prose类相关的样式

Tailwind CSS 4不再需要`tailwind.config.js`，可直接在CSS文件加一行`@plugin`。`src\index.css`新增：

```css
@plugin "@tailwindcss/typography";
```

## 体验感受

bun 热更新时会直接死掉：

```
panic(main thread): Segmentation fault at address 0x31CAE950140
oh no: Bun has crashed. This indicates a bug in Bun, not your code.

To send a redacted crash report to Bun's team,
please file a GitHub issue using the link below:
```

盲猜是我电脑的磁盘空间不够导致的。
