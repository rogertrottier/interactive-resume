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
        {/* Parallax Background Layers */}
        {["/OlympicSunsetMountains.png", "/OlympicSunsetSkySmall.png"].map((src, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el && !layersRef.current.includes(el)) {
                layersRef.current.push(el);
              }
            }}
            className="absolute inset-0 bg-cover bg-bottom"
            style={{
              backgroundImage: `url(${src})`,
              zIndex: 25 - index,
            }}
          />
        ))}

        {/* Hero Content */}
        <div className="relative z-10 flex items-start justify-center h-full text-white text-4xl">
          <div className="py-36 text-center w-4/5 md:w-full">A Playground of Ideas...</div>
        </div>
      </div>
    </div>
  );
}