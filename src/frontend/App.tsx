import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import LayoutApp from './LayoutApp';

export function App() {
  return (
    <Router>
      <Toaster theme="dark" position="top-center" />
      <LayoutApp />
    </Router>
  );
}

export default App;
