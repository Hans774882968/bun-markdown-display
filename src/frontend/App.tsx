import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ArticleList } from './components/ArticleList';
import { Article } from './components/Article';
import { NotFound } from './components/NotFound';
import { Layout } from './components/Layout';
import './index.css';

export function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:aid" element={<Article />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
