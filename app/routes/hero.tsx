import { useEffect, useRef } from "react";

export function Hero() {
  const layersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Dynamically import GSAP only on the client
    import("gsap").then((gsap) => {
      import("gsap/dist/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.default.registerPlugin(ScrollTrigger);

        layersRef.current.forEach((layer, index) => {
          gsap.default.to(layer, {
            y: index * 1,
            scrollTrigger: {
              trigger: layer,
              start: "top bottom",
              scrub: true,
            },
          });
        });
      });
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex justify-center">
      {/* Container that adjusts width based on screen size */}
      <div className="w-full md:w-4/5 h-full relative">
        

        {/* Hero Content */}
        <div className="py-36 text-center w-4/5 md:w-full">
          <label className="block md:inline text-4xl">
            Crafting Code, Concepts, and Creativity
          </label>
          <br />
          {/* <label className="hidden md:inline text-4xl"> · </label> */}
          <label className="block md:inline text-4xl">
            Welcome to My Playground of Ideas.
          </label>
        </div>
      </div>
    </div>
  );
}