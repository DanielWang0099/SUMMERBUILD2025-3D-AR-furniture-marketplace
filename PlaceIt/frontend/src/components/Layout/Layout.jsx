import {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [showScrollTop, setShowScrollTop]=useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY >300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to top when route changes (page navigation)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-8 right-8 z-50 bg-[#29d4c5] text-white p-3 rounded-full shadow-lg hover:bg-[#209aaa] transition-colors"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Layout;
