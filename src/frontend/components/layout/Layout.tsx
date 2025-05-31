import { ReactNode } from 'react';
import { FaGithub } from 'react-icons/fa';
import './Layout.css';
import Navbar from './Navbar';
import useLive2dHook from '@/frontend/hooks/useLive2dHook';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { live2dCanvasRef } = useLive2dHook();

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
      <canvas ref={live2dCanvasRef} style={{ position: 'fixed' }} />
    </div>
  );
}
