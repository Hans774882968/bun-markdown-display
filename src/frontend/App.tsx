import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArticleList } from "./components/ArticleList";
import { Article } from "./components/Article";
import { NotFound } from "./components/NotFound";
import "./index.css";

export function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:aid" element={<Article />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
