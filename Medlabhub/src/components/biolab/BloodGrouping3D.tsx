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
  ChevronRight, RotateCcw, CheckCircle2, XCircle, Eye, Heart,
  GraduationCap, ClipboardCheck, Lightbulb, BookOpen, Volume2, VolumeX
} from "lucide-react";
import { playPourSound, playSuccessSound, playErrorSound, playPickupSound, playDropSound, playCompletionFanfare, playGlassSound } from "@/lib/labSoundEffects";

type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number; name: string; action: string; requiredItem: string;
  duration: number; principle: string; hint: string; mentorTip: string; reference: string;
  quiz?: { question: string; correct: number; options: string[] };
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Collect Blood", action: "Drag the lancet to the finger to collect a blood sample.", requiredItem: "lancet", duration: 0, principle: "A capillary blood sample is obtained by finger prick. Clean the site with alcohol, allow to dry, then puncture with a sterile lancet (AABB Technical Manual).", hint: "Drag the lancet to collect blood.", mentorTip: "Wipe away the first drop — it contains tissue fluid that can cause false results!", reference: "AABB Technical Manual, 20th Ed." },
  { id: 2, name: "Prepare 3 Drops", action: "Place 3 drops of blood on the glass slide — one for each antiserum.", requiredItem: "blood_drop", duration: 0, principle: "Three separate drops ensure independent testing with Anti-A, Anti-B, and Anti-D antisera without cross-contamination.", hint: "Drag blood drops to the slide.", mentorTip: "Space the drops well apart to prevent mixing!", reference: "AABB Technical Manual; WHO Blood Safety" },
  { id: 3, name: "Add Anti-A", action: "Add Anti-A antiserum (BLUE) to the first blood drop.", requiredItem: "anti_a", duration: 0, principle: "Anti-A antiserum contains antibodies against A antigen. If A antigens are present on RBCs, agglutination (clumping) occurs (AABB Technical Manual).", hint: "Drag Anti-A (blue) to the first drop.", mentorTip: "Anti-A is color-coded BLUE. Add 1 drop of antiserum to 1 drop of blood.", reference: "AABB Technical Manual", quiz: { question: "What does Anti-A antiserum detect?", correct: 0, options: ["A antigens on RBCs", "B antigens on RBCs", "Rh(D) antigen", "Antibodies in serum"] } },
  { id: 4, name: "Add Anti-B", action: "Add Anti-B antiserum (YELLOW) to the second blood drop.", requiredItem: "anti_b", duration: 0, principle: "Anti-B antiserum contains antibodies against B antigen. Agglutination = B antigen present on the patient's RBCs.", hint: "Drag Anti-B (yellow) to the second drop.", mentorTip: "Anti-B is color-coded YELLOW. Use a separate mixing stick for each!", reference: "AABB Technical Manual; WHO" },
  { id: 5, name: "Add Anti-D", action: "Add Anti-D antiserum (CLEAR) to the third blood drop for Rh typing.", requiredItem: "anti_d", duration: 0, principle: "Anti-D detects the Rh(D) antigen — the most immunogenic Rh antigen. Rh-positive = agglutination. Rh-negative = no agglutination (AABB).", hint: "Drag Anti-D to the third drop.", mentorTip: "Rh typing is critical for transfusion safety and pregnancy management!", reference: "AABB Technical Manual", quiz: { question: "What is the clinical significance of Rh(D) typing?", correct: 2, options: ["Determines ABO group", "Detects infections", "Prevents hemolytic disease of the newborn & transfusion reactions", "Measures hemoglobin"] } },
  { id: 6, name: "Mix Gently", action: "Mix each drop with a separate applicator stick. Rock the slide gently.", requiredItem: "mixer", duration: 10, principle: "Gentle mixing ensures complete antigen-antibody interaction. Use separate sticks to prevent carryover between drops (AABB).", hint: "Drag the mixer to the slide.", mentorTip: "Rock the slide back and forth for 2 minutes. DO NOT use the same stick for different drops!", reference: "AABB; WHO Blood Safety Manual" },
  { id: 7, name: "Read Results", action: "Observe for agglutination (clumping) in each drop. Record the blood group!", requiredItem: "magnifier", duration: 0, principle: "Agglutination = antigen-antibody reaction (positive). Smooth suspension = no reaction (negative). Interpret ABO & Rh from the pattern (AABB Technical Manual).", hint: "Use the magnifier to read results.", mentorTip: "🔍 Check each drop carefully. Report the blood group based on the agglutination pattern!", reference: "AABB Technical Manual; WHO", quiz: { question: "If agglutination occurs with Anti-A and Anti-B but NOT Anti-D, what is the blood group?", correct: 2, options: ["A Positive", "B Negative", "AB Negative", "O Positive"] } },
];

const INSTRUMENTS = [
  { key: "lancet", label: "Sterile Lancet", color: "#ef4444" },
  { key: "blood_drop", label: "Blood Sample", color: "#dc2626" },
  { key: "anti_a", label: "Anti-A (Blue)", color: "#3b82f6" },
  { key: "anti_b", label: "Anti-B (Yellow)", color: "#eab308" },
  { key: "anti_d", label: "Anti-D (Clear)", color: "#d1d5db" },
  { key: "mixer", label: "Applicator Stick", color: "#a0845e" },
  { key: "magnifier", label: "Magnifying Glass", color: "#6b7280" },
];

// Blood group types for simulation
const BLOOD_GROUPS = [
  { type: "A+", antiA: true, antiB: false, antiD: true },
  { type: "B+", antiA: false, antiB: true, antiD: true },
  { type: "AB+", antiA: true, antiB: true, antiD: true },
  { type: "O+", antiA: false, antiB: false, antiD: true },
  { type: "A-", antiA: true, antiB: false, antiD: false },
  { type: "B-", antiA: false, antiB: true, antiD: false },
  { type: "AB-", antiA: true, antiB: true, antiD: false },
  { type: "O-", antiA: false, antiB: false, antiD: false },
];

const SLIDE_POS: [number, number, number] = [0, 0.97, 0.2];
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
      if (Math.sqrt((fx - SLIDE_POS[0]) ** 2 + (fz - SLIDE_POS[2]) ** 2) < DROP_RADIUS) onDropOnSlide(instrumentKey);
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

// Blood typing slide with 3 test areas
function TypingSlide({ step, bloodGroup, isDropTarget }: { step: number; bloodGroup: typeof BLOOD_GROUPS[0]; isDropTarget: boolean }) {
  const showAntiA = step >= 3;
  const showAntiB = step >= 4;
  const showAntiD = step >= 5;
  const showMixed = step >= 6;

  return (
    <group position={SLIDE_POS}>
      {isDropTarget && <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.7, 0.85, 32]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3} /></mesh>}
      {/* Glass slide */}
      <mesh castShadow><boxGeometry args={[1.8, 0.025, 0.6]} /><meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.85} roughness={0.1} transmission={0.3} /></mesh>
      {/* Labels */}
      {["Anti-A", "Anti-B", "Anti-D"].map((label, i) => (
        <group key={label}>
          <Html position={[-0.6 + i * 0.6, 0.08, -0.25]} center><div className="text-[8px] font-bold text-muted-foreground">{label}</div></Html>
        </group>
      ))}
      {/* Blood drops */}
      {step >= 2 && [-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0.05]}>
          <cylinderGeometry args={[0.08, 0.08, 0.005]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
      ))}
      {/* Anti-A reaction */}
      {showAntiA && (
        <group position={[-0.6, 0.025, 0.05]}>
          {bloodGroup.antiA && showMixed ? (
            // Agglutination — clumps
            Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[(Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1]}>
                <sphereGeometry args={[0.012 + Math.random() * 0.008, 6, 6]} />
                <meshStandardMaterial color="#8b0000" roughness={0.8} />
              </mesh>
            ))
          ) : showMixed ? (
            // Smooth — no agglutination
            <mesh><cylinderGeometry args={[0.07, 0.07, 0.003]} /><meshStandardMaterial color="#cc3333" roughness={0.5} /></mesh>
          ) : null}
        </group>
      )}
      {/* Anti-B reaction */}
      {showAntiB && (
        <group position={[0, 0.025, 0.05]}>
          {bloodGroup.antiB && showMixed ? (
            Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[(Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1]}>
                <sphereGeometry args={[0.012 + Math.random() * 0.008, 6, 6]} />
                <meshStandardMaterial color="#8b0000" roughness={0.8} />
              </mesh>
            ))
          ) : showMixed ? (
            <mesh><cylinderGeometry args={[0.07, 0.07, 0.003]} /><meshStandardMaterial color="#cc3333" roughness={0.5} /></mesh>
          ) : null}
        </group>
      )}
      {/* Anti-D reaction */}
      {showAntiD && (
        <group position={[0.6, 0.025, 0.05]}>
          {bloodGroup.antiD && showMixed ? (
            Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[(Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1]}>
                <sphereGeometry args={[0.012 + Math.random() * 0.008, 6, 6]} />
                <meshStandardMaterial color="#8b0000" roughness={0.8} />
              </mesh>
            ))
          ) : showMixed ? (
            <mesh><cylinderGeometry args={[0.07, 0.07, 0.003]} /><meshStandardMaterial color="#cc3333" roughness={0.5} /></mesh>
          ) : null}
        </group>
      )}
      <Html position={[0, 0.12, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">
          🩸 Blood Typing Slide {isDropTarget && <span className="text-green-500 font-bold">— Drop Here!</span>}
        </div>
      </Html>
    </group>
  );
}

function ReagentBottle({ color, label }: { color: string; label: string }) {
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.035, 0.045, 0.14]} /><meshPhysicalMaterial color={color} roughness={0.15} transparent opacity={0.9} /></mesh>
      <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.018, 0.022, 0.03]} /><meshStandardMaterial color="#1f2937" /></mesh>
      <Html position={[0, 0.18, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧪 {label}</div></Html>
    </group>
  );
}

function LabScene({ step, stepCompleted, onDropOnSlide, disabled, bloodGroup }: any) {
  const orbitRef = useRef<any>(null);
  const positions: Record<string, [number, number, number]> = {
    lancet: [-2.2, 1.05, 0.5], blood_drop: [-1.6, 1.05, 0.5],
    anti_a: [-1.0, 1.05, -0.8], anti_b: [-0.4, 1.05, -0.8], anti_d: [0.2, 1.05, -0.8],
    mixer: [1.0, 1.05, 0.5], magnifier: [2.0, 1.05, 0.5],
  };

  return (
    <>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#e8e4de" /></mesh>
        <mesh position={[0, 2.5, -5]} receiveShadow><planeGeometry args={[14, 5]} /><meshStandardMaterial color="#f5f0eb" /></mesh>
        <ambientLight intensity={0.8} /><directionalLight position={[5, 5, 5]} intensity={1.2} castShadow /><spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} />
      </group>
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow><meshStandardMaterial color="#f5f5f5" roughness={0.4} /></RoundedBox>

      <TypingSlide step={step} bloodGroup={bloodGroup} isDropTarget={!stepCompleted && !disabled} />

      {INSTRUMENTS.map(inst => (
        <DraggableObject key={inst.key} homePosition={positions[inst.key]} instrumentKey={inst.key} onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
          {inst.key === "magnifier" ? (
            <group>
              <mesh castShadow><cylinderGeometry args={[0.06, 0.06, 0.005]} /><meshPhysicalMaterial color="#dbeafe" transparent opacity={0.3} /></mesh>
              <mesh position={[0, -0.05, 0.06]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 0.12]} /><meshStandardMaterial color="#a0845e" /></mesh>
              <Html position={[0, 0.1, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🔍 Magnifier</div></Html>
            </group>
          ) : inst.key === "lancet" ? (
            <group>
              <mesh castShadow><boxGeometry args={[0.06, 0.02, 0.1]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
              <mesh position={[0, 0.01, 0.04]}><boxGeometry args={[0.01, 0.01, 0.02]} /><meshStandardMaterial color="#d1d5db" metalness={0.8} /></mesh>
              <Html position={[0, 0.08, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🩹 Lancet</div></Html>
            </group>
          ) : inst.key === "mixer" ? (
            <group>
              <mesh rotation={[0, 0, 0.1]} castShadow><cylinderGeometry args={[0.004, 0.004, 0.2]} /><meshStandardMaterial color="#a0845e" /></mesh>
              <Html position={[0, 0.15, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🪵 Stick</div></Html>
            </group>
          ) : (
            <ReagentBottle color={inst.color} label={inst.label} />
          )}
        </DraggableObject>
      ))}

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls ref={orbitRef} makeDefault minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
    </>
  );
}

function ResultsView({ bloodGroup, onClose }: { bloodGroup: typeof BLOOD_GROUPS[0]; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="bg-card rounded-2xl border shadow-xl p-6 max-w-md w-full mx-4 space-y-4" initial={{ scale: 0.5 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Blood Group Result</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200">
          <p className="text-5xl font-bold text-red-600">{bloodGroup.type}</p>
          <p className="text-sm text-muted-foreground mt-2">Blood Group</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="p-3 rounded-lg border">
            <div className={`text-lg font-bold ${bloodGroup.antiA ? "text-red-600" : "text-green-600"}`}>{bloodGroup.antiA ? "+" : "−"}</div>
            <p className="text-xs text-muted-foreground">Anti-A</p>
            <p className="text-[10px]">{bloodGroup.antiA ? "Agglutinated" : "Smooth"}</p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className={`text-lg font-bold ${bloodGroup.antiB ? "text-red-600" : "text-green-600"}`}>{bloodGroup.antiB ? "+" : "−"}</div>
            <p className="text-xs text-muted-foreground">Anti-B</p>
            <p className="text-[10px]">{bloodGroup.antiB ? "Agglutinated" : "Smooth"}</p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className={`text-lg font-bold ${bloodGroup.antiD ? "text-red-600" : "text-green-600"}`}>{bloodGroup.antiD ? "+" : "−"}</div>
            <p className="text-xs text-muted-foreground">Anti-D</p>
            <p className="text-[10px]">{bloodGroup.antiD ? "Rh Positive" : "Rh Negative"}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic text-center">Ref: AABB Technical Manual, 20th Ed.; WHO Blood Safety</p>
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
      setRemaining(r => { if (r - 1 <= 0) { clearInterval(t); setRunning(false); setDone(true); onComplete(); return 0; } return r - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);
  if (duration === 0) return null;
  const handleSkip = () => { setRemaining(0); setRunning(false); setDone(true); onComplete(); };
  return (
    <div className="space-y-2 p-3 rounded-lg bg-card border">
      <div className="flex items-center justify-between">
        <span className="font-mono text-lg font-bold">{remaining}s</span>
        {!done ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
            <Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">⏭ Skip</Button>
          </div>
        ) : <Badge className="bg-green-600 text-white">Done</Badge>}
      </div>
      <Progress value={((duration - remaining) / duration) * 100} className="h-2" />
    </div>
  );
}

export function BloodGrouping3D() {
  const [mode, setMode] = useState<GameMode>("learning");
  const [step, setStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [selectedBG, setSelectedBG] = useState(0);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
  const [gameFinished, setGameFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sfx = useCallback((fn: () => void) => { if (soundEnabled) try { fn(); } catch {} }, [soundEnabled]);
  const current = PROTOCOL_STEPS[step];
  const isLastStep = step === PROTOCOL_STEPS.length - 1;
  const bloodGroup = BLOOD_GROUPS[selectedBG];

  const handleDropOnSlide = useCallback((key: string) => {
    if (stepCompleted) return;
    if (key === current.requiredItem) {
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      sfx(key === "lancet" ? playGlassSound : () => playPourSound(0.5, 800));
      if (current.duration === 0) setTimerDone(true);
    } else {
      sfx(playErrorSound);
      setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      setMentorMessage(mode === "learning" ? `❌ Wrong! ${current.hint}` : `❌ Wrong item!`);
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
    setGameFinished(false); setShowResults(false);
  };

  const finalScore = useMemo(() => {
    const total = Math.round((score.correctSteps / PROTOCOL_STEPS.length) * 60 + (score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30) + Math.max(0, 10 - score.wrongSteps * 2));
    return { total, grade: total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake" };
  }, [score]);

  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-green-600" /> Blood Grouping Complete!</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200">
              <p className="text-4xl font-bold text-red-600">{bloodGroup.type}</p>
              <p className="text-sm text-muted-foreground">Determined Blood Group</p>
            </div>
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
          <h3 className="text-lg font-semibold flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> ABO & Rh Blood Grouping</h3>
          <p className="text-xs text-muted-foreground">Drag instruments & antisera onto the slide.</p>
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

      {/* Blood group selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Patient Blood:</span>
        {BLOOD_GROUPS.map((bg, i) => (
          <button key={i} onClick={() => { setSelectedBG(i); reset(); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${i === selectedBG ? "bg-red-600 text-white border-red-600" : "bg-card border-border hover:bg-muted"}`}>
            {bg.type}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1}/{PROTOCOL_STEPS.length}</span><span>{current.name}</span></div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 3.5, 4.5], fov: 50 }} gl={{ antialias: true }}>
              <Suspense fallback={null}><LabScene step={step} stepCompleted={stepCompleted} onDropOnSlide={handleDropOnSlide} disabled={false} bloodGroup={bloodGroup} /></Suspense>
            </Canvas>
            <div className="absolute top-3 left-3 right-3"><div className="p-3 rounded-lg backdrop-blur-md border text-sm bg-card/80"><span className="font-semibold">Step {current.id}:</span> {current.action}</div></div>
            {stepCompleted && <div className="absolute bottom-3 left-3"><Badge className="bg-green-600 text-white shadow-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done!</Badge></div>}
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
                : <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drag instruments to the slide!</motion.p>}
            </AnimatePresence></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">🧰 Instruments</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 gap-1.5">
              {INSTRUMENTS.map(inst => (
                <div key={inst.key} className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${inst.key === current.requiredItem && !stepCompleted ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card"}`}>
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
          {isLastStep && stepCompleted && <Button variant="default" className="w-full gap-2" onClick={() => setShowResults(true)}><Eye className="h-4 w-4" /> View Results</Button>}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5">
            <p className="font-semibold">📚 References</p>
            <p>• AABB Technical Manual, 20th Edition</p>
            <p>• WHO Blood Safety Guidelines</p>
            <p>• Harmening, Modern Blood Banking</p>
          </div>
        </div>
      </div>
      <AnimatePresence>{showResults && <ResultsView bloodGroup={bloodGroup} onClose={() => setShowResults(false)} />}</AnimatePresence>
    </div>
  );
}
