import { useState, useEffect } from 'react';

// Modified to ensure more reliable mobile detection
const useResponsive = (query = '(max-width: 768px)') => {
  // ALWAYS default to true to ensure mobile view works properly
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    // Make sure window is defined (client-side)
    if (typeof window !== 'undefined') {
      const mediaQueryList = window.matchMedia(query);
      
      const listener = (event) => {
        setMatches(event.matches);
        console.log(`Screen matches ${query}: ${event.matches}`);
      };

      // Force immediate check and update
      setMatches(mediaQueryList.matches);
      console.log(`Initial screen size check: matches ${query}: ${mediaQueryList.matches}`);
      console.log(`Window width: ${window.innerWidth}px`);

      // Modern event listener
      try {
        mediaQueryList.addEventListener('change', listener);
      } catch (e) {
        // Fallback for older browsers
        mediaQueryList.addListener(listener);
      }

      return () => {
        try {
          mediaQueryList.removeEventListener('change', listener);
        } catch (e) {
          mediaQueryList.removeListener(listener);
        }
      };
    }
  }, [query]);

  return matches;
};

export default useResponsive; 