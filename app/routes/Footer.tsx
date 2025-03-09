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

        {/* Social Icons */}
        <div className="flex space-x-4 mb-4">
          <a href="https://www.facebook.com/roger.trottier.50" target="_blank" className="text-white">
            <FaFacebook />
          </a>
          <a href="https://www.linkedin.com/in/roger-trottier-b63b7970/" target="_blank" className="text-white">
            <FaLinkedin />
          </a>
          <a href="https://github.com/rogertrottier" target="_blank" className="text-white">
            <FaGithub />
          </a>
        </div>

        {/* Legal Links */}
        <div className="text-sm">
          <a href="/legal-notice" className="hover:underline">2025 RogerT </a> |
          <a href="/privacy" className="hover:underline"> Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};
