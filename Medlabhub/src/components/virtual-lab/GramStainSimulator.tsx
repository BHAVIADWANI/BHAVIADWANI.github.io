import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, RotateCcw, AlertTriangle, CheckCircle2, XCircle,
  Flame, Droplets, Timer as TimerIcon, Microscope, Eye, FlaskConical,
  GraduationCap, ClipboardCheck, Lightbulb, Beaker, Wind, BookOpen
} from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number;
  name: string;
  action: string;
  requiredItem: string; // drag item key
  duration: number; // seconds, 0 = instant
  principle: string;
  gpColor: string;
  gnColor: string;
  gpLabel: string;
  gnLabel: string;
  hint: string;
  mentorTip: string;
  reference: string;
  quiz?: { question: string; correct: number; options: string[] };
  criticalErrors: { mistake: string; consequence: string }[];
}

interface DragItem {
  key: string;
  label: string;
  icon: string;
  category: "tool" | "reagent";
}

interface ScoreState {
  correctSteps: number;
  wrongSteps: number;
  quizCorrect: number;
  quizTotal: number;
  timerPenalties: number;
  totalTime: number;
}

// ──────────────────────────────────────────────
// Protocol Data (validated: Prescott's Micro 12th Ed, CLSI, WHO, Bergey's)
// ──────────────────────────────────────────────
const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    id: 1, name: "Prepare Smear", action: "Drag the inoculating loop to the slide to spread a thin smear of bacterial suspension.",
    requiredItem: "loop", duration: 0,
    principle: "A thin, even smear ensures uniform staining. Overly thick smears trap stain causing false-positive results. The smear should be thin enough to read text through it (Prescott's Microbiology, 12th Ed.).",
    gpColor: "transparent", gnColor: "transparent", gpLabel: "Unstained", gnLabel: "Unstained",
    hint: "Pick up the inoculating loop and drag it to the slide.", mentorTip: "A good smear is the foundation of an accurate Gram stain. Make it thin and even!",
    reference: "Prescott's Microbiology, 12th Ed., Ch. 2.6",
    criticalErrors: [{ mistake: "Smear too thick", consequence: "Over-staining and false Gram-positive results" }],
  },
  {
    id: 2, name: "Heat Fix", action: "Pass the slide over the Bunsen burner flame 3 times to fix the bacteria.",
    requiredItem: "burner", duration: 0,
    principle: "Heat fixation kills bacteria, adheres them to the slide, and coagulates proteins to preserve morphology. Over-heating destroys cell wall architecture (Bergey's Manual).",
    gpColor: "transparent", gnColor: "transparent", gpLabel: "Fixed", gnLabel: "Fixed",
    hint: "Drag the slide toward the Bunsen burner.", mentorTip: "Pass gently — the slide should be warm but not hot to touch. Smear side UP!",
    reference: "Bergey's Manual of Systematic Bacteriology",
    criticalErrors: [{ mistake: "Over-heating", consequence: "Cell distortion and altered Gram reaction" }],
  },
  {
    id: 3, name: "Crystal Violet (1 min)", action: "Apply crystal violet stain to flood the smear. Wait 60 seconds.",
    requiredItem: "crystal_violet", duration: 60,
    principle: "Crystal violet (CV⁺ ions) penetrates both GP and GN cell walls and binds to negatively charged components. ALL bacteria appear deep purple at this stage (Prescott's).",
    gpColor: "#7c3aed", gnColor: "#7c3aed", gpLabel: "Purple (CV⁺)", gnLabel: "Purple (CV⁺)",
    hint: "Drag the purple Crystal Violet bottle to the slide.", mentorTip: "Ensure complete coverage. All cells take up CV equally — this is the primary stain.",
    reference: "Prescott's Microbiology, 12th Ed.",
    quiz: { question: "After crystal violet, what color are Gram-negative bacteria?", correct: 0, options: ["Purple — same as Gram-positive", "Pink/Red", "Colorless", "Blue"] },
    criticalErrors: [{ mistake: "Insufficient coverage", consequence: "Unstained areas give false results" }],
  },
  {
    id: 4, name: "Wash with Water", action: "Gently rinse the slide with distilled water.",
    requiredItem: "wash_bottle", duration: 5,
    principle: "Rinsing removes excess crystal violet from the slide surface while preserving stain bound within cells.",
    gpColor: "#7c3aed", gnColor: "#7c3aed", gpLabel: "Purple (CV⁺)", gnLabel: "Purple (CV⁺)",
    hint: "Drag the wash bottle to the slide.", mentorTip: "Tilt the slide at 45° and use a gentle stream. Don't blast directly on the smear!",
    reference: "WHO Basic Laboratory Procedures, 2nd Ed.",
    criticalErrors: [{ mistake: "Forceful water stream", consequence: "Can remove stain and bacteria" }],
  },
  {
    id: 5, name: "Gram's Iodine (1 min)", action: "Apply Gram's iodine (mordant) to the smear. Wait 60 seconds.",
    requiredItem: "iodine", duration: 60,
    principle: "Iodine acts as a MORDANT — it forms a large crystal violet-iodine (CV–I) complex within cells. This complex becomes trapped in the thick peptidoglycan (~20–80nm) of GP cells (Prescott's).",
    gpColor: "#581c87", gnColor: "#581c87", gpLabel: "Purple (CV–I)", gnLabel: "Purple (CV–I)",
    hint: "Drag the brown Iodine bottle to the slide.", mentorTip: "The mordant step is critical. Without it, CV washes out of ALL cells during decolorization.",
    reference: "Prescott's Microbiology, 12th Ed.",
    quiz: { question: "What is the role of Gram's iodine?", correct: 2, options: ["Primary stain", "Decolorizer", "Mordant — forms CV–I complex", "Counterstain"] },
    criticalErrors: [{ mistake: "Skipping iodine", consequence: "CV not fixed — washes out of all cells" }],
  },
  {
    id: 6, name: "Wash with Water", action: "Rinse gently with distilled water to remove excess iodine.",
    requiredItem: "wash_bottle", duration: 5,
    principle: "Removes unbound iodine before the critical decolorization step.",
    gpColor: "#581c87", gnColor: "#581c87", gpLabel: "Purple (CV–I)", gnLabel: "Purple (CV–I)",
    hint: "Drag the wash bottle to the slide.", mentorTip: "Quick rinse is fine here. We're preparing for the most critical step next.",
    reference: "Clinical Microbiology Procedures Handbook",
    criticalErrors: [],
  },
  {
    id: 7, name: "Decolorize (10–20 sec)", action: "⚠️ CRITICAL! Apply decolorizer drop-wise for 10–20 seconds. Stop immediately when runoff is barely clear.",
    requiredItem: "decolorizer", duration: 15,
    principle: "The decolorizer dissolves the outer membrane of GN cells and the thin peptidoglycan cannot retain CV–I → GN become COLORLESS. GP thick peptidoglycan shrinks and traps CV–I → remain PURPLE. This is the DIFFERENTIAL step.",
    gpColor: "#7c3aed", gnColor: "transparent", gpLabel: "PURPLE (retained!)", gnLabel: "COLORLESS (lost CV–I)",
    hint: "Drag the decolorizer bottle carefully to the slide.", mentorTip: "⚠️ Too long = false negative (GP looks GN). Too short = false positive (GN looks GP). 10-20 seconds maximum!",
    reference: "Prescott's Microbiology & WHO Lab Manual",
    quiz: { question: "What happens if you over-decolorize?", correct: 1, options: ["Gram-negatives appear Gram-positive", "Gram-positives lose CV–I (false negative)", "All cells turn green", "No effect"] },
    criticalErrors: [
      { mistake: "Over-decolorization (>20s)", consequence: "GP cells lose CV–I → false Gram-negative" },
      { mistake: "Under-decolorization (<5s)", consequence: "GN cells retain CV–I → false Gram-positive" },
    ],
  },
  {
    id: 8, name: "Wash", action: "Immediately rinse with water to stop decolorization.",
    requiredItem: "wash_bottle", duration: 5,
    principle: "Stops decolorization instantly. Delay allows continued extraction of CV–I complex.",
    gpColor: "#7c3aed", gnColor: "transparent", gpLabel: "Purple", gnLabel: "Colorless",
    hint: "Quick! Wash immediately after decolorization.", mentorTip: "Speed matters here! Any delay acts as extended decolorization.",
    reference: "WHO Basic Lab Procedures, 2nd Ed.",
    criticalErrors: [{ mistake: "Delayed rinsing", consequence: "Extended decolorization → false negatives" }],
  },
  {
    id: 9, name: "Safranin (1 min)", action: "Apply safranin counterstain. Wait 30–60 seconds.",
    requiredItem: "safranin", duration: 60,
    principle: "Safranin is a red/pink dye. GN cells (now colorless) absorb safranin → appear PINK. GP cells (deep purple) are not significantly affected — dark purple masks lighter pink (Clinical Microbiology Procedures Handbook).",
    gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "PURPLE (final)", gnLabel: "PINK (safranin)",
    hint: "Drag the red Safranin bottle to the slide.", mentorTip: "This is the counterstain. It gives the GN bacteria their characteristic pink color.",
    reference: "Clinical Microbiology Procedures Handbook",
    quiz: { question: "Why don't GP cells appear pink?", correct: 2, options: ["They repel safranin", "Safranin doesn't bind to peptidoglycan", "Deep purple CV–I masks the lighter pink", "Safranin evaporates on contact"] },
    criticalErrors: [{ mistake: "Skipping safranin", consequence: "GN cells invisible — only GP visible" }],
  },
  {
    id: 10, name: "Final Wash", action: "Gently rinse with distilled water.",
    requiredItem: "wash_bottle", duration: 5,
    principle: "Removes excess safranin for a clean microscope slide.",
    gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Purple", gnLabel: "Pink",
    hint: "Final wash to clean the slide.", mentorTip: "Almost done! Gentle rinse only.",
    reference: "Prescott's Microbiology",
    criticalErrors: [],
  },
  {
    id: 11, name: "Dry Slide", action: "Blot dry with bibulous paper — do NOT rub.",
    requiredItem: "paper", duration: 0,
    principle: "Gentle blotting removes water without disturbing the stained smear. Rubbing removes bacteria and creates artifacts.",
    gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Purple (ready)", gnLabel: "Pink (ready)",
    hint: "Drag the bibulous paper to the slide.", mentorTip: "Blot, don't rub! Rubbing destroys your carefully stained smear.",
    reference: "Clinical Microbiology Procedures Handbook",
    criticalErrors: [{ mistake: "Rubbing the slide", consequence: "Removes bacteria, creates artifacts" }],
  },
  {
    id: 12, name: "Observe under Microscope", action: "Place slide on microscope stage. Apply immersion oil. Observe at 100× (1000× total magnification).",
    requiredItem: "microscope", duration: 0,
    principle: "Oil immersion eliminates air-glass interface, increasing resolution. At 1000× magnification, morphology, Gram reaction, and arrangement are clearly visible (Bergey's Manual).",
    gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Gram-positive (Purple)", gnLabel: "Gram-negative (Pink)",
    hint: "Drag the slide to the microscope to observe.", mentorTip: "Start at 10× to locate the stained area, then switch to 100× oil immersion.",
    reference: "Bergey's Manual of Systematic Bacteriology",
    quiz: { question: "Why is immersion oil necessary?", correct: 1, options: ["To stain bacteria", "To eliminate air-glass interface for better resolution", "To preserve the slide", "To magnify further"] },
    criticalErrors: [],
  },
];

const DRAG_ITEMS: DragItem[] = [
  { key: "loop", label: "Inoculating Loop", icon: "🔁", category: "tool" },
  { key: "burner", label: "Bunsen Burner", icon: "🔥", category: "tool" },
  { key: "wash_bottle", label: "Wash Bottle", icon: "💧", category: "tool" },
  { key: "paper", label: "Bibulous Paper", icon: "📄", category: "tool" },
  { key: "microscope", label: "Microscope", icon: "🔬", category: "tool" },
  { key: "crystal_violet", label: "Crystal Violet", icon: "💜", category: "reagent" },
  { key: "iodine", label: "Gram's Iodine", icon: "🟤", category: "reagent" },
  { key: "decolorizer", label: "Decolorizer (95% EtOH)", icon: "🧪", category: "reagent" },
  { key: "safranin", label: "Safranin", icon: "🔴", category: "reagent" },
];

const ORGANISMS = [
  { name: "Staphylococcus aureus", gram: "positive" as const, shape: "cocci", arrangement: "clusters", desc: "Cocci in grape-like clusters" },
  { name: "Streptococcus pyogenes", gram: "positive" as const, shape: "cocci", arrangement: "chains", desc: "Cocci in chains" },
  { name: "Bacillus subtilis", gram: "positive" as const, shape: "rods", arrangement: "rods", desc: "Large rods, single/chains" },
  { name: "Escherichia coli", gram: "negative" as const, shape: "rods", arrangement: "rods", desc: "Short rods" },
  { name: "Neisseria meningitidis", gram: "negative" as const, shape: "cocci", arrangement: "diplococci", desc: "Kidney-bean diplococci" },
  { name: "Pseudomonas aeruginosa", gram: "negative" as const, shape: "rods", arrangement: "rods", desc: "Slender rods" },
];

// ──────────────────────────────────────────────
// Bacteria Canvas Component
// ──────────────────────────────────────────────
function BacteriaCanvas({ gpColor, gnColor, organism, stepId }: {
  gpColor: string; gnColor: string;
  organism: typeof ORGANISMS[0]; stepId: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Slide background
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, w, h);

    // Slide border
    ctx.strokeStyle = "#d4c9b8";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    if (stepId < 1) return; // No bacteria yet

    const isGP = organism.gram === "positive";
    const fillColor = isGP ? gpColor : gnColor;
    if (fillColor === "transparent") {
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 0.5;
    }

    // Generate pseudo-random positions
    const seed = organism.name.length;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (seed * 7 + i * 137.5) % 360;
      const r = 30 + (i * 13 % 50);
      positions.push({
        x: w / 2 + Math.cos(angle * Math.PI / 180) * r,
        y: h / 2 + Math.sin(angle * Math.PI / 180) * r,
      });
    }

    positions.forEach((pos) => {
      ctx.beginPath();
      if (organism.shape === "cocci") {
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      } else {
        // Rod shape
        ctx.ellipse(pos.x, pos.y, 8, 3, (pos.x * 0.1), 0, Math.PI * 2);
      }
      if (fillColor === "transparent") {
        ctx.stroke();
      } else {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
    });

    // Stain wash effect animation
    if (stepId >= 3 && stepId <= 4) {
      // Purple tint overlay
      ctx.fillStyle = "rgba(124, 58, 237, 0.05)";
      ctx.fillRect(0, 0, w, h);
    }

  }, [gpColor, gnColor, organism, stepId]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={140}
      className="rounded-lg border-2 border-border mx-auto"
      style={{ imageRendering: "auto" }}
    />
  );
}

// ──────────────────────────────────────────────
// Microscope View Component
// ──────────────────────────────────────────────
function MicroscopeViewModal({
  organism, errors, onClose
}: {
  organism: typeof ORGANISMS[0];
  errors: string[];
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setZoom(1), 100);
    return () => clearTimeout(t);
  }, []);

  const isOverDecolorized = errors.includes("over_decolorize");
  const isUnderDecolorized = errors.includes("under_decolorize");

  const gpDisplayColor = isOverDecolorized ? "#ec4899" : "#7c3aed";
  const gnDisplayColor = isUnderDecolorized ? "#7c3aed" : "#ec4899";
  const displayColor = organism.gram === "positive" ? gpDisplayColor : gnDisplayColor;

  const label = organism.gram === "positive"
    ? (isOverDecolorized ? "⚠️ FALSE Gram-negative (over-decolorized)" : "Gram-positive")
    : (isUnderDecolorized ? "⚠️ FALSE Gram-positive (under-decolorized)" : "Gram-negative");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark field background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    // Circular viewport
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2);
    ctx.clip();

    // Light background inside scope
    ctx.fillStyle = "#faf8f0";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 16, 0);
      ctx.lineTo(i * 16, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 16);
      ctx.lineTo(w, i * 16);
      ctx.stroke();
    }

    // Draw bacteria
    const seed = organism.name.length;
    for (let i = 0; i < 35; i++) {
      const angle = (seed * 7 + i * 137.5) % 360;
      const r = 15 + (i * 17 % 100);
      const x = w / 2 + Math.cos(angle * Math.PI / 180) * r;
      const y = h / 2 + Math.sin(angle * Math.PI / 180) * r;

      ctx.beginPath();
      ctx.fillStyle = displayColor;

      if (organism.shape === "cocci") {
        if (organism.arrangement === "clusters") {
          // Cluster of 2-4
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(x + j * 6 - 3, y + (j % 2) * 5 - 2, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (organism.arrangement === "chains") {
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(x + j * 9, y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Diplococci
          ctx.arc(x - 3, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + 3, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Rods
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Crosshair
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.restore();

    // Circular border
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 5, 0, Math.PI * 2);
    ctx.stroke();
  }, [displayColor, organism, zoom]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-2xl border shadow-xl p-6 max-w-md w-full mx-4 space-y-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: zoom, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            1000× Oil Immersion
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <canvas ref={canvasRef} width={300} height={300} className="mx-auto rounded-full" />

        <div className="text-center space-y-1">
          <p className="font-semibold text-sm" style={{ color: displayColor }}>{label}</p>
          <p className="text-xs text-muted-foreground italic">{organism.name}</p>
          <p className="text-xs text-muted-foreground">{organism.desc}</p>
        </div>

        {errors.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-destructive" />
            <span className="font-medium text-destructive">Procedural errors affected result</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Countdown Timer
// ──────────────────────────────────────────────
function StepTimer({ duration, onComplete, onTick }: {
  duration: number; onComplete: () => void; onTick?: (remaining: number) => void;
}) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    setDone(false);
  }, [duration]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        onTick?.(next);
        if (next <= 0) {
          clearInterval(t);
          setRunning(false);
          setDone(true);
          onComplete();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete, onTick]);

  if (duration === 0) return null;

  const pct = ((duration - remaining) / duration) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      className="space-y-2 p-3 rounded-lg bg-card border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className={`h-4 w-4 ${running ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className="font-mono text-lg font-bold">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
        {!done ? (
          <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>
            {running ? "Pause" : "Start Timer"}
          </Button>
        ) : (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
          </Badge>
        )}
      </div>
      <Progress value={pct} className="h-2" />
      {running && remaining <= 5 && (
        <p className="text-xs text-destructive font-medium animate-pulse">⏰ Almost done!</p>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Drag State Context (pointer-based drag-and-move)
// ──────────────────────────────────────────────
interface DragState {
  itemKey: string;
  icon: string;
  label: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  originRect: DOMRect;
}

function useDragMove(onDropOnSlide: (itemKey: string) => void, slideRef: React.RefObject<HTMLDivElement | null>) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [returning, setReturning] = useState<{ x: number; y: number; icon: string; originX: number; originY: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent, item: DragItem, originRect: DOMRect) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const state: DragState = {
      itemKey: item.key,
      icon: item.icon,
      label: item.label,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      originRect,
    };
    dragRef.current = state;
    setDrag(state);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const updated = { ...dragRef.current, currentX: e.clientX, currentY: e.clientY };
    dragRef.current = updated;
    setDrag(updated);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    dragRef.current = null;

    // Check if dropped on slide
    const slideEl = slideRef.current;
    if (slideEl) {
      const rect = slideEl.getBoundingClientRect();
      if (d.currentX >= rect.left && d.currentX <= rect.right && d.currentY >= rect.top && d.currentY <= rect.bottom) {
        // Successful drop on slide
        onDropOnSlide(d.itemKey);
        // Animate back
        setReturning({
          x: d.currentX, y: d.currentY, icon: d.icon,
          originX: d.originRect.left + d.originRect.width / 2,
          originY: d.originRect.top + d.originRect.height / 2,
        });
        setDrag(null);
        setTimeout(() => setReturning(null), 400);
        return;
      }
    }
    // Missed — animate back
    setReturning({
      x: d.currentX, y: d.currentY, icon: d.icon,
      originX: d.originRect.left + d.originRect.width / 2,
      originY: d.originRect.top + d.originRect.height / 2,
    });
    setDrag(null);
    setTimeout(() => setReturning(null), 400);
  }, [onDropOnSlide, slideRef]);

  return { drag, returning, handlePointerDown, handlePointerMove, handlePointerUp };
}

// ──────────────────────────────────────────────
// Draggable Item Component (pointer-based)
// ──────────────────────────────────────────────
function DraggableItem({ item, isRequired, disabled, mode, onPointerDown }: {
  item: DragItem; isRequired: boolean; disabled: boolean; mode: GameMode;
  onPointerDown: (e: React.PointerEvent, item: DragItem, rect: DOMRect) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) onPointerDown(e, item, rect);
  };

  return (
    <div
      ref={ref}
      onPointerDown={handleDown}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all select-none min-w-[72px] touch-none
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-md hover:scale-105"}
        ${isRequired && mode === "learning" ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card"}
        ${item.category === "reagent" ? "border-dashed" : ""}
      `}
    >
      <span className="text-2xl">{item.icon}</span>
      <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
      {isRequired && mode === "learning" && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </div>
  );
}

// Floating drag ghost + return animation
function DragOverlay({ drag, returning }: { drag: DragState | null; returning: { x: number; y: number; icon: string; originX: number; originY: number } | null }) {
  return (
    <>
      {drag && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{ left: drag.currentX - 24, top: drag.currentY - 24 }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border-2 border-primary shadow-lg flex items-center justify-center text-2xl animate-pulse">
            {drag.icon}
          </div>
          <div className="text-[9px] text-center font-medium text-primary mt-0.5">{drag.label}</div>
        </div>
      )}
      {returning && (
        <motion.div
          className="fixed pointer-events-none z-[9999]"
          initial={{ left: returning.x - 24, top: returning.y - 24, scale: 1, opacity: 1 }}
          animate={{ left: returning.originX - 24, top: returning.originY - 24, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl">
            {returning.icon}
          </div>
        </motion.div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// Main Simulator
// ──────────────────────────────────────────────
export function GramStainSimulator() {
  const [mode, setMode] = useState<GameMode>("learning");
  const [step, setStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [selectedOrganism, setSelectedOrganism] = useState(0);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [wrongItem, setWrongItem] = useState<string | null>(null);
  const [mentorMessage, setMentorMessage] = useState<string>("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState<ScoreState>({
    correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, timerPenalties: 0, totalTime: 0,
  });
  const [gameFinished, setGameFinished] = useState(false);

  const slideRef = useRef<HTMLDivElement>(null);
  const current = PROTOCOL_STEPS[step];
  const organism = ORGANISMS[selectedOrganism];
  const isLastStep = step === PROTOCOL_STEPS.length - 1;

  const handleDropOnSlide = useCallback((droppedItem: string) => {
    if (stepCompleted) return;
    if (droppedItem === current.requiredItem) {
      setStepCompleted(true);
      setWrongItem(null);
      setScore((s) => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      if (current.duration === 0) setTimerDone(true);
    } else {
      setWrongItem(droppedItem);
      setScore((s) => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      const wrongLabel = DRAG_ITEMS.find((d) => d.key === droppedItem)?.label || droppedItem;
      if (mode === "learning") {
        setMentorMessage(`❌ "${wrongLabel}" is not correct for this step. ${current.hint}`);
      } else {
        setMentorMessage(`❌ Wrong item. Score reduced.`);
      }
    }
  }, [stepCompleted, current, mode]);

  const { drag, returning, handlePointerDown, handlePointerMove, handlePointerUp } = useDragMove(handleDropOnSlide, slideRef);

  const handleTimerComplete = useCallback(() => setTimerDone(true), []);

  const goNext = () => {
    if (isLastStep) {
      // Finish
      setScore((s) => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) }));
      setGameFinished(true);
      return;
    }
    setStep(step + 1);
    setStepCompleted(false);
    setTimerDone(false);
    setQuizAnswer(null);
    setWrongItem(null);
    setMentorMessage("");
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setScore((s) => ({
      ...s,
      quizTotal: s.quizTotal + 1,
      quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0),
    }));
  };

  const reset = () => {
    setStep(0);
    setStepCompleted(false);
    setTimerDone(false);
    setQuizAnswer(null);
    setWrongItem(null);
    setMentorMessage("");
    setErrors([]);
    setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, timerPenalties: 0, totalTime: 0 });
    setGameFinished(false);
    setShowMicroscope(false);
  };

  // Calculate final grade
  const finalScore = useMemo(() => {
    const stepPct = (score.correctSteps / PROTOCOL_STEPS.length) * 60;
    const quizPct = score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30;
    const penaltyPct = Math.max(0, 10 - score.wrongSteps * 2);
    const total = Math.round(stepPct + quizPct + penaltyPct);
    const grade = total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake Recommended";
    return { total, grade };
  }, [score]);

  // ── Finished screen ──
  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-success" />
              Gram Staining Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border">
                <p className="text-3xl font-bold text-primary">{finalScore.total}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted border">
                <p className="text-xl font-bold">{finalScore.grade}</p>
                <p className="text-xs text-muted-foreground mt-1">Grade</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted border">
                <p className="text-xl font-bold">{score.correctSteps}/{PROTOCOL_STEPS.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Correct Steps</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted border">
                <p className="text-xl font-bold">{Math.floor(score.totalTime / 60)}:{(score.totalTime % 60).toString().padStart(2, "0")}</p>
                <p className="text-xs text-muted-foreground mt-1">Time Taken</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border space-y-2">
              <p className="font-semibold text-sm">🔬 Staining Result</p>
              <p className="text-sm"><em>{organism.name}</em> — {organism.gram === "positive" ? "Gram-positive (Purple)" : "Gram-negative (Pink)"}</p>
              <p className="text-xs text-muted-foreground">{organism.desc}</p>
            </div>

            {score.wrongSteps > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-1 text-warning" />
                You made {score.wrongSteps} incorrect drag attempt{score.wrongSteps > 1 ? "s" : ""}. Review the protocol steps carefully.
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-1" /> Try Again
              </Button>
              <Button variant="outline" onClick={() => { reset(); setMode(mode === "learning" ? "exam" : "learning"); }} className="flex-1">
                Switch to {mode === "learning" ? "Exam" : "Learning"} Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Interactive Gram Staining Lab
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag reagents & tools to the slide. Follow the 12-step protocol.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => { setMode("learning"); reset(); }}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" /> Learning
            </button>
            <button
              onClick={() => { setMode("exam"); reset(); }}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Exam
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* ── Organism Selector ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Specimen:</span>
        {ORGANISMS.map((o, i) => (
          <button
            key={i}
            onClick={() => { setSelectedOrganism(i); setErrors([]); }}
            className={`px-2.5 py-1 rounded-md text-xs transition-all border ${
              i === selectedOrganism ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
            }`}
          >
            <em>{o.name}</em>
          </button>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {PROTOCOL_STEPS.length}</span>
          <span className="font-medium">{current.name}</span>
        </div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
        {/* Step bubbles */}
        <div className="flex gap-0.5 overflow-x-auto py-1">
          {PROTOCOL_STEPS.map((s, i) => (
            <div
              key={i}
              className={`min-w-[24px] h-6 flex items-center justify-center rounded text-[9px] font-bold ${
                i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Left: Workspace */}
        <div className="space-y-4">
          {/* Protocol instruction panel */}
          <Card className={current.id === 7 ? "border-destructive/40" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {current.id === 7 && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
                📋 Step {current.id}: {current.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{current.action}</p>

              {mode === "learning" && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" />
                  <span className="font-medium">Hint:</span> {current.hint}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drop Zone / Slide */}
          <div
            ref={slideRef}
            className={`
              relative p-6 rounded-xl border-2 border-dashed transition-all min-h-[200px] flex flex-col items-center justify-center gap-4
              ${drag ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/30"}
              ${stepCompleted ? "border-success/40 bg-success/5" : ""}
            `}
          >
            {/* Lab bench decorative elements */}
            <div className="absolute top-2 left-2 text-xs text-muted-foreground/50 flex items-center gap-1">
              <Beaker className="h-3 w-3" /> Lab Workbench
            </div>

            {/* Slide visualization */}
            <BacteriaCanvas
              gpColor={current.gpColor}
              gnColor={current.gnColor}
              organism={organism}
              stepId={stepCompleted ? current.id : current.id - 1}
            />

            {/* Status text */}
            <AnimatePresence mode="wait">
              {!stepCompleted ? (
                <motion.p key="waiting" className="text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  ↕️ Drag the correct item here
                </motion.p>
              ) : (
                <motion.div key="done" className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-1" />
                  <p className="text-sm font-medium text-success">Step applied!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wrong item feedback */}
            {wrongItem && !stepCompleted && (
              <motion.p
                className="text-xs text-destructive font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <XCircle className="h-3.5 w-3.5 inline mr-1" />
                Wrong item! Try again.
              </motion.p>
            )}

            {/* GP/GN indicator pills */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: stepCompleted ? current.gpColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gpColor : "transparent") }} />
                <span className="text-[10px] text-muted-foreground">GP: {stepCompleted ? current.gpLabel : (step > 0 ? PROTOCOL_STEPS[step - 1].gpLabel : "Unstained")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: stepCompleted ? current.gnColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gnColor : "transparent") }} />
                <span className="text-[10px] text-muted-foreground">GN: {stepCompleted ? current.gnLabel : (step > 0 ? PROTOCOL_STEPS[step - 1].gnLabel : "Unstained")}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          {stepCompleted && current.duration > 0 && (
            <StepTimer duration={current.duration} onComplete={handleTimerComplete} />
          )}

          {/* Quiz (learning mode or after step) */}
          {stepCompleted && current.quiz && (
            <motion.div
              className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">
                {current.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={quizAnswer !== null}
                    className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${
                      quizAnswer === null ? "hover:bg-muted border-border cursor-pointer" :
                      i === current.quiz!.correct ? "bg-success/10 border-success/50" :
                      i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "border-border opacity-40"
                    }`}
                  >
                    {quizAnswer !== null && i === current.quiz!.correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 text-success" />}
                    {quizAnswer === i && i !== current.quiz!.correct && <XCircle className="h-3.5 w-3.5 inline mr-1.5 text-destructive" />}
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scientific Principle (learning mode) */}
          {mode === "learning" && stepCompleted && (
            <motion.div
              className="p-3 rounded-lg bg-card border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> Scientific Principle
              </p>
              <p className="text-sm">{current.principle}</p>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {current.reference}</p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStep(Math.max(0, step - 1)); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setWrongItem(null); setMentorMessage(""); }}
              disabled={step === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={isLastStep && stepCompleted ? () => { setScore((s) => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); setGameFinished(true); } : goNext}
              disabled={!stepCompleted || (!timerDone && current.duration > 0)}
            >
              {isLastStep ? "Finish" : "Next Step"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right: Reagent Shelf + Mentor */}
        <div className="space-y-4">
          {/* Tools */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">🧰 Lab Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {DRAG_ITEMS.filter((d) => d.category === "tool").map((item) => (
                  <DraggableItem
                    key={item.key}
                    item={item}
                    isRequired={item.key === current.requiredItem}
                    disabled={stepCompleted}
                    mode={mode}
                    onPointerDown={handlePointerDown}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reagents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">🧪 Reagents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {DRAG_ITEMS.filter((d) => d.category === "reagent").map((item) => (
                  <DraggableItem
                    key={item.key}
                    item={item}
                    isRequired={item.key === current.requiredItem}
                    disabled={stepCompleted}
                    mode={mode}
                    onPointerDown={handlePointerDown}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Mentor */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                Lab Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {mentorMessage ? (
                  <motion.p
                    key={mentorMessage}
                    className="text-xs leading-relaxed"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {mentorMessage}
                  </motion.p>
                ) : (
                  <motion.p
                    key="idle"
                    className="text-xs text-muted-foreground italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Drag the correct item to the slide to proceed. I'll guide you along the way!
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Score (compact) */}
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground">📊 Score</p>
            <div className="flex justify-between"><span>Correct Steps</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div>
            <div className="flex justify-between"><span>Wrong Attempts</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div>
            <div className="flex justify-between"><span>Quiz</span><span className="font-mono font-bold">{score.quizCorrect}/{score.quizTotal}</span></div>
          </div>

          {/* Microscope button on last step */}
          {isLastStep && stepCompleted && (
            <Button variant="default" className="w-full gap-2" onClick={() => setShowMicroscope(true)}>
              <Eye className="h-4 w-4" /> View Under Microscope
            </Button>
          )}
        </div>
      </div>

      {/* Microscope Modal */}
      <AnimatePresence>
        {showMicroscope && (
          <MicroscopeViewModal
            organism={organism}
            errors={errors}
            onClose={() => setShowMicroscope(false)}
          />
        )}
      </AnimatePresence>
      <DragOverlay drag={drag} returning={returning} />
    </div>
  );
}
