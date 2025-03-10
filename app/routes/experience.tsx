import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

export function Experience() {
  const experiences = [
    {
      title: "Senior Software Engineer at Capital Benefit Group",
      description:
        "In my current role, I design and develop full-stack applications using .NET Core, Blazor, and managing the datastructure with Entity Framework. I optimize data architectures, integrate tools like Salesforce, manage deployment pipelines, and mentor new team members to ensure our solutions are scalable and efficient.",
    },
    {
      title: "Full-Stack Developer at Capital Benefit Services / EPK Benefits",
      description:
        "During my nearly eight-year tenure, I specialized in developing robust applications using ASP.Net MVC and C#. My work involved generating detailed reports with Crystal Reports, modernizing legacy systems from VBA to C#, and crafting dynamic online forms with PHP, jQuery, and Bootstrap—all while delivering reliable solutions for both clients and brokers.",
    },
    {
      title: "Software Developer at Prepared Response",
      description:
        "At Prepared Response, I contributed to enhancing Rapid Responder, an emergency management system critical to organizations nationwide. I developed features across the full stack—from MySQL database enhancements and web services in C# and VB to intuitive front-end interfaces using HTML, JavaScript, and jQuery—ensuring timely and actionable crisis data.",
    },
    {
      title: "Database Developer at Prepared Response",
      description:
        "I led a comprehensive migration project, transitioning databases from SQL to MySQL. This involved converting schemas, procedures, views, and data, which laid the foundation for improved performance and scalability in the company's primary products.",
    },
  ];

  // State to track the selected job
  const [selectedExperience, setSelectedExperience] = useState(experiences[0]);
  // Ref for the right panel container
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Animate the right panel when selected experience changes.
  useEffect(() => {
    if (rightPanelRef.current) {
      gsap.fromTo(
        rightPanelRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.4 }
      );
    }
  }, [selectedExperience]);

  return (
    <>
      <p className="text-center antialiased font-sans text-6xl font-bold mb-8">
        Experience
      </p>
      <div className="flex w-full flex-col md:flex-row">
        {/* Left Panel: Experience Titles */}
        <div className="md:w-1/3 text-white p-6 flex flex-col gap-4">
          {experiences.map((experience, index) => (
            <ExperienceButton
              key={index}
              experience={experience}
              selected={selectedExperience.title === experience.title}
              onClick={() => setSelectedExperience(experience)}
            />
          ))}
        </div>

        {/* Right Panel: Experience Details */}
        <div className="md:w-2/3 flex justify-center items-center p-8">
          <div ref={rightPanelRef} className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {selectedExperience.title}
            </h2>
            <p className="text-lg leading-relaxed">
              {selectedExperience.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

interface ExperienceButtonProps {
  experience: { title: string; description: string };
  selected: boolean;
  onClick: () => void;
}

function ExperienceButton({
  experience,
  selected,
  onClick,
}: ExperienceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`experience-button text-left p-3 transition-all duration-200 ${
        selected ? "selected" : "hover:bg-transparent"
      }`}
    >
      {experience.title}
    </button>
  );
}

export default Experience;
