// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Environment } from "@react-three/drei";
import { Microscope } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep } from "./SimulatorShell";

const steps: SimStep[] = [
  { id: 1, title: "Deparaffinize Section", description: "Place tissue section slide in xylene bath for deparaffinization (2 changes, 5 min each).", duration: 10, principle: "Paraffin wax embedding medium must be completely removed before staining. Xylene dissolves paraffin, making tissue permeable to aqueous stains (Bancroft & Gamble, Theory and Practice of Histological Techniques).", hint: "Immerse in xylene to remove paraffin.", mentorTip: "Use fresh xylene! Exhausted xylene leaves paraffin residue → poor staining. Two changes ensure complete removal.", reference: "Bancroft & Gamble, 8th Ed." },
  { id: 2, title: "Rehydrate in Alcohol", description: "Pass slide through graded alcohol series: 100% → 95% → 70% ethanol (2 min each).", duration: 8, principle: "Gradual rehydration prevents tissue distortion. Direct transfer from xylene to water would cause artifact. Each alcohol grade equilibrates the tissue progressively (Bancroft & Gamble).", hint: "Graded alcohol: 100→95→70%.", mentorTip: "Don't skip grades! Rapid rehydration causes tissue shrinkage and distortion.", reference: "Bancroft & Gamble", quiz: { question: "Why are graded alcohols used for rehydration?", correct: 1, options: ["To fix the tissue", "To prevent tissue distortion from rapid rehydration", "To stain the nuclei", "To kill bacteria"] } },
  { id: 3, title: "Wash in Water", description: "Rinse slide in distilled water to remove residual alcohol.", duration: 5, principle: "Water wash removes alcohol completely. Hematoxylin is an aqueous stain and requires tissue to be fully hydrated for proper binding.", hint: "Rinse in distilled water.", mentorTip: "Gentle running water — don't blast the section off the slide!", reference: "Bancroft & Gamble" },
  { id: 4, title: "Apply Hematoxylin", description: "Immerse slide in Harris Hematoxylin for nuclear staining (5 minutes).", duration: 15, principle: "Hematoxylin (actually its oxidation product hematein) binds to nucleic acids and histones in nuclei via aluminum mordant (Al³⁺-hematein complex). Stains nuclei blue-purple. Harris' formula contains mercuric oxide as oxidizer (Bancroft & Gamble).", hint: "Stain nuclei with hematoxylin.", mentorTip: "5 minutes is standard for Harris. Over-staining can be corrected by differentiation; under-staining cannot be easily fixed.", reference: "Bancroft & Gamble; Godkar", quiz: { question: "What cellular structure does hematoxylin primarily stain?", correct: 0, options: ["Nuclei (blue-purple)", "Cytoplasm (pink)", "Cell membrane", "Golgi apparatus"] } },
  { id: 5, title: "Wash Excess Stain", description: "Rinse in running tap water to remove excess hematoxylin.", duration: 5, principle: "Tap water wash removes unbound hematoxylin. Slightly alkaline tap water begins the 'bluing' process (converting red hematoxylin to blue-purple form).", hint: "Rinse off excess stain.", mentorTip: "Use running tap water, not distilled — the alkalinity of tap water helps blue the stain.", reference: "Bancroft & Gamble" },
  { id: 6, title: "Differentiate in Acid-Alcohol", description: "Quick dip (1-2 seconds) in 1% acid-alcohol to remove background staining.", duration: 4, principle: "Acid-alcohol (1% HCl in 70% ethanol) removes excess hematoxylin from cytoplasm and connective tissue, leaving nuclei crisply stained. This is the critical differentiation step (Bancroft & Gamble).", hint: "Quick dip in acid-alcohol.", mentorTip: "⚠️ CRITICAL: Only 1-2 seconds! Over-differentiation removes nuclear stain. Check under microscope!", reference: "Bancroft & Gamble", quiz: { question: "What is the purpose of acid-alcohol differentiation?", correct: 2, options: ["To fix the tissue", "To add color to cytoplasm", "To remove excess hematoxylin from non-nuclear structures", "To dehydrate the tissue"] } },
  { id: 7, title: "Blue in Scott's Water", description: "Immerse in Scott's tap water substitute for bluing nuclei (1-2 minutes).", duration: 8, principle: "Scott's water (NaHCO₃ + MgSO₄) is alkaline, converting the red-purple hematein-aluminum complex to its final blue form. This 'bluing' step is essential for proper nuclear color (Bancroft & Gamble).", hint: "Blue nuclei in alkaline solution.", mentorTip: "Scott's water turns nuclei from red to blue. If your tap water is sufficiently alkaline, this step may be optional.", reference: "Bancroft & Gamble" },
  { id: 8, title: "Apply Eosin", description: "Counterstain in Eosin Y solution for cytoplasm staining (2 minutes).", duration: 12, principle: "Eosin Y is an acidic dye that binds to positively charged (basic) proteins in cytoplasm, collagen, and muscle fibers. Stains them pink to red. Creates the classic H&E contrast with blue nuclei (Bancroft & Gamble).", hint: "Counterstain cytoplasm pink.", mentorTip: "2 minutes is standard. Eosin concentration and pH affect intensity. Over-staining makes tissue uniformly pink.", reference: "Bancroft & Gamble; Godkar" },
  { id: 9, title: "Dehydrate in Alcohol", description: "Pass through graded alcohol: 70% → 95% → 100% ethanol (2 min each).", duration: 8, principle: "Gradual dehydration preserves tissue architecture. Complete dehydration is essential before clearing — water in tissue causes milky opacity after mounting.", hint: "Dehydrate through graded alcohols.", mentorTip: "Absolute alcohol must be fresh and anhydrous. Residual water = cloudy sections.", reference: "Bancroft & Gamble" },
  { id: 10, title: "Clear in Xylene", description: "Clear sections in xylene (2 changes, 2 min each) for transparency.", duration: 6, principle: "Xylene replaces alcohol and makes tissue transparent. It is also miscible with DPX mountant. Incomplete clearing = hazy sections under microscope.", hint: "Clear in xylene.", mentorTip: "Two changes of fresh xylene ensure complete clearing.", reference: "Bancroft & Gamble" },
  { id: 11, title: "Mount Coverslip", description: "Apply DPX mountant and place coverslip on slide. Avoid air bubbles.", duration: 5, principle: "DPX (dibutylphthalate polystyrene xylene) is a permanent mounting medium with refractive index similar to glass, providing optical clarity for microscopy (Bancroft & Gamble).", hint: "Apply mountant and coverslip.", mentorTip: "Apply DPX from one side, lower coverslip slowly to avoid air bubbles. Let dry horizontally overnight.", reference: "Bancroft & Gamble" },
  { id: 12, title: "Observe Under Microscope", description: "Examine stained tissue: nuclei appear blue-purple (hematoxylin), cytoplasm pink-red (eosin).", duration: 0, principle: "H&E is the most widely used stain in histopathology. Nuclei: blue-purple (basophilic). Cytoplasm: pink-red (eosinophilic). RBCs: bright red. Collagen: pale pink. Muscle: deep pink (Bancroft & Gamble).", hint: "Observe H&E stained tissue.", mentorTip: "🔍 Good H&E: crisp blue nuclei against pink cytoplasm. If nuclei are too dark or washed out, adjust hematoxylin time or differentiation.", reference: "Bancroft & Gamble; Godkar" },
];

function StainingBath({ position, color, label, isActive, slideInBath }: {
  position: [number, number, number]; color: string; label: string; isActive: boolean; slideInBath: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (liquidRef.current && isActive) liquidRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.02;
    if (meshRef.current) {
      const scale = isActive ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 3);
    }
  });
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <RoundedBox args={[0.8, 0.6, 0.5]} radius={0.03}>
          <meshStandardMaterial color="#e0e0e0" transparent opacity={0.4} />
        </RoundedBox>
      </mesh>
      <mesh ref={liquidRef} position={[0, -0.05, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.4]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
      {slideInBath && (
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.5, 0.02, 0.15]} />
          <meshStandardMaterial color="#f0f0f0" transparent opacity={0.8} />
        </mesh>
      )}
      {isActive && (
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
      <Text position={[0, -0.45, 0]} fontSize={0.07} color="#666" anchorY="top">{label}</Text>
    </group>
  );
}

function GlassSlide({ position, tissueColor, isAnimating, targetY }: {
  position: [number, number, number]; tissueColor: string; isAnimating: boolean; targetY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      const target = isAnimating ? targetY : position[1];
      groupRef.current.position.y += (target - groupRef.current.position.y) * delta * 3;
    }
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.02, 0.2]} />
        <meshPhysicalMaterial color="#f8f8ff" transparent opacity={0.6} roughness={0.1} transmission={0.3} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.25, 0.005, 0.12]} />
        <meshStandardMaterial color={tissueColor} />
      </mesh>
    </group>
  );
}

function MicroscopeView({ visible }: { visible: boolean }) {
  const viewRef = useRef<THREE.Group>(null);
  useFrame(() => { if (viewRef.current) viewRef.current.visible = visible; });
  if (!visible) return null;
  return (
    <group ref={viewRef} position={[0, 1.5, 0]}>
      <mesh><circleGeometry args={[0.8, 64]} /><meshBasicMaterial color="#f5f0e8" /></mesh>
      {Array.from({ length: 20 }).map((_, i) => {
        const x = ((i * 17 + 7) % 120 - 60) / 100;
        const y = ((i * 23 + 11) % 120 - 60) / 100;
        if (Math.sqrt(x * x + y * y) > 0.7) return null;
        return (
          <group key={i} position={[x, y, 0.01]}>
            <mesh><circleGeometry args={[0.08 + (i * 0.013) % 0.04, 16]} /><meshBasicMaterial color="#e8a0b0" /></mesh>
            <mesh position={[(i * 0.007) % 0.03 - 0.015, (i * 0.011) % 0.03 - 0.015, 0.005]}>
              <circleGeometry args={[0.03 + (i * 0.009) % 0.02, 16]} /><meshBasicMaterial color="#4a3080" />
            </mesh>
          </group>
        );
      })}
      <Text position={[0, -0.95, 0.01]} fontSize={0.08} color="#333">H&E Stained Tissue — 40×</Text>
    </group>
  );
}

function LabScene({ currentStep, isTimerActive }: { currentStep: number; isTimerActive: boolean }) {
  const step = steps[currentStep];
  const getTissueColor = () => {
    if (currentStep < 4) return "#f5e6d0";
    if (currentStep < 8) return "#5a3a8a";
    return "#c06080";
  };
  const baths = [
    { pos: [-2, 0, 0] as [number, number, number], color: "#c0c8d0", label: "Xylene", active: step?.title.includes("Deparaffinize") || step?.title.includes("Clear") },
    { pos: [-1, 0, 0] as [number, number, number], color: "#d0d8e0", label: "Alcohol", active: step?.title.includes("Rehydrate") || step?.title.includes("Dehydrate") },
    { pos: [0, 0, 0] as [number, number, number], color: "#a0c0f0", label: "Water", active: step?.title.includes("Wash") },
    { pos: [1, 0, 0] as [number, number, number], color: "#4a2080", label: "Hematoxylin", active: step?.title.includes("Hematoxylin") },
    { pos: [2, 0, 0] as [number, number, number], color: "#e06080", label: "Eosin", active: step?.title.includes("Eosin") },
    { pos: [-0.5, 0, 1] as [number, number, number], color: "#d4a060", label: "Acid-Alcohol", active: step?.title.includes("Differentiate") },
    { pos: [0.5, 0, 1] as [number, number, number], color: "#80b0c0", label: "Scott's", active: step?.title.includes("Scott") },
  ];
  const activeBath = baths.find(b => b.active);
  const slideAnimating = isTimerActive && activeBath !== undefined;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 4, -2]} intensity={0.4} color="#f0e0d0" />
      <mesh position={[0, -0.35, 0.3]} receiveShadow>
        <boxGeometry args={[6, 0.1, 3]} /><meshStandardMaterial color="#d4c4a8" />
      </mesh>
      {baths.map((bath, i) => (
        <StainingBath key={i} position={bath.pos} color={bath.color} label={bath.label} isActive={bath.active} slideInBath={bath.active && isTimerActive} />
      ))}
      {step?.title !== "Observe Under Microscope" && (
        <GlassSlide
          position={activeBath ? [activeBath.pos[0], 0.8, activeBath.pos[2]] : [0, 0.8, -0.8]}
          tissueColor={getTissueColor()}
          isAnimating={slideAnimating}
          targetY={slideAnimating ? 0.1 : 0.8}
        />
      )}
      {step?.title === "Mount Coverslip" && (
        <group position={[0, 0.8, -0.8]}>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.2]} />
            <meshPhysicalMaterial color="#f0f0ff" transparent opacity={0.4} roughness={0.05} transmission={0.5} />
          </mesh>
          <Text position={[0.4, 0.1, 0]} fontSize={0.05} color="#666">Coverslip</Text>
        </group>
      )}
      <MicroscopeView visible={step?.title === "Observe Under Microscope"} />
      <Text position={[0, 2, 0]} fontSize={0.12} color="#333" maxWidth={4} textAlign="center">{step?.title || "Complete"}</Text>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
      <Environment preset="studio" />
    </>
  );
}

export function HEStaining3D() {
  return (
    <SimulatorShell
      title="H&E Staining — Histopathology"
      icon={<Microscope className="h-5 w-5 text-primary" />}
      references={["Bancroft & Gamble", "Godkar", "WHO"]}
      steps={steps}
      renderResults={() => (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Nuclei: <strong className="text-blue-600">Blue-purple</strong> (Hematoxylin)</p>
          <p>✅ Cytoplasm: <strong className="text-pink-600">Pink-red</strong> (Eosin)</p>
          <p>✅ RBCs: Bright red | Collagen: Pale pink | Muscle: Deep pink</p>
        </div>
      )}
    >
      {({ currentStep, isTimerActive }) => (
        <Canvas camera={{ position: [0, 3, 5], fov: 45 }}>
          <LabScene currentStep={currentStep} isTimerActive={isTimerActive} />
        </Canvas>
      )}
    </SimulatorShell>
  );
}
