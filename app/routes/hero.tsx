import { useEffect, useRef } from "react";
import gsap from "gsap";

type HeroProp = {
  isMobile: boolean;
}

export function Hero({
  isMobile,
}: HeroProp) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      // Select all spans with class "char" within the heroRef.
      const chars = heroRef.current.querySelectorAll(".char");
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.05, ease: "back.out(1.7)" }
      );
    }
  }, []);

  // Helper function to split a string into span-wrapped characters, preserving spaces.
  const splitText = (text: string) =>
    text.split("").map((char, index) => (
      <span key={index} className="char inline-block">
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  return (
    <div className="relative w-screen h-screen overflow-hidden flex justify-left items-center">
      <div className="w-full md:w-4/5 h-full relative">
        {/* Hero Content */}
        <div className="py-36 text-left w-full" ref={heroRef}>
          <div className={`${isMobile ? "text-4xl" : "text-6xl"} font-bold`}>
            {splitText("Crafting Code, ")}
          </div>
          <div className={`${isMobile ? "text-4xl" : "text-6xl"} font-bold`}>
            {splitText("Concepts, ")}
          </div>
          <div className={`${isMobile ? "text-4xl" : "text-6xl"} font-bold`}>
            {splitText("and Creativity")}
          </div>
          <br />
          <div className={`${isMobile ? "text-1xl" : "text-4xl"} font-bold`}>
            {"Welcome to My Playground of Ideas."}
          </div>
        </div>
      </div>
    </div>
  );
}
