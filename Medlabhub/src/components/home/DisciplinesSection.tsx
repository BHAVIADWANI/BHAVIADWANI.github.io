import { 
  Microscope, 
  Dna, 
  FlaskConical, 
  Droplets, 
  Shield, 
  Heart, 
  Search,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const disciplines = [
  {
    icon: Microscope,
    title: "Microbiology",
    description: "Bacterial, fungal, viral & archaeal identification. Gram staining, culture techniques, biochemical testing, AST analysis with CLSI/EUCAST standards.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
    href: "/identify",
    tags: ["500+ Organisms", "AST Analytics", "Virtual Gram Stain"],
  },
  {
    icon: Dna,
    title: "Molecular Biology & Genetics",
    description: "Interactive PCR simulation, DNA extraction protocols, gel electrophoresis visualization, FASTA analysis, and resistance gene detection.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    href: "/molecular",
    tags: ["PCR Simulator", "Gel Electrophoresis", "Lab Instruments"],
  },
  {
    icon: FlaskConical,
    title: "Clinical Chemistry",
    description: "Metabolic panels, liver & renal function tests, Levey-Jennings QC charts, Westgard multi-rule analysis, and Indian reference ranges (ICMR/NABL).",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
    href: "/clinical-chemistry",
    tags: ["QC Interpreter", "Westgard Rules", "Godkar Examples"],
  },
  {
    icon: Droplets,
    title: "Hematology",
    description: "CBC analysis, peripheral blood smear interpretation, coagulation studies (PT, aPTT, INR), hemoglobin electrophoresis, and leukemia classification.",
    color: "from-red-500/20 to-red-600/5",
    iconColor: "text-red-500",
    href: "/hematology",
    tags: ["CBC Parameters", "Coagulation", "Cell Morphology"],
  },
  {
    icon: Shield,
    title: "Immunology / Serology",
    description: "ELISA techniques, immunofluorescence, complement system, hypersensitivity reactions, autoimmune markers, and tumor marker panels.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-500",
    href: "/immunology",
    tags: ["ELISA", "Autoimmune Panels", "Tumor Markers"],
  },
  {
    icon: Heart,
    title: "Blood Bank (Immunohematology)",
    description: "ABO/Rh typing, crossmatch procedures, antibody screening & identification, transfusion reactions, HDFN, and component therapy protocols.",
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-500",
    href: "/blood-bank",
    tags: ["ABO/Rh Typing", "Crossmatch", "Transfusion"],
  },
  {
    icon: Search,
    title: "Pathology (Histopathology / Cytology)",
    description: "Tissue processing, H&E and special staining, IHC markers, Pap smear grading, surgical pathology, and biopsy evaluation techniques.",
    color: "from-teal-500/20 to-teal-600/5",
    iconColor: "text-teal-500",
    href: "/pathology",
    tags: ["Staining", "IHC Markers", "Cytology"],
  },
];

export function DisciplinesSection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            7 Laboratory <span className="gradient-text">Departments</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools, simulations, and validated data across every clinical laboratory science discipline
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {disciplines.map((d, i) => (
            <Link key={i} to={d.href} className="block">
              <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${d.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <CardContent className="relative p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center ${d.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <d.icon className="h-7 w-7" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    {d.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
