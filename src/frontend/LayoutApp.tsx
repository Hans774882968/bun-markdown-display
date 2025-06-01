import { Routes, Route } from 'react-router-dom';
import { ArticleList } from './components/ArticleList';
import { Article } from './components/article/Article';
import { NotFound } from './components/NotFound';
import { Layout } from './components/layout/Layout';
import './index.css';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import PixiLive2dDisplay from './components/PixiLive2dDisplay';

export default function LayoutApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/article/:aid" element={<Article />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/pixi-live2d-display-for-test" element={<PixiLive2dDisplay />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
