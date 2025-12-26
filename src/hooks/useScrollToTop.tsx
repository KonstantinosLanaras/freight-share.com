import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to scroll to top of page on route changes
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

/**
 * Component wrapper that scrolls to top on route changes
 * Use this in App.tsx to handle all routes
 */
export function ScrollToTop() {
  useScrollToTop();
  return null;
}
