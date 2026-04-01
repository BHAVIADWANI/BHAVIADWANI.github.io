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
  ChevronRight, RotateCcw, CheckCircle2, XCircle, Droplets,
  GraduationCap, ClipboardCheck, Lightbulb, BookOpen, Timer as TimerIcon, Volume2, VolumeX
} from "lucide-react";
import { playPourSound, playSuccessSound, playErrorSound, playTickSound, playTimerCompleteSound, playPickupSound, playDropSound, playCompletionFanfare, playGlassSound } from "@/lib/labSoundEffects";

type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number; name: string; action: string; requiredItem: string;
  duration: number; principle: string; hint: string; mentorTip: string; reference: string;
  tubeColor?: string;
  quiz?: { question: string; correct: number; options: string[] };
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Collect Blood", action: "Use the micropipette to collect 20 µL of capillary blood.", requiredItem: "micropipette", duration: 0, principle: "A precise 20 µL sample ensures accurate hemoglobin measurement. EDTA-anticoagulated venous blood or capillary blood can be used (ICSH Reference Method).", hint: "Drag the micropipette to the blood sample.", mentorTip: "Use EDTA blood for best results. Capillary blood may give slightly higher values.", reference: "ICSH Reference Method; Godkar Practical Pathology", tubeColor: "#dc2626" },
  { id: 2, name: "Add Drabkin's Reagent", action: "Dispense blood into 5 mL Drabkin's reagent (potassium ferricyanide + potassium cyanide).", requiredItem: "drabkins", duration: 10, principle: "Drabkin's reagent converts ALL forms of hemoglobin (oxy-, deoxy-, carboxy-, met-) to cyanmethemoglobin (HiCN) — the stable form measured photometrically (Godkar).", hint: "Drag Drabkin's reagent to the cuvette.", mentorTip: "The 1:251 dilution (20 µL in 5 mL) is critical for accuracy!", reference: "Godkar Practical Pathology; ICSH", tubeColor: "#7c3aed", quiz: { question: "What does Drabkin's reagent convert hemoglobin to?", correct: 1, options: ["Oxyhemoglobin", "Cyanmethemoglobin (HiCN)", "Methemoglobin", "Carboxyhemoglobin"] } },
  { id: 3, name: "Mix Thoroughly", action: "Mix the solution by gentle inversion 8–10 times.", requiredItem: "mixer", duration: 5, principle: "Complete mixing ensures uniform conversion. Vigorous shaking causes hemolysis artifacts.", hint: "Drag the mixer to the cuvette.", mentorTip: "Invert gently — don't shake! Air bubbles interfere with spectrophotometry.", reference: "Godkar; Henry's Clinical Diagnosis", tubeColor: "#6d28d9" },
  { id: 4, name: "Incubate (5 min)", action: "Allow the reaction to proceed for 5 minutes at room temperature.", requiredItem: "auto", duration: 15, principle: "5 minutes ensures complete conversion of all hemoglobin forms to HiCN. The reaction is: Hb → Hi (metHb) → HiCN (Godkar).", hint: "Wait for incubation.", mentorTip: "Do NOT read before 5 minutes — incomplete conversion gives falsely low results.", reference: "ICSH; Godkar Practical Pathology" },
  { id: 5, name: "Set Spectrophotometer", action: "Set the spectrophotometer to 540 nm wavelength.", requiredItem: "spectro", duration: 0, principle: "Cyanmethemoglobin has peak absorbance at 540 nm. This wavelength provides maximum sensitivity and specificity (Beer-Lambert Law).", hint: "Drag the cuvette to the spectrophotometer.", mentorTip: "540 nm is the absorption maximum of HiCN. Always zero with Drabkin's blank first!", reference: "ICSH Reference Method; Tietz Clinical Chemistry", quiz: { question: "At what wavelength is cyanmethemoglobin measured?", correct: 2, options: ["450 nm", "520 nm", "540 nm", "600 nm"] } },
  { id: 6, name: "Zero with Blank", action: "Place Drabkin's reagent blank in the spectrophotometer and zero the instrument.", requiredItem: "blank", duration: 0, principle: "The blank contains only Drabkin's reagent — zeroing eliminates background absorbance from the reagent itself.", hint: "Drag the blank cuvette first.", mentorTip: "Always zero before reading samples. Recalibrate every 30 minutes.", reference: "Godkar; ICSH" },
  { id: 7, name: "Read Absorbance", action: "Place the sample cuvette and read the absorbance (OD) at 540 nm.", requiredItem: "sample_cuvette", duration: 0, principle: "Absorbance is directly proportional to hemoglobin concentration (Beer-Lambert Law: A = εcl). Compare OD against standard curve or use factor method.", hint: "Drag the sample cuvette to the spectrophotometer.", mentorTip: "OD should be 0.2–0.8 for accuracy. Too high? Dilute and re-read.", reference: "ICSH; Tietz Clinical Chemistry", quiz: { question: "Which law governs spectrophotometric hemoglobin measurement?", correct: 0, options: ["Beer-Lambert Law", "Ohm's Law", "Boyle's Law", "Henry's Law"] } },
  { id: 8, name: "Calculate Result", action: "Calculate Hb concentration using the standard curve or factor method.", requiredItem: "calculator", duration: 0, principle: "Hb (g/dL) = (OD of test / OD of standard) × Concentration of standard. Normal: Male 13–17 g/dL, Female 12–16 g/dL (WHO criteria).", hint: "Use the calculator to compute the result.", mentorTip: "WHO anemia cutoffs: <13 g/dL (men), <12 g/dL (women), <11 g/dL (pregnant).", reference: "WHO; Godkar; Henry's Clinical Diagnosis" },
];

const INSTRUMENTS = [
  { key: "micropipette", label: "Micropipette (20µL)", color: "#3b82f6" },
  { key: "drabkins", label: "Drabkin's Reagent", color: "#7c3aed" },
  { key: "mixer", label: "Vortex Mixer", color: "#6b7280" },
  { key: "spectro", label: "Spectrophotometer", color: "#1f2937" },
  { key: "blank", label: "Blank Cuvette", color: "#e5e7eb" },
  { key: "sample_cuvette", label: "Sample Cuvette", color: "#dc2626" },
  { key: "calculator", label: "Calculator", color: "#22c55e" },
];

const TARGET_POS: [number, number, number] = [0, 0.97, 0.2];
const DROP_RADIUS = 0.7;

function DraggableObject({ children, homePosition, instrumentKey, onDropOnSlide, disabled, orbitRef }: any) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const [pos, setPos] = useState<[number, number, number]>(homePosition);
  const [isOver, setIsOver] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -homePosition[1]));
  const getWorldPoint = useCallback((e: PointerEvent) => { const rect = gl.domElement.getBoundingClientRect(); const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1); raycaster.current.setFromCamera(mouse, camera); const target = new THREE.Vector3(); raycaster.current.ray.intersectPlane(plane.current, target); return target; }, [camera, gl]);
  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled) return; e.stopPropagation(); isDragging.current = true;
    if (orbitRef.current) orbitRef.current.enabled = false; gl.domElement.style.cursor = "grabbing"; try { playPickupSound(); } catch {}
    const worldPt = getWorldPoint(e.nativeEvent); offset.current.set(pos[0] - worldPt.x, 0, pos[2] - worldPt.z);
    const onMove = (ev: PointerEvent) => { if (!isDragging.current) return; const pt = getWorldPoint(ev); setPos([pt.x + offset.current.x, homePosition[1] + 0.15, pt.z + offset.current.z]); };
    const onUp = (ev: PointerEvent) => { if (!isDragging.current) return; isDragging.current = false; gl.domElement.style.cursor = "auto"; if (orbitRef.current) orbitRef.current.enabled = true; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); const pt = getWorldPoint(ev); const fx = pt.x + offset.current.x, fz = pt.z + offset.current.z; if (Math.sqrt((fx - TARGET_POS[0]) ** 2 + (fz - TARGET_POS[2]) ** 2) < DROP_RADIUS) onDropOnSlide(instrumentKey); else try { playDropSound(); } catch {} setPos(homePosition); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  }, [disabled, getWorldPoint, gl, homePosition, instrumentKey, onDropOnSlide, orbitRef, pos]);
  return (
    <group position={pos} onPointerDown={onPointerDown} onPointerOver={() => { if (!disabled) { setIsOver(true); gl.domElement.style.cursor = "grab"; } }} onPointerOut={() => { setIsOver(false); if (!isDragging.current) gl.domElement.style.cursor = "auto"; }}>
      {children}
      {isOver && !disabled && <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08, 0.12, 16]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.5} /></mesh>}
    </group>
  );
}

function Cuvette({ color, isDropTarget }: { color: string; isDropTarget: boolean }) {
  return (
    <group position={TARGET_POS}>
      {isDropTarget && <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3, 0.45, 32]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3} /></mesh>}
      <mesh castShadow><boxGeometry args={[0.12, 0.5, 0.12]} /><meshPhysicalMaterial color="#f0f0f0" transparent opacity={0.6} roughness={0.1} transmission={0.3} /></mesh>
      <mesh position={[0, -0.05, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={color} transparent opacity={0.7} /></mesh>
      <Html position={[0, 0.35, 0]} center><div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">🧪 Cuvette {isDropTarget && <span className="text-green-500 font-bold">— Drop Here!</span>}</div></Html>
    </group>
  );
}

function SpectrophotometerModel() {
  return (
    <group position={[2, 0.96, -0.3]}>
      <RoundedBox args={[0.8, 0.3, 0.5]} radius={0.02} castShadow><meshStandardMaterial color="#374151" metalness={0.4} /></RoundedBox>
      <mesh position={[0, 0.17, -0.2]}><boxGeometry args={[0.35, 0.12, 0.02]} /><meshBasicMaterial color="#22c55e" /></mesh>
      <Html position={[0, 0.35, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">📊 Spectrophotometer (540nm)</div></Html>
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

function LabScene({ step, stepCompleted, onDropOnSlide, disabled }: any) {
  const orbitRef = useRef<any>(null);
  const currentStep = PROTOCOL_STEPS[step];
  const tubeColor = stepCompleted ? (currentStep.tubeColor || "#e5e7eb") : (step > 0 ? (PROTOCOL_STEPS[step - 1].tubeColor || "#e5e7eb") : "#e5e7eb");
  const positions: Record<string, [number, number, number]> = {
    micropipette: [-2.2, 1.05, 0.5], drabkins: [-1.6, 1.05, -0.8], mixer: [-1.0, 1.05, 0.5],
    spectro: [2, 0.96, -0.3], blank: [0.8, 1.05, -0.8], sample_cuvette: [1.4, 1.05, -0.8], calculator: [2.2, 1.05, 0.5],
  };
  return (
    <>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#e8e4de" /></mesh>
        <mesh position={[0, 2.5, -5]} receiveShadow><planeGeometry args={[14, 5]} /><meshStandardMaterial color="#f5f0eb" /></mesh>
        <ambientLight intensity={0.8} /><directionalLight position={[5, 5, 5]} intensity={1.2} castShadow /><spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} />
      </group>
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow><meshStandardMaterial color="#f5f5f5" roughness={0.4} /></RoundedBox>
      <Cuvette color={tubeColor} isDropTarget={!stepCompleted && !disabled} />
      <SpectrophotometerModel />
      {INSTRUMENTS.map(inst => (
        <DraggableObject key={inst.key} homePosition={positions[inst.key]} instrumentKey={inst.key} onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
          <ReagentBottle color={inst.color} label={inst.label} />
        </DraggableObject>
      ))}
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls ref={orbitRef} makeDefault minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
    </>
  );
}

function ResultsView({ onClose }: { onClose: () => void }) {
  const hbValue = (13.2 + Math.random() * 3).toFixed(1);
  const isNormal = parseFloat(hbValue) >= 12;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="bg-card rounded-2xl border shadow-xl p-6 max-w-md w-full mx-4 space-y-4" initial={{ scale: 0.5 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Droplets className="h-5 w-5 text-red-500" /> Hemoglobin Result</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className={`text-center p-6 rounded-xl border-2 ${isNormal ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-red-50 dark:bg-red-950/20 border-red-200"}`}>
          <p className={`text-5xl font-bold ${isNormal ? "text-green-600" : "text-red-600"}`}>{hbValue} g/dL</p>
          <p className="text-sm text-muted-foreground mt-2">{isNormal ? "Within Normal Range" : "Below Normal — Anemia"}</p>
        </div>
        <div className="text-xs space-y-1">
          <p><span className="font-semibold">OD at 540nm:</span> {(parseFloat(hbValue) * 0.045).toFixed(3)}</p>
          <p><span className="font-semibold">Method:</span> Cyanmethemoglobin (Drabkin's)</p>
          <p><span className="font-semibold">Normal:</span> Male 13–17 g/dL | Female 12–16 g/dL</p>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Ref: ICSH Reference Method; Godkar Practical Pathology; WHO Anemia Guidelines</p>
      </motion.div>
    </motion.div>
  );
}

function StepTimer({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { setRemaining(duration); setRunning(false); setDone(false); }, [duration]);
  useEffect(() => { if (!running || remaining <= 0) return; const t = setInterval(() => { setRemaining(r => { if (r - 1 <= 0) { clearInterval(t); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); return 0; } if (r - 1 <= 5) try { playTickSound(); } catch {}; return r - 1; }); }, 1000); return () => clearInterval(t); }, [running, remaining, onComplete]);
  if (duration === 0) return null;
  const handleSkip = () => { setRemaining(0); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); };
  return (
    <div className="space-y-2 p-3 rounded-lg bg-card border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><TimerIcon className={`h-4 w-4 ${running ? "text-destructive animate-pulse" : "text-primary"}`} /><span className="font-mono text-lg font-bold">{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}</span></div>
        {!done ? (<div className="flex items-center gap-2"><Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button><Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">⏭ Skip</Button></div>) : <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</Badge>}
      </div>
      <Progress value={((duration - remaining) / duration) * 100} className="h-2" />
    </div>
  );
}

export function HemoglobinEstimation3D() {
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

  useEffect(() => {
    if (current.requiredItem === "auto" && !stepCompleted) {
      const t = setTimeout(() => { setStepCompleted(true); setTimerDone(true); setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 })); setMentorMessage(current.mentorTip); sfx(playSuccessSound); }, 1500);
      return () => clearTimeout(t);
    }
  }, [step, current, stepCompleted, sfx]);

  const handleDropOnSlide = useCallback((key: string) => {
    if (stepCompleted) return;
    if (key === current.requiredItem) {
      setStepCompleted(true); setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 })); setMentorMessage(current.mentorTip);
      sfx(() => playPourSound(0.8, 700)); if (current.duration === 0) setTimerDone(true);
    } else { sfx(playErrorSound); setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 })); setMentorMessage(mode === "learning" ? `❌ Wrong! ${current.hint}` : `❌ Wrong!`); }
  }, [step, stepCompleted, current, mode, sfx]);

  const goNext = () => { if (isLastStep) { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); return; } setStep(step + 1); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); };
  const handleQuizAnswer = (idx: number) => { if (quizAnswer !== null) return; setQuizAnswer(idx); setScore(s => ({ ...s, quizTotal: s.quizTotal + 1, quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0) })); };
  const reset = () => { setStep(0); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 }); setGameFinished(false); setShowResults(false); };
  const finalScore = useMemo(() => { const total = Math.round((score.correctSteps / PROTOCOL_STEPS.length) * 60 + (score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30) + Math.max(0, 10 - score.wrongSteps * 2)); return { total, grade: total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake" }; }, [score]);

  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-green-600" /> Hemoglobin Estimation Complete!</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border"><p className="text-3xl font-bold text-primary">{finalScore.total}%</p><p className="text-xs text-muted-foreground">Score</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{finalScore.grade}</p><p className="text-xs text-muted-foreground">Grade</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{score.correctSteps}/{PROTOCOL_STEPS.length}</p><p className="text-xs text-muted-foreground">Steps</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{Math.floor(score.totalTime / 60)}m</p><p className="text-xs text-muted-foreground">Time</p></div>
            </div>
            <div className="flex gap-3"><Button onClick={reset} className="flex-1"><RotateCcw className="h-4 w-4 mr-1" /> Retry</Button><Button variant="outline" onClick={() => { reset(); setMode(mode === "learning" ? "exam" : "learning"); }} className="flex-1">Switch Mode</Button></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h3 className="text-lg font-semibold flex items-center gap-2"><Droplets className="h-5 w-5 text-red-500" /> Hemoglobin Estimation (Cyanmethemoglobin)</h3><p className="text-xs text-muted-foreground">Drag instruments & reagents to the cuvette.</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-md border bg-card hover:bg-muted">{soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}</button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => { setMode("learning"); reset(); }} className={`px-3 py-1.5 text-xs font-medium ${mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card"}`}><GraduationCap className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setMode("exam"); reset(); }} className={`px-3 py-1.5 text-xs font-medium ${mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card"}`}><ClipboardCheck className="h-3.5 w-3.5" /></button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <div className="space-y-1"><div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1}/{PROTOCOL_STEPS.length}</span><span>{current.name}</span></div><Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 4, 5], fov: 50 }} gl={{ antialias: true }}><Suspense fallback={null}><LabScene step={step} stepCompleted={stepCompleted} onDropOnSlide={handleDropOnSlide} disabled={false} /></Suspense></Canvas>
            <div className="absolute top-3 left-3 right-3"><div className="p-3 rounded-lg backdrop-blur-md border text-sm bg-card/80"><span className="font-semibold">Step {current.id}:</span> {current.action}</div></div>
            {stepCompleted && <div className="absolute bottom-3 left-3"><Badge className="bg-primary text-primary-foreground shadow-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done!</Badge></div>}
          </div>
          {stepCompleted && current.duration > 0 && !timerDone && <StepTimer duration={current.duration} onComplete={() => setTimerDone(true)} />}
          {stepCompleted && current.quiz && (
            <motion.div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">{current.quiz.options.map((opt, i) => (<button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null} className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${quizAnswer === null ? "hover:bg-muted border-border" : i === current.quiz!.correct ? "bg-green-500/10 border-green-500/50" : i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "opacity-40"}`}>{quizAnswer !== null && i === current.quiz!.correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 text-green-600" />}{quizAnswer === i && i !== current.quiz!.correct && <XCircle className="h-3.5 w-3.5 inline mr-1.5 text-destructive" />}{opt}</button>))}</div>
            </motion.div>
          )}
          {mode === "learning" && stepCompleted && (<motion.div className="p-3 rounded-lg bg-card border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="text-xs font-semibold text-muted-foreground mb-1"><BookOpen className="h-3.5 w-3.5 inline mr-1" /> Principle</p><p className="text-sm">{current.principle}</p><p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {current.reference}</p></motion.div>)}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" disabled={step === 0} onClick={() => { setStep(Math.max(0, step - 1)); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); }}>Previous</Button>
            <Button size="sm" disabled={!stepCompleted || (!timerDone && current.duration > 0)} onClick={isLastStep ? () => { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); } : goNext}>{isLastStep ? "Finish" : "Next"} <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
        <div className="space-y-4">
          {mode === "learning" && !stepCompleted && <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs"><Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" /> {current.hint}</div>}
          <Card className="border-primary/20 bg-primary/5"><CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> AI Lab Mentor</CardTitle></CardHeader><CardContent><AnimatePresence mode="wait">{mentorMessage ? <motion.p key={mentorMessage} className="text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{mentorMessage}</motion.p> : <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drag instruments to the cuvette!</motion.p>}</AnimatePresence></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">🧰 Instruments</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-1.5">{INSTRUMENTS.map(inst => (<div key={inst.key} className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${inst.key === current.requiredItem && !stepCompleted ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card"}`}><div className="w-3 h-3 rounded-full border" style={{ backgroundColor: inst.color }} />{inst.label}</div>))}</div></CardContent></Card>
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5"><p className="font-semibold text-muted-foreground">📊 Score</p><div className="flex justify-between"><span>Correct</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div><div className="flex justify-between"><span>Errors</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div></div>
          {isLastStep && stepCompleted && <Button variant="default" className="w-full gap-2" onClick={() => setShowResults(true)}>📊 View Results</Button>}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5"><p className="font-semibold">📚 References</p><p>• ICSH Reference Method for Hb</p><p>• Godkar Practical Pathology</p><p>• WHO Anemia Guidelines</p></div>
        </div>
      </div>
      <AnimatePresence>{showResults && <ResultsView onClose={() => setShowResults(false)} />}</AnimatePresence>
    </div>
  );
}
