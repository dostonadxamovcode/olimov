import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollToSection';

export default function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      // Retries until the target mounts — sections like Mock Tests load lazily via Suspense.
      scrollToSection(hash.slice(1));
      return;
    }

    window.scrollTo(0, 0);
  }, [hash, pathname]);

  return null;
}
