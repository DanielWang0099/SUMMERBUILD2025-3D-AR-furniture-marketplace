import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const useSmoothNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const smoothNavigate = (path, options = {}) => {
    const { requireAuth = true, scrollToTop = true } = options;
    
    // If authentication is required and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      handleAuthRedirect();
      return;
    }

    // For authenticated users or routes that don't require auth, navigate smoothly
    if (scrollToTop && !prefersReducedMotion) {
      // Add a brief fade-out effect before navigation
      document.body.style.opacity = '0.95';
      document.body.style.transition = 'opacity 0.15s ease-out';
      
      setTimeout(() => {
        navigate(path);
        // Reset scroll position instantly after navigation
        window.scrollTo(0, 0);
        
        // Fade back in
        setTimeout(() => {
          document.body.style.opacity = '1';
          document.body.style.transition = 'opacity 0.3s ease-in';
          
          // Clean up styles after transition
          setTimeout(() => {
            document.body.style.opacity = '';
            document.body.style.transition = '';
          }, 300);
        }, 50);
      }, 150);
    } else {
      // Instant navigation for reduced motion users
      navigate(path);
      if (scrollToTop) {
        window.scrollTo(0, 0);
      }
    }
  };

  const handleAuthRedirect = () => {
    // Smooth scroll to top before redirecting to login
    const currentScrollY = window.scrollY;
    
    if (currentScrollY <= 100 || prefersReducedMotion) {
      // Already near top or reduced motion preferred, navigate immediately
      if (!prefersReducedMotion) {
        document.body.style.opacity = '0.95';
        document.body.style.transition = 'opacity 0.15s ease-out';
      }
      
      setTimeout(() => {
        navigate('/login');
        window.scrollTo(0, 0);
        
        if (!prefersReducedMotion) {
          setTimeout(() => {
            document.body.style.opacity = '1';
            document.body.style.transition = 'opacity 0.3s ease-in';
            
            setTimeout(() => {
              document.body.style.opacity = '';
              document.body.style.transition = '';
            }, 300);
          }, 50);
        }
      }, prefersReducedMotion ? 0 : 150);
    } else {
      // Smooth scroll to top first, then navigate
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Calculate timing based on scroll distance for smooth experience
      const scrollDistance = currentScrollY;
      const scrollDuration = Math.min(Math.max(scrollDistance / 3, 300), 800);
      
      setTimeout(() => {
        document.body.style.opacity = '0.95';
        document.body.style.transition = 'opacity 0.15s ease-out';
        
        setTimeout(() => {
          navigate('/login');
          window.scrollTo(0, 0);
          
          setTimeout(() => {
            document.body.style.opacity = '1';
            document.body.style.transition = 'opacity 0.3s ease-in';
            
            setTimeout(() => {
              document.body.style.opacity = '';
              document.body.style.transition = '';
            }, 300);
          }, 50);
        }, 150);
      }, scrollDuration);
    }
  };

  return { smoothNavigate };
};
