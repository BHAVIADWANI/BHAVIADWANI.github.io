// @ts-nocheck
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useRef } from "react";
import { Target } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "colonies", label: "Colony Picker", color: "#fbbf24" },
  { key: "saline", label: "Sterile Saline", color: "#93c5fd" },
  { key: "mcfarland", label: "McFarland Standard", color: "#d1d5db" },
  { key: "swab", label: "Sterile Swab", color: "#f5f5dc" },
  { key: "plate", label: "MHA Plate", color: "#c4a35a" },
  { key: "disks", label: "Antibiotic Disks", color: "#f0f0f0" },
  { key: "forceps", label: "Sterile Forceps", color: "#9ca3af" },
  { key: "incubator", label: "Incubator (35°C)", color: "#f59e0b" },
  { key: "ruler", label: "Ruler/Caliper", color: "#6b7280" },
  { key: "clsi", label: "CLSI M100 Tables", color: "#3b82f6" },
];

const antibiotics = [
  { name: "Ampicillin", code: "AMP", zone: 22, breakpoint: { s: 17, r: 13 }, result: "S" },
  { name: "Ciprofloxacin", code: "CIP", zone: 28, breakpoint: { s: 21, r: 15 }, result: "S" },
  { name: "Erythromycin", code: "E", zone: 10, breakpoint: { s: 23, r: 13 }, result: "R" },
  { name: "Gentamicin", code: "GEN", zone: 18, breakpoint: { s: 15, r: 12 }, result: "S" },
  { name: "Penicillin", code: "P", zone: 8, breakpoint: { s: 29, r: 28 }, result: "R" },
  { name: "Vancomycin", code: "VA", zone: 19, breakpoint: { s: 17, r: 14 }, result: "S" },
];

const steps: SimStep[] = [
  { id: 1, title: "Prepare Inoculum", description: "Pick 3-5 colonies from an 18-24 hour culture. Suspend in sterile saline to match 0.5 McFarland turbidity standard (~1.5 × 10⁸ CFU/mL).", duration: 8, principle: "Standardized inoculum density ensures reproducible results. 0.5 McFarland = ~1.5 × 10⁸ CFU/mL. Too dense = false resistance; too light = false susceptibility (CLSI M100).", hint: "Match turbidity to McFarland 0.5.", mentorTip: "Use a McFarland nephelometer or visual comparison. Adjust within 15 minutes of preparation!", reference: "CLSI M100-S31; M02-A13", requiredInstrument: "colonies", quiz: { question: "What is the standard inoculum density for Kirby-Bauer AST?", correct: 1, options: ["0.1 McFarland", "0.5 McFarland (~1.5 × 10⁸ CFU/mL)", "1.0 McFarland", "2.0 McFarland"] } },
  { id: 2, title: "Inoculate MHA Plate", description: "Dip a sterile cotton swab into the inoculum. Streak the entire Mueller-Hinton Agar surface in 3 directions, rotating 60° each time.", duration: 10, principle: "Mueller-Hinton Agar (MHA) is the standard medium — it has controlled cation concentration (Ca²⁺, Mg²⁺) and minimal inhibitors. Three-direction streaking ensures an even bacterial lawn (CLSI M02).", hint: "Streak in 3 directions for even lawn.", mentorTip: "Rotate plate 60° between each pass. Press swab firmly but don't gouge the agar!", reference: "CLSI M02-A13; Cappuccino & Welsh", requiredInstrument: "swab" },
  { id: 3, title: "Allow Drying (3-5 min)", description: "Let the inoculated plate dry for 3-5 minutes before placing disks. Do not exceed 15 minutes.", duration: 10, principle: "Excess moisture causes swarming and irregular zones. Drying >15 min allows bacterial growth to begin, reducing zone sizes (CLSI M100).", hint: "Wait for surface moisture to absorb.", mentorTip: "Place plate lid slightly ajar in the BSC. If moisture remains, zones will be distorted.", reference: "CLSI M100" },
  { id: 4, title: "Place Antibiotic Disks", description: "Using sterile forceps, place antibiotic disks onto the agar surface at least 24 mm apart (center to center). Press gently.", duration: 12, principle: "Disks must be ≥24 mm apart to prevent overlapping zones. Press firmly to ensure contact — lifted disks give falsely small zones. Place within 15 min of inoculation (CLSI M02).", hint: "Space disks ≥24 mm apart.", mentorTip: "Maximum 12 disks on a 150mm plate, 5 on a 100mm plate. Press each disk once — no repositioning!", reference: "CLSI M02-A13; M100", requiredInstrument: "forceps", quiz: { question: "What is the minimum distance between antibiotic disks?", correct: 2, options: ["10 mm", "15 mm", "24 mm center-to-center", "50 mm"] } },
  { id: 5, title: "Incubate (16-18 hours)", description: "Invert the plate and incubate at 35 ± 2°C for 16-18 hours. Do not stack more than 5 plates.", duration: 15, principle: "35°C is optimal for most clinical isolates. 16-18 hours allows sufficient diffusion and growth. CO₂ incubation only for specific organisms (CLSI M100).", hint: "Invert and incubate at 35°C.", mentorTip: "Stack ≤5 plates to ensure even heating. Do NOT read plates early — zones may appear larger than final!", reference: "CLSI M100-S31", requiredInstrument: "incubator" },
  { id: 6, title: "Measure Zone Diameters", description: "Use a ruler or caliper to measure the diameter of each inhibition zone in mm. Include the 6 mm disk diameter.", duration: 10, principle: "Measure the zone where no visible growth is seen. Include the disk itself. Measure to the nearest whole mm. Use reflected light for non-hemolytic organisms (CLSI M100).", hint: "Measure clear zone diameter in mm.", mentorTip: "Hold plate against dark background with reflected light. Ignore a faint haze or single colonies within the zone — those may indicate resistant mutants.", reference: "CLSI M100; WHO AST Manual", requiredInstrument: "ruler", quiz: { question: "How should zone diameters be measured in disk diffusion AST?", correct: 0, options: ["Including the disk diameter, to the nearest whole mm", "Excluding the disk, in cm", "Only the clear area radius", "Using a protractor"] } },
  { id: 7, title: "Interpret Results", description: "Compare zone sizes against CLSI M100 breakpoint tables. Classify as Susceptible (S), Intermediate (I), or Resistant (R).", duration: 0, principle: "CLSI breakpoints are organism-specific and updated annually. S = likely to respond to treatment at standard dosage. I = may respond at higher dosage or in body sites where drug concentrates. R = unlikely to respond (CLSI M100).", hint: "Compare zones to CLSI breakpoints.", mentorTip: "Always use current year's CLSI tables! Breakpoints change. Report unusual resistance patterns to infection control.", reference: "CLSI M100-S31; WHO AMR Guidelines", requiredInstrument: "clsi" },
];

function MHAPlate({ showLawn, showDisks, showZones }: { showLawn: boolean; showDisks: boolean; showZones: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.1, 64]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.06, 64]} />
        <meshStandardMaterial color={showLawn ? "#d4c87a" : "#c4a35a"} />
      </mesh>
      {showLawn && (
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[1.85, 1.85, 0.01, 64]} />
          <meshStandardMaterial color="#e8dfa0" transparent opacity={0.6} />
        </mesh>
      )}
      {showDisks && antibiotics.map((ab, i) => {
        const angle = (i / antibiotics.length) * Math.PI * 2;
        const r = 1.1;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        return (
          <group key={ab.code} position={[x, 0.08, z]}>
            {showZones && (
              <mesh position={[0, -0.02, 0]}>
                <cylinderGeometry args={[ab.zone / 35, ab.zone / 35, 0.01, 32]} />
                <meshStandardMaterial color="#c4a35a" transparent opacity={0.8} />
              </mesh>
            )}
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
              <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            <Text position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color="#333" anchorX="center" anchorY="middle">
              {ab.code}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function ASTSimulator3D() {
  return (
    <SimulatorShell
      title="Antibiotic Susceptibility Testing — Kirby-Bauer Disk Diffusion"
      icon={<Target className="h-5 w-5 text-primary" />}
      references={["CLSI M100", "WHO", "Cappuccino & Welsh"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr><th className="p-2 text-left">Antibiotic</th><th className="p-2">Zone</th><th className="p-2">S ≥</th><th className="p-2">R ≤</th><th className="p-2">Result</th></tr>
            </thead>
            <tbody>
              {antibiotics.map(ab => (
                <tr key={ab.code} className="border-t">
                  <td className="p-2">{ab.name} ({ab.code})</td>
                  <td className="p-2 text-center font-mono">{ab.zone}</td>
                  <td className="p-2 text-center">{ab.breakpoint.s}</td>
                  <td className="p-2 text-center">{ab.breakpoint.r}</td>
                  <td className={`p-2 text-center font-bold ${ab.result === "S" ? "text-green-600" : "text-destructive"}`}>{ab.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    >
      {({ currentStep }) => {
        const showLawn = currentStep >= 1;
        const showDisks = currentStep >= 3;
        const showZones = currentStep >= 5;
        return (
          <Canvas camera={{ position: [2.5, 3, 2.5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <MHAPlate showLawn={showLawn} showDisks={showDisks} showZones={showZones} />
            <OrbitControls enablePan={false} />
          </Canvas>
        );
      }}
    </SimulatorShell>
  );
}
