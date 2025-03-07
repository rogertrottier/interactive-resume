import React, { useState, useEffect } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  }));
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Hide the system cursor globally (though the global CSS should handle this)
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      // Check for an interactive element under the pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && element.closest('.interactive')) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = originalCursor;
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${hovered ? 'hovered' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    />
  );
};

export default CustomCursor;
