import hljs from "highlight.js";
import { RendererObject } from "marked";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";

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

// Custom renderer for mermaid code blocks
const renderer: RendererObject = {
  code({ lang, text }) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${text}</div>`;
    }
    return false; // use default rendering
  }
};

marked.use({ renderer });

export { marked };
