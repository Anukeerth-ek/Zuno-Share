"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Zap, Shield } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700 -z-10"></div>

        <div className="max-w-6xl mx-auto">
           <Button 
            variant="ghost" 
            className="mb-8 hover:bg-transparent hover:text-primary p-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Empowering Growth Through <span className="text-primary">Shared Knowledge</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Skill Swap is a community-driven platform designed to connect learners and mentors. 
              We believe that everyone has something to teach and something to learn.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-foreground">Our Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Bridging the Gap in Professional Development</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Traditional mentorship can be hard to find and expensive. We&apos;re democratizing access to knowledge by creating a marketplace of skills where reputation and contribution matter more than credentials.
            </p>
            <ul className="space-y-4">
              {[
                "Democratize access to mentorship",
                "Foster a global community of learners",
                "Make skill exchange seamless and rewarding"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    ✓
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full"></div>
            <div className="relative bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">∞</div>
                  <div className="text-sm text-muted-foreground">Learning Possibilities</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">1-on-1</div>
                  <div className="text-sm text-muted-foreground">Personalized Mentorship</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Community Driven</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">Anytime</div>
                  <div className="text-sm text-muted-foreground">Global Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Skill Swap?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology and a focus on user experience, we provide the best environment for your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Community First",
                desc: "Join a vibrant community of like-minded individuals passionate about growth."
              },
              {
                icon: Zap,
                title: "Instant Connections",
                desc: "Find appropriate matches quickly with our smart matching algorithms."
              },
              {
                icon: Shield,
                title: "Verified Mentors",
                desc: "Learn from trusted experts with verified skills and community reviews."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
