// @ts-nocheck
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Beaker } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "grey_tube", label: "Fluoride-Oxalate Tube", color: "#9ca3af" },
  { key: "centrifuge", label: "Centrifuge", color: "#6b7280" },
  { key: "tubes", label: "Test Tubes (B/S/T)", color: "#fbbf24" },
  { key: "god_pod", label: "GOD-POD Reagent", color: "#8b5cf6" },
  { key: "pipette", label: "Micropipette (10 µL)", color: "#d1d5db" },
  { key: "standard", label: "Glucose Standard", color: "#f59e0b" },
  { key: "incubator", label: "Incubator (37°C)", color: "#ef4444" },
  { key: "spectro", label: "Spectrophotometer", color: "#22c55e" },
];

const absTest = 0.342;
const absStd = 0.380;
const glucoseResult = ((absTest / absStd) * 100).toFixed(1);

const steps: SimStep[] = [
  { id: 1, title: "Collect Fasting Blood", description: "Collect 2 mL venous blood in a fluoride-oxalate (grey top) vacutainer after 8-12 hours fasting.", duration: 5, principle: "Sodium fluoride inhibits enolase (glycolytic enzyme), preventing in-vitro glucose consumption (~7% per hour without it). Oxalate is the anticoagulant. Grey top tube is the standard for glucose (Tietz).", hint: "Use grey-top fluoride-oxalate tube.", mentorTip: "⚠️ Without fluoride, glucose drops ~5-7% per hour! Always use grey top for glucose testing.", reference: "Tietz Textbook of Clinical Chemistry; CLSI", requiredInstrument: "grey_tube", quiz: { question: "Why is sodium fluoride added to blood for glucose estimation?", correct: 2, options: ["To prevent clotting", "To lyse RBCs", "To inhibit glycolysis (glucose consumption)", "To stabilize hemoglobin"] } },
  { id: 2, title: "Separate Plasma", description: "Centrifuge at 3000 rpm for 10 minutes. Separate plasma (fluoride prevents glycolysis).", duration: 12, principle: "Centrifugation separates plasma from cells. Plasma (not serum) is used because fluoride-oxalate prevents clotting. Process within 30 minutes of collection (Tietz).", hint: "Centrifuge and separate plasma.", mentorTip: "Separate within 30 min! Even with fluoride, prolonged contact with cells affects glucose.", reference: "Tietz Clinical Chemistry", requiredInstrument: "centrifuge" },
  { id: 3, title: "Prepare Reagent Tubes", description: "Label 3 tubes: Blank (B), Standard (S), Test (T). Add 1.0 mL GOD-POD reagent to each tube.", duration: 8, principle: "GOD-POD reagent contains: Glucose Oxidase (GOD), Peroxidase (POD), 4-aminoantipyrine, and phenol. The enzymatic reaction produces a colored quinoneimine dye proportional to glucose (Trinder's method).", hint: "Label B, S, T and add reagent.", mentorTip: "Use accurate pipetting! 1.0 mL reagent in each tube. GOD-POD reagent must be at room temperature.", reference: "Tietz; Trinder's Method", requiredInstrument: "god_pod", quiz: { question: "What enzymes are present in the GOD-POD reagent?", correct: 1, options: ["Hexokinase and G6PDH", "Glucose Oxidase and Peroxidase", "Amylase and Lipase", "Lactate dehydrogenase"] } },
  { id: 4, title: "Add Samples", description: "Add 10 µL distilled water to Blank, 10 µL glucose standard (100 mg/dL) to Standard, 10 µL plasma to Test.", duration: 8, principle: "Blank corrects for reagent absorbance. Standard (100 mg/dL) provides the reference for calculation. Small sample volume (10 µL) ensures proper reagent-to-sample ratio.", hint: "Add water, standard, and plasma to respective tubes.", mentorTip: "Use calibrated micropipettes! 10 µL error significantly affects results at this volume.", reference: "Tietz Clinical Chemistry", requiredInstrument: "pipette" },
  { id: 5, title: "Mix and Incubate", description: "Mix well. Incubate all tubes at 37°C for 15 minutes. GOD oxidizes glucose → gluconic acid + H₂O₂. POD + chromogen → quinoneimine.", duration: 15, principle: "Reaction: Glucose + O₂ → Gluconic acid + H₂O₂ (GOD). Then: H₂O₂ + 4-aminoantipyrine + phenol → Quinoneimine (pink-red) + H₂O (POD). Color intensity ∝ glucose concentration (Tietz).", hint: "Incubate at 37°C for 15 min.", mentorTip: "🔬 The pink-red color develops proportionally to glucose. Read within 60 min — color fades!", reference: "Tietz; Trinder's Reaction", requiredInstrument: "incubator" },
  { id: 6, title: "Read Absorbance", description: "Read absorbance at 505 nm in spectrophotometer against the blank within 60 minutes.", duration: 8, principle: "Quinoneimine dye has maximum absorbance at 505 nm. Zero the spectrophotometer with the blank first. Color is stable for 60 minutes (Tietz Clinical Chemistry).", hint: "Read at 505 nm against blank.", mentorTip: "Read within 60 minutes! After that, the dye degrades and results become unreliable.", reference: "Tietz Clinical Chemistry", requiredInstrument: "spectro" },
  { id: 7, title: "Calculate Result", description: "Blood Glucose = (Abs. Test / Abs. Standard) × Concentration of Standard (100 mg/dL).", duration: 0, principle: "Calculation: Glucose (mg/dL) = (OD Test / OD Standard) × 100. Normal fasting: 70-100 mg/dL. Pre-diabetic: 100-125 mg/dL. Diabetic: ≥126 mg/dL (ADA criteria; Tietz).", hint: "Apply the calculation formula.", mentorTip: "Always run controls! If QC fails, repeat the entire batch.", reference: "Tietz; ADA Diabetes Diagnostic Criteria" },
];

function TestTubeRack({ step }: { step: number }) {
  const tubes = [
    { label: "B", color: "#e0e0e0", pos: [-0.5, 0, 0] as [number, number, number] },
    { label: "S", color: "#fbbf24", pos: [0, 0, 0] as [number, number, number] },
    { label: "T", color: "#f87171", pos: [0.5, 0, 0] as [number, number, number] },
  ];
  const liquidHeight = step >= 3 ? 0.6 : step >= 2 ? 0.3 : 0;
  const tubeColor = step >= 5;
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.15, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {tubes.map((tube) => (
        <group key={tube.label} position={tube.pos}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.0, 16, 1, true]} />
            <meshStandardMaterial color="#ddd" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ddd" transparent opacity={0.3} />
          </mesh>
          {liquidHeight > 0 && (
            <mesh position={[0, 0.1 + liquidHeight / 2, 0]}>
              <cylinderGeometry args={[0.09, 0.09, liquidHeight, 16]} />
              <meshStandardMaterial
                color={tubeColor ? (tube.label === "B" ? "#e0e0e0" : tube.label === "S" ? "#f59e0b" : "#ef4444") : tube.color}
                transparent opacity={0.7}
              />
            </mesh>
          )}
          <Text position={[0, 1.2, 0.15]} fontSize={0.12} color="#666" anchorX="center">
            {tube.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Spectrophotometer({ reading }: { reading: boolean }) {
  return (
    <group position={[2, -0.3, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0.41]}>
        <boxGeometry args={[0.6, 0.2, 0.01]} />
        <meshStandardMaterial color={reading ? "#22c55e" : "#1a1a2e"} emissive={reading ? "#22c55e" : "#000"} emissiveIntensity={reading ? 0.5 : 0} />
      </mesh>
      {reading && (
        <Text position={[0, 0.15, 0.43]} fontSize={0.08} color="#fff" anchorX="center">
          A=0.342
        </Text>
      )}
      <mesh position={[-0.3, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

export function BloodGlucose3D() {
  return (
    <SimulatorShell
      title="Blood Glucose Estimation — GOD-POD Method"
      icon={<Beaker className="h-5 w-5 text-primary" />}
      references={["Tietz Clinical Chemistry", "ADA", "CLSI"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Abs. Test: {absTest} | Abs. Standard: {absStd}</p>
          <p>Glucose = ({absTest}/{absStd}) × 100 = <strong className="text-foreground">{glucoseResult} mg/dL</strong></p>
          <p>Normal fasting: 70–100 mg/dL | Pre-diabetic: 100–125 | Diabetic: ≥126</p>
        </div>
      )}
    >
      {({ currentStep }) => (
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <TestTubeRack step={currentStep} />
          <Spectrophotometer reading={currentStep >= 5} />
          <OrbitControls enablePan={false} />
        </Canvas>
      )}
    </SimulatorShell>
  );
}
