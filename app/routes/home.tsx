import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Hero } from "../routes/hero";
import { Profile } from "../routes/profile";
import { Experience } from "./experience";
import { Skills } from "./skills";
import { ThreeSceneBallCircling } from "./ThreeJsComponents/ThreeSceneBallCircling";
import { ThreeSceneParticlesSwirl } from "./ThreeJsComponents/ThreeSceneParticlesSwirl";
import { ThreeSceneFloatySwirl } from "./ThreeJsComponents/ThreeSceneFloatySwirl"
import { ThreeSceneShaderCloudy } from "./ThreeJsComponents/ThreeSceneShaderCloudy";
import CustomCursor from "~/routes/CustomCursor/CustomCursor";
import { useIsMobile } from './useIsMobile'; 

import "~/routes/CustomCursor/CustomCursor.css"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const isMobile = useIsMobile();

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
      {!isMobile && <CustomCursor />}
      {/* <Welcome /> */}
      {/* <Hero /> */}
      <div className="relative w-screen h-screen">
        {/* <ThreeSceneShaderCloudy /> */}
        <ThreeSceneFloatySwirl />
        <ThreeSceneFloatySwirl />
        <ThreeSceneFloatySwirl />
        <div className="flex justify-center items-center w-full min-h-screen bg-[#080b26]">
          <div className="relative w-full max-w-[1200px] p-8 bg-[#0d102e]/50 backdrop-blur-[0.4px] md:backdrop-blur-[1.5px] shadow-lg border border-[#1a1d40] rounded-lg">
            <Profile />
            <Experience />
            <Skills />
            {/* <Timeline items={items} /> */}
          </div>
        </div>
      </div>
    </>
  );
}

{/* <div className="flex justify-center items-center w-full min-h-screen bg-[#080b26]">
          <div className="relative w-full max-w-[1200px] p-8 bg-[#0d102e]/50 backdrop-blur-sm shadow-lg border border-[#1a1d40] rounded-lg">
            <Profile />
            <Experience />
            {/* <Timeline items={items} /> */}
//   </div> 
// </div> 
