import './live2dcubismcore.js';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// TODO: 在组件里 import svg 不行，因为不知道怎么在开发/生产环境处理解析静态资源。在html里引用静态资源OK
function start() {
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
