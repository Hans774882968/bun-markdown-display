import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ArticleList } from './components/ArticleList';
import { Article } from './components/Article';
import { NotFound } from './components/NotFound';
import { Layout } from './components/layout/Layout';
import './index.css';
import { LoginForm } from './components/LoginForm';
import { Toaster } from 'sonner';
import { RegisterForm } from './components/RegisterForm';

export function App() {
  return (
    <Router>
      <Toaster theme="dark" position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:aid" element={<Article />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
