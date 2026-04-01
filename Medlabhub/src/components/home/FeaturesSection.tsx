import { 
  Microscope, 
  Database, 
  BarChart3, 
  BookOpen, 
  Dna, 
  BrainCircuit,
  GitCompare,
  Layers,
  FlaskConical,
  FileText,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Microscope,
    title: "Smart Identification",
    description: "Enter Gram stain, morphology, biochemical tests, and resistance patterns. AI matches against 500+ organisms across bacteria, fungi, viruses, and archaea.",
    href: "/identify",
  },
  {
    icon: BrainCircuit,
    title: "AI Lab Assistant",
    description: "4-mode intelligent assistant — concept tutor, lab mentor, result interpreter, and diagnostic reasoning engine powered by validated sources.",
    href: "/ai-tutor",
  },
  {
    icon: FlaskConical,
    title: "Virtual Lab Simulator",
    description: "Interactive Gram staining, DNA extraction, and PCR experiments with real reagents, animated equipment, timers, and mistake detection.",
    href: "/molecular",
  },
  {
    icon: BarChart3,
    title: "AST Advanced Analytics",
    description: "Cumulative antibiograms, MDR/XDR/PDR detection, resistance heatmaps, scatter plots, and trend analysis with CLSI/EUCAST interpretation.",
    href: "/ast",
  },
  {
    icon: BookOpen,
    title: "Organism Database",
    description: "Browse 500+ detailed profiles — bacteria, fungi, viruses, archaea, and protozoa with molecular data, resistance patterns, and clinical significance.",
    href: "/database",
  },
  {
    icon: GitCompare,
    title: "Organism Comparison",
    description: "Compare organisms side-by-side across morphology, biochemistry, resistance, treatment, and molecular characteristics.",
    href: "/compare",
  },
  {
    icon: GraduationCap,
    title: "Quiz & Flashcards",
    description: "Department-specific quizzes and spaced repetition flashcards covering microbiology, hematology, chemistry, and more.",
    href: "/quiz",
  },
  {
    icon: Wrench,
    title: "Lab Instruments Encyclopedia",
    description: "Department-wise catalog of instruments with validated principles, parts tables, real images, manufacturer data, and applications.",
    href: "/molecular",
  },
  {
    icon: Dna,
    title: "Molecular Analysis Tools",
    description: "FASTA sequence analyzer, resistance gene detector, and molecular biology simulations with gel electrophoresis visualization.",
    href: "/molecular",
  },
  {
    icon: FileText,
    title: "QC Charts & Westgard",
    description: "Interactive Levey-Jennings charts, automated Westgard multi-rule analysis, and real-world Godkar textbook examples with Indian ICMR ranges.",
    href: "/clinical-chemistry",
  },
  {
    icon: Layers,
    title: "Record Management",
    description: "Save identification records with patient data, AST results, and clinical notes. Export as PDF, Excel, or CSV with embedded charts.",
    href: "/records",
  },
  {
    icon: Database,
    title: "Multi-Format Export",
    description: "Download organism profiles, AST reports, and analytics as PDF study sheets, Excel workbooks, or CSV datasets for offline use.",
    href: "/database",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for
            <span className="gradient-text"> Laboratory Science</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete AI-powered platform for students, researchers, and laboratory professionals across all departments
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <Link key={i} to={feature.href} className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
