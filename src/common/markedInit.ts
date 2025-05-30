import hljs from 'highlight.js';
import { marked, RendererObject, Tokens } from 'marked';
import { markedHighlight } from 'marked-highlight';

const usedIds = new Set<string>();
function generateUniqueId(text: string) {
  let counter = 1;
  let id = `${text}-${counter}`;
  while (usedIds.has(id)) {
    counter++;
    id = `${text}-${counter}`;
  }
  usedIds.add(id);
  return id;
}

// 配置 marked 使用 marked-highlight 和 highlight.js
marked.use(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Custom renderer for mermaid code blocks
const wrapMermaidDivRenderer: RendererObject = {
  code({ lang, text }) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${text}</div>`;
    }
    return false; // use default rendering
  },
};

const addIdToHeadingRenderer: RendererObject = {
  heading({ text, depth }) {
    const id = generateUniqueId(text);
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  },
};

marked.use({ renderer: wrapMermaidDivRenderer });
marked.use({ renderer: addIdToHeadingRenderer });

// 提取标题结构
export const extractHeadings = (markdown: string) => {
  const tokens = marked.lexer(markdown);
  return tokens.filter(token => token.type === 'heading') as Array<Tokens.Heading>;
};

// 生成目录HTML
export const generateTOC = (headings: Array<Tokens.Heading>) => {
  if (headings.length === 0) return '';
  
  let tocHtml = '<div class="article-toc">\n<ul>\n';
  
  headings.forEach((heading) => {
    const { text, depth } = heading;
    const id = generateUniqueId(text);
    
    tocHtml += `<li class="toc-item toc-level-${depth}">`;
    tocHtml += `<a href="#${id}">${text}</a>`;
    tocHtml += '</li>\n';
  });

  tocHtml += '</ul>\n</div>';
  return tocHtml;
};

// 处理 [TOC] 标记入口
export const processTOC = (markdown: string) => {
  usedIds.clear();
  const headings = extractHeadings(markdown);
  const tocHtml = generateTOC(headings);
  usedIds.clear();
  return markdown.split('\n').map((ln) => {
    return ln.trim() === '[TOC]' || ln.trim() === '[toc]' ? tocHtml : ln;
  }).join('\n');
};

export { marked };
