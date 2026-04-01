import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, HelpCircle, Beaker } from "lucide-react";

type TestInfo = {
  name: string;
  emoji: string;
  principle: string;
  reagents: string[];
  procedure: string;
  positiveResult: string;
  negativeResult: string;
  positiveOrganisms: string[];
  negativeOrganisms: string[];
  clinicalUse: string;
};

const biochemTests: TestInfo[] = [
  {
    name: "Catalase Test",
    emoji: "🫧",
    principle: "Detects catalase enzyme that decomposes H₂O₂ → H₂O + O₂. Differentiates Staphylococci (+) from Streptococci (−).",
    reagents: ["3% hydrogen peroxide (H₂O₂)"],
    procedure: "Place colony on glass slide. Add drop of 3% H₂O₂. Observe for immediate bubbling.",
    positiveResult: "Vigorous bubbling (O₂ gas production)",
    negativeResult: "No bubbles",
    positiveOrganisms: ["Staphylococcus aureus", "Staphylococcus epidermidis", "Pseudomonas aeruginosa", "E. coli", "Klebsiella"],
    negativeOrganisms: ["Streptococcus pyogenes", "Streptococcus pneumoniae", "Enterococcus faecalis"],
    clinicalUse: "First-line differentiation of Gram-positive cocci: Staphylococci (catalase +) vs Streptococci (catalase −)",
  },
  {
    name: "Oxidase Test",
    emoji: "🟣",
    principle: "Detects cytochrome c oxidase in the electron transport chain. Uses tetramethyl-p-phenylenediamine (TMPD) which turns purple when oxidized.",
    reagents: ["Oxidase reagent (1% TMPD)", "Oxidase test strips"],
    procedure: "Rub colony onto oxidase reagent paper or add reagent to colony. Read within 10–30 seconds.",
    positiveResult: "Dark purple color within 10–30 seconds",
    negativeResult: "No color change",
    positiveOrganisms: ["Pseudomonas aeruginosa", "Neisseria meningitidis", "Neisseria gonorrhoeae", "Vibrio cholerae", "Campylobacter jejuni"],
    negativeOrganisms: ["E. coli", "Klebsiella pneumoniae", "Staphylococcus aureus", "Salmonella", "Shigella"],
    clinicalUse: "Key test for identifying Pseudomonas and differentiating Neisseria from other Gram-negative diplococci",
  },
  {
    name: "Indole Test",
    emoji: "🔴",
    principle: "Detects tryptophanase enzyme that hydrolyzes tryptophan → indole + pyruvic acid + NH₃. Indole reacts with Kovac's reagent to form a red ring.",
    reagents: ["Tryptone broth (tryptophan-rich)", "Kovac's reagent (p-dimethylaminobenzaldehyde)"],
    procedure: "Inoculate tryptone broth, incubate 24 h at 37°C. Add 5 drops Kovac's reagent. Observe for red ring.",
    positiveResult: "Red/cherry-red ring at surface (indole + Kovac's)",
    negativeResult: "No color change (yellow reagent layer)",
    positiveOrganisms: ["E. coli", "Proteus vulgaris", "Vibrio cholerae"],
    negativeOrganisms: ["Klebsiella pneumoniae", "Proteus mirabilis", "Enterobacter", "Serratia"],
    clinicalUse: "Part of IMViC tests. E. coli is indole +, while Klebsiella and Enterobacter are indole −",
  },
  {
    name: "Citrate Utilization (Simmons)",
    emoji: "🟦",
    principle: "Tests ability to use citrate as sole carbon source. Citrate metabolism → alkaline products → bromothymol blue indicator turns blue.",
    reagents: ["Simmons citrate agar (contains bromothymol blue)"],
    procedure: "Streak slant lightly (do NOT stab). Incubate 24–48 h. Observe for color change green → blue.",
    positiveResult: "Blue color (alkaline pH) ± growth",
    negativeResult: "Remains green (no growth, no pH change)",
    positiveOrganisms: ["Klebsiella pneumoniae", "Enterobacter", "Serratia marcescens", "Citrobacter", "Salmonella (most)"],
    negativeOrganisms: ["E. coli", "Shigella", "Edwardsiella"],
    clinicalUse: "Part of IMViC. Differentiates E. coli (citrate −) from Enterobacter (citrate +)",
  },
  {
    name: "Urease Test",
    emoji: "🩷",
    principle: "Detects urease enzyme: urea → 2 NH₃ + CO₂. Ammonia raises pH → phenol red indicator turns pink/magenta.",
    reagents: ["Christensen's urea agar (with phenol red)"],
    procedure: "Inoculate urea slant/broth, incubate 24 h (up to 7 days for slow producers). Observe for pink color.",
    positiveResult: "Pink to magenta (alkaline pH from ammonia)",
    negativeResult: "No color change (remains yellow/orange)",
    positiveOrganisms: ["Proteus mirabilis (rapid, strong +)", "Helicobacter pylori", "Klebsiella", "Cryptococcus neoformans"],
    negativeOrganisms: ["E. coli", "Salmonella", "Shigella"],
    clinicalUse: "Rapid urease test for H. pylori diagnosis. Proteus is strongly urease positive (rapid pink in 4–6 h)",
  },
  {
    name: "Methyl Red (MR) Test",
    emoji: "🟥",
    principle: "Detects mixed acid fermentation of glucose → stable acid end products (lactic, acetic, formic acid) → pH <4.4 → methyl red turns red.",
    reagents: ["MR-VP broth (glucose-phosphate broth)", "Methyl red indicator"],
    procedure: "Inoculate MR-VP broth, incubate 48–72 h at 37°C. Add 5 drops methyl red. Read immediately.",
    positiveResult: "Red color (pH ≤ 4.4, mixed acid fermentation)",
    negativeResult: "Yellow (pH > 6.0)",
    positiveOrganisms: ["E. coli", "Yersinia", "Citrobacter"],
    negativeOrganisms: ["Enterobacter", "Klebsiella", "Serratia"],
    clinicalUse: "Part of IMViC. E. coli = MR+/VP−; Enterobacter = MR−/VP+",
  },
  {
    name: "Voges-Proskauer (VP) Test",
    emoji: "🟨",
    principle: "Detects 2,3-butanediol fermentation pathway. Acetoin (acetylmethylcarbinol) intermediate reacts with KOH + α-naphthol → red color.",
    reagents: ["MR-VP broth", "Barritt's reagents: α-naphthol (5%) + KOH (40%)"],
    procedure: "Inoculate MR-VP broth, incubate 48 h. Add α-naphthol first, then KOH. Shake. Wait 15–30 min.",
    positiveResult: "Red/crimson color developing within 15–30 min",
    negativeResult: "No color change (copper/yellow)",
    positiveOrganisms: ["Klebsiella pneumoniae", "Enterobacter", "Serratia"],
    negativeOrganisms: ["E. coli", "Salmonella", "Shigella", "Yersinia"],
    clinicalUse: "IMViC component. VP+ organisms use butanediol pathway instead of mixed acid",
  },
  {
    name: "Triple Sugar Iron (TSI) Agar",
    emoji: "🧪",
    principle: "Detects fermentation of glucose, lactose, sucrose; H₂S production; and gas formation. Phenol red pH indicator + ferrous sulfate for H₂S.",
    reagents: ["TSI agar slant (phenol red indicator, ferrous sulfate)"],
    procedure: "Stab butt, streak slant. Incubate 18–24 h at 37°C. Read slant/butt/H₂S/gas.",
    positiveResult: "Various patterns: A/A (acid/acid), K/A (alkaline/acid), H₂S (blackening), gas (bubbles/cracks)",
    negativeResult: "K/K (alkaline/alkaline) = non-fermenter",
    positiveOrganisms: ["E. coli: A/A + gas", "Salmonella typhi: K/A + H₂S (no gas)", "Shigella: K/A (no gas, no H₂S)", "Klebsiella: A/A + gas (mucoid)"],
    negativeOrganisms: ["Pseudomonas: K/K (non-fermenter)"],
    clinicalUse: "Critical for Enterobacteriaceae ID. Pattern interpretation guides further testing",
  },
  {
    name: "Coagulase Test",
    emoji: "🩸",
    principle: "Detects coagulase enzyme (free or bound) that clots plasma. Bound coagulase (clumping factor) tested by slide test; free coagulase by tube test.",
    reagents: ["Rabbit plasma (EDTA or citrated)"],
    procedure: "Slide test: mix colony with plasma drop. Tube test: add colony to plasma, incubate 37°C, check at 1, 4, 24 h.",
    positiveResult: "Slide: clumping within 10 s. Tube: clot formation (any degree)",
    negativeResult: "No clumping / no clot",
    positiveOrganisms: ["Staphylococcus aureus"],
    negativeOrganisms: ["S. epidermidis", "S. saprophyticus", "All other CoNS"],
    clinicalUse: "Gold standard to differentiate S. aureus (coagulase +) from coagulase-negative staphylococci (CoNS)",
  },
  {
    name: "Motility Test (SIM / Wet Mount)",
    emoji: "🏃",
    principle: "Detects bacterial motility via flagella. SIM medium: motile organisms spread from stab line creating turbid diffuse growth. Wet mount: direct visualization.",
    reagents: ["SIM medium (semi-solid agar)", "or wet mount slide"],
    procedure: "SIM: stab inoculate, incubate 37°C, 24 h. Observe for diffuse growth away from stab line.",
    positiveResult: "Diffuse turbidity spreading from stab line (SIM) / darting movement (wet mount)",
    negativeResult: "Growth only along stab line (SIM) / Brownian motion only (wet mount)",
    positiveOrganisms: ["E. coli", "Proteus mirabilis", "Salmonella", "Pseudomonas aeruginosa"],
    negativeOrganisms: ["Klebsiella pneumoniae", "Shigella", "Staphylococcus aureus", "Streptococcus"],
    clinicalUse: "Differentiates Klebsiella (non-motile) from E. coli (motile). Shigella (non-motile) from Salmonella (motile)",
  },
];

type TestResult = { testName: string; result: "positive" | "negative" | null };

export function BiochemicalTestSimulator() {
  const [selectedOrganism, setSelectedOrganism] = useState("");
  const [activeTest, setActiveTest] = useState(0);
  const [results, setResults] = useState<TestResult[]>(biochemTests.map((t) => ({ testName: t.name, result: null })));
  const [showInterpretation, setShowInterpretation] = useState(false);

  const test = biochemTests[activeTest];

  const organisms = [
    "E. coli", "Klebsiella pneumoniae", "Staphylococcus aureus", "Streptococcus pyogenes",
    "Pseudomonas aeruginosa", "Proteus mirabilis", "Salmonella typhi", "Shigella flexneri",
    "Enterobacter cloacae", "Neisseria meningitidis",
  ];

  const performTest = (result: "positive" | "negative") => {
    setResults((prev) => prev.map((r, i) => (i === activeTest ? { ...r, result } : r)));
  };

  const getExpectedResult = (testInfo: TestInfo, org: string): "positive" | "negative" => {
    return testInfo.positiveOrganisms.some((o) => org.toLowerCase().includes(o.toLowerCase().split(" ")[0]))
      ? "positive" : "negative";
  };

  const runAllTests = () => {
    if (!selectedOrganism) return;
    setResults(biochemTests.map((t) => ({
      testName: t.name,
      result: getExpectedResult(t, selectedOrganism),
    })));
    setShowInterpretation(true);
  };

  return (
    <div className="space-y-6">
      {/* Organism Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Organism to Test</label>
          <Select value={selectedOrganism} onValueChange={(v) => { setSelectedOrganism(v); setShowInterpretation(false); setResults(biochemTests.map((t) => ({ testName: t.name, result: null }))); }}>
            <SelectTrigger><SelectValue placeholder="Choose an organism..." /></SelectTrigger>
            <SelectContent>
              {organisms.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={runAllTests} disabled={!selectedOrganism} className="mt-6">
          <Beaker className="h-4 w-4 mr-2" /> Run All Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Tests</h4>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 pr-4">
              {biochemTests.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTest(i)}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                    i === activeTest ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="flex-1 font-medium">{t.name}</span>
                  {results[i].result && (
                    results[i].result === "positive"
                      ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      : <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Test Detail */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">{test.emoji} {test.name}</CardTitle>
                {results[activeTest].result && (
                  <Badge variant={results[activeTest].result === "positive" ? "default" : "destructive"}>
                    {results[activeTest].result === "positive" ? "✅ Positive" : "❌ Negative"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold mb-1">Principle</h5>
                <p className="text-sm text-muted-foreground">{test.principle}</p>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Reagents</h5>
                <div className="flex flex-wrap gap-2">
                  {test.reagents.map((r) => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Procedure</h5>
                <p className="text-sm">{test.procedure}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-xs font-semibold text-success mb-1">Positive Result</p>
                  <p className="text-xs">{test.positiveResult}</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs font-semibold text-destructive mb-1">Negative Result</p>
                  <p className="text-xs">{test.negativeResult}</p>
                </div>
              </div>

              {selectedOrganism && !results[activeTest].result && (
                <div className="flex gap-3">
                  <Button onClick={() => performTest("positive")} variant="outline" className="flex-1 border-success text-success hover:bg-success/10">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Positive
                  </Button>
                  <Button onClick={() => performTest("negative")} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10">
                    <XCircle className="h-4 w-4 mr-1" /> Negative
                  </Button>
                </div>
              )}

              <div className="text-sm">
                <h5 className="font-semibold mb-2">Clinical Significance</h5>
                <p className="text-muted-foreground">{test.clinicalUse}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <h6 className="font-semibold mb-1 text-success">Typically Positive</h6>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {test.positiveOrganisms.map((o) => <li key={o}>• <span className="italic">{o}</span></li>)}
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold mb-1 text-destructive">Typically Negative</h6>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {test.negativeOrganisms.map((o) => <li key={o}>• <span className="italic">{o}</span></li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Summary */}
      {showInterpretation && selectedOrganism && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📊 Biochemical Profile: <span className="italic">{selectedOrganism}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {results.map((r, i) => (
                <div key={i} className={`p-2 rounded-lg text-center text-xs font-medium ${
                  r.result === "positive" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  <span className="text-lg block">{biochemTests[i].emoji}</span>
                  {biochemTests[i].name.split(" ")[0]}
                  <br />{r.result === "positive" ? "+" : "−"}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
