import React, { useState, useEffect, useCallback } from 'react';
import ScratchPage from './pages/ScratchPage';
import AdminPanel from './pages/AdminPanel';

type View = 'scratch' | 'admin';

export default function App() {
  const [view, setView] = useState<View>(() => {
    // On initial load, only show admin if already authenticated AND path is /admin
    if (window.location.pathname === '/admin') {
      return sessionStorage.getItem('vitalisAdminAuth') === 'true' ? 'admin' : 'scratch';
    }
    return 'scratch';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('vitalisAdminAuth') === 'true';
  });

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        const authed = sessionStorage.getItem('vitalisAdminAuth') === 'true';
        if (authed) {
          setIsAdminAuthenticated(true);
          setView('admin');
        } else {
          window.history.replaceState({}, '', '/');
          setView('scratch');
        }
      } else {
        setView('scratch');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Called by ScratchPage's AdminLoginModal onSuccess
  const handleAdminLoginSuccess = useCallback(() => {
    sessionStorage.setItem('vitalisAdminAuth', 'true');
    setIsAdminAuthenticated(true);
    setView('admin');
    window.history.pushState({}, '', '/admin');
  }, []);

  const handleAdminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('vitalisAdminAuth');
    sessionStorage.removeItem('caffeineAdminToken');
    setView('scratch');
    window.history.pushState({}, '', '/');
  }, []);

  if (view === 'admin' && isAdminAuthenticated) {
    return <AdminPanel onLogout={handleAdminLogout} />;
  }

  return <ScratchPage onAdminLoginSuccess={handleAdminLoginSuccess} />;
}
