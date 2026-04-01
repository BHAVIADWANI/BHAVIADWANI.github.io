import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, RotateCcw, Target, Ruler } from "lucide-react";

type AntibioticBreakpoint = {
  name: string;
  diskContent: string;
  S: number; // ≥ S is Susceptible
  I: [number, number]; // Intermediate range
  R: number; // ≤ R is Resistant
};

const organisms: Record<string, { antibiotics: AntibioticBreakpoint[] }> = {
  "Staphylococcus aureus": {
    antibiotics: [
      { name: "Penicillin (P)", diskContent: "10 U", S: 29, I: [0, 0], R: 28 },
      { name: "Oxacillin (OX)", diskContent: "1 µg", S: 13, I: [11, 12], R: 10 },
      { name: "Vancomycin (VA)", diskContent: "30 µg", S: 15, I: [0, 0], R: 14 },
      { name: "Erythromycin (E)", diskContent: "15 µg", S: 23, I: [14, 22], R: 13 },
      { name: "Gentamicin (GM)", diskContent: "10 µg", S: 15, I: [13, 14], R: 12 },
      { name: "Ciprofloxacin (CIP)", diskContent: "5 µg", S: 21, I: [16, 20], R: 15 },
    ],
  },
  "Escherichia coli": {
    antibiotics: [
      { name: "Ampicillin (AM)", diskContent: "10 µg", S: 17, I: [14, 16], R: 13 },
      { name: "Gentamicin (GM)", diskContent: "10 µg", S: 15, I: [13, 14], R: 12 },
      { name: "Ciprofloxacin (CIP)", diskContent: "5 µg", S: 21, I: [16, 20], R: 15 },
      { name: "Ceftriaxone (CRO)", diskContent: "30 µg", S: 23, I: [20, 22], R: 19 },
      { name: "Trimethoprim-Sulfa (SXT)", diskContent: "1.25/23.75 µg", S: 16, I: [11, 15], R: 10 },
      { name: "Imipenem (IPM)", diskContent: "10 µg", S: 23, I: [20, 22], R: 19 },
    ],
  },
  "Pseudomonas aeruginosa": {
    antibiotics: [
      { name: "Piperacillin-Tazo (TZP)", diskContent: "100/10 µg", S: 21, I: [18, 20], R: 17 },
      { name: "Ceftazidime (CAZ)", diskContent: "30 µg", S: 18, I: [15, 17], R: 14 },
      { name: "Gentamicin (GM)", diskContent: "10 µg", S: 15, I: [13, 14], R: 12 },
      { name: "Ciprofloxacin (CIP)", diskContent: "5 µg", S: 21, I: [16, 20], R: 15 },
      { name: "Imipenem (IPM)", diskContent: "10 µg", S: 19, I: [16, 18], R: 15 },
      { name: "Colistin (CL)", diskContent: "10 µg", S: 11, I: [0, 0], R: 10 },
    ],
  },
};

const kbSteps = [
  {
    title: "Inoculum Preparation (0.5 McFarland)",
    description: "Prepare a bacterial suspension adjusted to 0.5 McFarland standard (≈1.5 × 10⁸ CFU/mL) using a turbidimeter. The suspension should match the turbidity of the standard against a white card with black lines.",
    tips: ["Use 4–5 well-isolated colonies of the same morphology", "Compare turbidity within 15 minutes of preparation", "If too turbid: add sterile saline. If too light: add more colonies"],
    errors: ["Too concentrated inoculum → smaller zones → false resistance", "Too dilute inoculum → larger zones → false susceptibility"],
  },
  {
    title: "Mueller-Hinton Agar Inoculation",
    description: "Dip a sterile cotton swab into the adjusted inoculum. Rotate the swab against the tube wall to remove excess fluid. Streak the entire surface of Mueller-Hinton agar (MHA) plate in three directions (rotating plate 60° each time) to ensure even, confluent growth.",
    tips: ["MHA depth must be 4 mm (±0.5 mm)", "pH 7.2–7.4", "Let plate dry 3–5 min before applying disks"],
    errors: ["Uneven streaking → uneven zones → unreliable results", "Agar too thick → smaller zones; too thin → larger zones"],
  },
  {
    title: "Antibiotic Disk Placement",
    description: "Using sterile forceps or a disk dispenser, place antibiotic disks on the inoculated MHA plate. Press each disk gently to ensure complete contact with the agar surface. Space disks at least 24 mm apart (center to center) and 15 mm from the plate edge.",
    tips: ["Maximum 12 disks on a 150 mm plate, 5 on a 100 mm plate", "Apply disks within 15 min of inoculation", "Once placed, do not move disks (antibiotic diffusion begins immediately)"],
    errors: ["Overlapping zones → cannot measure accurately", "Poor disk-agar contact → irregular or absent zones"],
  },
  {
    title: "Incubation",
    description: "Invert plates and incubate at 35 ± 2°C for 16–18 hours in ambient air (most organisms). Do NOT incubate in CO₂ unless specifically required, as CO₂ can alter pH and affect zone sizes.",
    tips: ["Read at exactly 16–18 h for accurate results", "For MRSA screening (oxacillin): incubate full 24 h", "Some organisms require specific conditions (CO₂ for Neisseria/Haemophilus)"],
    errors: ["Reading too early → zones appear larger (false susceptible)", "Excessive incubation → smaller zones (resistant mutants grow in)"],
  },
  {
    title: "Zone Measurement & Interpretation",
    description: "Measure the diameter of each zone of inhibition in millimeters using calipers or a ruler. Measure across the center of the disk. Include the diameter of the disk. Compare measurements to CLSI M100 breakpoints to interpret as Susceptible (S), Intermediate (I), or Resistant (R).",
    tips: ["Measure to the nearest mm", "Read zones on the back of the plate against a dark background", "For swarming Proteus: ignore swarming veil, read obvious zone"],
    errors: ["Measuring radius instead of diameter → wrong interpretation", "Not using current CLSI tables → outdated breakpoints"],
  },
];

export function ASTSimulator() {
  const [step, setStep] = useState(0);
  const [organism, setOrganism] = useState("");
  const [zones, setZones] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const orgData = organism ? organisms[organism] : null;

  const interpretZone = (zone: number, abx: AntibioticBreakpoint): "S" | "I" | "R" => {
    if (zone >= abx.S) return "S";
    if (zone <= abx.R) return "R";
    return "I";
  };

  const interpretAll = () => {
    setShowResults(true);
  };

  const generateRandomZones = () => {
    if (!orgData) return;
    const newZones: Record<string, string> = {};
    orgData.antibiotics.forEach((abx) => {
      const base = Math.floor((abx.S + abx.R) / 2);
      const variation = Math.floor(Math.random() * 20) - 8;
      newZones[abx.name] = String(Math.max(6, base + variation));
    });
    setZones(newZones);
  };

  const reset = () => {
    setStep(0);
    setOrganism("");
    setZones({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kirby–Bauer Disk Diffusion Method</h3>
          <p className="text-sm text-muted-foreground">CLSI M100 Performance Standards</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
      </div>

      <Progress value={(step / (kbSteps.length - 1)) * 100} className="h-2" />

      {/* Kirby-Bauer Procedure Steps */}
      <Card className="bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step {step + 1}: {kbSteps[step].title}</CardTitle>
            <Badge variant="outline">{step + 1}/{kbSteps.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{kbSteps[step].description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <h5 className="text-xs font-semibold text-success mb-2">Tips</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {kbSteps[step].tips.map((t, i) => <li key={i}>✅ {t}</li>)}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <h5 className="text-xs font-semibold text-destructive mb-2">Common Errors</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {kbSteps[step].errors.map((e, i) => <li key={i}>❌ {e}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button onClick={() => setStep(Math.min(kbSteps.length - 1, step + 1))} disabled={step === kbSteps.length - 1}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Zone Measurement Simulator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Ruler className="h-5 w-5" /> Zone of Inhibition Measurement</CardTitle>
          <CardDescription>Select an organism, enter zone diameters (mm), and interpret according to CLSI breakpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={organism} onValueChange={(v) => { setOrganism(v); setZones({}); setShowResults(false); }}>
                <SelectTrigger><SelectValue placeholder="Select organism..." /></SelectTrigger>
                <SelectContent>
                  {Object.keys(organisms).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {organism && (
              <Button variant="outline" onClick={generateRandomZones}>
                <Target className="h-4 w-4 mr-2" /> Simulate Zones
              </Button>
            )}
          </div>

          {orgData && (
            <>
              <div className="space-y-3">
                {orgData.antibiotics.map((abx) => (
                  <div key={abx.name} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{abx.name}</p>
                      <p className="text-xs text-muted-foreground">Disk: {abx.diskContent} | S≥{abx.S} | R≤{abx.R}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        placeholder="mm"
                        value={zones[abx.name] || ""}
                        onChange={(e) => setZones({ ...zones, [abx.name]: e.target.value })}
                      />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                    {showResults && zones[abx.name] && (
                      <Badge variant={
                        interpretZone(Number(zones[abx.name]), abx) === "S" ? "default" :
                        interpretZone(Number(zones[abx.name]), abx) === "R" ? "destructive" : "secondary"
                      }>
                        {interpretZone(Number(zones[abx.name]), abx)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={interpretAll} disabled={Object.keys(zones).length === 0} className="w-full">
                Interpret Results (CLSI M100)
              </Button>
            </>
          )}

          {showResults && orgData && (
            <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <h4 className="font-semibold text-sm mb-3">Antibiogram Summary — <span className="italic">{organism}</span></h4>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">
                    {orgData.antibiotics.filter((a) => zones[a.name] && interpretZone(Number(zones[a.name]), a) === "S").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Susceptible</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">
                    {orgData.antibiotics.filter((a) => zones[a.name] && interpretZone(Number(zones[a.name]), a) === "I").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Intermediate</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">
                    {orgData.antibiotics.filter((a) => zones[a.name] && interpretZone(Number(zones[a.name]), a) === "R").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Resistant</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
