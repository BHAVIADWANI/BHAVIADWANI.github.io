// @ts-nocheck
import { useState, useRef, useCallback, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, RotateCcw, CheckCircle2, XCircle, Eye, FlaskConical,
  GraduationCap, ClipboardCheck, Lightbulb, BookOpen, Timer as TimerIcon, Volume2, VolumeX
} from "lucide-react";
import { playPourSound, playSuccessSound, playErrorSound, playTickSound, playTimerCompleteSound, playPickupSound, playDropSound, playCompletionFanfare } from "@/lib/labSoundEffects";

type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number; name: string; action: string; requiredItem: string;
  duration: number; principle: string; hint: string; mentorTip: string; reference: string;
  wellColor?: string;
  quiz?: { question: string; correct: number; options: string[] };
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Coat Wells", action: "Drag the capture antibody pipette to coat the microplate wells.", requiredItem: "capture_ab", duration: 15, principle: "Capture antibody binds to the polystyrene well surface via passive adsorption. Incubate at 4°C overnight or 37°C for 2 hours (Tietz Clinical Chemistry).", hint: "Drag the capture antibody to the plate.", mentorTip: "100 µL per well. Consistent coating = consistent results!", reference: "Tietz Textbook of Clinical Chemistry", wellColor: "#f0f0f0" },
  { id: 2, name: "Wash (3×)", action: "Wash the plate 3 times with wash buffer (PBS-Tween 20).", requiredItem: "wash_buffer", duration: 10, principle: "Washing removes unbound antibody. PBS-Tween 20 (0.05%) reduces non-specific binding (WHO ELISA Manual).", hint: "Drag the wash buffer to the plate.", mentorTip: "Proper washing is the most critical step! Inadequate washing = high background.", reference: "WHO ELISA Laboratory Manual", wellColor: "#f8f8f8" },
  { id: 3, name: "Block Wells", action: "Add blocking buffer (BSA/casein) to prevent non-specific binding.", requiredItem: "blocking", duration: 15, principle: "Blocking proteins occupy remaining binding sites on the well surface, reducing background noise (Henry's Clinical Diagnosis).", hint: "Drag the blocking solution to the plate.", mentorTip: "1–3% BSA in PBS. Block for 1–2 hours at 37°C.", reference: "Henry's Clinical Diagnosis and Management", wellColor: "#fefce8", quiz: { question: "Why is blocking necessary in ELISA?", correct: 1, options: ["To enhance antibody binding", "To prevent non-specific binding and reduce background", "To fix the antibody permanently", "To change the well pH"] } },
  { id: 4, name: "Wash (3×)", action: "Wash again to remove excess blocking buffer.", requiredItem: "wash_buffer", duration: 10, principle: "Removes unbound blocking agent before sample addition.", hint: "Wash the plate again.", mentorTip: "Flick and blot the plate between washes.", reference: "CLSI ELISA Guidelines" },
  { id: 5, name: "Add Sample", action: "Add patient serum/sample containing the target antigen.", requiredItem: "sample", duration: 15, principle: "Target antigen in the sample binds to the capture antibody immobilized on the well (sandwich principle). Incubate at 37°C for 1–2 hours.", hint: "Drag the patient sample to the plate.", mentorTip: "Use positive and negative controls alongside patient samples!", reference: "Tietz; WHO ELISA Manual", wellColor: "#fef9c3", quiz: { question: "In a sandwich ELISA, what binds to the capture antibody?", correct: 0, options: ["Target antigen from the sample", "Enzyme conjugate", "Substrate", "Blocking buffer"] } },
  { id: 6, name: "Wash (3×)", action: "Wash to remove unbound sample components.", requiredItem: "wash_buffer", duration: 10, principle: "Critical wash — removes everything except antigen bound to capture antibody.", hint: "Wash the plate.", mentorTip: "3–5 washes minimum. Each wash must fill the well completely.", reference: "WHO Laboratory Manual" },
  { id: 7, name: "Enzyme Conjugate", action: "Add enzyme-labeled detection antibody (HRP or AP conjugate).", requiredItem: "conjugate", duration: 15, principle: "Detection antibody binds to a different epitope on the captured antigen (sandwich). HRP (horseradish peroxidase) is most common enzyme label (Tietz).", hint: "Drag the enzyme conjugate to the plate.", mentorTip: "This creates the antibody-antigen-antibody 'sandwich'!", reference: "Tietz Clinical Chemistry; CLSI", wellColor: "#dbeafe", quiz: { question: "What enzyme is most commonly used in ELISA conjugates?", correct: 2, options: ["Catalase", "Amylase", "Horseradish Peroxidase (HRP)", "Lipase"] } },
  { id: 8, name: "Wash (3×)", action: "Wash to remove unbound conjugate.", requiredItem: "wash_buffer", duration: 10, principle: "Removes excess enzyme conjugate. Only enzyme bound via antigen-antibody sandwich remains.", hint: "Wash again.", mentorTip: "This is the final critical wash before detection!", reference: "WHO ELISA Manual" },
  { id: 9, name: "Add Substrate", action: "Add TMB substrate — observe color development!", requiredItem: "substrate", duration: 20, principle: "TMB (3,3',5,5'-tetramethylbenzidine) is oxidized by HRP → blue color. Color intensity is proportional to antigen concentration (Beer-Lambert Law).", hint: "Drag the TMB substrate to the plate.", mentorTip: "🔬 Watch the color change! Blue = positive reaction. Incubate in the dark!", reference: "Tietz; Clinical Chemistry Procedures Handbook", wellColor: "#3b82f6", quiz: { question: "What color does TMB substrate produce with HRP?", correct: 1, options: ["Red", "Blue (then yellow after stop)", "Green", "Purple"] } },
  { id: 10, name: "Add Stop Solution", action: "Add 2N H₂SO₄ stop solution — blue changes to YELLOW!", requiredItem: "stop_solution", duration: 0, principle: "Sulfuric acid stops the enzymatic reaction and shifts TMB absorbance from 650nm (blue) to 450nm (yellow). Read within 30 minutes.", hint: "Drag the stop solution to the plate.", mentorTip: "Color change: Blue → Yellow! Read OD at 450nm.", reference: "WHO ELISA Manual; Tietz", wellColor: "#eab308" },
  { id: 11, name: "Read Results", action: "Place the plate in the ELISA reader to measure OD at 450nm.", requiredItem: "reader", duration: 0, principle: "Spectrophotometric reading at 450nm. OD values above cutoff = positive. Calculate using standard curve (Tietz Clinical Chemistry).", hint: "Drag the plate to the ELISA reader.", mentorTip: "Compare patient OD with positive/negative controls and cutoff value.", reference: "Tietz; CLSI ELISA Guidelines" },
];

const INSTRUMENTS = [
  { key: "capture_ab", label: "Capture Antibody", color: "#8b5cf6" },
  { key: "wash_buffer", label: "Wash Buffer", color: "#93c5fd" },
  { key: "blocking", label: "Blocking Buffer (BSA)", color: "#fef3c7" },
  { key: "sample", label: "Patient Sample", color: "#f87171" },
  { key: "conjugate", label: "Enzyme Conjugate", color: "#60a5fa" },
  { key: "substrate", label: "TMB Substrate", color: "#3b82f6" },
  { key: "stop_solution", label: "Stop Solution (H₂SO₄)", color: "#fbbf24" },
  { key: "reader", label: "ELISA Reader", color: "#6b7280" },
];

const PLATE_POS: [number, number, number] = [0, 0.97, 0.2];
const DROP_RADIUS = 0.8;

function DraggableObject({ children, homePosition, instrumentKey, onDropOnSlide, disabled, orbitRef }: any) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const [pos, setPos] = useState<[number, number, number]>(homePosition);
  const [isOver, setIsOver] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -homePosition[1]));

  const getWorldPoint = useCallback((e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.current.setFromCamera(mouse, camera);
    const target = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, target);
    return target;
  }, [camera, gl]);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    isDragging.current = true;
    if (orbitRef.current) orbitRef.current.enabled = false;
    gl.domElement.style.cursor = "grabbing";
    try { playPickupSound(); } catch {}
    const worldPt = getWorldPoint(e.nativeEvent);
    offset.current.set(pos[0] - worldPt.x, 0, pos[2] - worldPt.z);
    const onMove = (ev: PointerEvent) => { if (!isDragging.current) return; const pt = getWorldPoint(ev); setPos([pt.x + offset.current.x, homePosition[1] + 0.15, pt.z + offset.current.z]); };
    const onUp = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      gl.domElement.style.cursor = "auto";
      if (orbitRef.current) orbitRef.current.enabled = true;
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp);
      const pt = getWorldPoint(ev);
      const fx = pt.x + offset.current.x, fz = pt.z + offset.current.z;
      if (Math.sqrt((fx - PLATE_POS[0]) ** 2 + (fz - PLATE_POS[2]) ** 2) < DROP_RADIUS) onDropOnSlide(instrumentKey);
      else try { playDropSound(); } catch {}
      setPos(homePosition);
    };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  }, [disabled, getWorldPoint, gl, homePosition, instrumentKey, onDropOnSlide, orbitRef, pos]);

  return (
    <group position={pos} onPointerDown={onPointerDown}
      onPointerOver={() => { if (!disabled) { setIsOver(true); gl.domElement.style.cursor = "grab"; } }}
      onPointerOut={() => { setIsOver(false); if (!isDragging.current) gl.domElement.style.cursor = "auto"; }}>
      {children}
      {isOver && !disabled && <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08, 0.12, 16]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.5} /></mesh>}
    </group>
  );
}

// 96-well ELISA microplate
function MicroPlate({ wellColor, isDropTarget }: { wellColor: string; isDropTarget: boolean }) {
  return (
    <group position={PLATE_POS}>
      {isDropTarget && <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.7, 0.85, 32]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3} /></mesh>}
      {/* Plate body */}
      <RoundedBox args={[1.6, 0.06, 1.0]} radius={0.01} castShadow>
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
      </RoundedBox>
      {/* Wells (8×12 grid simplified to 4×6) */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-0.55 + col * 0.22, 0.035, -0.35 + row * 0.22]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03]} />
            <meshStandardMaterial color={wellColor} roughness={0.2} />
          </mesh>
        ))
      )}
      <Html position={[0, 0.15, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">
          🧫 96-Well Microplate {isDropTarget && <span className="text-green-500 font-bold">— Drop Here!</span>}
        </div>
      </Html>
    </group>
  );
}

function ReagentBottle({ color, label }: { color: string; label: string }) {
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.04, 0.05, 0.18]} /><meshPhysicalMaterial color={color} roughness={0.15} transparent opacity={0.9} /></mesh>
      <mesh position={[0, 0.11, 0]} castShadow><cylinderGeometry args={[0.022, 0.028, 0.04]} /><meshStandardMaterial color="#1f2937" /></mesh>
      <Html position={[0, 0.22, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧪 {label}</div></Html>
    </group>
  );
}

// ELISA Reader instrument
function ELISAReaderModel() {
  return (
    <group>
      <RoundedBox args={[0.6, 0.15, 0.4]} radius={0.02} castShadow><meshStandardMaterial color="#e5e7eb" metalness={0.3} /></RoundedBox>
      <mesh position={[0, 0.1, -0.12]}><boxGeometry args={[0.3, 0.12, 0.02]} /><meshBasicMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0, 0.1, -0.12]}><boxGeometry args={[0.28, 0.1, 0.01]} /><meshBasicMaterial color="#22c55e" /></mesh>
      <Html position={[0, 0.25, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">📊 ELISA Reader</div></Html>
    </group>
  );
}

function LabScene({ step, stepCompleted, onDropOnSlide, disabled }: any) {
  const orbitRef = useRef<any>(null);
  const currentStep = PROTOCOL_STEPS[step];
  const wellColor = stepCompleted ? (currentStep.wellColor || "#f0f0f0") : (step > 0 ? (PROTOCOL_STEPS[step - 1].wellColor || "#f0f0f0") : "#f0f0f0");

  const positions: Record<string, [number, number, number]> = {
    capture_ab: [-2.2, 1.05, -0.8], wash_buffer: [-1.6, 1.05, -0.8], blocking: [-1.0, 1.05, -0.8],
    sample: [-0.4, 1.05, -0.8], conjugate: [0.2, 1.05, -0.8], substrate: [0.8, 1.05, -0.8],
    stop_solution: [1.4, 1.05, -0.8], reader: [2.2, 0.96, 0.5],
  };

  return (
    <>
      {/* Lab environment */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#e8e4de" /></mesh>
        <mesh position={[0, 2.5, -5]} receiveShadow><planeGeometry args={[14, 5]} /><meshStandardMaterial color="#f5f0eb" /></mesh>
        <mesh position={[0, 4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 1.5]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <ambientLight intensity={0.8} /><directionalLight position={[5, 5, 5]} intensity={1.2} castShadow /><spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} />
      </group>
      {/* Workbench */}
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow><meshStandardMaterial color="#f5f5f5" roughness={0.4} /></RoundedBox>
      {/* Reagent rack */}
      <RoundedBox args={[2.8, 0.05, 0.22]} position={[-0.4, 0.96, -0.8]} radius={0.01} castShadow><meshStandardMaterial color="#a0845e" roughness={0.7} /></RoundedBox>

      <MicroPlate wellColor={wellColor} isDropTarget={!stepCompleted && !disabled} />

      {INSTRUMENTS.filter(i => i.key !== "reader").map(inst => (
        <DraggableObject key={inst.key} homePosition={positions[inst.key]} instrumentKey={inst.key} onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
          <ReagentBottle color={inst.color} label={inst.label} />
        </DraggableObject>
      ))}
      <DraggableObject homePosition={positions.reader} instrumentKey="reader" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ELISAReaderModel />
      </DraggableObject>

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls ref={orbitRef} makeDefault minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
    </>
  );
}

function ResultsView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="bg-card rounded-2xl border shadow-xl p-6 max-w-lg w-full mx-4 space-y-4" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">📊 ELISA Results — OD at 450nm</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const isPositive = i < 3 || (i >= 6 && i < 8);
            const isNegative = i >= 3 && i < 6;
            const od = isPositive ? (1.2 + Math.random() * 0.8).toFixed(2) : isNegative ? (0.05 + Math.random() * 0.1).toFixed(2) : (Math.random() * 2).toFixed(2);
            return (
              <div key={i} className={`p-1 rounded text-center text-[9px] border ${isPositive ? "bg-yellow-400/30 border-yellow-500" : isNegative ? "bg-muted border-border" : "bg-card border-border"}`}>
                <div className="font-mono font-bold">{od}</div>
              </div>
            );
          })}
        </div>
        <div className="space-y-1 text-xs">
          <p><span className="inline-block w-3 h-3 rounded bg-yellow-400/30 border border-yellow-500 mr-1" /> Positive (OD &gt; cutoff)</p>
          <p><span className="inline-block w-3 h-3 rounded bg-muted border mr-1" /> Negative (OD &lt; cutoff)</p>
          <p className="text-muted-foreground">Cutoff = Mean Negative Control OD + 3 × SD</p>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Ref: Tietz Clinical Chemistry; WHO ELISA Manual</p>
      </motion.div>
    </motion.div>
  );
}

function StepTimer({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { setRemaining(duration); setRunning(false); setDone(false); }, [duration]);
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(r => { if (r - 1 <= 0) { clearInterval(t); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); return 0; } if (r - 1 <= 5) try { playTickSound(); } catch {}; return r - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);
  if (duration === 0) return null;
  const handleSkip = () => { setRemaining(0); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); };
  return (
    <div className="space-y-2 p-3 rounded-lg bg-card border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><TimerIcon className={`h-4 w-4 ${running ? "text-destructive animate-pulse" : "text-primary"}`} /><span className="font-mono text-lg font-bold">{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}</span></div>
        {!done ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start Timer"}</Button>
            <Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">⏭ Skip</Button>
          </div>
        ) : <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</Badge>}
      </div>
      <Progress value={((duration - remaining) / duration) * 100} className="h-2" />
    </div>
  );
}

export function ELISASimulator3D() {
  const [mode, setMode] = useState<GameMode>("learning");
  const [step, setStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
  const [gameFinished, setGameFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sfx = useCallback((fn: () => void) => { if (soundEnabled) try { fn(); } catch {} }, [soundEnabled]);
  const current = PROTOCOL_STEPS[step];
  const isLastStep = step === PROTOCOL_STEPS.length - 1;

  const handleDropOnSlide = useCallback((key: string) => {
    if (stepCompleted) return;
    if (key === current.requiredItem) {
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      sfx(() => playPourSound(1, 700));
      if (current.duration === 0) setTimerDone(true);
    } else {
      sfx(playErrorSound);
      setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      const label = INSTRUMENTS.find(i => i.key === key)?.label || key;
      setMentorMessage(mode === "learning" ? `❌ "${label}" is not correct. ${current.hint}` : `❌ Wrong reagent!`);
    }
  }, [step, stepCompleted, current, mode, sfx]);

  const goNext = () => {
    if (isLastStep) { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); return; }
    setStep(step + 1); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage("");
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setScore(s => ({ ...s, quizTotal: s.quizTotal + 1, quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0) }));
  };

  const reset = () => {
    setStep(0); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null);
    setMentorMessage(""); setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
    setGameFinished(false); setShowResults(false);
  };

  const finalScore = useMemo(() => {
    const s = (score.correctSteps / PROTOCOL_STEPS.length) * 60;
    const q = score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30;
    const p = Math.max(0, 10 - score.wrongSteps * 2);
    const total = Math.round(s + q + p);
    return { total, grade: total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake Recommended" };
  }, [score]);

  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-green-600" /> ELISA Test Complete!</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border"><p className="text-3xl font-bold text-primary">{finalScore.total}%</p><p className="text-xs text-muted-foreground">Score</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{finalScore.grade}</p><p className="text-xs text-muted-foreground">Grade</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{score.correctSteps}/{PROTOCOL_STEPS.length}</p><p className="text-xs text-muted-foreground">Correct Steps</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{Math.floor(score.totalTime / 60)}:{(score.totalTime % 60).toString().padStart(2, "0")}</p><p className="text-xs text-muted-foreground">Time</p></div>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1"><RotateCcw className="h-4 w-4 mr-1" /> Try Again</Button>
              <Button variant="outline" onClick={() => { reset(); setMode(mode === "learning" ? "exam" : "learning"); }} className="flex-1">Switch Mode</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /> Sandwich ELISA Simulation</h3>
          <p className="text-xs text-muted-foreground">Drag reagents onto the microplate. Orbit with right-click.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-md border bg-card hover:bg-muted transition-colors">
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => { setMode("learning"); reset(); }} className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}><GraduationCap className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setMode("exam"); reset(); }} className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}><ClipboardCheck className="h-3.5 w-3.5" /></button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset</Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1}/{PROTOCOL_STEPS.length}</span><span className="font-medium">{current.name}</span></div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 4, 5], fov: 50 }} gl={{ antialias: true }}>
              <Suspense fallback={null}><LabScene step={step} stepCompleted={stepCompleted} onDropOnSlide={handleDropOnSlide} disabled={false} /></Suspense>
            </Canvas>
            <div className="absolute top-3 left-3 right-3">
              <div className="p-3 rounded-lg backdrop-blur-md border text-sm bg-card/80 border-border">
                <span className="font-semibold">Step {current.id}:</span> {current.action}
              </div>
            </div>
            {stepCompleted && <div className="absolute bottom-3 left-3"><Badge className="bg-green-600 text-white shadow-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Step Applied!</Badge></div>}
          </div>
          {stepCompleted && current.duration > 0 && !timerDone && <StepTimer duration={current.duration} onComplete={() => setTimerDone(true)} />}
          {stepCompleted && current.quiz && (
            <motion.div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">
                {current.quiz.options.map((opt, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null}
                    className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${quizAnswer === null ? "hover:bg-muted border-border" : i === current.quiz!.correct ? "bg-green-500/10 border-green-500/50" : i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "border-border opacity-40"}`}>
                    {quizAnswer !== null && i === current.quiz!.correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 text-green-600" />}
                    {quizAnswer === i && i !== current.quiz!.correct && <XCircle className="h-3.5 w-3.5 inline mr-1.5 text-destructive" />}
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {mode === "learning" && stepCompleted && (
            <motion.div className="p-3 rounded-lg bg-card border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs font-semibold text-muted-foreground mb-1"><BookOpen className="h-3.5 w-3.5 inline mr-1" /> Principle</p>
              <p className="text-sm">{current.principle}</p>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {current.reference}</p>
            </motion.div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" disabled={step === 0} onClick={() => { setStep(Math.max(0, step - 1)); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); }}>Previous</Button>
            <Button size="sm" disabled={!stepCompleted || (!timerDone && current.duration > 0)} onClick={isLastStep ? () => { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); } : goNext}>
              {isLastStep ? "Finish" : "Next Step"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mode === "learning" && !stepCompleted && <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs"><Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" /> {current.hint}</div>}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> AI Lab Mentor</CardTitle></CardHeader>
            <CardContent><AnimatePresence mode="wait">
              {mentorMessage ? <motion.p key={mentorMessage} className="text-xs leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{mentorMessage}</motion.p>
                : <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drag reagents to the microplate. I'll guide you through ELISA!</motion.p>}
            </AnimatePresence></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">🧰 Reagents & Instruments</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 gap-1.5">
              {INSTRUMENTS.map(inst => (
                <div key={inst.key} className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${inst.key === current.requiredItem && !stepCompleted ? "border-primary bg-primary/10 ring-1 ring-primary/30 font-semibold" : "border-border bg-card"} ${stepCompleted ? "opacity-50" : ""}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ backgroundColor: inst.color }} />{inst.label}
                </div>
              ))}
            </div></CardContent>
          </Card>
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground">📊 Score</p>
            <div className="flex justify-between"><span>Correct</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div>
            <div className="flex justify-between"><span>Errors</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div>
          </div>
          {isLastStep && stepCompleted && <Button variant="default" className="w-full gap-2" onClick={() => setShowResults(true)}><Eye className="h-4 w-4" /> View ELISA Results</Button>}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5">
            <p className="font-semibold">📚 References</p>
            <p>• Tietz Textbook of Clinical Chemistry</p>
            <p>• WHO ELISA Laboratory Manual</p>
            <p>• Henry's Clinical Diagnosis</p>
            <p>• CLSI ELISA Guidelines</p>
          </div>
        </div>
      </div>
      <AnimatePresence>{showResults && <ResultsView onClose={() => setShowResults(false)} />}</AnimatePresence>
    </div>
  );
}
