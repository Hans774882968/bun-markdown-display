import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import LayoutApp from './LayoutApp';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Bun + React Markdown Display</title>
      </Helmet>
      <Router>
        <Toaster theme="dark" position="top-center" />
        <LayoutApp />
      </Router>
    </HelmetProvider>
  );
}

export default App;
