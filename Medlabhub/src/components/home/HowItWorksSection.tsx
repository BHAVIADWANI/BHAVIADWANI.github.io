import { CheckCircle2, Microscope, FlaskConical, BarChart3, BrainCircuit, BookOpen, GraduationCap } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Choose Your Department",
    description: "Select from 7 clinical laboratory departments — Microbiology, Molecular Biology, Clinical Chemistry, Hematology, Immunology, Blood Bank, or Pathology.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Identify or Simulate",
    description: "Run organism identification with biochemical tests, or perform virtual experiments like Gram staining, DNA extraction, and PCR with real protocols.",
    icon: FlaskConical,
  },
  {
    step: "03",
    title: "Analyze & Interpret",
    description: "Get AI-powered results with AST analytics, QC chart interpretation, resistance detection, and multi-department diagnostic reasoning.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Ask the AI Assistant",
    description: "Use the 4-mode AI Lab Assistant to learn concepts, follow protocols, interpret results, or solve clinical cases — all with validated scientific references.",
    icon: BrainCircuit,
  },
  {
    step: "05",
    title: "Study & Export",
    description: "Review with quizzes and flashcards, save records, and export reports as PDF, Excel, or CSV for offline study and clinical documentation.",
    icon: GraduationCap,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">MicroID</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From department selection to AI-assisted analysis in five streamlined steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />

            <div className="space-y-10">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex gap-6 md:gap-8 items-start group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 z-10">
                      {step.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-success opacity-0 group-hover:opacity-100 transition-opacity hidden md:block mt-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
