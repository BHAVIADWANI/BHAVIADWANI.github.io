import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw, Stethoscope, AlertTriangle } from "lucide-react";

type ClinicalCase = {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  presentation: string;
  history: string;
  sampleType: string;
  gramStain: string;
  colony: string;
  biochemResults: { test: string; result: string }[];
  astResults: { antibiotic: string; zone: number; interpretation: string }[];
  answer: string;
  organism: string;
  explanation: string;
  treatment: string;
  keyFindings: string[];
};

const cases: ClinicalCase[] = [
  {
    id: "case1",
    title: "Community-Acquired Pneumonia",
    difficulty: "Beginner",
    presentation: "A 65-year-old male presents with productive cough, rusty-colored sputum, fever (39.2°C), chest pain, and dyspnea for 3 days. CXR shows right lower lobe consolidation.",
    history: "Smoker (40 pack-years), COPD, no recent hospitalization. No known drug allergies.",
    sampleType: "Sputum",
    gramStain: "Gram-positive lancet-shaped diplococci (pairs) with surrounding clear halo (capsule)",
    colony: "Small, mucoid, α-hemolytic colonies on blood agar with 'draughtsman' (central depression) appearance. Optochin-sensitive (zone >14 mm). Bile-soluble.",
    biochemResults: [
      { test: "Catalase", result: "Negative" },
      { test: "Optochin", result: "Sensitive (18 mm zone)" },
      { test: "Bile Solubility", result: "Positive (colony dissolves)" },
      { test: "Quellung Reaction", result: "Positive (capsule swelling)" },
    ],
    astResults: [
      { antibiotic: "Penicillin", zone: 25, interpretation: "S" },
      { antibiotic: "Erythromycin", zone: 22, interpretation: "S" },
      { antibiotic: "Levofloxacin", zone: 20, interpretation: "S" },
      { antibiotic: "Trimethoprim-Sulfa", zone: 8, interpretation: "R" },
    ],
    answer: "Streptococcus pneumoniae",
    organism: "Streptococcus pneumoniae",
    explanation: "The combination of Gram-positive lancet-shaped diplococci, α-hemolysis, optochin sensitivity, and bile solubility is pathognomonic for S. pneumoniae. The capsule (Quellung +) is a major virulence factor. This is the #1 cause of community-acquired pneumonia.",
    treatment: "Amoxicillin or respiratory fluoroquinolone (levofloxacin/moxifloxacin) for outpatient. Ceftriaxone + azithromycin for inpatient. Pneumococcal vaccination for prevention.",
    keyFindings: ["Lancet-shaped Gram-positive diplococci", "α-hemolysis on blood agar", "Optochin sensitive", "Bile soluble", "Quellung positive"],
  },
  {
    id: "case2",
    title: "Urinary Tract Infection",
    difficulty: "Beginner",
    presentation: "A 28-year-old female presents with dysuria, frequency, urgency, and suprapubic pain for 2 days. No fever. Urine is cloudy with nitrite and leukocyte esterase positive on dipstick.",
    history: "Sexually active, no recent antibiotics. Previous UTI 1 year ago.",
    sampleType: "Mid-stream urine (>10⁵ CFU/mL)",
    gramStain: "Gram-negative bacilli (rods)",
    colony: "Pink (lactose-fermenting) colonies on MacConkey agar. Metallic green sheen on EMB agar. Non-hemolytic on blood agar. >10⁵ CFU/mL.",
    biochemResults: [
      { test: "Catalase", result: "Positive" },
      { test: "Oxidase", result: "Negative" },
      { test: "Indole", result: "Positive (red ring)" },
      { test: "Methyl Red", result: "Positive" },
      { test: "Voges-Proskauer", result: "Negative" },
      { test: "Citrate", result: "Negative" },
      { test: "TSI", result: "A/A with gas, no H₂S" },
      { test: "Motility", result: "Motile" },
    ],
    astResults: [
      { antibiotic: "Ampicillin", zone: 8, interpretation: "R" },
      { antibiotic: "Ciprofloxacin", zone: 25, interpretation: "S" },
      { antibiotic: "Trimethoprim-Sulfa", zone: 20, interpretation: "S" },
      { antibiotic: "Nitrofurantoin", zone: 18, interpretation: "S" },
      { antibiotic: "Ceftriaxone", zone: 28, interpretation: "S" },
    ],
    answer: "Escherichia coli",
    organism: "Escherichia coli",
    explanation: "E. coli is the #1 cause of uncomplicated UTIs (80%). The IMViC pattern (++−−), lactose fermentation on MacConkey (pink colonies), metallic green sheen on EMB, and indole positivity are classic. The TSI pattern A/A with gas confirms a lactose/glucose/sucrose fermenter.",
    treatment: "Uncomplicated UTI: Nitrofurantoin 5 days or TMP-SMX 3 days (if susceptible). Note ampicillin resistance — common due to β-lactamase production.",
    keyFindings: ["Gram-negative bacilli", "Lactose fermenter (pink on MacConkey)", "Metallic green sheen on EMB", "IMViC: ++−−", "Indole positive"],
  },
  {
    id: "case3",
    title: "Wound Infection Post-Surgery",
    difficulty: "Intermediate",
    presentation: "A 45-year-old male develops wound erythema, warmth, purulent drainage, and fever (38.5°C) 5 days after abdominal surgery. Wound culture ordered.",
    history: "Type 2 diabetes, BMI 32. Procedure was elective cholecystectomy.",
    sampleType: "Wound swab (purulent drainage)",
    gramStain: "Gram-positive cocci in grape-like clusters",
    colony: "Golden-yellow, round, opaque colonies on blood agar with β-hemolysis. Yellow halo on mannitol salt agar (mannitol fermenter).",
    biochemResults: [
      { test: "Catalase", result: "Positive (strong bubbling)" },
      { test: "Coagulase (slide)", result: "Positive (clumping)" },
      { test: "Coagulase (tube)", result: "Positive (clot at 4 h)" },
      { test: "DNase", result: "Positive" },
      { test: "Mannitol", result: "Fermented (yellow on MSA)" },
    ],
    astResults: [
      { antibiotic: "Oxacillin (MRSA screen)", zone: 8, interpretation: "R" },
      { antibiotic: "Vancomycin", zone: 18, interpretation: "S" },
      { antibiotic: "Trimethoprim-Sulfa", zone: 24, interpretation: "S" },
      { antibiotic: "Clindamycin", zone: 22, interpretation: "S" },
      { antibiotic: "Linezolid", zone: 25, interpretation: "S" },
    ],
    answer: "Methicillin-Resistant Staphylococcus aureus (MRSA)",
    organism: "Staphylococcus aureus (MRSA)",
    explanation: "Gram-positive cocci in clusters + catalase positive = Staphylococcus. Coagulase positive = S. aureus. Oxacillin resistance (zone <13 mm) indicates MRSA carrying the mecA gene encoding PBP2a. MRSA is a critical pathogen in surgical site infections.",
    treatment: "Vancomycin IV for serious MRSA infections. TMP-SMX or doxycycline for mild-moderate skin/soft tissue MRSA. Linezolid as alternative. Wound debridement essential.",
    keyFindings: ["Gram-positive cocci in clusters", "Catalase positive", "Coagulase positive", "Oxacillin resistant (MRSA)", "Golden colonies + β-hemolysis"],
  },
  {
    id: "case4",
    title: "Neonatal Meningitis",
    difficulty: "Advanced",
    presentation: "A 5-day-old neonate presents with poor feeding, lethargy, temperature instability (36°C), bulging fontanelle, and seizures. CSF shows: WBC 2500/µL (90% PMN), glucose 15 mg/dL (blood glucose 80), protein 350 mg/dL.",
    history: "Full-term vaginal delivery. Mother was GBS-negative on screening. No prolonged rupture of membranes.",
    sampleType: "CSF",
    gramStain: "Gram-negative bacilli",
    colony: "Pink (lactose-fermenting) mucoid colonies on MacConkey agar. Non-hemolytic on blood agar. Mucoid capsule visible.",
    biochemResults: [
      { test: "Catalase", result: "Positive" },
      { test: "Oxidase", result: "Negative" },
      { test: "Indole", result: "Negative" },
      { test: "Citrate", result: "Positive" },
      { test: "Urease", result: "Positive" },
      { test: "VP", result: "Positive" },
      { test: "TSI", result: "A/A with gas, no H₂S" },
      { test: "String test", result: "Positive (>5mm string)" },
    ],
    astResults: [
      { antibiotic: "Ampicillin", zone: 20, interpretation: "S" },
      { antibiotic: "Ceftriaxone", zone: 30, interpretation: "S" },
      { antibiotic: "Gentamicin", zone: 18, interpretation: "S" },
      { antibiotic: "Meropenem", zone: 26, interpretation: "S" },
    ],
    answer: "Klebsiella pneumoniae",
    organism: "Klebsiella pneumoniae",
    explanation: "Gram-negative bacilli with mucoid capsule, lactose fermenter, IMViC (−−++), urease positive, non-motile (string test positive = hypervirulent capsule). K. pneumoniae is the second most common cause of neonatal Gram-negative meningitis after E. coli K1. The very low CSF glucose and high protein with PMN predominance confirm bacterial meningitis.",
    treatment: "Empiric: Ampicillin + cefotaxime/ceftriaxone + gentamicin. Duration: 21 days minimum for Gram-negative meningitis. Monitor for complications (hydrocephalus, abscess).",
    keyFindings: ["Gram-negative encapsulated bacilli", "Mucoid lactose-fermenting colonies", "IMViC: −−++", "Urease positive", "Non-motile"],
  },
];

type Phase = "presentation" | "gram" | "colony" | "biochem" | "ast" | "diagnosis" | "feedback";

export function ClinicalCaseMode() {
  const [caseIdx, setCaseIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("presentation");
  const [userDiagnosis, setUserDiagnosis] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentCase = caseIdx !== null ? cases[caseIdx] : null;

  const diagnosisOptions = [
    "Staphylococcus aureus (MSSA)", "Staphylococcus aureus (MRSA)", "Staphylococcus epidermidis",
    "Streptococcus pneumoniae", "Streptococcus pyogenes", "Enterococcus faecalis",
    "Escherichia coli", "Klebsiella pneumoniae", "Pseudomonas aeruginosa",
    "Proteus mirabilis", "Salmonella typhi", "Neisseria meningitidis",
  ];

  const submitDiagnosis = () => {
    const correct = userDiagnosis.toLowerCase().includes(currentCase!.organism.toLowerCase().split(" ")[0]) ||
                    currentCase!.organism.toLowerCase().includes(userDiagnosis.toLowerCase().split(" ")[0]);
    setIsCorrect(correct);
    setPhase("feedback");
  };

  const phases: Phase[] = ["presentation", "gram", "colony", "biochem", "ast", "diagnosis", "feedback"];
  const phaseLabels = ["Patient", "Gram Stain", "Colony", "Biochem", "AST", "Diagnose", "Feedback"];
  const phaseIdx = phases.indexOf(phase);

  if (caseIdx === null) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
            <Stethoscope className="h-5 w-5 text-primary" /> Clinical Case-Based Learning
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Analyze unknown samples, perform tests, identify microorganisms, and receive diagnostic feedback
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cases.map((c, i) => (
            <Card key={c.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setCaseIdx(i); setPhase("presentation"); setUserDiagnosis(""); setIsCorrect(null); }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <Badge variant={c.difficulty === "Beginner" ? "secondary" : c.difficulty === "Intermediate" ? "outline" : "destructive"}>
                    {c.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{c.presentation.slice(0, 120)}...</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{currentCase!.title}</h3>
        <div className="flex gap-2">
          <Badge variant={currentCase!.difficulty === "Beginner" ? "secondary" : currentCase!.difficulty === "Intermediate" ? "outline" : "destructive"}>
            {currentCase!.difficulty}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => { setCaseIdx(null); setPhase("presentation"); }}>
            <RotateCcw className="h-4 w-4 mr-1" /> All Cases
          </Button>
        </div>
      </div>

      {/* Phase nav */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {phases.map((p, i) => (
          <button
            key={p}
            onClick={() => { if (i <= phaseIdx || phase === "feedback") setPhase(p); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              p === phase ? "bg-primary text-primary-foreground" : i < phaseIdx ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {phaseLabels[i]}
          </button>
        ))}
      </div>
      <Progress value={(phaseIdx / (phases.length - 1)) * 100} className="h-2" />

      {/* Patient Presentation */}
      {phase === "presentation" && (
        <Card>
          <CardHeader><CardTitle className="text-base">📋 Patient Presentation</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{currentCase!.presentation}</p>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium mb-1">Medical History</p>
              <p className="text-muted-foreground">{currentCase!.history}</p>
            </div>
            <Badge variant="secondary">Sample: {currentCase!.sampleType}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Gram Stain */}
      {phase === "gram" && (
        <Card>
          <CardHeader><CardTitle className="text-base">🔬 Gram Stain Results</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/20 text-center">
              <p className="text-lg font-medium">{currentCase!.gramStain}</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">What does this Gram stain morphology suggest? Consider shape, arrangement, and staining reaction.</p>
          </CardContent>
        </Card>
      )}

      {/* Colony */}
      {phase === "colony" && (
        <Card>
          <CardHeader><CardTitle className="text-base">🧫 Colony Morphology</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/20">
              <p className="text-sm">{currentCase!.colony}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Biochem */}
      {phase === "biochem" && (
        <Card>
          <CardHeader><CardTitle className="text-base">🧪 Biochemical Test Results</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentCase!.biochemResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">{r.test}</span>
                  <Badge variant={r.result.toLowerCase().includes("positive") || r.result.toLowerCase().includes("sensitive") ? "default" : "secondary"}>
                    {r.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AST */}
      {phase === "ast" && (
        <Card>
          <CardHeader><CardTitle className="text-base">💊 Antimicrobial Susceptibility</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentCase!.astResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-sm">{r.antibiotic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.zone} mm</span>
                    <Badge variant={r.interpretation === "S" ? "default" : r.interpretation === "R" ? "destructive" : "secondary"}>
                      {r.interpretation}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis */}
      {phase === "diagnosis" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎯 Your Diagnosis</CardTitle>
            <CardDescription>Based on all findings, identify the causative organism</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={userDiagnosis} onValueChange={setUserDiagnosis}>
              <SelectTrigger><SelectValue placeholder="Select your diagnosis..." /></SelectTrigger>
              <SelectContent>
                {diagnosisOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={submitDiagnosis} disabled={!userDiagnosis} className="w-full">Submit Diagnosis</Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {phase === "feedback" && (
        <div className="space-y-4">
          <Card className={`border-2 ${isCorrect ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {isCorrect ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                {isCorrect ? "Correct Diagnosis!" : "Incorrect — Review the Findings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Correct Answer:</strong> <span className="italic">{currentCase!.organism}</span></p>
              <p>{currentCase!.explanation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">💊 Recommended Treatment</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p>{currentCase!.treatment}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">🔑 Key Diagnostic Findings</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentCase!.keyFindings.map((f) => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      {phase !== "feedback" && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setPhase(phases[Math.max(0, phaseIdx - 1)])} disabled={phaseIdx === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={() => setPhase(phases[Math.min(phases.length - 1, phaseIdx + 1)])} disabled={phase === "diagnosis"}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
