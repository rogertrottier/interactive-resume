import React, { useState, useEffect } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setPosition({ x: clientX, y: clientY });

      // Check for an interactive element under the cursor
      const element = document.elementFromPoint(clientX, clientY);
      if (element && element.closest('.interactive')) {
        setIsInteractive(true);
      } else {
        setIsInteractive(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`custom-cursor ${isInteractive ? 'hovered' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="line top"></div>
      <div className="line bottom"></div>
      <div className="line left"></div>
      <div className="line right"></div>
    </div>
  );
};

export default CustomCursor;
