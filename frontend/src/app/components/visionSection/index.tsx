import { Sparkles, Heart, Globe } from "lucide-react";

const visionPoints = [
  {
    icon: Heart,
    title: "Human-First",
    description: "Technology that brings people together, not keeps them scrolling.",
  },
  {
    icon: Globe,
    title: "Globally Connected",
    description: "Bridge distances and cultures through meaningful exchanges.",
  },
  {
    icon: Sparkles,
    title: "Authentically You",
    description: "Be yourself. Find people who appreciate the real you.",
  },
];

const VisionSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Vision Statement */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Our Vision
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-8 leading-tight">
              A World Where{" "}
              <span className="text-gradient">Everyone Belongs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We envision a future where technology amplifies human connection instead of replacing it. 
              Where finding your tribe is just a conversation away.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="glass-card rounded-3xl p-8 md:p-12 mb-16 relative glow-border">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center pt-6">
              <h3 className="text-2xl font-bold font-display text-foreground mb-4">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                To create the most authentic peer-to-peer connection platform that helps people 
                discover meaningful relationships based on shared interests, values, and goals.
              </p>
            </div>
          </div>

          {/* Vision Points */}
          <div className="grid md:grid-cols-3 gap-6">
            {visionPoints.map((point, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 text-center group hover:bg-card/80 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <point.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-lg font-bold font-display text-foreground mb-2">
                  {point.title}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
