import { Link, useLocation } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import { SiMarkdown } from 'react-icons/si';
import './Navbar.css';
import { UserStatus } from './UserStatus';
import { useJwtTokenStore } from '@/frontend/stores/useJwtTokenStore';

export default function Navbar() {
  const location = useLocation();
  const { isAdmin } = useJwtTokenStore();

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
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <SiMarkdown size={24} />
            <strong>Markdown文章展示</strong>
          </Link>
          {getBreadcrumb()}
        </div>
        <div className="nav-middle flex-1 px-12 flex gap-8">
          <Link to="/pixi-live2d-display-for-test">
            <strong>Live2d测试页</strong>
          </Link>
          {
            isAdmin && (
              <Link to="/user-management">
                <strong>用户管理</strong>
              </Link>
            )
          }
        </div>
        <div className="nav-right">
          <UserStatus />
          <a
            href="https://github.com/Hans774882968/bun-markdown-display"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </nav>
  );
}
