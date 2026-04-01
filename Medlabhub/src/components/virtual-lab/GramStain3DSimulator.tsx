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

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type GameMode = "learning" | "exam";

interface ProtocolStep {
  id: number;
  name: string;
  action: string;
  requiredItem: string;
  duration: number;
  principle: string;
  gpColor: string;
  gnColor: string;
  gpLabel: string;
  gnLabel: string;
  hint: string;
  mentorTip: string;
  reference: string;
  quiz?: { question: string; correct: number; options: string[] };
}

// ──────────────────────────────────────────────
// Protocol Data (Cappuccino, Godkar, CLSI, WHO)
// ──────────────────────────────────────────────
const PROTOCOL_STEPS: ProtocolStep[] = [
  { id: 1, name: "Prepare Smear", action: "Drag the inoculating loop to the slide to spread a thin smear.", requiredItem: "loop", duration: 0, principle: "A thin, even smear ensures uniform staining and proper visualization (Cappuccino & Welsh, Microbiology Lab Manual, 12th Ed.).", gpColor: "transparent", gnColor: "transparent", gpLabel: "Unstained", gnLabel: "Unstained", hint: "Pick up the loop and drag it onto the slide.", mentorTip: "A good smear is the foundation of an accurate Gram stain!", reference: "Cappuccino & Welsh, Microbiology: A Laboratory Manual" },
  { id: 2, name: "Air Dry", action: "Allow the smear to air dry. Click Next when ready.", requiredItem: "auto", duration: 0, principle: "Air drying prevents washing away of the smear during staining (Godkar, Practical Microbiology).", gpColor: "transparent", gnColor: "transparent", gpLabel: "Dried", gnLabel: "Dried", hint: "The smear air dries naturally.", mentorTip: "Don't blow on the slide — it can contaminate with oral flora.", reference: "Godkar, Practical Microbiology" },
  { id: 3, name: "Heat Fix", action: "Drag the slide over the Bunsen burner flame to heat-fix.", requiredItem: "burner", duration: 0, principle: "Heat fixation kills bacteria, adheres them to the slide, and coagulates proteins (Bergey's Manual).", gpColor: "transparent", gnColor: "transparent", gpLabel: "Fixed", gnLabel: "Fixed", hint: "Drag the Bunsen burner to the slide.", mentorTip: "Pass gently 3 times — the slide should be warm, not hot. Smear side UP!", reference: "Bergey's Manual; WHO Lab Biosafety Manual" },
  { id: 4, name: "Crystal Violet (60s)", action: "Drag the Crystal Violet bottle to the slide. Wait 60 seconds.", requiredItem: "crystal_violet", duration: 60, principle: "Crystal violet (CV⁺) penetrates both GP and GN cell walls. ALL bacteria appear purple (Cappuccino).", gpColor: "#7c3aed", gnColor: "#7c3aed", gpLabel: "Purple (CV⁺)", gnLabel: "Purple (CV⁺)", hint: "Drag the purple reagent bottle to the slide.", mentorTip: "Ensure complete coverage. All cells take up CV equally.", reference: "Cappuccino & Welsh, Microbiology Lab Manual", quiz: { question: "After crystal violet, what color are Gram-negative bacteria?", correct: 0, options: ["Purple — same as Gram-positive", "Pink/Red", "Colorless", "Blue"] } },
  { id: 5, name: "Wash with Water", action: "Drag the wash bottle to the slide to gently rinse.", requiredItem: "wash", duration: 5, principle: "Rinsing removes excess crystal violet while preserving stain within cells.", gpColor: "#7c3aed", gnColor: "#7c3aed", gpLabel: "Purple (CV⁺)", gnLabel: "Purple (CV⁺)", hint: "Drag the blue wash bottle to the slide.", mentorTip: "Tilt the slide at 45° and use a gentle stream.", reference: "WHO Basic Lab Procedures, 2nd Ed." },
  { id: 6, name: "Gram's Iodine (60s)", action: "Drag the Iodine bottle to the slide. Wait 60 seconds.", requiredItem: "iodine", duration: 60, principle: "Iodine forms a crystal violet-iodine (CV–I) complex trapped in thick peptidoglycan of GP cells (Cappuccino).", gpColor: "#581c87", gnColor: "#581c87", gpLabel: "Purple (CV–I)", gnLabel: "Purple (CV–I)", hint: "Drag the brown iodine bottle to the slide.", mentorTip: "The mordant step is critical. Without it, CV washes out of ALL cells.", reference: "Cappuccino & Welsh; CLSI Laboratory Standards", quiz: { question: "What is the role of Gram's iodine?", correct: 2, options: ["Primary stain", "Decolorizer", "Mordant — forms CV–I complex", "Counterstain"] } },
  { id: 7, name: "Wash with Water", action: "Rinse gently to remove excess iodine.", requiredItem: "wash", duration: 5, principle: "Removes unbound iodine before the critical decolorization step.", gpColor: "#581c87", gnColor: "#581c87", gpLabel: "Purple (CV–I)", gnLabel: "Purple (CV–I)", hint: "Drag the wash bottle to the slide.", mentorTip: "Quick rinse — preparing for the most critical step.", reference: "Clinical Microbiology Procedures Handbook" },
  { id: 8, name: "Decolorize (10–20s)", action: "⚠️ CRITICAL! Drag the decolorizer to the slide. 10–20 seconds only!", requiredItem: "decolorizer", duration: 15, principle: "Decolorizer dissolves GN outer membrane; thin peptidoglycan can't retain CV–I → GN colorless. GP thick peptidoglycan traps CV–I → purple.", gpColor: "#7c3aed", gnColor: "transparent", gpLabel: "PURPLE (retained!)", gnLabel: "COLORLESS", hint: "Drag the decolorizer bottle carefully to the slide.", mentorTip: "⚠️ Too long = false negative. Too short = false positive. 10–20 seconds MAX!", reference: "Cappuccino & WHO Lab Manual", quiz: { question: "What happens if you over-decolorize?", correct: 1, options: ["GN appear GP", "GP lose CV–I (false negative)", "All cells green", "No effect"] } },
  { id: 9, name: "Wash Immediately", action: "Wash NOW to stop decolorization!", requiredItem: "wash", duration: 5, principle: "Stops decolorization instantly. Delay causes extended extraction.", gpColor: "#7c3aed", gnColor: "transparent", gpLabel: "Purple", gnLabel: "Colorless", hint: "Quick — wash immediately!", mentorTip: "Speed matters! Any delay extends decolorization.", reference: "WHO Basic Lab Procedures" },
  { id: 10, name: "Safranin (60s)", action: "Drag the Safranin bottle to the slide. Wait 60 seconds.", requiredItem: "safranin", duration: 60, principle: "Safranin counterstain: GN (colorless) absorb pink. GP (purple) unaffected — dark purple masks lighter pink.", gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "PURPLE (final)", gnLabel: "PINK (safranin)", hint: "Drag the red safranin bottle to the slide.", mentorTip: "This gives GN bacteria their characteristic pink color.", reference: "Clinical Microbiology Procedures Handbook", quiz: { question: "Why don't GP cells appear pink?", correct: 2, options: ["They repel safranin", "Safranin doesn't bind", "Deep purple CV–I masks pink", "Safranin evaporates"] } },
  { id: 11, name: "Final Wash", action: "Gently rinse with distilled water.", requiredItem: "wash", duration: 5, principle: "Removes excess safranin for a clean slide.", gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Purple", gnLabel: "Pink", hint: "Final wash.", mentorTip: "Almost done! Gentle rinse only.", reference: "Godkar, Practical Microbiology" },
  { id: 12, name: "Dry Slide", action: "Drag the bibulous paper to the slide — do NOT rub.", requiredItem: "paper", duration: 0, principle: "Gentle blotting removes water without disturbing the stained smear.", gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Purple (ready)", gnLabel: "Pink (ready)", hint: "Drag the paper onto the slide.", mentorTip: "Blot, don't rub! Rubbing destroys your smear.", reference: "Clinical Microbiology Procedures Handbook" },
  { id: 13, name: "Observe Microscope", action: "Drag the slide to the microscope to observe at 1000× oil immersion.", requiredItem: "microscope", duration: 0, principle: "Oil immersion eliminates air-glass interface, increasing resolution at 1000× (Bergey's Manual).", gpColor: "#7c3aed", gnColor: "#ec4899", gpLabel: "Gram-positive (Purple)", gnLabel: "Gram-negative (Pink)", hint: "Drag the slide to the microscope.", mentorTip: "Start at 10× to locate, then switch to 100× oil immersion.", reference: "Bergey's Manual of Systematic Bacteriology", quiz: { question: "Why is immersion oil necessary?", correct: 1, options: ["To stain bacteria", "To eliminate air-glass interface", "To preserve slide", "To magnify further"] } },
];

interface InstrumentDef {
  key: string;
  label: string;
  category: "tool" | "reagent";
  color: string;
  bottleColor?: string;
}

const INSTRUMENTS: InstrumentDef[] = [
  { key: "loop", label: "Inoculating Loop", category: "tool", color: "#c0c0c0" },
  { key: "burner", label: "Bunsen Burner", category: "tool", color: "#4a90d9" },
  { key: "wash", label: "Wash Bottle", category: "tool", color: "#93c5fd" },
  { key: "paper", label: "Bibulous Paper", category: "tool", color: "#fef3c7" },
  { key: "microscope", label: "Microscope", category: "tool", color: "#6b7280" },
  { key: "crystal_violet", label: "Crystal Violet", category: "reagent", color: "#7c3aed", bottleColor: "#7c3aed" },
  { key: "iodine", label: "Gram's Iodine", category: "reagent", color: "#92400e", bottleColor: "#b45309" },
  { key: "decolorizer", label: "Decolorizer", category: "reagent", color: "#d1d5db", bottleColor: "#e5e7eb" },
  { key: "safranin", label: "Safranin", category: "reagent", color: "#e11d48", bottleColor: "#f43f5e" },
];

const ORGANISMS = [
  { name: "Staphylococcus aureus", gram: "positive" as const, shape: "cocci" as const, arrangement: "clusters", desc: "Cocci in grape-like clusters" },
  { name: "Streptococcus pyogenes", gram: "positive" as const, shape: "cocci" as const, arrangement: "chains", desc: "Cocci in chains" },
  { name: "Escherichia coli", gram: "negative" as const, shape: "rods" as const, arrangement: "rods", desc: "Short rods" },
  { name: "Neisseria meningitidis", gram: "negative" as const, shape: "cocci" as const, arrangement: "diplococci", desc: "Kidney-bean diplococci" },
  { name: "Pseudomonas aeruginosa", gram: "negative" as const, shape: "rods" as const, arrangement: "rods", desc: "Slender rods" },
  { name: "Bacillus subtilis", gram: "positive" as const, shape: "rods" as const, arrangement: "rods", desc: "Large rods" },
];

// Slide center position on the bench
const SLIDE_POS: [number, number, number] = [0, 0.97, 0.2];
const DROP_RADIUS = 0.6; // how close you need to drag to "drop on slide"

// ──────────────────────────────────────────────
// Draggable wrapper for 3D objects
// ──────────────────────────────────────────────
function DraggableObject({
  children,
  homePosition,
  instrumentKey,
  onDropOnSlide,
  disabled,
  orbitRef,
}: {
  children: React.ReactNode;
  homePosition: [number, number, number];
  instrumentKey: string;
  onDropOnSlide: (key: string) => void;
  disabled: boolean;
  orbitRef: React.RefObject<any>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const planeY = useRef(homePosition[1]);
  const offset = useRef(new THREE.Vector3());
  const [pos, setPos] = useState<[number, number, number]>(homePosition);
  const [isOver, setIsOver] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -homePosition[1]));

  const getWorldPoint = useCallback((e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);
    const target = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, target);
    return target;
  }, [camera, gl]);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    isDragging.current = true;
    // Disable orbit while dragging
    if (orbitRef.current) orbitRef.current.enabled = false;
    gl.domElement.style.cursor = "grabbing";
    try { playPickupSound(); } catch {}

    const worldPt = getWorldPoint(e.nativeEvent);
    offset.current.set(pos[0] - worldPt.x, 0, pos[2] - worldPt.z);

    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const pt = getWorldPoint(ev);
      const nx = pt.x + offset.current.x;
      const nz = pt.z + offset.current.z;
      // Lift slightly when dragging
      setPos([nx, homePosition[1] + 0.15, nz]);
    };

    const onUp = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      gl.domElement.style.cursor = "auto";
      if (orbitRef.current) orbitRef.current.enabled = true;

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      // Check if dropped near slide
      const pt = getWorldPoint(ev);
      const fx = pt.x + offset.current.x;
      const fz = pt.z + offset.current.z;
      const dx = fx - SLIDE_POS[0];
      const dz = fz - SLIDE_POS[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < DROP_RADIUS) {
        onDropOnSlide(instrumentKey);
      } else {
        try { playDropSound(); } catch {}
      }

      // Animate back home
      setPos(homePosition);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [disabled, getWorldPoint, gl, homePosition, instrumentKey, onDropOnSlide, orbitRef, pos]);

  return (
    <group
      ref={groupRef}
      position={pos}
      onPointerDown={onPointerDown}
      onPointerOver={() => { if (!disabled) { setIsOver(true); gl.domElement.style.cursor = "grab"; } }}
      onPointerOut={() => { setIsOver(false); if (!isDragging.current) gl.domElement.style.cursor = "auto"; }}
    >
      {children}
      {/* Highlight ring when hovering */}
      {isOver && !disabled && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ──────────────────────────────────────────────
// 3D Lab Environment — Realistic Colors
// ──────────────────────────────────────────────

function LabRoom() {
  return (
    <group>
      {/* Floor — light tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#e8e4de" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#f5f0eb" />
      </mesh>
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-7, 2.5, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f0ebe5" />
      </mesh>
      {/* Ceiling light panels */}
      <mesh position={[0, 4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 1.5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* IMPROVED LIGHTING — bright and clear */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
      <spotLight position={[0, 5, 0]} intensity={0.9} angle={0.6} penumbra={0.3} castShadow />
      <pointLight position={[-2, 3, 2]} intensity={0.4} color="#fff8e7" />
    </group>
  );
}

function WorkBench() {
  return (
    <group position={[0, 0, 0]}>
      {/* Table top — LIGHT GREY (not dark) */}
      <RoundedBox args={[6, 0.12, 3]} position={[0, 0.9, 0]} radius={0.02} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} metalness={0.05} />
      </RoundedBox>
      {/* Table edge trim */}
      <mesh position={[0, 0.84, 1.5]}>
        <boxGeometry args={[6, 0.02, 0.02]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.3} />
      </mesh>
      {/* Legs — silver/chrome */}
      {[[-2.8, 0.42, -1.3], [2.8, 0.42, -1.3], [-2.8, 0.42, 1.3], [2.8, 0.42, 1.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.84]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Glass Slide (drop target — glows when item nearby)
function GlassSlide({ gpColor, gnColor, organism, stepId, isDropTarget, heatFixAnimating }: {
  gpColor: string; gnColor: string; organism: typeof ORGANISMS[0];
  stepId: number; isDropTarget: boolean; heatFixAnimating?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(0);

  useFrame((_, delta) => {
    if (meshRef.current && isDropTarget) {
      meshRef.current.position.y = SLIDE_POS[1] + Math.sin(Date.now() * 0.003) * 0.008;
    }
    if (groupRef.current) {
      if (heatFixAnimating) {
        animProgress.current = Math.min(1, animProgress.current + delta * 0.8);
        const t = animProgress.current;
        const liftY = t < 0.4 ? (t / 0.4) * 0.45 : t > 0.7 ? ((1 - t) / 0.3) * 0.45 : 0.45;
        const slideX = t < 0.4 ? (t / 0.4) * -1.2 : t > 0.7 ? ((1 - t) / 0.3) * -1.2 : -1.2;
        groupRef.current.position.set(slideX, liftY, 0);
      } else {
        animProgress.current = 0;
        groupRef.current.position.set(0, 0, 0);
      }
    }
  });

  const isGP = organism.gram === "positive";
  const cellColor = isGP ? gpColor : gnColor;
  const showCells = stepId >= 1;

  return (
    <group ref={groupRef}>
    <group position={SLIDE_POS}>
      {/* Drop zone indicator */}
      {isDropTarget && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.3 + Math.sin(Date.now() * 0.004) * 0.15} />
        </mesh>
      )}
      {/* Slide glass — transparent blue-white */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.2, 0.025, 0.45]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0}
          transmission={0.3}
        />
      </mesh>
      {/* Frosted label area */}
      <mesh position={[-0.4, 0.015, 0]}>
        <boxGeometry args={[0.3, 0.003, 0.42]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.9} />
      </mesh>
      {/* Bacteria cells */}
      {showCells && cellColor !== "transparent" && (
        <group position={[0.15, 0.02, 0]}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (organism.name.length * 7 + i * 137.5) % 360;
            const r = 0.02 + (i * 0.013) % 0.15;
            const x = Math.cos((angle * Math.PI) / 180) * r;
            const z = Math.sin((angle * Math.PI) / 180) * r;
            return organism.shape === "cocci" ? (
              <mesh key={i} position={[x, 0, z]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial color={cellColor} emissive={cellColor} emissiveIntensity={0.3} />
              </mesh>
            ) : (
              <mesh key={i} position={[x, 0, z]} rotation={[0, angle * 0.017, Math.PI / 2]}>
                <capsuleGeometry args={[0.005, 0.015, 4, 8]} />
                <meshStandardMaterial color={cellColor} emissive={cellColor} emissiveIntensity={0.3} />
              </mesh>
            );
          })}
        </group>
      )}
      {/* Stain liquid layer */}
      {stepId >= 4 && cellColor !== "transparent" && (
        <mesh position={[0.15, 0.016, 0]}>
          <boxGeometry args={[0.5, 0.003, 0.3]} />
          <meshStandardMaterial color={cellColor} transparent opacity={0.15} />
        </mesh>
      )}
      <Html position={[0, 0.1, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">
          🔬 Glass Slide {isDropTarget && <span className="text-green-500 font-bold">— Drop Here!</span>}
          {heatFixAnimating && <span className="text-amber-500 font-bold animate-pulse"> 🔥 Heat Fixing...</span>}
        </div>
      </Html>
    </group>
    </group>
  );
}

// Staining Tray (visual only)
function StainingTray() {
  return (
    <group position={[0, 0.92, 0.2]}>
      <RoundedBox args={[1.6, 0.04, 0.7]} radius={0.01} receiveShadow>
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} metalness={0.1} />
      </RoundedBox>
      {/* Rails */}
      {[-0.33, 0.33].map((z, i) => (
        <mesh key={i} position={[0, 0.025, z]}>
          <boxGeometry args={[1.5, 0.01, 0.02]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Petri Dish with bacteria
function PetriDish() {
  return (
    <group position={[-2, 0.97, -0.6]}>
      {/* Bottom dish */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.025]} />
        <meshPhysicalMaterial color="#f0f0f0" transparent opacity={0.7} roughness={0.1} transmission={0.2} />
      </mesh>
      {/* Agar */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.008]} />
        <meshStandardMaterial color="#f5e6a8" roughness={0.8} />
      </mesh>
      {/* Colonies */}
      {[[-0.06, 0.02, 0.04], [0.05, 0.02, -0.03], [0, 0.02, 0.08], [-0.08, 0.02, -0.06], [0.07, 0.02, 0.06]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
        </mesh>
      ))}
      {/* Lid */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.01]} />
        <meshPhysicalMaterial color="#f8f8f8" transparent opacity={0.4} roughness={0.05} transmission={0.4} />
      </mesh>
      <Html position={[0, 0.12, 0]} center>
        <div className="text-[8px] text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧫 Petri Dish</div>
      </Html>
    </group>
  );
}

// Slide Rack
function SlideRack() {
  return (
    <group position={[1.8, 0.96, 0.8]}>
      <RoundedBox args={[0.5, 0.06, 0.2]} radius={0.005} castShadow>
        <meshStandardMaterial color="#a3a3a3" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.18 + i * 0.09, 0.04, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.15]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} />
        </mesh>
      ))}
      <Html position={[0, 0.12, 0]} center>
        <div className="text-[8px] text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">Slide Rack</div>
      </Html>
    </group>
  );
}

// 3D Microscope — light grey + black
function MicroscopeModel({ homePosition }: { homePosition: [number, number, number] }) {
  return (
    <group>
      {/* Base */}
      <RoundedBox args={[0.5, 0.08, 0.4]} position={[0, 0, 0]} radius={0.02} castShadow>
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      {/* Arm */}
      <mesh position={[-0.15, 0.4, -0.12]} castShadow>
        <boxGeometry args={[0.08, 0.8, 0.08]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[-0.15, 0.82, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.35]} />
        <meshStandardMaterial color="#374151" metalness={0.4} />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[-0.15, 0.92, -0.05]} castShadow>
        <cylinderGeometry args={[0.03, 0.025, 0.15]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} />
      </mesh>
      {/* Objective turret */}
      <mesh position={[-0.15, 0.76, 0.12]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} />
      </mesh>
      {/* Objectives — colored rings */}
      {[0, 1.2, 2.4, 3.6].map((angle, i) => (
        <mesh key={i} position={[-0.15 + Math.sin(angle) * 0.04, 0.72, 0.12 + Math.cos(angle) * 0.04]} castShadow>
          <cylinderGeometry args={[0.012, 0.01, 0.06 + i * 0.015]} />
          <meshStandardMaterial color={["#eab308", "#22c55e", "#3b82f6", "#f8fafc"][i]} metalness={0.5} />
        </mesh>
      ))}
      {/* Stage */}
      <mesh position={[-0.02, 0.25, 0.08]} castShadow>
        <boxGeometry args={[0.35, 0.03, 0.35]} />
        <meshStandardMaterial color="#374151" metalness={0.3} />
      </mesh>
      {/* Stage clips */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[-0.02 + x, 0.27, 0.08]}>
          <boxGeometry args={[0.04, 0.01, 0.12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
      ))}
      {/* Focus knobs — silver */}
      {[0.15, 0.3].map((y, i) => (
        <mesh key={i} position={[0.12, y, -0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035 - i * 0.008, 0.035 - i * 0.008, 0.04]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Light source */}
      <pointLight position={[-0.02, 0.15, 0.08]} intensity={0.3} color="#fffde8" distance={0.5} />
      <Html position={[0, 1.05, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">🔬 Microscope</div>
      </Html>
    </group>
  );
}

// Bunsen Burner — blue + silver
function BunsenBurnerModel({ isOn }: { isOn: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (flameRef.current && isOn) {
      flameRef.current.scale.y = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
      flameRef.current.scale.x = 0.9 + Math.sin(Date.now() * 0.013) * 0.1;
    }
  });

  return (
    <group>
      {/* Base — blue */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.06]} />
        <meshStandardMaterial color="#4a90d9" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Barrel — silver */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.35]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Air intake collar */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.04]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} />
      </mesh>
      {/* Gas tube */}
      <mesh position={[0.12, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} />
      </mesh>
      {/* Gas knob */}
      <mesh position={[0.22, 0.02, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Flame */}
      {isOn && (
        <group position={[0, 0.42, 0]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.025, 0.12, 8]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.04, 0]} scale={[1.3, 1.2, 1.3]}>
            <coneGeometry args={[0.03, 0.15, 8]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0.5} />
          </mesh>
          <pointLight position={[0, 0.1, 0]} intensity={0.6} color="#ff9933" distance={1.5} />
        </group>
      )}
      <Html position={[0, 0.55, 0]} center>
        <div className="text-[9px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1.5 py-0.5 rounded border whitespace-nowrap">🔥 Bunsen Burner</div>
      </Html>
    </group>
  );
}

// Reagent Bottle model
function ReagentBottleModel({ color, label }: { color: string; label: string }) {
  return (
    <group>
      {/* Bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.18]} />
        <meshPhysicalMaterial color={color} roughness={0.15} metalness={0} transmission={0.15} transparent opacity={0.9} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.12]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.028, 0.04]} />
        <meshStandardMaterial color="#1f2937" roughness={0.3} />
      </mesh>
      {/* Dropper tip */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.004, 0.012, 0.025]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      {/* White label */}
      <mesh position={[0, -0.01, 0.052]}>
        <planeGeometry args={[0.07, 0.05]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <Html position={[0, 0.22, 0]} center>
        <div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🧪 {label}</div>
      </Html>
    </group>
  );
}

// Wash Bottle model
function WashBottleModel() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.2]} />
        <meshPhysicalMaterial color="#dbeafe" transparent opacity={0.7} roughness={0.1} transmission={0.25} />
      </mesh>
      {/* Water inside */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.14]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} />
      </mesh>
      {/* Spout tube */}
      <mesh position={[0.04, 0.12, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.006, 0.006, 0.1]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Html position={[0, 0.22, 0]} center>
        <div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">💧 Wash Bottle</div>
      </Html>
    </group>
  );
}

// Inoculating Loop model
function InoculatingLoopModel() {
  return (
    <group>
      <mesh rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.22]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.015, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.013, 0.002, 8, 16]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.9} />
      </mesh>
      <Html position={[0, 0.2, 0]} center>
        <div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">🔁 Loop</div>
      </Html>
    </group>
  );
}

// Bibulous Paper model
function BibulousPaperModel() {
  return (
    <group>
      <RoundedBox args={[0.15, 0.015, 0.2]} radius={0.003} castShadow>
        <meshStandardMaterial color="#fef3c7" roughness={0.95} />
      </RoundedBox>
      <Html position={[0, 0.08, 0]} center>
        <div className="text-[8px] font-medium text-muted-foreground bg-card/70 backdrop-blur px-1 py-0.5 rounded border whitespace-nowrap">📄 Paper</div>
      </Html>
    </group>
  );
}

// Waste Container
function WasteContainer() {
  return (
    <group position={[-2.5, 0.5, 1]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.45]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <torusGeometry args={[0.15, 0.01, 8, 16]} />
        <meshStandardMaterial color="#991b1b" metalness={0.5} />
      </mesh>
      <Html position={[0, 0.35, 0]} center>
        <div className="text-[8px] text-destructive font-bold">⚠️ BIOHAZARD</div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────
// Realistic Liquid Pouring Physics
// ──────────────────────────────────────────────
const POUR_PARTICLE_COUNT = 60;
const SPLASH_PARTICLE_COUNT = 20;

function LiquidPourEffect({ active, color, pourOrigin }: { active: boolean; color: string; pourOrigin?: [number, number, number] }) {
  const pourRef = useRef<THREE.Points>(null);
  const splashRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(POUR_PARTICLE_COUNT * 3));
  const splashVel = useRef<Float32Array>(new Float32Array(SPLASH_PARTICLE_COUNT * 3));
  const ages = useRef<Float32Array>(new Float32Array(POUR_PARTICLE_COUNT));
  const splashAges = useRef<Float32Array>(new Float32Array(SPLASH_PARTICLE_COUNT));

  const origin = pourOrigin || [SLIDE_POS[0], SLIDE_POS[1] + 0.5, SLIDE_POS[2]];

  // Pouring stream positions
  const pourPositions = useMemo(() => {
    const arr = new Float32Array(POUR_PARTICLE_COUNT * 3);
    for (let i = 0; i < POUR_PARTICLE_COUNT; i++) {
      arr[i * 3] = origin[0] + (Math.random() - 0.5) * 0.02;
      arr[i * 3 + 1] = origin[1] - Math.random() * 0.4;
      arr[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * 0.02;
      velocities.current[i * 3] = (Math.random() - 0.5) * 0.001;
      velocities.current[i * 3 + 1] = -0.003 - Math.random() * 0.004; // gravity
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      ages.current[i] = Math.random();
    }
    return arr;
  }, []);

  // Splash positions
  const splashPositions = useMemo(() => {
    const arr = new Float32Array(SPLASH_PARTICLE_COUNT * 3);
    for (let i = 0; i < SPLASH_PARTICLE_COUNT; i++) {
      arr[i * 3] = SLIDE_POS[0] + (Math.random() - 0.5) * 0.15;
      arr[i * 3 + 1] = SLIDE_POS[1] + 0.01;
      arr[i * 3 + 2] = SLIDE_POS[2] + (Math.random() - 0.5) * 0.08;
      splashVel.current[i * 3] = (Math.random() - 0.5) * 0.008;
      splashVel.current[i * 3 + 1] = 0.002 + Math.random() * 0.006;
      splashVel.current[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
      splashAges.current[i] = Math.random();
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!active) return;
    const clampDelta = Math.min(delta, 0.05);

    // Update pour stream
    if (pourRef.current) {
      const pos = pourRef.current.geometry.attributes.position;
      const arr = (pos as any).array;
      for (let i = 0; i < POUR_PARTICLE_COUNT; i++) {
        ages.current[i] += clampDelta * 2;

        // Apply velocity + gravity
        velocities.current[i * 3 + 1] -= 0.0003; // gravity acceleration
        arr[i * 3] += velocities.current[i * 3];
        arr[i * 3 + 1] += velocities.current[i * 3 + 1];
        arr[i * 3 + 2] += velocities.current[i * 3 + 2];

        // Reset when hits slide level or too old
        if (arr[i * 3 + 1] < SLIDE_POS[1] || ages.current[i] > 1) {
          arr[i * 3] = origin[0] + (Math.random() - 0.5) * 0.02;
          arr[i * 3 + 1] = origin[1];
          arr[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * 0.02;
          velocities.current[i * 3] = (Math.random() - 0.5) * 0.001;
          velocities.current[i * 3 + 1] = -0.003 - Math.random() * 0.004;
          velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
          ages.current[i] = 0;
        }
      }
      pos.needsUpdate = true;
    }

    // Update splash particles
    if (splashRef.current) {
      const pos = splashRef.current.geometry.attributes.position;
      const arr = (pos as any).array;
      for (let i = 0; i < SPLASH_PARTICLE_COUNT; i++) {
        splashAges.current[i] += clampDelta * 3;

        splashVel.current[i * 3 + 1] -= 0.0004; // gravity
        arr[i * 3] += splashVel.current[i * 3];
        arr[i * 3 + 1] += splashVel.current[i * 3 + 1];
        arr[i * 3 + 2] += splashVel.current[i * 3 + 2];

        // Reset splash
        if (arr[i * 3 + 1] < SLIDE_POS[1] - 0.02 || splashAges.current[i] > 1) {
          arr[i * 3] = SLIDE_POS[0] + (Math.random() - 0.5) * 0.15;
          arr[i * 3 + 1] = SLIDE_POS[1] + 0.01;
          arr[i * 3 + 2] = SLIDE_POS[2] + (Math.random() - 0.5) * 0.08;
          splashVel.current[i * 3] = (Math.random() - 0.5) * 0.008;
          splashVel.current[i * 3 + 1] = 0.002 + Math.random() * 0.006;
          splashVel.current[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
          splashAges.current[i] = 0;
        }
      }
      pos.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Pouring stream */}
      <points ref={pourRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pourPositions, 3]} count={POUR_PARTICLE_COUNT} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.015} transparent opacity={0.8} sizeAttenuation />
      </points>
      {/* Splash on slide */}
      <points ref={splashRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[splashPositions, 3]} count={SPLASH_PARTICLE_COUNT} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.008} transparent opacity={0.5} sizeAttenuation />
      </points>
      {/* Liquid puddle on slide (growing) */}
      <mesh position={[SLIDE_POS[0] + 0.1, SLIDE_POS[1] + 0.015, SLIDE_POS[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────
// Reagent Rack (visual holder)
// ──────────────────────────────────────────────
function ReagentRackHolder() {
  return (
    <group position={[1.5, 0.96, -0.9]}>
      {/* Rack base — wooden */}
      <RoundedBox args={[1.1, 0.05, 0.22]} radius={0.01} castShadow>
        <meshStandardMaterial color="#a0845e" roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.06, -0.09]}>
        <boxGeometry args={[1.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#8B7355" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────
// Full Lab Scene with draggable instruments
// ──────────────────────────────────────────────
function LabScene({
  step, stepCompleted, organism, requiredItem, burnerOn, heatFixAnimating,
  onDropOnSlide, particleColor, showParticles, disabled
}: {
  step: number; stepCompleted: boolean; organism: typeof ORGANISMS[0];
  requiredItem: string; burnerOn: boolean; heatFixAnimating: boolean; onDropOnSlide: (key: string) => void;
  particleColor: string; showParticles: boolean; disabled: boolean;
}) {
  const orbitRef = useRef<any>(null);
  const currentStep = PROTOCOL_STEPS[step];
  const gpColor = stepCompleted ? currentStep.gpColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gpColor : "transparent");
  const gnColor = stepCompleted ? currentStep.gnColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gnColor : "transparent");

  // Instrument home positions
  const positions = {
    loop: [-0.5, 0.97, 0.9] as [number, number, number],
    burner: [-1.8, 0.96, 0] as [number, number, number],
    wash: [-1, 0.96, 0.8] as [number, number, number],
    paper: [0.8, 0.97, 0.9] as [number, number, number],
    microscope: [2.2, 0.96, -0.2] as [number, number, number],
    crystal_violet: [1.2, 1.05, -0.9] as [number, number, number],
    iodine: [1.5, 1.05, -0.9] as [number, number, number],
    decolorizer: [1.8, 1.05, -0.9] as [number, number, number],
    safranin: [2.1, 1.05, -0.9] as [number, number, number],
  };

  return (
    <>
      <LabRoom />
      <WorkBench />
      <StainingTray />
      <PetriDish />
      <SlideRack />
      <WasteContainer />
      <ReagentRackHolder />

      <GlassSlide
        gpColor={gpColor}
        gnColor={gnColor}
        organism={organism}
        stepId={stepCompleted ? currentStep.id : (step > 0 ? PROTOCOL_STEPS[step - 1].id : 0)}
        isDropTarget={!stepCompleted && !disabled}
        heatFixAnimating={heatFixAnimating}
      />

      {/* Draggable Inoculating Loop */}
      <DraggableObject homePosition={positions.loop} instrumentKey="loop" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <InoculatingLoopModel />
      </DraggableObject>

      {/* Draggable Bunsen Burner */}
      <DraggableObject homePosition={positions.burner} instrumentKey="burner" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <BunsenBurnerModel isOn={burnerOn} />
      </DraggableObject>

      {/* Draggable Wash Bottle */}
      <DraggableObject homePosition={positions.wash} instrumentKey="wash" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <WashBottleModel />
      </DraggableObject>

      {/* Draggable Bibulous Paper */}
      <DraggableObject homePosition={positions.paper} instrumentKey="paper" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <BibulousPaperModel />
      </DraggableObject>

      {/* Draggable Microscope */}
      <DraggableObject homePosition={positions.microscope} instrumentKey="microscope" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <MicroscopeModel homePosition={positions.microscope} />
      </DraggableObject>

      {/* Draggable Reagent Bottles */}
      <DraggableObject homePosition={positions.crystal_violet} instrumentKey="crystal_violet" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottleModel color="#7c3aed" label="Crystal Violet" />
      </DraggableObject>
      <DraggableObject homePosition={positions.iodine} instrumentKey="iodine" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottleModel color="#b45309" label="Gram's Iodine" />
      </DraggableObject>
      <DraggableObject homePosition={positions.decolorizer} instrumentKey="decolorizer" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottleModel color="#e5e7eb" label="Decolorizer" />
      </DraggableObject>
      <DraggableObject homePosition={positions.safranin} instrumentKey="safranin" onDropOnSlide={onDropOnSlide} disabled={disabled || stepCompleted} orbitRef={orbitRef}>
        <ReagentBottleModel color="#f43f5e" label="Safranin" />
      </DraggableObject>

      <LiquidPourEffect active={showParticles} color={particleColor} />
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={12} blur={2} />
      <OrbitControls
        ref={orbitRef}
        makeDefault
        minDistance={2}
        maxDistance={8}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
    </>
  );
}

// ──────────────────────────────────────────────
// Microscope View (2D overlay)
// ──────────────────────────────────────────────
function MicroscopeView3D({ organism, onClose }: { organism: typeof ORGANISMS[0]; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnification, setMagnification] = useState<"10x" | "40x" | "100x">("10x");
  const [focusLevel, setFocusLevel] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#faf8f0";
    ctx.fillRect(0, 0, w, h);

    const blurAmount = Math.abs(focusLevel - 5) * 0.5;
    if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;

    const cellColor = organism.gram === "positive" ? "#7c3aed" : "#ec4899";
    const cellCount = magnification === "10x" ? 15 : magnification === "40x" ? 25 : 40;
    const cellSize = magnification === "10x" ? 2 : magnification === "40x" ? 4 : 7;

    const seed = organism.name.length;
    for (let i = 0; i < cellCount; i++) {
      const angle = (seed * 7 + i * 137.5) % 360;
      const r = 15 + (i * 17 % (w / 3));
      const x = w / 2 + Math.cos(angle * Math.PI / 180) * r;
      const y = h / 2 + Math.sin(angle * Math.PI / 180) * r;

      ctx.fillStyle = cellColor;
      ctx.beginPath();

      if (organism.shape === "cocci") {
        if (organism.arrangement === "clusters") {
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(x + j * cellSize * 1.5 - cellSize, y + (j % 2) * cellSize - cellSize / 2, cellSize, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (organism.arrangement === "chains") {
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(x + j * cellSize * 2.2, y, cellSize, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.arc(x - cellSize, y, cellSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + cellSize, y, cellSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.ellipse(0, 0, cellSize * 2.5, cellSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.filter = "none";

    // Crosshair
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.restore();

    // Border ring
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 5, 0, Math.PI * 2);
    ctx.stroke();
  }, [organism, magnification, focusLevel]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-2xl border shadow-xl p-6 max-w-lg w-full mx-4 space-y-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            Microscope View — {organism.name}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <canvas ref={canvasRef} width={350} height={350} className="mx-auto rounded-full" />

        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-muted-foreground">Objective:</span>
          {(["10x", "40x", "100x"] as const).map(mag => (
            <button key={mag} onClick={() => setMagnification(mag)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${magnification === mag ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
              {mag} {mag === "100x" && "🫧 Oil"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Focus:</span>
          <input type="range" min={0} max={10} value={focusLevel} onChange={e => setFocusLevel(Number(e.target.value))} className="flex-1 h-2 accent-primary" />
          <span className="text-xs font-mono">{focusLevel}</span>
        </div>

        <div className="text-center space-y-1">
          <p className="font-semibold text-sm" style={{ color: organism.gram === "positive" ? "#7c3aed" : "#ec4899" }}>
            {organism.gram === "positive" ? "Gram-positive (Purple)" : "Gram-negative (Pink)"}
          </p>
          <p className="text-xs text-muted-foreground italic">{organism.name} — {organism.desc}</p>
          <p className="text-[10px] text-muted-foreground">Ref: Bergey's Manual of Systematic Bacteriology</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Timer
// ──────────────────────────────────────────────
function StepTimer({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setRemaining(duration); setRunning(false); setDone(false); }, [duration]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(r => {
        if (r - 1 <= 0) {
          clearInterval(t);
          setRunning(false);
          setDone(true);
          try { playTimerCompleteSound(); } catch {}
          onComplete();
          return 0;
        }
        if (r - 1 <= 5) try { playTickSound(); } catch {}
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);

  if (duration === 0) return null;

  const pct = ((duration - remaining) / duration) * 100;
  const handleSkip = () => { setRemaining(0); setRunning(false); setDone(true); try { playTimerCompleteSound(); } catch {} onComplete(); };
  return (
    <div className="space-y-2 p-3 rounded-lg bg-card border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className={`h-4 w-4 ${running ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className="font-mono text-lg font-bold">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </span>
        </div>
        {!done ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>
              {running ? "Pause" : "Start Timer"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">⏭ Skip</Button>
          </div>
        ) : (
          <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" /> Complete</Badge>
        )}
      </div>
      <Progress value={pct} className="h-2" />
      {running && remaining <= 5 && <p className="text-xs text-destructive font-medium animate-pulse">⏰ Almost done!</p>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Simulator
// ──────────────────────────────────────────────
export function GramStain3DSimulator() {
  const [mode, setMode] = useState<GameMode>("learning");
  const [step, setStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [selectedOrganism, setSelectedOrganism] = useState(0);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [burnerOn, setBurnerOn] = useState(false);
  const [heatFixAnimating, setHeatFixAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleColor, setParticleColor] = useState("#7c3aed");
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
  const [gameFinished, setGameFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sfx = useCallback((fn: () => void) => {
    if (soundEnabled) try { fn(); } catch {}
  }, [soundEnabled]);

  const current = PROTOCOL_STEPS[step];
  const organism = ORGANISMS[selectedOrganism];
  const isLastStep = step === PROTOCOL_STEPS.length - 1;

  // Auto-complete "Air Dry" step
  useEffect(() => {
    if (current.requiredItem === "auto" && !stepCompleted) {
      const t = setTimeout(() => {
        setStepCompleted(true);
        setTimerDone(true);
        setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
        setMentorMessage(current.mentorTip);
        sfx(playSuccessSound);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step, current, stepCompleted, sfx]);

  const handleDropOnSlide = useCallback((key: string) => {
    if (stepCompleted) return;

    if (key === current.requiredItem) {
      setStepCompleted(true);
      setScore(s => ({ ...s, correctSteps: s.correctSteps + 1 }));
      setMentorMessage(current.mentorTip);

      // Sound effects based on instrument
      if (key === "burner") { setBurnerOn(true); setHeatFixAnimating(true); sfx(playFlameSound); setTimeout(() => setHeatFixAnimating(false), 2000); }
      else if (["crystal_violet", "iodine", "safranin"].includes(key)) {
        sfx(() => playPourSound(1.5, key === "iodine" ? 500 : 650));
        const colors: Record<string, string> = { crystal_violet: "#7c3aed", iodine: "#b45309", safranin: "#f43f5e" };
        setParticleColor(colors[key] || "#3b82f6");
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2500);
      } else if (key === "wash") {
        sfx(() => playPourSound(1, 800));
        setParticleColor("#60a5fa");
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1500);
      } else if (key === "decolorizer") {
        sfx(() => playPourSound(0.8, 700));
        setParticleColor("#e5e7eb");
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1500);
      } else if (key === "paper") {
        sfx(playPaperSound);
      } else if (key === "microscope") {
        sfx(playFocusClickSound);
      } else if (key === "loop") {
        sfx(playGlassSound);
      } else {
        sfx(playSuccessSound);
      }

      if (current.duration === 0) setTimerDone(true);
    } else {
      sfx(playErrorSound);
      setScore(s => ({ ...s, wrongSteps: s.wrongSteps + 1 }));
      const label = INSTRUMENTS.find(i => i.key === key)?.label || key;
      setMentorMessage(mode === "learning"
        ? `❌ "${label}" is not correct for this step. ${current.hint}`
        : `❌ Wrong instrument. Protocol error! Score reduced.`
      );
    }
  }, [step, stepCompleted, current, mode, sfx]);

  const goNext = () => {
    if (isLastStep) {
      setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) }));
      sfx(playCompletionFanfare);
      setGameFinished(true);
      return;
    }
    setStep(step + 1);
    setStepCompleted(false);
    setTimerDone(false);
    setQuizAnswer(null);
    setMentorMessage("");
    setShowParticles(false);
    if (step >= 2) setBurnerOn(false);
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setScore(s => ({
      ...s,
      quizTotal: s.quizTotal + 1,
      quizCorrect: s.quizCorrect + (idx === current.quiz!.correct ? 1 : 0),
    }));
  };

  const reset = () => {
    setStep(0); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null);
    setMentorMessage(""); setScore({ correctSteps: 0, wrongSteps: 0, quizCorrect: 0, quizTotal: 0, totalTime: 0 });
    setGameFinished(false); setShowMicroscope(false); setBurnerOn(false); setShowParticles(false);
  };

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
              <CheckCircle2 className="h-6 w-6 text-green-600" /> 3D Gram Staining Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border">
                <p className="text-3xl font-bold text-primary">{finalScore.total}%</p>
                <p className="text-xs text-muted-foreground mt-1">Score</p>
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
                <p className="text-xs text-muted-foreground mt-1">Time</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-card border space-y-2">
              <p className="font-semibold text-sm">🔬 Result: <em>{organism.name}</em></p>
              <p className="text-sm">{organism.gram === "positive" ? "Gram-positive (Purple)" : "Gram-negative (Pink)"} — {organism.desc}</p>
              <p className="text-[10px] text-muted-foreground italic">Validated References: Cappuccino & Welsh; Godkar; CLSI; WHO Lab Biosafety Manual</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1"><RotateCcw className="h-4 w-4 mr-1" /> Try Again</Button>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            MicroLab XR — 3D Gram Staining
          </h3>
          <p className="text-xs text-muted-foreground">Drag instruments & reagents onto the slide. Orbit with right-click or two fingers.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-md border bg-card hover:bg-muted transition-colors" title={soundEnabled ? "Mute sounds" : "Enable sounds"}>
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => { setMode("learning"); reset(); }}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
              <GraduationCap className="h-3.5 w-3.5" /> Learning
            </button>
            <button onClick={() => { setMode("exam"); reset(); }}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${mode === "exam" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
              <ClipboardCheck className="h-3.5 w-3.5" /> Exam
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset</Button>
        </div>
      </div>

      {/* Organism selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Specimen:</span>
        {ORGANISMS.map((o, i) => (
          <button key={i} onClick={() => setSelectedOrganism(i)}
            className={`px-2.5 py-1 rounded-md text-xs transition-all border ${i === selectedOrganism ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
            <em>{o.name}</em>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {PROTOCOL_STEPS.length}</span>
          <span className="font-medium">{current.name}</span>
        </div>
        <Progress value={(step / (PROTOCOL_STEPS.length - 1)) * 100} className="h-2" />
        <div className="flex gap-0.5 overflow-x-auto py-1">
          {PROTOCOL_STEPS.map((s, i) => (
            <div key={i} className={`min-w-[22px] h-5 flex items-center justify-center rounded text-[8px] font-bold ${
              i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
              i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>{i + 1}</div>
          ))}
        </div>
      </div>

      {/* Main 3D + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* 3D Canvas */}
        <div className="space-y-4">
          <div className="relative rounded-xl border-2 border-border overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ height: "450px" }}>
            <Canvas shadows camera={{ position: [0, 3.5, 4.5], fov: 50 }} gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <LabScene
                  step={step}
                  stepCompleted={stepCompleted}
                  organism={organism}
                  requiredItem={current.requiredItem}
                  burnerOn={burnerOn}
                  heatFixAnimating={heatFixAnimating}
                  onDropOnSlide={handleDropOnSlide}
                  particleColor={particleColor}
                  showParticles={showParticles}
                  disabled={false}
                />
              </Suspense>
            </Canvas>
            {/* Overlay instruction */}
            <div className="absolute top-3 left-3 right-3">
              <div className={`p-3 rounded-lg backdrop-blur-md border text-sm ${current.id === 8 ? "bg-destructive/20 border-destructive/40 text-destructive" : "bg-card/80 border-border"}`}>
                {current.id === 8 && <AlertTriangle className="h-4 w-4 inline mr-1.5 animate-pulse" />}
                <span className="font-semibold">Step {current.id}:</span> {current.action}
              </div>
            </div>
            {/* Status overlay */}
            {stepCompleted && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-green-600 text-white shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Step Applied!
                </Badge>
              </div>
            )}
            {/* GP/GN indicators */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur rounded-md px-2 py-1 border text-[10px]">
                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: stepCompleted ? current.gpColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gpColor : "transparent") }} />
                GP
              </div>
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur rounded-md px-2 py-1 border text-[10px]">
                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: stepCompleted ? current.gnColor : (step > 0 ? PROTOCOL_STEPS[step - 1].gnColor : "transparent") }} />
                GN
              </div>
            </div>
          </div>

          {/* Timer */}
          {stepCompleted && current.duration > 0 && !timerDone && (
            <StepTimer duration={current.duration} onComplete={() => setTimerDone(true)} />
          )}

          {/* Quiz */}
          {stepCompleted && current.quiz && (
            <motion.div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-medium text-sm">🧠 {current.quiz.question}</p>
              <div className="space-y-2">
                {current.quiz.options.map((opt, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null}
                    className={`w-full text-left p-2.5 rounded-lg text-sm border transition-colors ${
                      quizAnswer === null ? "hover:bg-muted border-border cursor-pointer" :
                      i === current.quiz!.correct ? "bg-green-500/10 border-green-500/50" :
                      i === quizAnswer ? "bg-destructive/10 border-destructive/50" : "border-border opacity-40"
                    }`}>
                    {quizAnswer !== null && i === current.quiz!.correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 text-green-600" />}
                    {quizAnswer === i && i !== current.quiz!.correct && <XCircle className="h-3.5 w-3.5 inline mr-1.5 text-destructive" />}
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Principle */}
          {mode === "learning" && stepCompleted && (
            <motion.div className="p-3 rounded-lg bg-card border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Scientific Principle</p>
              <p className="text-sm">{current.principle}</p>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Ref: {current.reference}</p>
            </motion.div>
          )}

          {/* Step result explanation */}
          {stepCompleted && (
            <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-1">
              <p className="font-semibold text-muted-foreground">Step Result</p>
              <div className="flex gap-4">
                <span>GP: <span className="font-bold" style={{ color: current.gpColor === "transparent" ? undefined : current.gpColor }}>{current.gpLabel}</span></span>
                <span>GN: <span className="font-bold" style={{ color: current.gnColor === "transparent" ? undefined : current.gnColor }}>{current.gnLabel}</span></span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" disabled={step === 0}
              onClick={() => { setStep(Math.max(0, step - 1)); setStepCompleted(false); setTimerDone(false); setQuizAnswer(null); setMentorMessage(""); }}>
              Previous
            </Button>
            <Button size="sm" disabled={!stepCompleted || (!timerDone && current.duration > 0)}
              onClick={isLastStep ? () => { setScore(s => ({ ...s, totalTime: Math.round((Date.now() - startTime) / 1000) })); sfx(playCompletionFanfare); setGameFinished(true); } : goNext}>
              {isLastStep ? "Finish" : "Next Step"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Drag instruction */}
          {!stepCompleted && current.requiredItem !== "auto" && (
            <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/30 text-xs">
              <span className="font-bold">🖱️ Drag & Drop:</span> Click and drag the correct instrument onto the glass slide.
            </div>
          )}

          {/* Hint in learning mode */}
          {mode === "learning" && !stepCompleted && (
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <Lightbulb className="h-3.5 w-3.5 inline mr-1 text-primary" />
              <span className="font-medium">Hint:</span> {current.hint}
            </div>
          )}

          {/* Lab Mentor */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" /> AI Lab Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {mentorMessage ? (
                  <motion.p key={mentorMessage} className="text-xs leading-relaxed" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {mentorMessage}
                  </motion.p>
                ) : (
                  <motion.p key="idle" className="text-xs text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Drag the correct instrument to the slide. I'll guide you through each step!
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Instrument list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">🧰 Instruments on Bench</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5">
                {INSTRUMENTS.map(inst => (
                  <div
                    key={inst.key}
                    className={`flex items-center gap-1.5 p-1.5 rounded text-[10px] border ${
                      inst.key === current.requiredItem && !stepCompleted
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30 font-semibold"
                        : "border-border bg-card"
                    } ${stepCompleted ? "opacity-50" : ""}`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ backgroundColor: inst.color }} />
                    {inst.label}
                    {inst.key === current.requiredItem && !stepCompleted && <span className="text-primary ml-auto">←</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score */}
          <div className="p-3 rounded-lg bg-card border text-xs space-y-1.5">
            <p className="font-semibold text-muted-foreground">📊 Score</p>
            <div className="flex justify-between"><span>Correct Steps</span><span className="font-mono font-bold text-primary">{score.correctSteps}/{step + (stepCompleted ? 1 : 0)}</span></div>
            <div className="flex justify-between"><span>Wrong Attempts</span><span className="font-mono font-bold text-destructive">{score.wrongSteps}</span></div>
            <div className="flex justify-between"><span>Quiz</span><span className="font-mono font-bold">{score.quizCorrect}/{score.quizTotal}</span></div>
          </div>

          {/* Microscope button */}
          {isLastStep && stepCompleted && (
            <Button variant="default" className="w-full gap-2" onClick={() => setShowMicroscope(true)}>
              <Eye className="h-4 w-4" /> View Under Microscope
            </Button>
          )}

          {/* References */}
          <div className="p-2.5 rounded-lg bg-muted/50 border text-[9px] text-muted-foreground space-y-0.5">
            <p className="font-semibold">📚 References</p>
            <p>• Cappuccino & Welsh, Microbiology: A Laboratory Manual</p>
            <p>• Godkar, Practical Microbiology</p>
            <p>• Clinical Microbiology Procedures Handbook</p>
            <p>• WHO Laboratory Biosafety Manual</p>
            <p>• CLSI Laboratory Standards</p>
          </div>
        </div>
      </div>

      {/* Microscope Modal */}
      <AnimatePresence>
        {showMicroscope && <MicroscopeView3D organism={organism} onClose={() => setShowMicroscope(false)} />}
      </AnimatePresence>
    </div>
  );
}
