import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, ChevronRight, ChevronLeft, BookOpen, Atom,
  Target, Zap, BarChart3, FlaskConical, CheckCircle2, Lightbulb
} from "lucide-react";

interface TutorialStep {
  title: string;
  icon: React.ReactNode;
  content: string;
  keyPoints: string[];
  reference: string;
  diagram?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "What is Molecular Docking?",
    icon: <Atom className="h-6 w-6" />,
    content: "Molecular docking is a computational technique used in drug discovery to predict how a small molecule (ligand) binds to a protein (receptor). It simulates the molecular recognition process — like finding the right key for a lock. The goal is to predict the preferred orientation and binding affinity of a ligand within the protein's binding site.",
    keyPoints: [
      "Docking predicts the 3D pose of a ligand in a protein binding site",
      "Binding affinity (kcal/mol) estimates how strongly the ligand binds",
      "Lower (more negative) energy = stronger predicted binding",
      "Used in virtual screening to identify potential drug candidates",
      "AutoDock Vina uses a scoring function based on physics and knowledge-based potentials"
    ],
    reference: "Trott, O., & Olson, A. J. (2010). AutoDock Vina. Journal of Computational Chemistry, 31(2), 455–461.",
  },
  {
    title: "Understanding Protein Structures",
    icon: <FlaskConical className="h-6 w-6" />,
    content: "Proteins are large macromolecules that fold into specific 3D shapes. Their structure determines function. In docking, we use protein structures from the Protein Data Bank (PDB), solved via X-ray crystallography, cryo-EM, or NMR spectroscopy. The structure resolution (measured in Ångströms) affects docking reliability — lower values mean higher detail.",
    keyPoints: [
      "PDB files contain atomic coordinates of every atom in the protein",
      "Resolution < 2.5 Å is generally preferred for docking studies",
      "X-ray crystallography is the most common structure determination method",
      "Proteins must be prepared: remove water, add hydrogens, assign charges",
      "The binding pocket is a cavity where the ligand fits"
    ],
    reference: "Berman, H. M., et al. (2000). The Protein Data Bank. Nucleic Acids Research, 28(1), 235–242.",
  },
  {
    title: "Understanding Ligands",
    icon: <Target className="h-6 w-6" />,
    content: "A ligand is a small molecule that binds to a protein. In drug discovery, ligands are potential drug candidates. They can be represented in multiple formats: SDF (with 3D coordinates), SMILES (text notation), or MOL2 (with atom types and charges). PubChem and DrugBank are major databases for finding ligand structures.",
    keyPoints: [
      "Ligands are typically small organic molecules (< 500 Da for drug-likeness)",
      "SMILES notation describes molecular structure as text (e.g., CC(=O)OC1=CC=CC=C1C(O)=O for aspirin)",
      "3D conformation is critical — the ligand must be in a realistic 3D shape",
      "Lipinski's Rule of Five helps predict oral bioavailability",
      "Multiple conformations may be tested to find optimal binding"
    ],
    reference: "Kim, S., et al. (2023). PubChem 2023 update. Nucleic Acids Research, 51(D1), D1373–D1380.",
  },
  {
    title: "Defining the Docking Region",
    icon: <Target className="h-6 w-6" />,
    content: "The search space (grid box) defines where AutoDock Vina looks for binding poses. It should encompass the entire binding pocket with some margin. Grid center coordinates specify the center of the search box, and grid size defines its dimensions in Ångströms. Blind docking uses a very large box covering the entire protein.",
    keyPoints: [
      "Grid box must cover the binding site plus 5–10 Å margin",
      "Typical focused docking box: 20×20×20 Å",
      "Blind docking box: covers entire protein (40+ Å per side)",
      "Grid center should be at the geometric center of the binding pocket",
      "Exhaustiveness parameter controls search thoroughness (default: 8)"
    ],
    reference: "AutoDock Vina Documentation. https://autodock-vina.readthedocs.io/",
  },
  {
    title: "Running the Docking Simulation",
    icon: <Zap className="h-6 w-6" />,
    content: "AutoDock Vina uses a stochastic global optimization algorithm combining Iterated Local Search with the Broyden–Fletcher–Goldfarb–Shanno (BFGS) method. It evaluates millions of ligand conformations, orientations, and positions within the grid box, scoring each one with a hybrid scoring function that considers van der Waals forces, hydrogen bonds, hydrophobic effects, and torsional penalties.",
    keyPoints: [
      "Vina's scoring function combines knowledge-based and empirical terms",
      "Higher exhaustiveness = more thorough search = more CPU time",
      "Multiple independent runs improve result reliability",
      "Typical docking takes seconds to minutes on a modern CPU",
      "GPU acceleration can speed up virtual screening campaigns"
    ],
    reference: "Eberhardt, J., et al. (2021). AutoDock Vina 1.2.0. Journal of Chemical Information and Modeling, 61(8), 3891–3898.",
  },
  {
    title: "Interpreting Binding Energy",
    icon: <BarChart3 className="h-6 w-6" />,
    content: "The binding affinity score (kcal/mol) is the most important output. More negative values indicate stronger predicted binding. However, docking scores are approximations — experimental validation (e.g., IC50 assays, SPR, ITC) is always needed. RMSD values between poses indicate structural diversity of binding modes.",
    keyPoints: [
      "≤ −9.0 kcal/mol: Excellent binding — strong drug candidate",
      "−7.0 to −9.0 kcal/mol: Good binding — worth investigating",
      "−5.0 to −7.0 kcal/mol: Moderate — may need optimization",
      "> −5.0 kcal/mol: Weak binding — likely not a viable drug candidate",
      "RMSD < 2 Å between poses suggests a well-defined binding mode",
      "Always validate computationally predicted binding with wet-lab experiments"
    ],
    reference: "Forli, S., et al. (2016). Computational protein–ligand docking and virtual drug screening with the AutoDock suite. Nature Protocols, 11, 905–919.",
  },
];

const REFERENCE_TOPICS = [
  {
    title: "Scoring Functions",
    content: "AutoDock Vina uses a hybrid scoring function combining empirical and knowledge-based terms. It accounts for: steric interactions (van der Waals), hydrogen bonding, hydrophobic effects, and torsional penalty for ligand flexibility. The final score approximates ΔG (Gibbs free energy of binding).",
  },
  {
    title: "Protein Preparation",
    content: "Before docking, proteins must be prepared: (1) Remove co-crystallized ligands and water molecules, (2) Add missing hydrogen atoms, (3) Assign partial charges (Gasteiger or Kollman), (4) Convert to PDBQT format. Programs like AutoDockTools, UCSF Chimera, or Open Babel handle these steps.",
  },
  {
    title: "Ligand Preparation",
    content: "Ligands need: (1) 3D coordinate generation from 2D or SMILES, (2) Energy minimization, (3) Protonation state assignment at physiological pH, (4) Torsion tree setup (define rotatable bonds), (5) Conversion to PDBQT. RDKit and Open Babel are standard tools.",
  },
  {
    title: "Validation & Redocking",
    content: "To validate a docking protocol, redock a known co-crystallized ligand and compare the predicted pose to the experimental one. An RMSD < 2.0 Å is generally considered successful reproduction. This validates your grid parameters and scoring function performance.",
  },
  {
    title: "Virtual Screening",
    content: "Virtual screening docks thousands to millions of compounds against a target protein. It's used to identify hit compounds in early drug discovery. High-throughput virtual screening (HTVS) uses lower exhaustiveness for speed, followed by more rigorous docking of top candidates.",
  },
  {
    title: "Limitations",
    content: "Molecular docking has important limitations: (1) Scoring functions are approximations — not all strong binders are correctly ranked, (2) Protein flexibility is limited in standard docking, (3) Water-mediated interactions are often ignored, (4) Entropic contributions are poorly modeled. Always validate with experiments.",
  },
];

export function DockingTutorial() {
  const [activeView, setActiveView] = useState<"walkthrough" | "reference">("walkthrough");
  const [currentStep, setCurrentStep] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === "walkthrough" ? "default" : "outline"}
          onClick={() => setActiveView("walkthrough")}
          className="gap-2"
        >
          <GraduationCap className="h-4 w-4" /> Interactive Walkthrough
        </Button>
        <Button
          variant={activeView === "reference" ? "default" : "outline"}
          onClick={() => setActiveView("reference")}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" /> Reference Guide
        </Button>
      </div>

      {activeView === "walkthrough" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                {step.icon}
                Step {currentStep + 1}: {step.title}
              </CardTitle>
              <Badge variant="secondary">
                {currentStep + 1} / {TUTORIAL_STEPS.length}
              </Badge>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main content */}
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-sm leading-relaxed">{step.content}</p>
            </div>

            {/* Key points */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-primary" /> Key Points
              </h4>
              <ul className="space-y-2">
                {step.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reference */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">📖 Reference: </span>
              {step.reference}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(s => s - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                disabled={currentStep === TUTORIAL_STEPS.length - 1}
                onClick={() => setCurrentStep(s => s + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {REFERENCE_TOPICS.map((topic, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
