import React from "react";
import { TimelineItem } from "./timelineItem";
import "./timeline.css"; // Contains styles for timeline path, markers, etc.

interface TimelineItemData {
  alignment: "left" | "right";
  title: string;
  description: string;
  image: string;
  date: string;
}

interface TimelineProps {
  items: TimelineItemData[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="timeline-container">
      <div className="timeline-line"></div>
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          alignment={index % 2 === 0 ? "left" : "right"}
          title={item.title}
          description={item.description}
          image={item.image}
          date={item.date}
        />
      ))}
    </div>
  );
}