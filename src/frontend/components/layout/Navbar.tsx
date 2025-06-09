import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaGithub, FaRobot, FaUserCog } from 'react-icons/fa';
import { SiMarkdown } from 'react-icons/si';
import './Navbar.css';
import { UserStatus } from './UserStatus';
import { useJwtTokenStore } from '@/frontend/stores/useJwtTokenStore';
import NavbarMenu from './NavbarMenu';

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
          <NavbarMenu
            btn={
              <strong>Live2D 测试页</strong>
            }
            links={
              [
                {
                  href: '/pixi-live2d-display-for-test',
                  icon: <FaRobot size={16} />,
                  label: 'pixi-live2d-display',
                },
                {
                  href: '/oh-my-live2d-for-test',
                  icon: <FaRobot size={16} />,
                  label: 'oh-my-live2d',
                },
              ]
            }
            menuItemsClasses="w-48"
          />
          {
            isAdmin && (
              <NavbarMenu
                btn={
                  <strong>管理页</strong>
                }
                links={
                  [
                    {
                      href: '/user-management',
                      icon: <FaUserCog size={16} />,
                      label: '用户管理',
                    },
                    {
                      href: '/article-management',
                      icon: <FaBook size={16} />,
                      label: '文章管理',
                    },
                  ]
                }
                menuItemsClasses="w-26"
              />
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
