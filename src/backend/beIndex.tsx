import { serve } from 'bun';
import { handleLogin } from './login';
import { handleLogout } from './logout';
import { handleArticle, handleAllArticles } from './articles';
import index from '@/index.html';
import { handleRegister } from './register';
import { handleIsAdmin } from './user/isAdmin';
import { routeAllowOnlyPost } from './utils/routeAllowOnlyPost';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 5202 : 5201;

const server = serve({
  port: PORT,
  routes: {
    // Serve index.html for all unmatched routes. 这样才能渲染前端的自定义404页面。设为 "/" 会返回HTTP状态码404
    '/*': index,
    '/api/allArticles': handleAllArticles,
    '/api/article/:aid': handleArticle,
    '/api/login': routeAllowOnlyPost(handleLogin),
    '/api/logout': routeAllowOnlyPost(handleLogout),
    '/api/register': routeAllowOnlyPost(handleRegister),
    '/api/user/isAdmin': handleIsAdmin,
  },
  // 开发配置
  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log('[bun-markdown-display] server is running at port', server.port);
