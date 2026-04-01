import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight, ChevronLeft, RotateCcw, Dna, FlaskConical, Zap, Timer,
  CheckCircle2, XCircle, AlertTriangle, Thermometer, Beaker
} from "lucide-react";

// ─── Shared Timer ───
function LabTimer({ duration, label, onComplete }: { duration: number; label: string; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setRemaining(duration); setRunning(false); setDone(false); }, [duration]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(t); setRunning(false); setDone(true); onComplete(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = ((duration - remaining) / duration) * 100;

  return (
    <div className="p-3 rounded-lg bg-card border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="font-mono text-sm font-bold">{mins}:{secs.toString().padStart(2, "0")}</span>
        </div>
        {!done ? (
          <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>
            {running ? "Pause" : "Start"}
          </Button>
        ) : (
          <Badge variant="default" className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" /> Done</Badge>
        )}
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DNA EXTRACTION SIMULATOR
// Based on Sambrook & Russell: Molecular Cloning, 4th Ed.
// ═══════════════════════════════════════════════════

interface ExtractionStep {
  name: string;
  icon: string;
  equipment: string[];
  reagents: { name: string; details: string }[];
  action: string;
  principle: string;
  duration: number;
  criticalErrors: { mistake: string; consequence: string }[];
  reference: string;
}

const extractionSteps: ExtractionStep[] = [
  {
    name: "Sample Preparation",
    icon: "🧫",
    equipment: ["Microcentrifuge tubes (1.5 mL)", "Micropipettes (P20, P200, P1000)", "Tube rack"],
    reagents: [{ name: "PBS", details: "Phosphate-buffered saline, pH 7.4" }],
    action: "Transfer 1 mL of overnight bacterial culture (OD600 ≈ 1.0, ~10⁹ CFU/mL) to a 1.5 mL microcentrifuge tube. Centrifuge at 6,000 × g for 5 minutes. Discard supernatant. Resuspend pellet in 200 µL PBS.",
    principle: "Pelleting concentrates bacterial cells for efficient lysis. PBS maintains physiological osmolarity to prevent premature cell damage. OD600 measurement ensures standardized starting material.",
    duration: 300,
    criticalErrors: [
      { mistake: "Using too few cells", consequence: "Insufficient DNA yield for downstream applications" },
      { mistake: "Incomplete resuspension", consequence: "Uneven lysis, reduced yield" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6",
  },
  {
    name: "Cell Lysis",
    icon: "💥",
    equipment: ["Vortex mixer", "Heating block / water bath (56°C)"],
    reagents: [
      { name: "Lysis buffer", details: "10 mM Tris-HCl pH 8.0, 1 mM EDTA, 0.5% SDS" },
      { name: "Proteinase K", details: "20 mg/mL stock, add to 100 µg/mL final" },
      { name: "RNase A", details: "10 mg/mL stock, add to 20 µg/mL final" },
    ],
    action: "Add 400 µL lysis buffer. Add 10 µL Proteinase K (20 mg/mL). Add 4 µL RNase A (10 mg/mL). Vortex briefly (5 sec). Incubate at 56°C for 30–60 minutes until solution is clear.",
    principle: "SDS (anionic detergent) solubilizes cell membranes. EDTA chelates Mg²⁺, inhibiting DNases. Proteinase K (serine protease, active in SDS) digests proteins including histones and nucleases. RNase A degrades contaminating RNA. The 56°C temperature optimizes Proteinase K activity (Sambrook & Russell).",
    duration: 1800,
    criticalErrors: [
      { mistake: "Omitting Proteinase K", consequence: "Protein contamination, low A260/A280 ratio (<1.6)" },
      { mistake: "Temperature too high (>65°C)", consequence: "Proteinase K denaturation, reduced protein digestion" },
      { mistake: "Omitting RNase A", consequence: "RNA contamination overestimates DNA concentration" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6.4",
  },
  {
    name: "Protein Removal",
    icon: "🧪",
    equipment: ["Microcentrifuge (≥12,000 × g)", "Fume hood"],
    reagents: [
      { name: "Phenol:Chloroform:IAA", details: "25:24:1 (v/v/v), pH 8.0, saturated" },
    ],
    action: "Add equal volume (600 µL) of Phenol:Chloroform:IAA. Vortex vigorously 15 seconds. Centrifuge at 12,000 × g for 10 minutes at room temperature. Carefully transfer the UPPER aqueous phase (~500 µL) to a new tube. Avoid the interface.",
    principle: "Phenol denatures and partitions proteins into the organic (lower) phase. Chloroform stabilizes the interface and removes residual phenol. IAA (isoamyl alcohol) reduces foaming. DNA remains in the aqueous (upper) phase due to its hydrophilicity. pH 8.0 keeps DNA in aqueous phase (at acidic pH, DNA partitions to organic phase).",
    duration: 600,
    criticalErrors: [
      { mistake: "Disturbing the interface", consequence: "Protein contamination of DNA extract" },
      { mistake: "Using phenol at acidic pH", consequence: "DNA partitions to organic phase — complete DNA loss" },
      { mistake: "Not working in fume hood", consequence: "Phenol exposure — toxic and corrosive (safety violation)" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6.4.2",
  },
  {
    name: "DNA Precipitation",
    icon: "🧊",
    equipment: ["Ice rack / −20°C freezer", "Microcentrifuge"],
    reagents: [
      { name: "3M Sodium Acetate", details: "pH 5.2" },
      { name: "100% Ethanol", details: "Ice-cold (−20°C), molecular biology grade" },
    ],
    action: "Add 1/10 volume (50 µL) of 3M sodium acetate pH 5.2. Add 2.5 volumes (1.25 mL) of ice-cold 100% ethanol. Mix by gentle inversion 6–8 times. Incubate at −20°C for ≥30 minutes (or overnight for maximum recovery). You should see white DNA filaments precipitating.",
    principle: "Sodium acetate provides Na⁺ cations that neutralize the negative phosphate backbone of DNA, reducing its solubility. Ethanol reduces the dielectric constant of the solution, causing DNA to aggregate and precipitate. Cold temperature increases precipitation efficiency. The 2.5× volume ratio ensures adequate ethanol concentration for complete DNA precipitation.",
    duration: 1800,
    criticalErrors: [
      { mistake: "Room temperature ethanol", consequence: "Poor precipitation efficiency, reduced yield" },
      { mistake: "Insufficient incubation time", consequence: "Incomplete precipitation, DNA remains in solution" },
      { mistake: "Vortexing instead of gentle inversion", consequence: "DNA shearing — reduced fragment size" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6.4.3",
  },
  {
    name: "Centrifugation & Pellet Formation",
    icon: "⚙️",
    equipment: ["Microcentrifuge (≥12,000 × g)", "Micropipettes"],
    reagents: [],
    action: "Centrifuge at ≥12,000 × g for 15 minutes at 4°C. A small white/translucent DNA pellet should be visible at the bottom of the tube. Carefully aspirate and discard the supernatant without disturbing the pellet.",
    principle: "High-speed centrifugation forces precipitated DNA to the bottom of the tube. The pellet contains genomic DNA along with co-precipitated salts. The 4°C temperature maintains DNA integrity during processing.",
    duration: 900,
    criticalErrors: [
      { mistake: "Insufficient centrifugation speed", consequence: "DNA remains in supernatant — lost when discarding" },
      { mistake: "Aspirating too aggressively", consequence: "Pellet dislodges and is lost" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6.4.3",
  },
  {
    name: "Ethanol Wash",
    icon: "🫧",
    equipment: ["Microcentrifuge", "Micropipettes"],
    reagents: [{ name: "70% Ethanol", details: "Freshly prepared, ice-cold" }],
    action: "Add 1 mL of ice-cold 70% ethanol. Centrifuge at 12,000 × g for 5 minutes at 4°C. Carefully remove supernatant. Repeat wash once more.",
    principle: "70% ethanol removes co-precipitated salts (Na⁺, acetate) that would inhibit downstream enzymatic reactions (PCR, restriction digestion). The 70% concentration maintains DNA precipitation (DNA does not redissolve) while effectively dissolving salts.",
    duration: 300,
    criticalErrors: [
      { mistake: "Using 100% ethanol for wash", consequence: "Salts remain — inhibit PCR and restriction enzymes" },
      { mistake: "Only one wash", consequence: "Residual salt contamination" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed.",
  },
  {
    name: "Pellet Drying",
    icon: "💨",
    equipment: ["Speed-Vac concentrator (optional)", "Laminar flow hood"],
    reagents: [],
    action: "Air dry the pellet for 5–10 minutes at room temperature with tube inverted on clean tissue. Or use Speed-Vac for 2–3 minutes. The pellet should change from glossy to matte/translucent appearance. Do NOT over-dry.",
    principle: "Residual ethanol must be completely removed as it inhibits restriction enzymes, ligases, and PCR. Over-drying makes the pellet difficult to resuspend (glassy pellet) and can denature DNA.",
    duration: 300,
    criticalErrors: [
      { mistake: "Over-drying (>15 min)", consequence: "DNA becomes difficult to resuspend, reduced solubility" },
      { mistake: "Residual ethanol remaining", consequence: "Inhibits downstream enzymatic reactions" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed.",
  },
  {
    name: "Resuspension & Quality Control",
    icon: "💧",
    equipment: ["Micropipettes", "NanoDrop spectrophotometer", "Heating block (optional, 55°C)"],
    reagents: [{ name: "TE Buffer", details: "10 mM Tris-HCl pH 8.0, 1 mM EDTA" }],
    action: "Add 50–100 µL TE buffer (pH 8.0). Gently pipette up and down 10–20 times to resuspend. Optional: incubate at 55°C for 10 min for complete resuspension. Measure concentration using NanoDrop at A260. Assess purity: A260/A280 (protein contamination) and A260/A230 (organic contamination).",
    principle: "TE buffer at pH 8.0 maintains DNA stability — Tris buffers pH and EDTA chelates divalent cations that activate DNases. Pure DNA has A260/A280 ≈ 1.8 (lower indicates protein contamination) and A260/A230 ≈ 2.0–2.2 (lower indicates organic solvent/salt contamination).",
    duration: 0,
    criticalErrors: [
      { mistake: "Using water instead of TE", consequence: "DNA degrades faster without EDTA protection" },
      { mistake: "Vigorous vortexing", consequence: "Shears high-molecular-weight genomic DNA" },
    ],
    reference: "Sambrook & Russell, Molecular Cloning, 4th Ed., Ch. 6.5",
  },
];

function DNAExtractionSimulator() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQ, setTotalQ] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [showQC, setShowQC] = useState(false);

  const s = extractionSteps[step];
  const isLast = step === extractionSteps.length - 1;
  const handleTimerDone = useCallback(() => {}, []);

  // Simulated QC results
  const qcResults = {
    concentration: (42.7 + Math.random() * 20).toFixed(1),
    a260_280: (1.78 + Math.random() * 0.1).toFixed(2),
    a260_230: (1.95 + Math.random() * 0.3).toFixed(2),
    totalYield: ((42.7 + Math.random() * 20) * 0.05).toFixed(1),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            DNA Extraction Protocol
          </h3>
          <p className="text-xs text-muted-foreground">Sambrook & Russell, Molecular Cloning, 4th Ed.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setStep(0); setScore(0); setTotalQ(0); setShowErrors(false); setShowQC(false); }}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>

      {/* Step navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {extractionSteps.map((es, i) => (
          <button
            key={i}
            onClick={() => { setStep(i); setShowErrors(false); }}
            className={`flex flex-col items-center gap-0.5 min-w-[56px] p-1.5 rounded-lg text-[10px] transition-all border ${
              i === step ? "bg-primary/10 border-primary ring-1 ring-primary/30" :
              i < step ? "bg-primary/5 border-primary/20" : "border-border hover:bg-muted"
            }`}
          >
            <span className="text-lg">{es.icon}</span>
            <span className="leading-tight text-center">{es.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <Progress value={(step / (extractionSteps.length - 1)) * 100} className="h-2" />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{s.icon} {s.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Equipment & Reagents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">🧰 Equipment</p>
              <div className="flex flex-wrap gap-1">
                {s.equipment.map((eq) => <Badge key={eq} variant="outline" className="text-[10px]">{eq}</Badge>)}
              </div>
            </div>
            {s.reagents.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">🧪 Reagents</p>
                {s.reagents.map((r) => (
                  <div key={r.name} className="mb-1">
                    <Badge variant="secondary" className="text-[10px]">{r.name}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-1">{r.details}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium mb-1">📋 Procedure</p>
            <p className="text-sm">{s.action}</p>
          </div>

          {/* Timer */}
          {s.duration > 0 && (
            <LabTimer duration={Math.min(s.duration, 120)} label={`${s.name} (simulated)`} onComplete={handleTimerDone} />
          )}

          {/* Principle */}
          <div className="p-3 rounded-lg bg-card border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">🔬 Principle</p>
            <p className="text-sm">{s.principle}</p>
            <p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {s.reference}</p>
          </div>

          {/* Errors */}
          {s.criticalErrors.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowErrors(!showErrors)} className="gap-1.5">
                <AlertTriangle className="h-4 w-4" /> {showErrors ? "Hide" : "Show"} Errors
              </Button>
              {showErrors && (
                <div className="space-y-2 animate-fade-in">
                  {s.criticalErrors.map((e, i) => (
                    <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
                      <p className="font-medium text-destructive"><XCircle className="h-3.5 w-3.5 inline mr-1" />{e.mistake}</p>
                      <p className="text-muted-foreground text-xs mt-1">→ {e.consequence}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* QC Results on last step */}
          {isLast && (
            <>
              <Button onClick={() => setShowQC(true)} disabled={showQC} className="gap-1.5">
                <Beaker className="h-4 w-4" /> Run NanoDrop Analysis
              </Button>
              {showQC && (
                <div className="p-4 rounded-lg bg-card border-2 border-primary/30 animate-fade-in space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">📊 NanoDrop QC Results</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Concentration</p>
                      <p className="text-lg font-mono font-bold text-primary">{qcResults.concentration} ng/µL</p>
                    </div>
                    <div className="p-3 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">A260/A280 (Protein)</p>
                      <p className="text-lg font-mono font-bold text-success">{qcResults.a260_280}</p>
                      <p className="text-[10px] text-muted-foreground">Target: ~1.80</p>
                    </div>
                    <div className="p-3 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">A260/A230 (Organics)</p>
                      <p className="text-lg font-mono font-bold text-success">{qcResults.a260_230}</p>
                      <p className="text-[10px] text-muted-foreground">Target: 2.0–2.2</p>
                    </div>
                    <div className="p-3 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">Total Yield</p>
                      <p className="text-lg font-mono font-bold">{qcResults.totalYield} µg</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">A260/A280 ≈ 1.8 = pure DNA. Values &lt;1.7 suggest protein contamination.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => { setStep(Math.max(0, step - 1)); setShowErrors(false); }} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button onClick={() => { setStep(Math.min(extractionSteps.length - 1, step + 1)); setShowErrors(false); }} disabled={isLast}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PCR SIMULATOR
// Based on Molecular Cloning (Sambrook & Russell) & Prescott's
// ═══════════════════════════════════════════════════

interface PCRReagent {
  name: string;
  volume: string;
  finalConc: string;
  purpose: string;
}

const pcrMasterMix: PCRReagent[] = [
  { name: "Nuclease-free H₂O", volume: "to 25 µL", finalConc: "—", purpose: "Brings total volume to 25 µL" },
  { name: "10× PCR Buffer", volume: "2.5 µL", finalConc: "1×", purpose: "Provides optimal pH (8.3–8.8) and KCl for enzyme activity" },
  { name: "MgCl₂ (25 mM)", volume: "1.5 µL", finalConc: "1.5 mM", purpose: "Essential cofactor for Taq polymerase; affects specificity" },
  { name: "dNTP Mix (10 mM each)", volume: "0.5 µL", finalConc: "200 µM each", purpose: "Building blocks (dATP, dTTP, dCTP, dGTP) for new DNA strands" },
  { name: "Forward Primer (10 µM)", volume: "1.25 µL", finalConc: "0.5 µM", purpose: "Binds to 3′ end of sense strand, initiates synthesis" },
  { name: "Reverse Primer (10 µM)", volume: "1.25 µL", finalConc: "0.5 µM", purpose: "Binds to 3′ end of antisense strand, initiates synthesis" },
  { name: "Taq DNA Polymerase (5 U/µL)", volume: "0.125 µL", finalConc: "0.625 U", purpose: "Thermostable DNA polymerase (Thermus aquaticus), synthesizes DNA 5′→3′" },
  { name: "Template DNA", volume: "1–2 µL", finalConc: "10–100 ng", purpose: "Target DNA to be amplified" },
];

interface ThermalStep {
  name: string;
  temp: string;
  tempNum: number;
  duration: string;
  durationSec: number;
  principle: string;
  visual: string;
}

const thermalProfile: ThermalStep[] = [
  { name: "Initial Denaturation", temp: "94°C", tempNum: 94, duration: "3 min", durationSec: 180, principle: "Complete denaturation of template DNA. Ensures all dsDNA is separated into single strands before cycling begins. Also activates hot-start polymerases.", visual: "🔥 Complete strand separation" },
  { name: "Denaturation", temp: "94°C", tempNum: 94, duration: "30 sec", durationSec: 30, principle: "Hydrogen bonds between base pairs break at >90°C. Double-stranded DNA denatures into two single-stranded templates. Taq polymerase survives due to thermostability (half-life ~40 min at 95°C).", visual: "═══ → ─── + ───" },
  { name: "Annealing", temp: "55°C", tempNum: 55, duration: "30 sec", durationSec: 30, principle: "Temperature lowered to allow primers to bind complementary sequences on template strands. Annealing temperature (Ta) is typically 5°C below the primer melting temperature (Tm). Too low = non-specific binding; too high = no binding.", visual: "───▶ primers bind ◀───" },
  { name: "Extension", temp: "72°C", tempNum: 72, duration: "60 sec", durationSec: 60, principle: "Optimal temperature for Taq polymerase activity (72°C). Enzyme synthesizes new DNA strand 5′→3′ from each primer at ~1,000 nucleotides/second. Extension time depends on amplicon size (~1 min/kb).", visual: "▶═══════════▶ new strand" },
  { name: "Final Extension", temp: "72°C", tempNum: 72, duration: "7 min", durationSec: 420, principle: "Extended incubation at 72°C ensures all partially synthesized fragments are completed. Adds 3′-A overhangs useful for TA cloning.", visual: "✅ All fragments completed" },
  { name: "Hold", temp: "4°C", tempNum: 4, duration: "∞", durationSec: 0, principle: "Products held at 4°C to prevent non-specific activity. Store at −20°C for long-term.", visual: "❄️ Products stabilized" },
];

const gelBands = [
  { lane: "Ladder", bands: [100, 200, 300, 500, 750, 1000, 1500, 2000] },
  { lane: "Sample 1", bands: [1500], label: "16S rRNA (1,500 bp)" },
  { lane: "Sample 2", bands: [533], label: "mecA gene (533 bp)" },
  { lane: "Neg. Control", bands: [], label: "No template" },
  { lane: "Sample 3", bands: [300, 750], label: "Multiplex PCR" },
];

function PCRSimulator() {
  const [phase, setPhase] = useState<"setup" | "cycling" | "gel">("setup");
  const [mixStep, setMixStep] = useState(0);
  const [cycleStep, setCycleStep] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [gelRunning, setGelRunning] = useState(false);
  const [gelDone, setGelDone] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const copies = Math.pow(2, cycle);
  const currentThermal = thermalProfile[cycleStep];

  const nextCycleStep = () => {
    if (cycleStep < thermalProfile.length - 1) {
      const nextIdx = cycleStep + 1;
      setCycleStep(nextIdx);
      // After extension (step 3), increment cycle and loop back to denaturation (step 1)
      if (cycleStep === 3 && cycle < 30) {
        setCycle((c) => c + 1);
      }
    }
  };

  const runGel = () => {
    setGelRunning(true);
    setTimeout(() => { setGelRunning(false); setGelDone(true); }, 2500);
  };

  const reset = () => {
    setPhase("setup");
    setMixStep(0);
    setCycleStep(0);
    setCycle(1);
    setGelRunning(false);
    setGelDone(false);
    setShowErrors(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            PCR Protocol Simulator
          </h3>
          <p className="text-xs text-muted-foreground">Sambrook & Russell, Molecular Cloning & Prescott's Microbiology</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
      </div>

      {/* Phase selector */}
      <div className="flex gap-2">
        {(["setup", "cycling", "gel"] as const).map((p, i) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
              phase === p ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
            }`}
          >
            {i + 1}. {p === "setup" ? "Master Mix Prep" : p === "cycling" ? "Thermal Cycling" : "Gel Electrophoresis"}
          </button>
        ))}
      </div>

      {/* ── Phase 1: Master Mix ── */}
      {phase === "setup" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🧪 PCR Master Mix Preparation (25 µL reaction)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-medium mb-1">📋 Protocol</p>
              <p>Prepare master mix on ice. Add components in order shown. Template DNA added last to prevent contamination. Mix gently — do NOT vortex (shears DNA).</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left text-xs">Reagent</th>
                    <th className="p-2 text-left text-xs">Volume</th>
                    <th className="p-2 text-left text-xs">Final Conc.</th>
                    <th className="p-2 text-left text-xs">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {pcrMasterMix.map((r, i) => (
                    <tr key={i} className={`border-t ${i <= mixStep ? "bg-success/5" : ""} ${i === mixStep ? "ring-2 ring-primary/30" : ""}`}>
                      <td className="p-2 text-xs font-medium">
                        {i <= mixStep && <CheckCircle2 className="h-3 w-3 inline mr-1 text-success" />}
                        {r.name}
                      </td>
                      <td className="p-2 text-xs font-mono">{r.volume}</td>
                      <td className="p-2 text-xs font-mono">{r.finalConc}</td>
                      <td className="p-2 text-xs text-muted-foreground">{r.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setMixStep(Math.max(0, mixStep - 1))} disabled={mixStep === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => {
                if (mixStep < pcrMasterMix.length - 1) setMixStep(mixStep + 1);
                else setPhase("cycling");
              }}>
                {mixStep === pcrMasterMix.length - 1 ? "Load Thermal Cycler →" : "Add Reagent"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 2: Thermal Cycling ── */}
      {phase === "cycling" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-destructive" />
              Thermal Cycling — Cycle {cycle}/30
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">~{copies.toLocaleString()} copies generated</p>
              <Badge variant="secondary" className="font-mono">2^{cycle} = {copies.toLocaleString()}</Badge>
            </div>

            <Progress value={(cycle / 30) * 100} className="h-2" />

            {/* Temperature indicator */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                currentThermal.tempNum >= 90 ? "bg-destructive/20 text-destructive" :
                currentThermal.tempNum >= 70 ? "bg-warning/20 text-warning-foreground" :
                currentThermal.tempNum >= 50 ? "bg-primary/20 text-primary" :
                "bg-blue-500/20 text-blue-600"
              }`}>
                {currentThermal.temp}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{currentThermal.name}</p>
                <p className="text-xs text-muted-foreground">{currentThermal.duration}</p>
              </div>
              <div className="text-2xl">{currentThermal.visual.split(" ")[0]}</div>
            </div>

            <div className="p-3 rounded-lg bg-card border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">🔬 Principle</p>
              <p className="text-sm">{currentThermal.principle}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 text-center font-mono text-sm">
              {currentThermal.visual}
            </div>

            {/* Thermal profile overview */}
            <div className="flex gap-1">
              {thermalProfile.map((tp, i) => (
                <div
                  key={i}
                  className={`flex-1 py-1.5 rounded text-[9px] text-center font-medium transition-all ${
                    i === cycleStep ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                    i < cycleStep ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tp.temp}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setCycleStep(Math.max(0, cycleStep - 1))} disabled={cycleStep === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => {
                if (cycleStep < thermalProfile.length - 1) nextCycleStep();
                else setPhase("gel");
              }}>
                {cycleStep === thermalProfile.length - 1 ? "Run Gel →" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 3: Gel Electrophoresis ── */}
      {phase === "gel" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Agarose Gel Electrophoresis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-medium mb-1">📋 Protocol</p>
              <p>1.5% Agarose gel in 1× TAE buffer. Load 5 µL PCR product + 1 µL 6× loading dye. Run at 100V for 30–45 min. Stain with ethidium bromide (EtBr) or SYBR Safe. Visualize under UV transilluminator.</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">1.5% Agarose</Badge>
              <Badge variant="outline" className="text-xs">1× TAE Buffer</Badge>
              <Badge variant="outline" className="text-xs">100V, 30 min</Badge>
              <Badge variant="outline" className="text-xs">EtBr / SYBR Safe</Badge>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={runGel} disabled={gelRunning || gelDone}>
                <Zap className="h-4 w-4 mr-1" /> {gelRunning ? "Running..." : "Run Gel"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setGelDone(false); setGelRunning(false); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Gel visualization */}
            <div className="bg-foreground/95 rounded-lg p-4">
              <div className="flex justify-between text-xs text-muted mb-2">
                <span>⊖ Cathode (−)</span>
                <span>⊕ Anode (+)</span>
              </div>
              <div className="flex gap-2 justify-around mb-1">
                {gelBands.map((lane, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-2 bg-muted/30 rounded-t mx-auto" />
                    <span className="text-[9px] text-muted/50 block mt-0.5">{lane.lane}</span>
                  </div>
                ))}
              </div>
              <div className="relative bg-foreground/80 rounded-lg h-56 flex gap-2 justify-around px-2 py-4">
                {gelBands.map((lane, li) => (
                  <div key={li} className="flex-1 relative">
                    {(gelDone ? lane.bands : []).map((bp, bi) => {
                      const position = (1 - bp / 2000) * 100;
                      const brightness = lane.lane === "Ladder" ? "bg-green-400/60" : "bg-green-300/90";
                      const width = lane.lane === "Ladder" ? "w-8" : "w-10";
                      return (
                        <div
                          key={bi}
                          className={`absolute ${width} h-1.5 ${brightness} rounded-full left-1/2 -translate-x-1/2 transition-all duration-1000`}
                          style={{ top: `${position}%` }}
                          title={`${bp} bp`}
                        >
                          {lane.lane === "Ladder" && (
                            <span className="absolute -left-6 text-[8px] text-green-400/50">{bp}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {gelRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-lg animate-pulse">
                    <span className="text-blue-400 text-sm font-mono">⚡ Running at 100V...</span>
                  </div>
                )}
              </div>
            </div>

            {gelDone && (
              <div className="p-4 rounded-lg bg-card border space-y-2 text-sm animate-fade-in">
                <h4 className="font-semibold">📊 Band Interpretation</h4>
                {gelBands.filter(l => l.lane !== "Ladder").map((l) => (
                  <p key={l.lane}>
                    • <strong>{l.lane}:</strong>{" "}
                    {l.bands.length === 0 ? "No bands — negative control confirms no contamination" :
                     `Band(s) at ~${l.bands.join(", ")} bp — ${"label" in l ? l.label : ""}`}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════
export function MolecularSimulator() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pcr" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="pcr" className="gap-1.5 text-xs"><FlaskConical className="h-3.5 w-3.5" /> PCR Protocol</TabsTrigger>
          <TabsTrigger value="gel" className="gap-1.5 text-xs"><Zap className="h-3.5 w-3.5" /> Gel Only</TabsTrigger>
          <TabsTrigger value="extract" className="gap-1.5 text-xs"><Dna className="h-3.5 w-3.5" /> DNA Extraction</TabsTrigger>
        </TabsList>
        <TabsContent value="pcr"><PCRSimulator /></TabsContent>
        <TabsContent value="gel">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">Standalone gel electrophoresis is included in the PCR simulation (Phase 3). Select the PCR tab to run the full workflow including gel visualization.</p>
            <Button onClick={() => {}} variant="outline">Go to PCR Protocol →</Button>
          </Card>
        </TabsContent>
        <TabsContent value="extract"><DNAExtractionSimulator /></TabsContent>
      </Tabs>
    </div>
  );
}
