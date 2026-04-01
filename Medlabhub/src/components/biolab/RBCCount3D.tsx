// @ts-nocheck
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Droplets } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "edta_tube", label: "EDTA Blood Tube", color: "#dc2626" },
  { key: "thoma_pipette", label: "Thoma RBC Pipette", color: "#e5e7eb" },
  { key: "hayems", label: "Hayem's Fluid", color: "#93c5fd" },
  { key: "hemocytometer", label: "Neubauer Chamber", color: "#9ca3af" },
  { key: "coverslip", label: "Coverslip", color: "#d1d5db" },
  { key: "microscope", label: "Microscope (40×)", color: "#6b7280" },
  { key: "counter", label: "Cell Counter", color: "#22c55e" },
];

const cellCount = 450;
const rbcResult = cellCount * 10000;

const steps: SimStep[] = [
  { id: 1, title: "Collect EDTA Blood", description: "Collect 2 mL venous blood in an EDTA (K₂EDTA) vacutainer. Mix gently by 8-10 inversions.", duration: 5, principle: "EDTA prevents clotting by chelating calcium. K₂EDTA is recommended by ICSH. Gentle mixing prevents hemolysis and platelet clumping (Godkar).", hint: "Collect blood in EDTA tube.", mentorTip: "Mix immediately after collection! Delayed mixing = clots = invalid results.", reference: "ICSH; Godkar Practical Pathology", requiredInstrument: "edta_tube" },
  { id: 2, title: "Prepare RBC Pipette", description: "Draw well-mixed blood up to the 0.5 mark in the Thoma RBC diluting pipette (1:200 dilution).", duration: 8, principle: "The Thoma pipette has a mixing bulb containing a glass bead. Drawing to 0.5 mark and diluting to 101 gives 1:200 dilution (0.5/101 = 1:200) as per ICSH standard.", hint: "Draw blood to 0.5 mark.", mentorTip: "Wipe excess blood from the pipette tip before adding diluent. No air bubbles!", reference: "Godkar; Henry's Clinical Diagnosis", requiredInstrument: "thoma_pipette", quiz: { question: "What dilution is achieved when blood is drawn to 0.5 and diluent to 101 in a Thoma pipette?", correct: 2, options: ["1:100", "1:500", "1:200", "1:20"] } },
  { id: 3, title: "Add Hayem's Fluid", description: "Draw Hayem's fluid (HgCl₂ + Na₂SO₄ + NaCl) up to the 101 mark. This gives a 1:200 dilution.", duration: 8, principle: "Hayem's fluid fixes and preserves RBC morphology while lysing WBCs and platelets. Composition: mercuric chloride (fixative), sodium sulfate (increases specific gravity), NaCl (isotonicity).", hint: "Fill to 101 with Hayem's fluid.", mentorTip: "Hayem's fluid LYSES WBCs so only RBCs remain for counting. Don't use for WBC counts!", reference: "Godkar Practical Pathology", requiredInstrument: "hayems" },
  { id: 4, title: "Mix Thoroughly", description: "Roll the pipette between palms for 2 minutes to ensure uniform mixing. Discard the first 3-4 drops.", duration: 10, principle: "Mixing ensures uniform cell distribution. Discarding first drops removes undiluted blood in the stem (dead space), preventing falsely high counts.", hint: "Mix well and discard first drops.", mentorTip: "Roll horizontally — don't shake vertically! Shaking causes hemolysis.", reference: "Godkar; ICSH" },
  { id: 5, title: "Charge Hemocytometer", description: "Place the coverslip on the Neubauer chamber. Touch the pipette tip to the edge — fluid fills by capillary action.", duration: 8, principle: "The Neubauer chamber has a depth of 0.1 mm. Capillary action ensures a single-layer distribution of cells. Overfilling creates a thicker layer and falsely high counts.", hint: "Let fluid fill by capillary action.", mentorTip: "⚠️ Do NOT press on the coverslip or blow fluid in. Let capillary action work!", reference: "Godkar; Henry's Clinical Diagnosis", requiredInstrument: "hemocytometer", quiz: { question: "What is the depth of the Neubauer hemocytometer counting chamber?", correct: 1, options: ["0.01 mm", "0.1 mm", "1.0 mm", "0.5 mm"] } },
  { id: 6, title: "Allow Settling (2 min)", description: "Wait 2 minutes for RBCs to settle on the grid in a moist chamber.", duration: 10, principle: "Cells must settle onto the grid plane for accurate counting. A moist chamber (wet filter paper) prevents evaporation during settling.", hint: "Wait for cells to settle.", mentorTip: "Place chamber on moist filter paper in a Petri dish to prevent drying.", reference: "Godkar; ICSH" },
  { id: 7, title: "Count RBCs", description: "Under 40× objective, count RBCs in 5 small squares (4 corner + 1 center) of the central large square. Count cells touching left and top borders only.", duration: 15, principle: "The 'L-rule': count cells touching LEFT and TOP borders, exclude RIGHT and BOTTOM to prevent double-counting. 5 small squares (each 1/25 mm²) = 1/5 mm² area (Godkar).", hint: "Count 5 small squares using L-rule.", mentorTip: "Use the 'reverse-L' counting rule consistently. Count systematically: left to right, row by row.", reference: "Godkar; Henry's Clinical Diagnosis", requiredInstrument: "microscope", quiz: { question: "Which counting rule prevents double-counting cells at borders?", correct: 0, options: ["Count cells touching left and top borders only", "Count all touching cells", "Count cells in the center only", "Exclude all border cells"] } },
  { id: 8, title: "Calculate Result", description: "RBC count = (N × dilution × depth factor) / area = N × 200 × 10 / (5 × 1/25) = N × 10,000/µL", duration: 0, principle: "Formula: RBC = N × 10,000/µL where N = total cells in 5 small squares. Normal values: Males 4.5-5.5 million/µL, Females 4.0-5.0 million/µL (WHO; Godkar).", hint: "Apply the calculation formula.", mentorTip: "If N = 450, then RBC = 450 × 10,000 = 4,500,000/µL = 4.5 million/µL ✓ Normal!", reference: "Godkar; Henry's Clinical Diagnosis; WHO", requiredInstrument: "counter" },
];

function Hemocytometer({ charged, showCells }: { charged: boolean; showCells: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#ccc" metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.2, 0.04, 1.0]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.6} />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <group key={`grid-${i}`}>
          <mesh position={[-0.4 + i * 0.2, 0.05, 0]}>
            <boxGeometry args={[0.005, 0.005, 0.8]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[0, 0.05, -0.4 + i * 0.2]}>
            <boxGeometry args={[0.8, 0.005, 0.005]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.4, 0.02, 1.2]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.15} />
      </mesh>
      {charged && (
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[1.1, 0.01, 0.9]} />
          <meshStandardMaterial color="#fca5a5" transparent opacity={0.3} />
        </mesh>
      )}
      {showCells && [...Array(40)].map((_, i) => {
        const x = ((i * 17 + 7) % 70 - 35) / 100;
        const z = ((i * 23 + 11) % 60 - 30) / 100;
        return (
          <mesh key={`rbc-${i}`} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, (i * 47) % 314 / 100]}>
            <torusGeometry args={[0.015, 0.005, 8, 16]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        );
      })}
    </group>
  );
}

export function RBCCount3D() {
  return (
    <SimulatorShell
      title="Manual RBC Count — Neubauer Hemocytometer"
      icon={<Droplets className="h-5 w-5 text-primary" />}
      references={["Godkar", "Henry's Clinical Diagnosis", "ICSH"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Cells counted in 5 small squares: <strong>{cellCount}</strong></p>
          <p>RBC = {cellCount} × 10,000 = <strong className="text-foreground">{(rbcResult / 1e6).toFixed(1)} million/µL</strong></p>
          <p>Normal: Males 4.5–5.5 M/µL | Females 4.0–5.0 M/µL</p>
        </div>
      )}
    >
      {({ currentStep }) => (
        <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Hemocytometer charged={currentStep >= 4} showCells={currentStep >= 6} />
          <OrbitControls enablePan={false} />
        </Canvas>
      )}
    </SimulatorShell>
  );
}
