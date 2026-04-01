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
  ChevronRight, RotateCcw, CheckCircle2, XCircle, Eye, Dna,
  GraduationCap, ClipboardCheck, Lightbulb, BookOpen, Timer as TimerIcon, Volume2, VolumeX
} from "lucide-react";
import { playPourSound, playSuccessSound, playErrorSound, playTickSound, playTimerCompleteSound, playPickupSound, playDropSound, playCompletionFanfare } from "@/lib/labSoundEffects";

type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number; name: string; action: string; requiredItem: string;
  duration: number; principle: string; hint: string; mentorTip: string; reference: string;
  quiz?: { question: string; correct: number; options: string[] };
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Extract DNA", action: "Drag the DNA extraction kit to the sample tube to isolate genomic DNA.", requiredItem: "dna_kit", duration: 15, principle: "DNA extraction uses cell lysis, proteinase K digestion, and column purification to isolate pure genomic DNA (Sambrook & Russell, Molecular Cloning).", hint: "Drag the DNA extraction kit to the sample.", mentorTip: "Check DNA purity with NanoDrop — A260/A280 ratio should be 1.8–2.0.", reference: "Sambrook & Russell, Molecular Cloning" },
  { id: 2, name: "Prepare Master Mix", action: "Add PCR master mix containing Taq polymerase, dNTPs, and buffer.", requiredItem: "master_mix", duration: 10, principle: "Master mix contains: Taq DNA polymerase, dNTPs (dATP, dTTP, dCTP, dGTP), MgCl₂, and reaction buffer. Keep on ice! (CLSI MM03).", hint: "Drag the master mix to the PCR tube.", mentorTip: "Always prepare master mix on ice to prevent non-specific amplification.", reference: "CLSI MM03; Sambrook & Russell", quiz: { question: "What enzyme catalyzes DNA synthesis in PCR?", correct: 1, options: ["DNA ligase", "Taq DNA polymerase", "Reverse transcriptase", "Helicase"] } },
  { id: 3, name: "Add Primers", action: "Add forward and reverse primers specific to the target sequence.", requiredItem: "primers", duration: 5, principle: "Primers are short oligonucleotides (18–25 bp) complementary to flanking regions of the target DNA. They define the amplified region (Sambrook & Russell).", hint: "Drag the primer tube to the PCR tube.", mentorTip: "Primer design is critical — check melting temperature (Tm) difference < 5°C between F and R primers.", reference: "Sambrook & Russell; CLSI MM03", quiz: { question: "What is the optimal primer length for standard PCR?", correct: 1, options: ["5–10 bp", "18–25 bp", "50–100 bp", "200+ bp"] } },
  { id: 4, name: "Add Template DNA", action: "Add the extracted template DNA to the reaction tube.", requiredItem: "template", duration: 5, principle: "Template DNA provides the target sequence for amplification. Use 10–100 ng for standard PCR (CLSI MM03).", hint: "Drag the template DNA to the PCR tube.", mentorTip: "Too much template can inhibit the reaction. 50 ng is usually optimal.", reference: "CLSI MM03" },
  { id: 5, name: "Load PCR Machine", action: "Place the PCR tube into the thermal cycler and close the lid.", requiredItem: "pcr_machine", duration: 0, principle: "The thermal cycler precisely controls temperature for denaturation, annealing, and extension cycles (Sambrook & Russell).", hint: "Drag the tube to the PCR machine.", mentorTip: "Ensure the heated lid is on to prevent evaporation!", reference: "Sambrook & Russell" },
  { id: 6, name: "Denaturation (94°C)", action: "Initial denaturation at 94°C for 5 minutes, then 30 cycles at 94°C for 30 seconds.", requiredItem: "auto", duration: 20, principle: "High temperature (94°C) breaks hydrogen bonds between DNA strands, creating single-stranded template. Essential for primer annealing (Sambrook & Russell).", hint: "Thermal cycling begins automatically.", mentorTip: "94°C separates double-stranded DNA into single strands.", reference: "Sambrook & Russell; CLSI MM03", quiz: { question: "What happens during the denaturation step of PCR?", correct: 2, options: ["Primers bind to template", "DNA polymerase synthesizes new strand", "Double-stranded DNA separates into single strands", "DNA is degraded"] } },
  { id: 7, name: "Annealing (55°C)", action: "Temperature drops to 55°C — primers anneal to complementary sequences.", requiredItem: "auto", duration: 15, principle: "At the annealing temperature (50–65°C), primers bind to complementary sequences on the single-stranded template. Temperature depends on primer Tm.", hint: "Primers are annealing to template.", mentorTip: "Annealing temp = Tm - 5°C. Too high = no binding. Too low = non-specific binding.", reference: "Sambrook & Russell" },
  { id: 8, name: "Extension (72°C)", action: "Temperature rises to 72°C — Taq polymerase extends primers, synthesizing new DNA.", requiredItem: "auto", duration: 15, principle: "Taq polymerase (optimum 72°C) adds complementary nucleotides to the 3' end of each primer, synthesizing new DNA strands (Sambrook & Russell).", hint: "Extension in progress.", mentorTip: "Extension rate: ~1000 bp/minute for Taq. Final extension: 72°C for 7 minutes.", reference: "Sambrook & Russell; CLSI MM03" },
  { id: 9, name: "Prepare Gel", action: "Prepare 1.5% agarose gel with ethidium bromide for electrophoresis.", requiredItem: "agarose", duration: 15, principle: "Agarose gel electrophoresis separates DNA fragments by size. Smaller fragments migrate faster through the gel matrix (Sambrook & Russell).", hint: "Drag the agarose to prepare the gel.", mentorTip: "1.5% gel for 100–1000 bp products. Add EtBr for UV visualization (handle with gloves!).", reference: "Sambrook & Russell", quiz: { question: "In gel electrophoresis, DNA migrates toward which electrode?", correct: 1, options: ["Cathode (negative)", "Anode (positive)", "Neither — it stays in the well", "Both directions"] } },
  { id: 10, name: "Load & Run Gel", action: "Load PCR product with loading dye into gel wells. Run at 100V for 30 minutes.", requiredItem: "electrophoresis", duration: 20, principle: "DNA is negatively charged (phosphate backbone) and migrates toward the positive anode. Loading dye tracks migration progress.", hint: "Drag the sample to the electrophoresis unit.", mentorTip: "Always include a DNA ladder (molecular weight marker) and negative control!", reference: "Sambrook & Russell; CLSI" },
  { id: 11, name: "Visualize Results", action: "Place gel on UV transilluminator to visualize DNA bands.", requiredItem: "uv_viewer", duration: 0, principle: "Ethidium bromide intercalates between DNA base pairs and fluoresces under UV light (302nm). Band position indicates fragment size (Sambrook & Russell).", hint: "Drag the gel to the UV viewer.", mentorTip: "Compare band size with DNA ladder. Expected band at target size = successful amplification!", reference: "Sambrook & Russell; CLSI MM03" },
];

const INSTRUMENTS = [
  { key: "dna_kit", label: "DNA Extraction Kit", color: "#8b5cf6" },
  { key: "master_mix", label: "PCR Master Mix", color: "#22c55e" },
  { key: "primers", label: "Primers (F + R)", color: "#f97316" },
  { key: "template", label: "Template DNA", color: "#ef4444" },
  { key: "pcr_machine", label: "PCR Thermal Cycler", color: "#6b7280" },
  { key: "agarose", label: "Agarose Gel", color: "#fef3c7" },
  { key: "electrophoresis", label: "Electrophoresis Unit", color: "#3b82f6" },
  { key: "uv_viewer", label: "UV Transilluminator", color: "#a855f7" },
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
      if (Math.sqrt((fx - TARGET_POS[0]) ** 2 + (fz - TARGET_POS[2]) ** 2) < DROP_RADIUS) onDropOnSlide(instrumentKey);
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

// PCR Machine
function PCRMachineModel({ cycling, cyclePhase }: { cycling: boolean; cyclePhase: string }) {
  const lidRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (lidRef.current && cycling) {
      const glow = cyclePhase === "denature" ? "#ef4444" : cyclePhase === "anneal" ? "#22c55e" : "#3b82f6";
      (lidRef.current.material as THREE.MeshStandardMaterial).emissive.set(glow);
      (lidRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
    }
  });
  return (
    <group>
      <RoundedBox args={[0.7, 0.2, 0.5]} radius={0.02} castShadow><meshStandardMaterial color="#d1d5db" metalness={0.4} /></RoundedBox>
      <mesh ref={lidRef} position={[0, 0.12, 0]} castShadow><boxGeometry args={[0.65, 0.04, 0.45]} /><meshStandardMaterial color="#9ca3af" metalness={0.3} /></mesh>
      {/* Display screen */}
      <mesh position={[0, 0.15, -0.2]}><boxGeometry args={[0.25, 0.08, 0.02]} /><meshBasicMaterial color={cycling ? "#22c55e" : "#1a1a2e"} /></mesh>
      {/* Tube wells */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.21 + i * 0.06, 0.08, 0.05]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} /><meshStandardMaterial color="#e5e7eb" />
        </mesh>
      ))}
      <Html position={[0, 0.3, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">
          🧬 PCR Thermal Cycler {cycling && <span className="text-green-500 font-bold animate-pulse">RUNNING</span>}
        </div>
      </Html>
    </group>
  );
}

function ReagentTube({ color, label }: { color: string; label: string }) {
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.02, 0.025, 0.12]} /><meshPhysicalMaterial color={color} roughness={0.2} transparent opacity={0.85} /></mesh>
      <mesh position={[0, 0.07, 0]} castShadow><cylinderGeometry args={[0.012, 0.015, 0.02]} /><meshStandardMaterial color="#1f2937" /></mesh>
      <Html position={[0, 0.15, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧪 {label}</div></Html>
    </group>
  );
}

function ElectrophoresisUnit() {
  return (
    <group>
      <RoundedBox args={[0.6, 0.1, 0.35]} radius={0.01} castShadow><meshPhysicalMaterial color="#dbeafe" transparent opacity={0.6} /></RoundedBox>
      {/* Gel inside */}
      <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.45, 0.04, 0.25]} /><meshStandardMaterial color="#fefce8" roughness={0.8} /></mesh>
      {/* Electrodes */}
      <mesh position={[-0.28, 0.06, 0]}><boxGeometry args={[0.02, 0.04, 0.3]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0.28, 0.06, 0]}><boxGeometry args={[0.02, 0.04, 0.3]} /><meshStandardMaterial color="#1f2937" /></mesh>
      <Html position={[0, 0.18, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">⚡ Electrophoresis</div></Html>
    </group>
  );
}

function LabScene({ step, stepCompleted, onDropOnSlide, disabled, cycling, cyclePhase }: any) {
  const orbitRef = useRef<any>(null);
  const positions: Record<string, [number, number, number]> = {
    dna_kit: [-2.2, 1.05, -0.8], master_mix: [-1.6, 1.05, -0.8], primers: [-1.0, 1.05, -0.8],
    template: [-0.4, 1.05, -0.8], pcr_machine: [0, 0.96, 0.2],
    agarose: [1.4, 1.05, -0.8], electrophoresis: [2.0, 0.96, 0.5], uv_viewer: [2.5, 0.96, -0.3],
  };

  return (
    <>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#e8e4de" /></mesh>
        <mesh position={[0, 2.5, -5]} receiveShadow><planeGeometry args={[14, 5]} /><meshStandardMaterial color="#f5f0eb" /></mesh>
        <ambientLight intensity={0.8} /><directionalLight position={[5, 5, 5]} intensity={1.2} castShadow /><spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} />
      </group>
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow><meshStandardMaterial color="#f5f5f5" roughness={0.4} /></RoundedBox>
      {/* Drop target indicator */}
      {!stepCompleted && !disabled && <mesh position={[TARGET_POS[0], TARGET_POS[1] - 0.02, TARGET_POS[2]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.5, 0.65, 32]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3} /></mesh>}

      {/* PCR machine always visible in center */}
      <group position={positions.pcr_machine}><PCRMachineModel cycling={cycling} cyclePhase={cyclePhase} /></group>

      {/* Draggable reagents */}
      {INSTRUMENTS.filter(i => !["pcr_machine", "electrophoresis", "uv_viewer"].includes(i.key)).map(inst => (
        <DraggableObject key={inst.key} homePosition={positions[inst.key]} instrumentKey={inst.key} onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
          <ReagentTube color={inst.color} label={inst.label} />
        </DraggableObject>
      ))}
      <DraggableObject homePosition={positions.pcr_machine} instrumentKey="pcr_machine" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted || step < 4 || step > 4} orbitRef={orbitRef}>
        <group />
      </DraggableObject>
      <DraggableObject homePosition={positions.electrophoresis} instrumentKey="electrophoresis" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ElectrophoresisUnit />
      </DraggableObject>
      <DraggableObject homePosition={positions.uv_viewer} instrumentKey="uv_viewer" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <group>
          <RoundedBox args={[0.4, 0.12, 0.3]} radius={0.02} castShadow><meshStandardMaterial color="#1f2937" metalness={0.3} /></RoundedBox>
          <mesh position={[0, 0.07, 0]}><boxGeometry args={[0.35, 0.01, 0.25]} /><meshBasicMaterial color="#7c3aed" /></mesh>
          <Html position={[0, 0.2, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🔦 UV Viewer</div></Html>
        </group>
      </DraggableObject>

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls ref={orbitRef} makeDefault minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
    </>
  );
}

function GelResultsView({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    // Gel background
    ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fefce8"; ctx.globalAlpha = 0.15; ctx.fillRect(20, 20, w - 40, h - 40); ctx.globalAlpha = 1;
    // Wells
    const lanes = 5;
    const lw = (w - 60) / lanes;
    const labels = ["Ladder", "Patient 1", "Patient 2", "Neg Ctrl", "Pos Ctrl"];
    // Ladder bands
    const ladderBands = [50, 90, 130, 170, 210, 250, 290];
    ladderBands.forEach(y => {
      ctx.fillStyle = "#22c55e"; ctx.globalAlpha = 0.8;
      ctx.fillRect(30, y, lw - 10, 4); ctx.globalAlpha = 1;
    });
    // Sample bands
    [1, 2, 4].forEach(lane => {
      ctx.fillStyle = "#22c55e"; ctx.globalAlpha = 0.9;
      ctx.fillRect(30 + lane * lw, 170, lw - 10, 5); ctx.globalAlpha = 1;
    });
    // No band for negative control (lane 3)
    // Labels
    ctx.fillStyle = "#ffffff"; ctx.font = "10px monospace";
    labels.forEach((l, i) => ctx.fillText(l, 30 + i * lw, h - 10));
    // Size markers
    ctx.fillStyle = "#9ca3af"; ctx.font = "9px monospace";
    ["1000bp", "750", "500", "300", "200", "100", "50"].forEach((s, i) => ctx.fillText(s, 2, 54 + i * 40));
  }, []);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="bg-card rounded-2xl border shadow-xl p-6 max-w-lg w-full mx-4 space-y-4" initial={{ scale: 0.5 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Dna className="h-5 w-5 text-primary" /> Gel Electrophoresis Results</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <canvas ref={canvasRef} width={350} height={350} className="mx-auto rounded-lg border" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">Interpretation:</p>
          <p>✅ Patient 1 & 2: Band at ~300bp = Target gene DETECTED</p>
          <p>❌ Negative Control: No band = No contamination</p>
          <p>✅ Positive Control: Band present = Assay valid</p>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Ref: Sambrook & Russell, Molecular Cloning; CLSI MM03</p>
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
      setRemaining(r => { if (r - 1 <= 0) { clearInterval(t); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); return 0; } return r - 1; });
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
            <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
            <Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">⏭ Skip</Button>
          </div>
        ) : <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" /> Done</Badge>}
      </div>
      <Progress value={((duration - remaining) / duration) * 100} className="h-2" />
    </div>
  );
}

export function PCRSimulator3D() {
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
  const [cycling, setCycling] = useState(false);
  const [cyclePhase, setCyclePhase] = useState("idle");

  const sfx = useCallback((fn: () => void) => { if (soundEnabled) try { fn(); } catch {} }, [soundEnabled]);
  const current = PROTOCOL_STEPS[step];
  const isLastStep = step === PROTOCOL_STEPS.length - 1;

  // Set cycling phase visuals for thermal cycling steps (user must start timer)
  useEffect(() => {
    if (current.requiredItem === "auto" && !stepCompleted) {
      setCycling(true);
      const phaseIdx = step === 5 ? 0 : step === 6 ? 1 : 2;
      setCyclePhase(["denature", "anneal", "extend"][phaseIdx]);
      // Mark step as "ready" — user will use the timer to complete
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      sfx(playSuccessSound);
    } else {
      setCycling(false); setCyclePhase("idle");
    }
  }, [step, current, stepCompleted, sfx]);

  const handleDropOnSlide = useCallback((key: string) => {
    if (stepCompleted) return;
    if (key === current.requiredItem) {
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      sfx(() => playPourSound(0.8, 700));
      if (current.duration === 0) setTimerDone(true);
    } else {
      sfx(playErrorSound);
      setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      setMentorMessage(mode === "learning" ? `❌ Wrong! ${current.hint}` : `❌ Wrong reagent!`);
    }
  }, [step, stepCompleted, current, mode, sfx]);

  const goNext = () => {
    if (isLastStep) { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); return; }
    setStep(step + 1); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage("");
  };

  const handleQuizAnswer = (idx: number) => { if (quizAnswer !== null) return; setQuizAnswer(idx); setScore(s => ({ ...s, quizTotal: s.quizTotal + 1, quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0) })); };

  const reset = () => {
    setStep(0); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage("");
    setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
    setGameFinished(false); setShowResults(false); setCycling(false); setCyclePhase("idle");
  };

  const finalScore = useMemo(() => {
    const total = Math.round((score.correctSteps / PROTOCOL_STEPS.length) * 60 + (score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30) + Math.max(0, 10 - score.wrongSteps * 2));
    return { total, grade: total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake" };
  }, [score]);

  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-green-600" /> PCR & Gel Electrophoresis Complete!</CardTitle></CardHeader>
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
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Dna className="h-5 w-5 text-primary" /> PCR Amplification & Gel Electrophoresis</h3>
          <p className="text-xs text-muted-foreground">Drag reagents to the work area. Orbit with right-click.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-md border bg-card hover:bg-muted">{soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}</button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => { setMode("learning"); reset(); }} className={`px-3 py-1.5 text-xs font-medium ${mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card"}`}><GraduationCap className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setMode("exam"); reset(); }} className={`px-3 py-1.5 text-xs font-medium ${mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card"}`}><ClipboardCheck className="h-3.5 w-3.5" /></button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1}/{PROTOCOL_STEPS.length}</span><span>{current.name}</span></div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 4, 5], fov: 50 }} gl={{ antialias: true }}>
              <Suspense fallback={null}><LabScene step={step} stepCompleted={stepCompleted} onDropOnSlide={handleDropOnSlide} disabled={false} cycling={cycling} cyclePhase={cyclePhase} /></Suspense>
            </Canvas>
            <div className="absolute top-3 left-3 right-3"><div className="p-3 rounded-lg backdrop-blur-md border text-sm bg-card/80"><span className="font-semibold">Step {current.id}:</span> {current.action}</div></div>
            {stepCompleted && <div className="absolute bottom-3 left-3"><Badge className="bg-green-600 text-white shadow-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done!</Badge></div>}
            {cycling && <div className="absolute bottom-3 right-3"><Badge className="bg-amber-500 text-white shadow-lg animate-pulse">🌡️ {cyclePhase === "denature" ? "94°C Denaturation" : cyclePhase === "anneal" ? "55°C Annealing" : "72°C Extension"}</Badge></div>}
          </div>
          {stepCompleted && current.duration > 0 && !timerDone && <StepTimer duration={current.duration} onComplete={() => setTimerDone(true)} />}
          {stepCompleted && current.quiz && (
            <motion.div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">
                {current.quiz.options.map((opt, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null}
                    className={`w-full text-left p-2.5 rounded-lg text-sm border ${quizAnswer === null ? "hover:bg-muted border-border" : i === current.quiz!.correct ? "bg-green-500/10 border-green-500/50" : i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "opacity-40"}`}>
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
              {isLastStep ? "Finish" : "Next"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {mode === "learning" && !stepCompleted && <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs"><Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" /> {current.hint}</div>}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> AI Lab Mentor</CardTitle></CardHeader>
            <CardContent><AnimatePresence mode="wait">
              {mentorMessage ? <motion.p key={mentorMessage} className="text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{mentorMessage}</motion.p>
                : <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drag reagents to the work area!</motion.p>}
            </AnimatePresence></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">🧰 Reagents</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 gap-1.5">
              {INSTRUMENTS.map(inst => (
                <div key={inst.key} className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${inst.key === current.requiredItem && !stepCompleted ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card"} ${stepCompleted ? "opacity-50" : ""}`}>
                  <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: inst.color }} />{inst.label}
                </div>
              ))}
            </div></CardContent>
          </Card>
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground">📊 Score</p>
            <div className="flex justify-between"><span>Correct</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div>
            <div className="flex justify-between"><span>Errors</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div>
          </div>
          {isLastStep && stepCompleted && <Button variant="default" className="w-full gap-2" onClick={() => setShowResults(true)}><Eye className="h-4 w-4" /> View Gel Results</Button>}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5">
            <p className="font-semibold">📚 References</p>
            <p>• Sambrook & Russell, Molecular Cloning</p>
            <p>• CLSI MM03, Molecular Diagnostics</p>
          </div>
        </div>
      </div>
      <AnimatePresence>{showResults && <GelResultsView onClose={() => setShowResults(false)} />}</AnimatePresence>
    </div>
  );
}
