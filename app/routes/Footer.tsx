import React from "react";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white py-6">
      <div className="container mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
          <a href="#">
            <h1>{'{ Roger · Trottier }'}</h1>
          </a>
        </div>

        {/* Contact Info */}
        <div className="text-sm flex space-x-4 mb-4">
          <span className="hover:underline">(253) 439-7862 </span> 
          <span> · </span>
          <span className="hover:underline"> RogerTrottier@gmail.com</span>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-4 mb-4">
          <a href="https://www.linkedin.com/in/roger-trottier-b63b7970/" target="_blank" className="text-white">
            <FaLinkedin className="text-3xl"/>
          </a>
          <a href="https://github.com/rogertrottier" target="_blank" className="text-white">
            <FaGithub className="text-3xl"/>
          </a>
        </div>

        {/* Legal Links */}
        <div className="text-sm">
          <span className="hover:underline">2025 RogerT </span> 
        </div>
      </div>
    </footer>
  );
};
