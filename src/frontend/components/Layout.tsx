import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiMarkdown } from 'react-icons/si';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const getBreadcrumb = () => {
    if (location.pathname === '/') return null;
    if (location.pathname.startsWith('/article/')) {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-separator">&gt;</span>
          <span>文章</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="nav-left">
            <Link to="/" className="nav-brand">
              <SiMarkdown size={24} />
              <strong>Markdown文章展示</strong>
            </Link>
            {getBreadcrumb()}
          </div>
          <a
            href="https://github.com/Hans774882968/bun-markdown-display"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>Made with ❤ in {currentYear} by</p>
          <p className="author-link">
            <FaGithub size={20} />
            <a
              href="https://github.com/Hans774882968"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Hans</strong>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
