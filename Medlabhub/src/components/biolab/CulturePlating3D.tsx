// @ts-nocheck
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { Bug } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "loop", label: "Inoculating Loop", color: "#c0c0c0" },
  { key: "burner", label: "Bunsen Burner", color: "#3b82f6" },
  { key: "specimen", label: "Specimen", color: "#dc2626" },
  { key: "plate", label: "Agar Plate", color: "#c4a35a" },
  { key: "incubator", label: "Incubator (37°C)", color: "#f59e0b" },
  { key: "magnifier", label: "Magnifier", color: "#6b7280" },
];

const steps: SimStep[] = [
  { id: 1, title: "Sterilize Inoculating Loop", description: "Hold the nichrome loop in the Bunsen burner flame until red-hot. Allow to cool for 10 seconds.", duration: 8, principle: "Sterilization by flaming kills all microorganisms on the loop, preventing contamination of the culture plate (Cappuccino & Welsh, 12th Ed.).", hint: "Heat the loop until it glows red.", mentorTip: "Always flame before AND after each use. The loop must cool before touching colonies — hot loops kill bacteria!", reference: "Cappuccino & Welsh, Microbiology Lab Manual", requiredInstrument: "burner" },
  { id: 2, title: "Collect Specimen", description: "Touch the cooled loop to the specimen (broth culture or clinical sample) to pick up a small inoculum.", duration: 5, principle: "Only a small amount of inoculum is needed — too much leads to a heavy lawn without isolated colonies (Cheesbrough, District Lab Practice).", hint: "Pick up inoculum with the loop.", mentorTip: "Less is more! A barely visible amount of inoculum is sufficient.", reference: "Cheesbrough, District Lab Practice in Tropical Countries", requiredInstrument: "specimen" },
  { id: 3, title: "Primary Streak (Zone 1)", description: "Streak the inoculum back and forth across one quadrant (~1/4 of the plate).", duration: 10, principle: "The primary streak deposits the highest concentration of bacteria. Each subsequent zone progressively dilutes organisms to yield isolated colonies (Cappuccino & Welsh).", hint: "Streak Zone 1 with parallel lines.", mentorTip: "Use close, parallel streaks. Don't press too hard — you'll gouge the agar!", reference: "Cappuccino & Welsh; CLSI", requiredInstrument: "loop", quiz: { question: "What is the purpose of the streak plate technique?", correct: 1, options: ["To grow bacteria in broth", "To isolate single colonies from a mixed culture", "To count total bacteria", "To test antibiotic resistance"] } },
  { id: 4, title: "Re-sterilize Loop", description: "Flame the loop again to kill remaining organisms before the next zone.", duration: 5, principle: "Re-sterilization between zones prevents carryover of too many organisms, ensuring progressive dilution.", hint: "Flame the loop.", mentorTip: "Critical step! Skipping this means Zone 2 will be too confluent.", reference: "Cappuccino & Welsh", requiredInstrument: "burner" },
  { id: 5, title: "Second Streak (Zone 2)", description: "Rotate the plate 90°. Drag the loop 2-3 times through Zone 1, then streak into the second quadrant.", duration: 10, principle: "Drawing through Zone 1 picks up organisms at lower concentration. Subsequent streaking further dilutes them (Cappuccino & Welsh).", hint: "Overlap Zone 1 slightly, then streak Zone 2.", mentorTip: "Only 2-3 passes through Zone 1! More passes = too many organisms carried over.", reference: "Cappuccino & Welsh", requiredInstrument: "loop" },
  { id: 6, title: "Re-sterilize Loop", description: "Flame the loop again before streaking Zone 3.", duration: 5, principle: "Each sterilization reduces bacterial load by ~99.9%, enabling progressive dilution across zones.", hint: "Flame the loop between zones.", mentorTip: "Always cool the loop before touching agar.", reference: "Cappuccino & Welsh", requiredInstrument: "burner" },
  { id: 7, title: "Third Streak (Zone 3)", description: "Rotate 90° again. Drag through Zone 2, then streak into the third quadrant.", duration: 10, principle: "By Zone 3, bacterial concentration is low enough that individual colonies begin to appear after incubation.", hint: "Streak Zone 3 with wider spacing.", mentorTip: "Wider spacing between streaks here helps isolate colonies.", reference: "Cappuccino & Welsh", requiredInstrument: "loop" },
  { id: 8, title: "Final Streak (Zone 4)", description: "Flame loop, drag through Zone 3, and streak into the remaining area WITHOUT touching Zone 1.", duration: 10, principle: "Zone 4 should yield well-isolated colonies. Touching Zone 1 re-introduces high concentration organisms, ruining the dilution (Cappuccino & Welsh).", hint: "Streak the last zone — avoid Zone 1!", mentorTip: "⚠️ NEVER streak back into Zone 1! This is the most common student mistake.", reference: "Cappuccino & Welsh; CLSI", requiredInstrument: "loop", quiz: { question: "Why must Zone 4 NOT touch Zone 1?", correct: 2, options: ["It wastes agar space", "It makes the plate look messy", "It re-introduces high-concentration bacteria, preventing isolation", "It contaminates the culture"] } },
  { id: 9, title: "Incubate Plate", description: "Invert the plate and incubate at 37°C for 18-24 hours.", duration: 12, principle: "Inversion prevents condensation from dripping onto colonies, which would cause spreading and merging. 37°C is optimal for most human pathogens (CLSI).", hint: "Invert and incubate.", mentorTip: "Always invert! Moisture drops ruin isolated colonies.", reference: "CLSI; Cappuccino & Welsh", requiredInstrument: "incubator" },
  { id: 10, title: "Observe Colonies", description: "Examine isolated colonies in Zone 3/4. Note morphology: size, shape, color, margin, elevation, hemolysis.", duration: 0, principle: "Colony morphology is the first step in identification. Key features: size (mm), shape (circular/irregular), margin (entire/undulate), elevation (flat/raised/convex), color, opacity, and hemolysis pattern on blood agar (Cappuccino & Welsh).", hint: "Examine and describe colonies.", mentorTip: "🔍 Record: size, shape, color, margin, elevation, opacity, hemolysis. This is critical for identification!", reference: "Cappuccino & Welsh; Bergey's Manual", requiredInstrument: "magnifier" },
];

function PetriDish({ streakZone, showColonies }: { streakZone: number; showColonies: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 64]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.06, 64]} />
        <meshStandardMaterial color="#c4a35a" />
      </mesh>
      {streakZone >= 1 && (
        <group>
          {[...Array(6)].map((_, i) => (
            <mesh key={`z1-${i}`} position={[-0.5, 0.06, -0.9 + i * 0.22]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[1.2, 0.005, 0.02]} />
              <meshStandardMaterial color="#f5f5dc" />
            </mesh>
          ))}
        </group>
      )}
      {streakZone >= 3 && (
        <group>
          {[...Array(5)].map((_, i) => (
            <mesh key={`z2-${i}`} position={[0.6, 0.06, -0.3 + i * 0.25]} rotation={[0, -0.4, 0]}>
              <boxGeometry args={[1.0, 0.005, 0.02]} />
              <meshStandardMaterial color="#f5f5dc" opacity={0.8} transparent />
            </mesh>
          ))}
        </group>
      )}
      {streakZone >= 5 && (
        <group>
          {[...Array(4)].map((_, i) => (
            <mesh key={`z3-${i}`} position={[0.2, 0.06, 0.5 + i * 0.2]} rotation={[0, 0.6, 0]}>
              <boxGeometry args={[0.8, 0.005, 0.02]} />
              <meshStandardMaterial color="#f5f5dc" opacity={0.6} transparent />
            </mesh>
          ))}
        </group>
      )}
      {showColonies && (
        <group>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 0.5 + Math.PI * 0.5;
            const r = 0.8 + (i * 0.37) % 0.6;
            return (
              <mesh key={`col-${i}`} position={[Math.cos(angle) * r, 0.07, Math.sin(angle) * r]}>
                <sphereGeometry args={[0.04 + (i * 0.013) % 0.03, 16, 16]} />
                <meshStandardMaterial color={i % 3 === 0 ? "#f5f5dc" : i % 3 === 1 ? "#fbbf24" : "#e5e7eb"} />
              </mesh>
            );
          })}
        </group>
      )}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 0.04, 64]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function BunsenBurner({ isLit }: { isLit: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (flameRef.current && isLit) flameRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.2; });
  return (
    <group position={[-2.5, -0.5, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#555" metalness={0.8} />
      </mesh>
      {isLit && (
        <mesh ref={flameRef} position={[0, 0.75, 0]}>
          <coneGeometry args={[0.08, 0.4, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function InoculatingLoop({ isHot }: { isHot: boolean }) {
  return (
    <group position={[2.2, -0.5, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        <meshStandardMaterial color={isHot ? "#ff4400" : "#aaa"} emissive={isHot ? "#ff2200" : "#000"} emissiveIntensity={isHot ? 1.5 : 0} metalness={0.9} />
      </mesh>
    </group>
  );
}

export function CulturePlating3D() {
  return (
    <SimulatorShell
      title="Bacterial Culture Plating — Streak Plate Technique"
      icon={<Bug className="h-5 w-5 text-primary" />}
      references={["Cappuccino & Welsh", "CLSI", "Cheesbrough"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Isolated colonies visible in Zone 3/4</p>
          <p>Colony morphology: Circular, convex, entire margin, 1-2mm, cream-colored</p>
          <p className="italic">Pick isolated colony for biochemical testing or subculture.</p>
        </div>
      )}
    >
      {({ currentStep }) => {
        const streakZone = currentStep >= 8 ? 6 : currentStep >= 7 ? 5 : currentStep >= 5 ? 4 : currentStep >= 3 ? 3 : currentStep >= 2 ? 1 : 0;
        const isLoopHot = steps[currentStep]?.title.includes("Sterilize") || steps[currentStep]?.title.includes("Re-sterilize");
        const showColonies = currentStep >= 9;
        return (
          <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <PetriDish streakZone={streakZone} showColonies={showColonies} />
            <BunsenBurner isLit={isLoopHot} />
            <InoculatingLoop isHot={isLoopHot} />
            <OrbitControls enablePan={false} />
          </Canvas>
        );
      }}
    </SimulatorShell>
  );
}
