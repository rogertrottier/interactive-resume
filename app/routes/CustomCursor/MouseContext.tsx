import React, { createContext, useState, useEffect, useContext } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const initialMousePosition: MousePosition = typeof window !== 'undefined'
  ? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  : { x: 0, y: 0 };

const MouseContext = createContext<MousePosition>(initialMousePosition);

export const MouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<MousePosition>(initialMousePosition);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Avoid SSR issues
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <MouseContext.Provider value={position}>
      {children}
    </MouseContext.Provider>
  );
};

export const useMouse = () => useContext(MouseContext);
