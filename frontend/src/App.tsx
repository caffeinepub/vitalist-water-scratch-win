import { useEffect, useState } from 'react';
import ScratchPage from './pages/ScratchPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (path === '/admin') {
    return <AdminPanel />;
  }
  return <ScratchPage />;
}
