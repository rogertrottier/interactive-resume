import React from "react";

interface Interest {
  title: string;
  description: string;
  link: string;
  img: string;
}

const interests: Interest[] = [
  {
    title: "The Book Of Shaders",
    description:
      "A comprehensive guide to shaders that inspires my work with Three.js and graphical UI effects.",
    link: "https://thebookofshaders.com/",
    img: "/Img/TheBookOfShadersWebsite.png",
  },
  {
    title: "Simondev.io",
    description:
      "A resource focused on game graphics rendering and modern UI techniques using Three.js.",
    link: "https://simondev.io/",
    img: "/Img/SimonDevWebsite.png",
  },
  {
    title: "Machine Learning (PyTorch)",
    description:
      "Just starting my journey into machine learning and neural networks to explore future possibilities.",
    link: "https://pytorch.org/",
    img: "/Img/PyTorchWebsite.png",
  },
];

export function Interests() {
  return (
    <section className="p-8 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-center text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Interests
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {interests.map((interest, index) => (
          <InterestCard key={index} interest={interest} />
        ))}
      </div>
    </section>
  );
}

function InterestCard({ interest }: { interest: Interest }) {
  return (
    <a
      href={interest.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {/* Add "group" here so hovering anywhere in the card triggers effects */}
      <div className="group rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800 w-64 h-100">
        {/* Image occupies the top half */}
        <div className="overflow-hidden h-1/2">
          <img
            src={interest.img}
            alt={interest.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* Text content occupies the bottom half */}
        <div className="p-4 h-1/2 flex flex-col justify-start">
          <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200">
            {interest.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-left mt-2">
            {interest.description}
          </p>
        </div>
      </div>
    </a>
  );
}

export default Interests;
