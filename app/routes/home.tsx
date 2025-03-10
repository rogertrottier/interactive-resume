import React from 'react';
import ReactDOM from 'react-dom/client';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Hero } from "../routes/hero";
import { Profile } from "../routes/profile";
import { Experience } from "./experience";
import { Skills } from "./Skills";
import { Interests } from "./Interests"
import { Footer } from "./Footer";
import { ThreeSceneBallCircling } from "./ThreeJsComponents/ThreeSceneBallCircling";
import { ThreeSceneParticlesSwirl } from "./ThreeJsComponents/ThreeSceneParticlesSwirl";
import { ThreeSceneFloatySwirl } from "./ThreeJsComponents/ThreeSceneFloatySwirl"
import { ThreeSceneShaderCloudy } from "./ThreeJsComponents/ThreeSceneShaderCloudy";
import { ThreeSceneFloatyModelSwirl } from "./ThreeJsComponents/ThreeSceneFloatyModelSwirl";
import { ThreeSceneFluidSimulation } from "./ThreeJsComponents/ThreeSceneFluidSimulation"
import { ThreeSceneFloatySineWave } from "./ThreeJsComponents/ThreeSceneFloatySineWave"
import CustomCursor from "~/routes/CustomCursor/CustomCursor";
import { MouseProvider } from "~/routes/CustomCursor/MouseContext"
import { useIsMobile } from './useIsMobile';

import "~/routes/CustomCursor/CustomCursor.css"
import FadeOverlay from "./ThreeJsComponents/ThreeSceneFadeOverlay";
import { GpuWaveScene } from './ThreeJsComponents/GPURender/GpuScene';

export default function Home() {
  const resumeProfile = {
    heroImg: './public/OlympicSunset.png',
    fullProfileImg: './public/Roger_Black_White_Alpha.png',
    user: {
      name: 'Roger Trottier',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQHqWJPEfKpJfA/profile-displayphoto-shrink_200_200/B4EZVKFxEHGYAY-/0/1740704780886?e=1746057600&v=beta&t=yjbvVPc_s6zjIo4Va-MDvK5x1xFAdwvq38pjaXWUaw8',
      imageSize: 90,
    }
  };

  const items = [
    {
      title: "Bachelor's Degree in Computer Science and Systems",
      institution: "University of Washington",
      description: "Final two years completed at UW following initial studies at various community colleges. Focused on Java, C, foundational algorithms, and data structures, with a structured approach to version control using a waterfall methodology.",
      period: "2008 - 2013",
      image: "https://www.tacoma.uw.edu/sites/default/files/2022-09/homepage-campus-725x500.jpg",
      date: "2013"
    },
    {
      title: "Software Developer",
      institution: "Prepared Response",
      description: "",
      period: "2013 - 2015",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Armstrong_Ambulance_P17.jpg",
      date: "2014"
    }
  ]

  return (
    <>
      <React.StrictMode>
        <MouseProvider>
          {!useIsMobile() && <CustomCursor />}
          {/* <Welcome /> */}
          <div className="relative w-screen h-screen min-h-screen text-[#cbccd0] bg-gradient-to-br from-indigo-950 to-black-1000 bg-opacity-25">
            {/* <ThreeSceneFloatySwirl /> */}
            <ThreeSceneFloatySineWave count={(useIsMobile() ? 1500 : 3000)} particleWidth={(useIsMobile() ? 25 : 50)} />
            {/* <ThreeSceneFloatyModelSwirl modelPath="/models/Duck.glb" modelScale={60 * (isMobile ? 0.5 : 1)} hasLighting={false} />
            <ThreeSceneFloatyModelSwirl modelPath="/models/Keyboard.glb" modelScale={10 * (isMobile ? 0.5 : 1)} hasLighting={true}/> */}
            {/* <ThreeSceneFluidSimulation /> */}
            {/* <GpuWaveScene /> */}
            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px]">
                <Hero isMobile={useIsMobile()}/>
              </div>
            </div>

            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.1px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
                <Profile />
              </div>
            </div>
            <br />
            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.1px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
                <Experience />
              </div>
            </div>
            <br />
            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.1px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
                <Skills />
              </div>
            </div>
            <br />
            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.1px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
                <Interests />
              </div>
            </div>

            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="relative w-full max-w-[1000px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.1px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
                <Footer />
              </div>
            </div>
          </div>
        </MouseProvider>
      </React.StrictMode >
    </>
  );
}
