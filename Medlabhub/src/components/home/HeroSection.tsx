import { ArrowRight, Microscope, BrainCircuit, Sparkles, FlaskConical, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 scientific-grid opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-destructive/5 rounded-full blur-3xl animate-pulse-slow" />

      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI-Powered Clinical Laboratory Intelligence
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            Your Complete
            <br />
            <span className="gradient-text">Lab Science Platform</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            Identify microorganisms, simulate experiments, interpret results, and learn across 7 clinical laboratory departments — powered by AI and validated scientific protocols.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
            <Link to="/identify">
              <Button variant="hero" size="xl" className="group">
                <Microscope className="h-5 w-5" />
                Start Identification
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/ai-tutor">
              <Button variant="outline" size="xl" className="group">
                <BrainCircuit className="h-5 w-5" />
                AI Lab Assistant
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in">
            {[
              { value: "500+", label: "Organisms" },
              { value: "7", label: "Departments" },
              { value: "3", label: "Virtual Lab Sims" },
              { value: "AI", label: "Lab Assistant" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/4 animate-float">
        <div className="w-16 h-16 rounded-2xl bg-card shadow-xl flex items-center justify-center border border-border/50">
          <Microscope className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="absolute top-32 right-1/6 animate-float" style={{ animationDelay: "1s" }}>
        <div className="w-12 h-12 rounded-xl bg-card shadow-lg flex items-center justify-center border border-border/50">
          <FlaskConical className="h-6 w-6 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-14 h-14 rounded-2xl bg-card shadow-lg flex items-center justify-center border border-border/50">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
      </div>
    </section>
  );
}
