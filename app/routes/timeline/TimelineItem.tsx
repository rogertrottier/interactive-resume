import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TimelineItemProps {
  alignment: "left" | "right";
  title: string;
  description: string;
  image: string;
  date: string;
}

export function TimelineItem({ alignment, title, description, image, date }: TimelineItemProps) {
  const itemRef = useRef(null);

  useEffect(() => {
    gsap.from(itemRef.current, {
      opacity: 0,
      x: alignment === "left" ? -100 : 100,
      duration: 1,
      scrollTrigger: {
        trigger: itemRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  }, [alignment]);

  return (
    <div ref={itemRef} className={`timeline-item ${alignment}`}>
      <div className="timeline-content">
        <h3>{title}</h3>
        <span>{date}</span>
        <p>{description}</p>
      </div>
      <div className="timeline-image">
        <img src={image} alt={title} />
      </div>
      <div className="timeline-marker"></div>
    </div>
  );
}