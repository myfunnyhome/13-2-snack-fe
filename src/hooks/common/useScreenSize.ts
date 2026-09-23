'use client';

import { useEffect, useState } from 'react';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('mobile');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 744) {
        setScreenSize('mobile');
      } else if (width < 1440) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
}
