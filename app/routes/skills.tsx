import React from "react";
import { PiGithubLogoLight, PiGitlabLogoLight } from "react-icons/pi";
import { FaCogs, FaDatabase, FaCode } from "react-icons/fa";
import { DiDotnet } from "react-icons/di";
import { SiMysql, SiDotnet } from "react-icons/si";
import { SkillCard } from "./SkillCard"; // adjust path as needed
import type { Skill } from "./SkillCard";
import "./skills.css"

const skills: Skill[] = [
  { name: "GitHub", icon: <PiGithubLogoLight />, description: "GitHub" },
  { name: "JetBrains Rider", icon: <FaCogs />, description: "IDE for .NET development" },
  { name: "DataGrip", icon: <FaDatabase />, description: "Database management tool" },
  { name: ".NET Core", icon: <SiDotnet />, description: "Robust web framework" },
  { name: "Blazor", icon: <SiDotnet />, description: "Full stack development with C# and HTML" },
  { name: "Entity Framework", icon: <DiDotnet />, description: "Code-first database framework" },
  { name: "C#", icon: <FaCode />, description: "Versatile programming language" },
  { name: "MySQL", icon: <SiMysql />, description: "Relational database system" },
];

export function Skills() {
  return (
    <section className="p-8">
      <p className="text-center antialiased font-sans text-6xl font-bold mb-8">
        Expertise
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {skills.map((skill, index) => (
          <SkillCard key={index} skill={skill} />
        ))}
      </div>
    </section>
  );
}
