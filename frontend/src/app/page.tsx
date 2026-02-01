import dynamic from "next/dynamic";
import Hero from "./components/HomeSections/Hero";
import Features from "./components/HomeSections/Features";

// ✅ Lazy load components below the fold
const HowItWorks = dynamic(() => import("./components/HomeSections/HowItWorks"));
const Footer = dynamic(() => import("./components/HomeSections/Footer"));
const HomeCTA = dynamic(() => import("./components/HomeSections/HomeCTA"));
const ProblemSolutionSection = dynamic(() => import("./components/problemSolution"));
const VisionSection = dynamic(() => import("./components/visionSection"));
const FAQSection = dynamic(() => import("./components/faq"));

export default function Home() {

     return (
          <div className="min-h-screen bg-gray-900">
               <Hero />
               <Features />
               <ProblemSolutionSection/>
               <HowItWorks />
               <VisionSection/>
               <FAQSection/>
               <HomeCTA />
               <Footer />
          </div>
     );
}
