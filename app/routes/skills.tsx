import React, { useState, useRef, useEffect } from "react";
import { SiReact, SiTailwindcss, SiMysql } from "react-icons/si";
import { DiDotnet } from "react-icons/di";
import { FaDatabase, FaCogs, FaCode } from "react-icons/fa";
import { PiGithubLogoLight, PiGitlabLogoLight } from "react-icons/pi";
import { SiDotnet } from "react-icons/si";

export function Skills() {
  const skills = [
    {
      name: "GitHub",
      icon: <PiGithubLogoLight />,
      description: "GitHub",
    },
    {
      name: "GitLab",
      icon: <PiGitlabLogoLight />,
      description: "GitLab",
    },
    {
      name: "JetBrains Rider",
      icon: <FaCogs />,
      description: "IDE for .NET development",
    },
    {
      name: "DataGrip",
      icon: <FaDatabase />,
      description: "Database management tool",
    },
    {
      name: "React",
      icon: <SiReact />,
      description: "Modern front-end library",
    },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss />,
      description: "Utility-first CSS framework",
    },
    {
      name: ".NET Core",
      icon: <SiDotnet />,
      description: "Robust web framework",
    },
    {
      name: "Blazor",
      icon: <SiDotnet />,
      description: "Web framework that allows for full stack development with C# and HTML",
    },
    {
      name:"Entity Framework",
      icon: <DiDotnet />,
      description: "A code first database development framework that translates models into database tables and maintains consitancy for Datastructures"
    },
    {
      name: "C#",
      icon: <FaCode />,
      description: "Versatile programming language",
    },
    {
      name: "MySQL",
      icon: <SiMysql />,
      description: "Relational database system",
    },
  ];

  return (
    <section className="p-8">
      <p className="text-center antialiased font-sans text-6xl font-bold mb-8">
        Expertise
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 flex flex-col items-center"
          >
            <div className="text-5xl text-blue-500">{skill.icon}</div>
            <h3 className="mt-4 text-xl font-semibold">{skill.name}</h3>
            <p className="text-sm text-gray-600 text-center">{skill.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}