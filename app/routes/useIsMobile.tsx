import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mq.addListener(handleChange);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleChange);
      } else {
        mq.removeListener(handleChange);
      }
    };
  }, []);

  return isMobile;
}