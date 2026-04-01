import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  FlaskConical, Microscope, Beaker, TestTube, Dna, Droplets, Heart,
  Bug, ArrowLeft, GraduationCap, Target, Shield
} from "lucide-react";
import { AcidFastStaining3D } from "@/components/biolab/AcidFastStaining3D";
import { ELISASimulator3D } from "@/components/biolab/ELISASimulator3D";
import { PCRSimulator3D } from "@/components/biolab/PCRSimulator3D";
import { BloodGrouping3D } from "@/components/biolab/BloodGrouping3D";
import { GramStain3DSimulator } from "@/components/virtual-lab/GramStain3DSimulator";
import { HemoglobinEstimation3D } from "@/components/biolab/HemoglobinEstimation3D";
import { HEStaining3D } from "@/components/biolab/HEStaining3D";
import { DNAExtraction3D } from "@/components/biolab/DNAExtraction3D";
import { CulturePlating3D } from "@/components/biolab/CulturePlating3D";
import { ASTSimulator3D } from "@/components/biolab/ASTSimulator3D";
import { RBCCount3D } from "@/components/biolab/RBCCount3D";
import { BloodGlucose3D } from "@/components/biolab/BloodGlucose3D";
import { Agglutination3D } from "@/components/biolab/Agglutination3D";
import { CrossMatching3D } from "@/components/biolab/CrossMatching3D";

interface Experiment {
  id: string;
  title: string;
  department: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  references: string[];
  available: boolean;
}

const departments = [
  { id: "all", label: "All Departments", icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { id: "micro", label: "Microbiology", icon: <Bug className="h-3.5 w-3.5" /> },
  { id: "hema", label: "Hematology", icon: <Droplets className="h-3.5 w-3.5" /> },
  { id: "biochem", label: "Biochemistry", icon: <Beaker className="h-3.5 w-3.5" /> },
  { id: "histo", label: "Histopathology", icon: <Microscope className="h-3.5 w-3.5" /> },
  { id: "immuno", label: "Immunology", icon: <Shield className="h-3.5 w-3.5" /> },
  { id: "molecular", label: "Molecular Biology", icon: <Dna className="h-3.5 w-3.5" /> },
  { id: "bloodbank", label: "Blood Bank", icon: <Heart className="h-3.5 w-3.5" /> },
];

const experiments: Experiment[] = [
  { id: "gram-stain", title: "Gram Staining", department: "micro", icon: <FlaskConical className="h-5 w-5" />, difficulty: "Beginner", duration: "15–20 min", description: "Differentiate Gram-positive and Gram-negative bacteria using crystal violet, iodine, decolorizer, and safranin.", references: ["Cappuccino & Welsh", "CLSI"], available: true },
  { id: "acid-fast", title: "Acid-Fast Staining (ZN)", department: "micro", icon: <FlaskConical className="h-5 w-5" />, difficulty: "Intermediate", duration: "20–25 min", description: "Ziehl-Neelsen method to detect acid-fast bacilli (Mycobacterium tuberculosis) using carbol fuchsin, acid-alcohol, and methylene blue.", references: ["WHO TB Lab Manual", "Cappuccino & Welsh"], available: true },
  { id: "culture-plating", title: "Bacterial Culture Plating", department: "micro", icon: <Bug className="h-5 w-5" />, difficulty: "Beginner", duration: "15–20 min", description: "Streak plate technique for bacterial isolation on agar media using four-quadrant method with Bunsen burner sterilization.", references: ["Cappuccino & Welsh", "CLSI"], available: true },
  { id: "ast", title: "Antibiotic Susceptibility Testing", department: "micro", icon: <Target className="h-5 w-5" />, difficulty: "Intermediate", duration: "20–25 min", description: "Kirby-Bauer disk diffusion method on Mueller-Hinton agar with CLSI M100 breakpoint interpretation.", references: ["CLSI M100", "WHO"], available: true },
  { id: "hemoglobin", title: "Hemoglobin Estimation", department: "hema", icon: <Droplets className="h-5 w-5" />, difficulty: "Beginner", duration: "15–20 min", description: "Cyanmethemoglobin method for hemoglobin estimation using Drabkin's reagent and spectrophotometry at 540nm.", references: ["Godkar Practical Pathology", "ICSH"], available: true },
  { id: "rbc-count", title: "RBC Count", department: "hema", icon: <Droplets className="h-5 w-5" />, difficulty: "Intermediate", duration: "15–20 min", description: "Manual RBC counting using Neubauer hemocytometer with Hayem's fluid dilution (1:200) and 40× microscopy.", references: ["Godkar", "Henry's Clinical Diagnosis"], available: true },
  { id: "blood-glucose", title: "Blood Glucose Estimation", department: "biochem", icon: <Beaker className="h-5 w-5" />, difficulty: "Beginner", duration: "15–20 min", description: "GOD-POD enzymatic method for blood glucose estimation with spectrophotometric reading at 505nm.", references: ["Tietz Clinical Chemistry"], available: true },
  { id: "he-staining", title: "H&E Staining", department: "histo", icon: <Microscope className="h-5 w-5" />, difficulty: "Intermediate", duration: "25–30 min", description: "Hematoxylin and Eosin staining for tissue sections following Bancroft & Gamble protocols.", references: ["Bancroft & Gamble", "Godkar"], available: true },
  { id: "elisa", title: "ELISA Test", department: "immuno", icon: <TestTube className="h-5 w-5" />, difficulty: "Intermediate", duration: "25–30 min", description: "Sandwich ELISA for antigen detection with coating, blocking, sample addition, enzyme conjugate, substrate, and stop solution.", references: ["Tietz Clinical Chemistry", "WHO"], available: true },
  { id: "agglutination", title: "Agglutination Tests", department: "immuno", icon: <Shield className="h-5 w-5" />, difficulty: "Beginner", duration: "10–15 min", description: "Slide agglutination for serological diagnosis including Widal, ASO, and Brucella testing.", references: ["Tietz", "WHO"], available: true },
  { id: "pcr", title: "PCR Amplification", department: "molecular", icon: <Dna className="h-5 w-5" />, difficulty: "Advanced", duration: "20–25 min", description: "Polymerase chain reaction simulation with DNA extraction, master mix preparation, thermal cycling, and gel electrophoresis.", references: ["Sambrook & Russell", "CLSI MM03"], available: true },
  { id: "dna-extraction", title: "DNA Extraction", department: "molecular", icon: <Dna className="h-5 w-5" />, difficulty: "Intermediate", duration: "20–25 min", description: "Genomic DNA extraction from blood using phenol-chloroform method with NanoDrop analysis.", references: ["Sambrook & Russell"], available: true },
  { id: "blood-grouping", title: "Blood Grouping (ABO)", department: "bloodbank", icon: <Heart className="h-5 w-5" />, difficulty: "Beginner", duration: "10–15 min", description: "ABO blood group determination using anti-A, anti-B, and anti-D antisera with slide agglutination method.", references: ["AABB Technical Manual", "WHO Blood Safety"], available: true },
  { id: "cross-matching", title: "Cross Matching", department: "bloodbank", icon: <Heart className="h-5 w-5" />, difficulty: "Intermediate", duration: "20–25 min", description: "Major and minor cross-matching using IAT (Indirect Antiglobulin Test) with AHG phase for pre-transfusion compatibility.", references: ["AABB Technical Manual"], available: true },
];

const difficultyColor = {
  Beginner: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function BioLabContent() {
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("all");

  const filteredExperiments = selectedDept === "all"
    ? experiments
    : experiments.filter(e => e.department === selectedDept);

  if (activeExperiment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveExperiment(null)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Experiments
        </Button>
        {activeExperiment === "gram-stain" && <GramStain3DSimulator />}
        {activeExperiment === "acid-fast" && <AcidFastStaining3D />}
        {activeExperiment === "elisa" && <ELISASimulator3D />}
        {activeExperiment === "pcr" && <PCRSimulator3D />}
        {activeExperiment === "blood-grouping" && <BloodGrouping3D />}
        {activeExperiment === "hemoglobin" && <HemoglobinEstimation3D />}
        {activeExperiment === "he-staining" && <HEStaining3D />}
        {activeExperiment === "dna-extraction" && <DNAExtraction3D />}
        {activeExperiment === "culture-plating" && <CulturePlating3D />}
        {activeExperiment === "ast" && <ASTSimulator3D />}
        {activeExperiment === "rbc-count" && <RBCCount3D />}
        {activeExperiment === "blood-glucose" && <BloodGlucose3D />}
        {activeExperiment === "agglutination" && <Agglutination3D />}
        {activeExperiment === "cross-matching" && <CrossMatching3D />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <FlaskConical className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">BioLab 3D Virtual Laboratory</h2>
            <p className="text-muted-foreground text-sm">Interactive 3D Laboratory Simulations • Validated Protocols • AI-Guided Training</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">CLSI Standards</Badge>
          <Badge variant="outline" className="text-[10px]">WHO Guidelines</Badge>
          <Badge variant="outline" className="text-[10px]">NABL Accredited Protocols</Badge>
          <Badge variant="outline" className="text-[10px]">Cappuccino & Welsh</Badge>
          <Badge variant="outline" className="text-[10px]">Tietz Clinical Chemistry</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Departments", value: "8", icon: <FlaskConical className="h-4 w-4 text-primary" /> },
          { label: "Experiments", value: `${experiments.length}`, icon: <TestTube className="h-4 w-4 text-primary" /> },
          { label: "3D Interactive", value: `${experiments.filter(e => e.available).length}`, icon: <Microscope className="h-4 w-4 text-primary" /> },
          { label: "Training Modes", value: "3", icon: <GraduationCap className="h-4 w-4 text-primary" /> },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedDept} onValueChange={setSelectedDept}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {departments.map(dept => (
            <TabsTrigger key={dept.id} value={dept.id} className="gap-1.5 text-xs">
              {dept.icon} {dept.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedDept} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExperiments.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full transition-all hover:shadow-lg cursor-pointer hover:border-primary/40"
                  onClick={() => setActiveExperiment(exp.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">{exp.icon}</div>
                        <div>
                          <CardTitle className="text-sm">{exp.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground capitalize">{departments.find(d => d.id === exp.department)?.label}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground text-[10px]">3D Ready</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-xs leading-relaxed">{exp.description}</CardDescription>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] ${difficultyColor[exp.difficulty]}`}>{exp.difficulty}</Badge>
                      <Badge variant="outline" className="text-[10px]">⏱ {exp.duration}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground">📚 {exp.references.join(" • ")}</p>
                    <Button size="sm" className="w-full mt-2 gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5" /> Start Experiment
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
