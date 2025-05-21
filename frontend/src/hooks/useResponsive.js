import { useState, useEffect } from 'react';

const useResponsive = (query = '(max-width: 768px)') => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    setMatches(mediaQueryList.matches); // Initial check

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export default useResponsive; 