import { ReactNode } from 'react';
import { FaGithub } from 'react-icons/fa';
import './Layout.css';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // TODO: footer 暂时不拆，为 MutationObserver 做准备
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout">
      <Navbar />
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
