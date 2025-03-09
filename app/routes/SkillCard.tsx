import React, { useRef, useState, useEffect } from "react";
import { useMouse } from "./CustomCursor/MouseContext"; // adjust path as needed

export interface Skill {
  name: string;
  icon: JSX.Element;
  description: string;
}

export function SkillCard({ skill }: { skill: Skill }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fixed card dimensions for consistency.
  const cardWidth = 200;
  const cardHeight = 210;

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Calculate distance from the mouse to the card.
      let dx = 0, dy = 0;
      if (mouse.x < rect.left) {
        dx = rect.left - mouse.x;
      } else if (mouse.x > rect.right) {
        dx = mouse.x - rect.right;
      }
      if (mouse.y < rect.top) {
        dy = rect.top - mouse.y;
      } else if (mouse.y > rect.bottom) {
        dy = mouse.y - rect.bottom;
      }
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = 200; // start glow within 200px
      const intensity = Math.max(0, Math.min(1, 1 - distance / threshold));
      setGlowIntensity(intensity);
      // Also update the CSS variable on this card.
      ref.current.style.setProperty("--glow-intensity", intensity.toString());
    }
  }, [mouse]);

  return (
    <div
      ref={ref}
      className={`skill-card p-4 rounded-lg shadow-md transition-all duration-300 flex flex-col items-center ${isHovered ? "hover" : ""}`}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-5xl text-blue-500">{skill.icon}</div>
      <h3 className="mt-4 text-xl font-semibold">{skill.name}</h3>
      <p className="text-sm text-gray-600 text-center">{skill.description}</p>
    </div>
  );
}
