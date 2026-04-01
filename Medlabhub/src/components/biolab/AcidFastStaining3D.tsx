// @ts-nocheck
import { useState, useRef, useCallback, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Html, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, RotateCcw, AlertTriangle, CheckCircle2, XCircle,
  Microscope, Eye, FlaskConical, GraduationCap, ClipboardCheck,
  Lightbulb, BookOpen, Timer as TimerIcon, Volume2, VolumeX
} from "lucide-react";
import {
  playPourSound, playFlameSound, playGlassSound, playSuccessSound,
  playErrorSound, playTickSound, playTimerCompleteSound, playPaperSound,
  playPickupSound, playDropSound, playCompletionFanfare, playFocusClickSound
} from "@/lib/labSoundEffects";

type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number; name: string; action: string; requiredItem: string;
  duration: number; principle: string; cellColor: string;
  afbColor: string; afbLabel: string; nonAfbLabel: string;
  hint: string; mentorTip: string; reference: string;
  quiz?: { question: string; correct: number; options: string[] };
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Prepare Smear", action: "Drag the inoculating loop to the slide to prepare a thin sputum smear.", requiredItem: "loop", duration: 0, principle: "A thin, even smear is critical for proper AFB visualization. Thick smears lead to false negatives (WHO TB Lab Manual, 2014).", cellColor: "transparent", afbColor: "transparent", afbLabel: "Unstained", nonAfbLabel: "Unstained", hint: "Pick up the loop and drag it onto the slide.", mentorTip: "Use sputum sample — the most purulent part gives best results.", reference: "WHO TB Laboratory Biosafety Manual" },
  { id: 2, name: "Air Dry", action: "Allow the smear to air dry completely.", requiredItem: "auto", duration: 0, principle: "Complete air drying prevents washing off during staining (District Lab Practice in Tropical Countries).", cellColor: "transparent", afbColor: "transparent", afbLabel: "Dried", nonAfbLabel: "Dried", hint: "Wait for air drying.", mentorTip: "Never blow dry — risk of aerosolizing TB bacilli!", reference: "Cheesbrough, District Lab Practice" },
  { id: 3, name: "Heat Fix", action: "Pass the slide over the Bunsen burner flame 3 times.", requiredItem: "burner", duration: 0, principle: "Heat fixation kills organisms and adheres smear. Essential for safety with TB specimens (WHO Biosafety).", cellColor: "transparent", afbColor: "transparent", afbLabel: "Fixed", nonAfbLabel: "Fixed", hint: "Drag the Bunsen burner to the slide.", mentorTip: "Smear side UP! Handle TB specimens in BSC.", reference: "WHO Lab Biosafety Manual, 3rd Ed." },
  { id: 4, name: "Carbol Fuchsin (5 min)", action: "Flood the smear with carbol fuchsin. Heat gently for 5 minutes — steam but DON'T boil!", requiredItem: "carbol_fuchsin", duration: 30, principle: "Carbol fuchsin penetrates mycolic acid layer when heated. Steam opens waxy cell wall allowing dye entry. ALL organisms stain red (Cappuccino & Welsh).", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED (stained)", nonAfbLabel: "RED (stained)", hint: "Drag the red carbol fuchsin bottle to the slide.", mentorTip: "⚠️ CRITICAL: Heat gently until steam rises. Boiling disrupts the smear!", reference: "Cappuccino & Welsh; WHO ZN Protocol", quiz: { question: "Why must carbol fuchsin be heated during ZN staining?", correct: 1, options: ["To sterilize the stain", "To open the mycolic acid layer for dye penetration", "To speed up the reaction", "To change the dye color"] } },
  { id: 5, name: "Cool & Wash", action: "Let the slide cool, then wash with water.", requiredItem: "wash", duration: 5, principle: "Cooling before washing prevents slide cracking. Gentle wash removes excess stain.", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED", nonAfbLabel: "RED", hint: "Drag the wash bottle to the slide.", mentorTip: "Let it cool first — thermal shock cracks glass slides.", reference: "WHO TB Laboratory Manual" },
  { id: 6, name: "Acid-Alcohol (2 min)", action: "⚠️ CRITICAL! Apply 20% H₂SO₄ (acid-alcohol) for decolorization. 2 minutes.", requiredItem: "acid_alcohol", duration: 20, principle: "Acid-alcohol dissolves dye from non-AFB cells. Mycobacteria retain carbol fuchsin due to mycolic acid — hence 'acid-fast' (Bergey's Manual). Non-AFB become colorless.", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED (retained!)", nonAfbLabel: "COLORLESS", hint: "Drag the acid-alcohol decolorizer to the slide.", mentorTip: "This is the differential step! AFB resist decolorization due to mycolic acid.", reference: "Bergey's Manual; CLSI M48-A", quiz: { question: "Why do Mycobacteria resist acid-alcohol decolorization?", correct: 2, options: ["Thick peptidoglycan", "Outer membrane", "Mycolic acid in cell wall", "Capsule protection"] } },
  { id: 7, name: "Wash", action: "Wash with water to stop decolorization.", requiredItem: "wash", duration: 5, principle: "Removes excess acid-alcohol. Prompt washing prevents over-decolorization.", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED", nonAfbLabel: "Colorless", hint: "Wash immediately!", mentorTip: "Quick rinse — don't let acid-alcohol sit too long.", reference: "WHO Basic Lab Procedures" },
  { id: 8, name: "Methylene Blue (1 min)", action: "Apply methylene blue counterstain for 1 minute.", requiredItem: "methylene_blue", duration: 15, principle: "Methylene blue counterstains decolorized (non-AFB) cells blue. AFB remain red — blue masks lighter red (Cappuccino & Welsh).", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED (AFB!)", nonAfbLabel: "BLUE (counterstained)", hint: "Drag the blue methylene blue bottle to the slide.", mentorTip: "Non-AFB bacteria and tissue cells will appear blue.", reference: "Cappuccino & Welsh; Godkar", quiz: { question: "What color are Mycobacterium tuberculosis cells after ZN staining?", correct: 0, options: ["Red/Pink (acid-fast)", "Blue", "Purple", "Colorless"] } },
  { id: 9, name: "Final Wash", action: "Gently rinse with water.", requiredItem: "wash", duration: 5, principle: "Removes excess methylene blue for clean visualization.", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED", nonAfbLabel: "BLUE", hint: "Final wash.", mentorTip: "Almost done!", reference: "WHO TB Lab Manual" },
  { id: 10, name: "Dry Slide", action: "Blot dry with bibulous paper — do NOT rub.", requiredItem: "paper", duration: 0, principle: "Gentle blotting removes water without disturbing the stained smear.", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "RED (ready)", nonAfbLabel: "BLUE (ready)", hint: "Drag the paper onto the slide.", mentorTip: "Blot gently. Rubbing destroys the smear.", reference: "Clinical Microbiology Procedures Handbook" },
  { id: 11, name: "Observe Microscope", action: "Examine under oil immersion (1000×). Look for red rod-shaped AFB against blue background.", requiredItem: "microscope", duration: 0, principle: "Oil immersion at 1000× is required. Examine at least 100 fields before reporting negative (WHO grading scale).", cellColor: "#dc2626", afbColor: "#dc2626", afbLabel: "Acid-Fast (RED rods)", nonAfbLabel: "Non-AFB (BLUE)", hint: "Drag the slide to the microscope.", mentorTip: "Report using WHO/IUATLD grading: 1+, 2+, 3+ based on AFB count per field.", reference: "WHO TB Microscopy Manual; IUATLD", quiz: { question: "How many oil-immersion fields must be examined before reporting AFB-negative?", correct: 2, options: ["10 fields", "50 fields", "At least 100 fields", "300 fields"] } },
];

const INSTRUMENTS = [
  { key: "loop", label: "Inoculating Loop", color: "#c0c0c0" },
  { key: "burner", label: "Bunsen Burner", color: "#4a90d9" },
  { key: "wash", label: "Wash Bottle", color: "#93c5fd" },
  { key: "paper", label: "Bibulous Paper", color: "#fef3c7" },
  { key: "microscope", label: "Microscope", color: "#6b7280" },
  { key: "carbol_fuchsin", label: "Carbol Fuchsin", color: "#dc2626" },
  { key: "acid_alcohol", label: "Acid-Alcohol (20% H₂SO₄)", color: "#e5e7eb" },
  { key: "methylene_blue", label: "Methylene Blue", color: "#2563eb" },
];

const SLIDE_POS: [number, number, number] = [0, 0.97, 0.2];
const DROP_RADIUS = 0.6;

// ── Reusable 3D Components ──
function DraggableObject({ children, homePosition, instrumentKey, onDropOnSlide, disabled, orbitRef }: any) {
  const groupRef = useRef<THREE.Group>(null);
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
    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const pt = getWorldPoint(ev);
      setPos([pt.x + offset.current.x, homePosition[1] + 0.15, pt.z + offset.current.z]);
    };
    const onUp = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      gl.domElement.style.cursor = "auto";
      if (orbitRef.current) orbitRef.current.enabled = true;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const pt = getWorldPoint(ev);
      const fx = pt.x + offset.current.x;
      const fz = pt.z + offset.current.z;
      const dist = Math.sqrt((fx - SLIDE_POS[0]) ** 2 + (fz - SLIDE_POS[2]) ** 2);
      if (dist < DROP_RADIUS) onDropOnSlide(instrumentKey);
      else try { playDropSound(); } catch {}
      setPos(homePosition);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [disabled, getWorldPoint, gl, homePosition, instrumentKey, onDropOnSlide, orbitRef, pos]);

  return (
    <group ref={groupRef} position={pos} onPointerDown={onPointerDown}
      onPointerOver={() => { if (!disabled) { setIsOver(true); gl.domElement.style.cursor = "grab"; } }}
      onPointerOut={() => { setIsOver(false); if (!isDragging.current) gl.domElement.style.cursor = "auto"; }}>
      {children}
      {isOver && !disabled && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function LabRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#e8e4de" /></mesh>
      <mesh position={[0, 2.5, -5]} receiveShadow><planeGeometry args={[14, 5]} /><meshStandardMaterial color="#f5f0eb" /></mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-7, 2.5, 0]} receiveShadow><planeGeometry args={[10, 5]} /><meshStandardMaterial color="#f0ebe5" /></mesh>
      <mesh position={[0, 4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 1.5]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
      <spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} castShadow />
    </group>
  );
}

function WorkBench() {
  return (
    <group>
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} metalness={0.05} />
      </RoundedBox>
      {[[-2.8, 0.42, -1.3], [2.8, 0.42, -1.3], [-2.8, 0.42, 1.3], [2.8, 0.42, 1.3]].map((p, i) => (
        <mesh key={i} position={p as any} castShadow><cylinderGeometry args={[0.04, 0.04, 0.84]} /><meshStandardMaterial color="#a1a1aa" metalness={0.8} roughness={0.2} /></mesh>
      ))}
    </group>
  );
}

function GlassSlide({ afbColor, nonAfbColor, stepId, isDropTarget, heatFixAnimating }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(0);
  
  useFrame((_, delta) => {
    if (meshRef.current && isDropTarget) meshRef.current.position.y = SLIDE_POS[1] + Math.sin(Date.now() * 0.003) * 0.008;
    // Heat fix animation: slide lifts up to burner flame, holds, returns
    if (groupRef.current) {
      if (heatFixAnimating) {
        animProgress.current = Math.min(1, animProgress.current + delta * 0.8);
        const t = animProgress.current;
        // Arc: slide moves toward burner (-1.8, 0) and lifts to flame height (~1.4)
        const liftY = t < 0.4 ? (t / 0.4) * 0.45 : t > 0.7 ? ((1 - t) / 0.3) * 0.45 : 0.45;
        const slideX = t < 0.4 ? (t / 0.4) * -1.2 : t > 0.7 ? ((1 - t) / 0.3) * -1.2 : -1.2;
        groupRef.current.position.set(slideX, liftY, 0);
      } else {
        animProgress.current = 0;
        groupRef.current.position.set(0, 0, 0);
      }
    }
  });
  const showCells = stepId >= 1;
  return (
    <group ref={groupRef}>
    <group position={SLIDE_POS}>
      {isDropTarget && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} /><meshBasicMaterial color="#22c55e" transparent opacity={0.3 + Math.sin(Date.now() * 0.004) * 0.15} />
        </mesh>
      )}
      <mesh ref={meshRef} castShadow><boxGeometry args={[1.2, 0.025, 0.45]} /><meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.85} roughness={0.1} transmission={0.3} /></mesh>
      <mesh position={[-0.4, 0.015, 0]}><boxGeometry args={[0.3, 0.003, 0.42]} /><meshStandardMaterial color="#f0e6d3" roughness={0.9} /></mesh>
      {showCells && afbColor !== "transparent" && (
        <group position={[0.15, 0.02, 0]}>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (11 * 7 + i * 137.5) % 360;
            const r = 0.02 + (i * 0.013) % 0.15;
            const x = Math.cos((angle * Math.PI) / 180) * r;
            const z = Math.sin((angle * Math.PI) / 180) * r;
            return (
              <group key={i}>
                {i < 8 ? (
                  <mesh position={[x, 0, z]} rotation={[0, angle * 0.017, Math.PI / 2]}>
                    <capsuleGeometry args={[0.003, 0.02, 4, 8]} />
                    <meshStandardMaterial color={afbColor} emissive={afbColor} emissiveIntensity={0.3} />
                  </mesh>
                ) : (
                  <mesh position={[x * 1.3, 0, z * 1.3]}>
                    <sphereGeometry args={[0.006, 8, 8]} />
                    <meshStandardMaterial color={nonAfbColor || "#2563eb"} emissive={nonAfbColor || "#2563eb"} emissiveIntensity={0.2} />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      )}
      <Html position={[0, 0.1, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">
          🔬 Sputum Smear {isDropTarget && <span className="text-green-500 font-bold">— Drop Here!</span>}
          {heatFixAnimating && <span className="text-amber-500 font-bold animate-pulse"> 🔥 Heat Fixing...</span>}
        </div>
      </Html>
    </group>
    </group>
  );
}

function ReagentBottle({ color, label }: { color: string; label: string }) {
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.04, 0.05, 0.18]} /><meshPhysicalMaterial color={color} roughness={0.15} transparent opacity={0.9} /></mesh>
      <mesh position={[0, -0.02, 0]}><cylinderGeometry args={[0.035, 0.045, 0.12]} /><meshStandardMaterial color={color} transparent opacity={0.6} /></mesh>
      <mesh position={[0, 0.11, 0]} castShadow><cylinderGeometry args={[0.022, 0.028, 0.04]} /><meshStandardMaterial color="#1f2937" /></mesh>
      <Html position={[0, 0.22, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧪 {label}</div></Html>
    </group>
  );
}

function BunsenBurner({ isOn }: { isOn: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (flameRef.current && isOn) { flameRef.current.scale.y = 0.8 + Math.sin(Date.now() * 0.01) * 0.2; } });
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[0.12, 0.14, 0.06]} /><meshStandardMaterial color="#4a90d9" metalness={0.5} /></mesh>
      <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.04, 0.05, 0.35]} /><meshStandardMaterial color="#b0b0b0" metalness={0.7} /></mesh>
      {isOn && (
        <group position={[0, 0.42, 0]}>
          <mesh ref={flameRef}><coneGeometry args={[0.025, 0.12, 8]} /><meshBasicMaterial color="#4488ff" transparent opacity={0.9} /></mesh>
          <pointLight position={[0, 0.1, 0]} intensity={0.6} color="#ff9933" distance={1.5} />
        </group>
      )}
      <Html position={[0, 0.55, 0]} center><div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">🔥 Bunsen Burner</div></Html>
    </group>
  );
}

function LabScene({ step, stepCompleted, requiredItem, burnerOn, heatFixAnimating, onDropOnSlide, disabled }: any) {
  const orbitRef = useRef<any>(null);
  const currentStep = PROTOCOL_STEPS[step];
  const afbColor = stepCompleted ? currentStep.afbColor : (step > 0 ? PROTOCOL_STEPS[step - 1].afbColor : "transparent");
  const nonAfbColor = stepCompleted && step >= 7 ? "#2563eb" : (step >= 7 ? "#2563eb" : afbColor);

  const positions: Record<string, [number, number, number]> = {
    loop: [-0.5, 0.97, 0.9], burner: [-1.8, 0.96, 0], wash: [-1, 0.96, 0.8],
    paper: [0.8, 0.97, 0.9], microscope: [2.2, 0.96, -0.2],
    carbol_fuchsin: [1.2, 1.05, -0.9], acid_alcohol: [1.5, 1.05, -0.9], methylene_blue: [1.8, 1.05, -0.9],
  };

  return (
    <>
      <LabRoom /><WorkBench />
      <GlassSlide afbColor={afbColor} nonAfbColor={nonAfbColor} stepId={stepCompleted ? currentStep.id : (step > 0 ? PROTOCOL_STEPS[step - 1].id : 0)} isDropTarget={!stepCompleted && !disabled} heatFixAnimating={heatFixAnimating} />
      <DraggableObject homePosition={positions.loop} instrumentKey="loop" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <group><mesh rotation={[0, 0, 0.15]} castShadow><cylinderGeometry args={[0.006, 0.006, 0.22]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} /></mesh>
        <mesh position={[0.015, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.013, 0.002, 8, 16]} /><meshStandardMaterial color="#d4d4d4" metalness={0.9} /></mesh>
        <Html position={[0, 0.2, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🔁 Loop</div></Html></group>
      </DraggableObject>
      <DraggableObject homePosition={positions.burner} instrumentKey="burner" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <BunsenBurner isOn={burnerOn} />
      </DraggableObject>
      <DraggableObject homePosition={positions.wash} instrumentKey="wash" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <group><mesh castShadow><cylinderGeometry args={[0.055, 0.065, 0.2]} /><meshPhysicalMaterial color="#dbeafe" transparent opacity={0.7} /></mesh>
        <Html position={[0, 0.22, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">💧 Wash</div></Html></group>
      </DraggableObject>
      <DraggableObject homePosition={positions.paper} instrumentKey="paper" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <group><RoundedBox args={[0.15, 0.015, 0.2]} radius={0.003} castShadow><meshStandardMaterial color="#fef3c7" roughness={0.95} /></RoundedBox>
        <Html position={[0, 0.08, 0]} center><div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">📄 Paper</div></Html></group>
      </DraggableObject>
      <DraggableObject homePosition={positions.microscope} instrumentKey="microscope" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <group>
          <RoundedBox args={[0.5, 0.08, 0.4]} radius={0.02} castShadow><meshStandardMaterial color="#374151" metalness={0.5} /></RoundedBox>
          <mesh position={[-0.15, 0.4, -0.12]} castShadow><boxGeometry args={[0.08, 0.8, 0.08]} /><meshStandardMaterial color="#4b5563" metalness={0.5} /></mesh>
          <mesh position={[-0.15, 0.82, 0.05]} castShadow><boxGeometry args={[0.12, 0.08, 0.35]} /><meshStandardMaterial color="#374151" metalness={0.4} /></mesh>
          <mesh position={[-0.15, 0.92, -0.05]} castShadow><cylinderGeometry args={[0.03, 0.025, 0.15]} /><meshStandardMaterial color="#1f2937" metalness={0.7} /></mesh>
          <Html position={[0, 1.05, 0]} center><div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">🔬 Microscope</div></Html>
        </group>
      </DraggableObject>
      <DraggableObject homePosition={positions.carbol_fuchsin} instrumentKey="carbol_fuchsin" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottle color="#dc2626" label="Carbol Fuchsin" />
      </DraggableObject>
      <DraggableObject homePosition={positions.acid_alcohol} instrumentKey="acid_alcohol" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottle color="#e5e7eb" label="Acid-Alcohol" />
      </DraggableObject>
      <DraggableObject homePosition={positions.methylene_blue} instrumentKey="methylene_blue" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottle color="#2563eb" label="Methylene Blue" />
      </DraggableObject>
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls ref={orbitRef} makeDefault minDistance={2} maxDistance={8} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
    </>
  );
}

function MicroscopeView({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnification, setMagnification] = useState<"10x" | "40x" | "100x">("100x");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#e8f0ff"; ctx.fillRect(0, 0, w, h);
    // Blue background cells
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(50 + Math.random() * (w - 100), 50 + Math.random() * (h - 100), 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red AFB rods
    const rodCount = magnification === "100x" ? 12 : magnification === "40x" ? 6 : 2;
    for (let i = 0; i < rodCount; i++) {
      ctx.save();
      const x = 80 + Math.random() * (w - 160), y = 80 + Math.random() * (h - 160);
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(-10, -1.5, 20, 3);
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = "#222"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 5, 0, Math.PI * 2); ctx.stroke();
  }, [magnification]);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="bg-card rounded-2xl border shadow-xl p-6 max-w-lg w-full mx-4 space-y-4" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> ZN Stain — Acid-Fast Bacilli</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <canvas ref={canvasRef} width={350} height={350} className="mx-auto rounded-full" />
        <div className="flex items-center gap-2 justify-center">
          {(["10x", "40x", "100x"] as const).map(mag => (
            <button key={mag} onClick={() => setMagnification(mag)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${magnification === mag ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
              {mag} {mag === "100x" && "🫧 Oil"}
            </button>
          ))}
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm text-red-600">Acid-Fast Bacilli Detected (RED rods)</p>
          <p className="text-xs text-muted-foreground">Blue background = Non-AFB cells (methylene blue counterstain)</p>
          <p className="text-[10px] text-muted-foreground italic">Ref: WHO TB Microscopy Manual; IUATLD Grading Scale</p>
        </div>
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
      setRemaining(r => {
        if (r - 1 <= 0) { clearInterval(t); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); return 0; }
        if (r - 1 <= 5) try { playTickSound(); } catch {};
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);
  if (duration === 0) return null;
  const handleSkip = () => { setRemaining(0); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); };
  return (
    <div className="space-y-2 p-3 rounded-lg bg-card border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className={`h-4 w-4 ${running ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className="font-mono text-lg font-bold">{Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}</span>
        </div>
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

// ── Main Component ──
export function AcidFastStaining3D() {
  const [mode, setMode] = useState<GameMode>("learning");
  const [step, setStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [burnerOn, setBurnerOn] = useState(false);
  const [heatFixAnimating, setHeatFixAnimating] = useState(false);
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
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);
      if (key === "burner") { setBurnerOn(true); setHeatFixAnimating(true); sfx(playFlameSound); setTimeout(() => { setHeatFixAnimating(false); }, 2000); }
      else if (["carbol_fuchsin", "acid_alcohol", "methylene_blue"].includes(key)) sfx(() => playPourSound(1.5, 600));
      else if (key === "wash") sfx(() => playPourSound(1, 800));
      else if (key === "paper") sfx(playPaperSound);
      else if (key === "microscope") sfx(playFocusClickSound);
      else if (key === "loop") sfx(playGlassSound);
      else sfx(playSuccessSound);
      if (current.duration === 0) setTimerDone(true);
    } else {
      sfx(playErrorSound);
      setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      const label = INSTRUMENTS.find(i => i.key === key)?.label || key;
      setMentorMessage(mode === "learning" ? `❌ "${label}" is not correct. ${current.hint}` : `❌ Wrong instrument!`);
    }
  }, [step, stepCompleted, current, mode, sfx]);

  const goNext = () => {
    if (isLastStep) { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); return; }
    setStep(step + 1); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); if (step >= 2) setBurnerOn(false);
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setScore(s => ({ ...s, quizTotal: s.quizTotal + 1, quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0) }));
  };

  const reset = () => {
    setStep(0); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null);
    setMentorMessage(""); setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
    setGameFinished(false); setShowMicroscope(false); setBurnerOn(false); setHeatFixAnimating(false);
  };

  const finalScore = useMemo(() => {
    const stepPct = (score.correctSteps / PROTOCOL_STEPS.length) * 60;
    const quizPct = score.quizTotal > 0 ? (score.quizCorrect / score.quizTotal) * 30 : 30;
    const penaltyPct = Math.max(0, 10 - score.wrongSteps * 2);
    const total = Math.round(stepPct + quizPct + penaltyPct);
    const grade = total >= 90 ? "Excellent" : total >= 70 ? "Good" : total >= 50 ? "Needs Improvement" : "Retake Recommended";
    return { total, grade };
  }, [score]);

  if (gameFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-green-600" /> Acid-Fast Staining Complete!</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border"><p className="text-3xl font-bold text-primary">{finalScore.total}%</p><p className="text-xs text-muted-foreground">Score</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{finalScore.grade}</p><p className="text-xs text-muted-foreground">Grade</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{score.correctSteps}/{PROTOCOL_STEPS.length}</p><p className="text-xs text-muted-foreground">Correct Steps</p></div>
              <div className="text-center p-4 rounded-lg bg-muted border"><p className="text-xl font-bold">{Math.floor(score.totalTime / 60)}:{(score.totalTime % 60).toString().padStart(2, "0")}</p><p className="text-xs text-muted-foreground">Time</p></div>
            </div>
            <div className="p-4 rounded-lg bg-card border space-y-2">
              <p className="font-semibold text-sm text-red-600">🔬 Result: Acid-Fast Bacilli Detected</p>
              <p className="text-sm">Red rods = AFB (Mycobacterium tuberculosis) • Blue background = Non-AFB cells</p>
              <p className="text-[10px] text-muted-foreground italic">Validated References: WHO TB Lab Manual; Cappuccino & Welsh; CLSI M48-A</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1"><RotateCcw className="h-4 w-4 mr-1" /> Try Again</Button>
              <Button variant="outline" onClick={() => { reset(); setMode(mode === "learning" ? "exam" : "learning"); }} className="flex-1">Switch to {mode === "learning" ? "Exam" : "Learning"} Mode</Button>
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
          <h3 className="text-lg font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /> Acid-Fast Staining (Ziehl-Neelsen)</h3>
          <p className="text-xs text-muted-foreground">Drag instruments & reagents onto the slide. Orbit with right-click.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-md border bg-card hover:bg-muted transition-colors">
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => { setMode("learning"); reset(); }} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}><GraduationCap className="h-3.5 w-3.5" /> Learning</button>
            <button onClick={() => { setMode("exam"); reset(); }} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}><ClipboardCheck className="h-3.5 w-3.5" /> Exam</button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset</Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1} of {PROTOCOL_STEPS.length}</span><span className="font-medium">{current.name}</span></div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 3.5, 4.5], fov: 50 }} gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <LabScene step={step} stepCompleted={stepCompleted} requiredItem={current.requiredItem} burnerOn={burnerOn} heatFixAnimating={heatFixAnimating} onDropOnSlide={handleDropOnSlide} disabled={false} />
              </Suspense>
            </Canvas>
            <div className="absolute top-3 left-3 right-3">
              <div className={`p-3 rounded-lg backdrop-blur-md border text-sm ${current.id === 6 ? "bg-destructive/20 border-destructive/40 text-destructive" : "bg-card/80 border-border"}`}>
                {current.id === 6 && <AlertTriangle className="h-4 w-4 inline mr-1.5 animate-pulse" />}
                <span className="font-semibold">Step {current.id}:</span> {current.action}
              </div>
            </div>
            {stepCompleted && <div className="absolute bottom-3 left-3"><Badge className="bg-green-600 text-white shadow-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Step Applied!</Badge></div>}
          </div>
          {stepCompleted && current.duration > 0 && !timerDone && <StepTimer duration={current.duration} onComplete={() => setTimerDone(true)} />}
          {stepCompleted && current.quiz && (
            <motion.div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">
                {current.quiz.options.map((opt, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null}
                    className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${quizAnswer === null ? "hover:bg-muted border-border cursor-pointer" : i === current.quiz!.correct ? "bg-green-500/10 border-green-500/50" : i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "border-border opacity-40"}`}>
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
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Scientific Principle</p>
              <p className="text-sm">{current.principle}</p>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {current.reference}</p>
            </motion.div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" disabled={step === 0} onClick={() => { setStep(Math.max(0, step - 1)); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); }}>Previous</Button>
            <Button size="sm" disabled={!stepCompleted || (!timerDone && current.duration > 0)}
              onClick={isLastStep ? () => { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); } : goNext}>
              {isLastStep ? "Finish" : "Next Step"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {mode === "learning" && !stepCompleted && (
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs"><Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" /><span className="font-medium">Hint:</span> {current.hint}</div>
          )}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> AI Lab Mentor</CardTitle></CardHeader>
            <CardContent><AnimatePresence mode="wait">
              {mentorMessage ? <motion.p key={mentorMessage} className="text-xs leading-relaxed" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>{mentorMessage}</motion.p>
                : <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drag instruments to the sputum smear. I'll guide you!</motion.p>}
            </AnimatePresence></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">🧰 Instruments</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 gap-1.5">
              {INSTRUMENTS.map(inst => (
                <div key={inst.key} className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${inst.key === current.requiredItem && !stepCompleted ? "border-primary bg-primary/10 ring-1 ring-primary/30 font-semibold" : "border-border bg-card"} ${stepCompleted ? "opacity-50" : ""}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ backgroundColor: inst.color }} />{inst.label}
                  {inst.key === current.requiredItem && !stepCompleted && <span className="text-primary ml-auto">←</span>}
                </div>
              ))}
            </div></CardContent>
          </Card>
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground">📊 Score</p>
            <div className="flex justify-between"><span>Correct Steps</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div>
            <div className="flex justify-between"><span>Wrong Attempts</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div>
            <div className="flex justify-between"><span>Quiz</span><span className="font-mono font-bold">{score.quizCorrect}/{score.quizTotal}</span></div>
          </div>
          {isLastStep && stepCompleted && <Button variant="default" className="w-full gap-2" onClick={() => setShowMicroscope(true)}><Eye className="h-4 w-4" /> View Under Microscope</Button>}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5">
            <p className="font-semibold">📚 References</p>
            <p>• WHO TB Laboratory Biosafety Manual</p>
            <p>• Cappuccino & Welsh, Microbiology Lab Manual</p>
            <p>• CLSI M48-A, AFB Smear Microscopy</p>
            <p>• Cheesbrough, District Lab Practice</p>
          </div>
        </div>
      </div>
      <AnimatePresence>{showMicroscope && <MicroscopeView onClose={() => setShowMicroscope(false)} />}</AnimatePresence>
    </div>
  );
}
