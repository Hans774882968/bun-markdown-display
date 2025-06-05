import { Routes, Route, useLocation } from 'react-router-dom';
import { ArticleList } from './components/ArticleList';
import { Article } from './components/article/Article';
import { NotFound } from './components/NotFound';
import { Layout } from './components/layout/Layout';
import './index.css';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import PixiLive2dDisplay from './components/PixiLive2dDisplay';
import UserManagement from './components/UserManagement';
import useRouteChange from './utils/useRouteChange';
import { useJwtTokenStore } from './stores/useJwtTokenStore';

export default function LayoutApp() {
  const location = useLocation();
  const { clearJwtTokenState, jwtToken } = useJwtTokenStore();

  useRouteChange(location, jwtToken || '', clearJwtTokenState);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/article/:aid" element={<Article />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/pixi-live2d-display-for-test" element={<PixiLive2dDisplay />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
