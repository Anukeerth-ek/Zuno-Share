"use client"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ShimmerText } from "@/components/ui/shimmer-text";

const Hero = () => {
  const router = useRouter()
  const goToFindConnectionPage = () => {
    router.push('/frontend/find-connections')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 ">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10"></div>
      
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-2xl animate-pulse delay-700"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-foreground">Start Your Learning Journey</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <ShimmerText text="Connect, Learn, and Grow Together" />
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Find your perfect mentor or mentee. Share skills, exchange knowledge, and accelerate your career growth through meaningful connections.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={()=> goToFindConnectionPage()} size="lg" className=" cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button onClick={() => router.push('/about')} variant="outline" size="lg" className="border-border hover:bg-secondary hover:text-white px-8 py-6 text-lg rounded-xl transition-all hover:scale-105">
            Learn More
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <Users className="w-10 h-10 text-primary mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">10,000+</div>
            <div className="text-sm text-muted-foreground">Active Mentors</div>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <MessageSquare className="w-10 h-10 text-primary mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">50,000+</div>
            <div className="text-sm text-muted-foreground">Connections Made</div>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <TrendingUp className="w-10 h-10 text-primary mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;