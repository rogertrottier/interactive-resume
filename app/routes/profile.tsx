
export function Profile() {
  return (
    <div className="flex flex-col md:flex-row items-center w-full">
      {/* Profile Picture - Stacked on mobile, left on larger screens */}
      <div className="w-full md:w-1/3 h-auto md:h-full flex-shrink-0 image-container relative">
        {/* <img
          src="./Roger_Black_White_Alpha_Edit.png"
          className="w-full object-cover"
        /> */}
        <h1>Roger Trottier</h1>
        <h2>Full Stack Software Developer</h2>
        <p>A Playground of Ideas...</p>
        {/* <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent to-[#0a0a2a]"></div> */}
      </div>

      {/* Summary Text - Centered */}
      <div className="w-full md:w-2/3 flex justify-center items-center p-8">
        <p className="text-lg leading-relaxed max-w-2xl">
          Welcome to my digital portfolio! I'm Roger—a passionate software engineer who loves crafting innovative,
          interactive solutions. With extensive experience in full-stack development using .NET, Blazor, and more.
          I specialize in building dynamic user experiences and streamlining data architectures. This resume itself
          is a playground—built with React, Tailwind, GSAP and Three.js as a fun excuse to learn and experiment with new technologies.
          Dive in to see how I blend solid coding fundamentals with creative, modern tools to bring ideas to life.
        </p>
      </div>
    </div>
  );
}
