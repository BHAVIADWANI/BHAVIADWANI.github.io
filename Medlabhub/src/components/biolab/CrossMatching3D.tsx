// @ts-nocheck
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Heart } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "blood_tubes", label: "Blood Collection Tubes", color: "#dc2626" },
  { key: "saline", label: "Normal Saline", color: "#93c5fd" },
  { key: "centrifuge", label: "Centrifuge", color: "#9ca3af" },
  { key: "patient_serum", label: "Patient Serum", color: "#fbbf24" },
  { key: "donor_cells", label: "Donor RBC Suspension", color: "#ef4444" },
  { key: "donor_serum", label: "Donor Serum", color: "#f59e0b" },
  { key: "patient_cells", label: "Patient RBC Suspension", color: "#dc2626" },
  { key: "liss", label: "LISS / Albumin", color: "#8b5cf6" },
  { key: "ahg", label: "AHG (Coombs) Reagent", color: "#166534" },
  { key: "magnifier", label: "Reading Lens", color: "#6b7280" },
];

const steps: SimStep[] = [
  { id: 1, title: "Collect Patient Sample", description: "Collect 5 mL clotted blood (serum) and EDTA blood (cells) from the patient.", duration: 8, principle: "Two samples needed: clotted blood for serum (contains antibodies) and EDTA blood for RBC suspension. EDTA preserves cell integrity better than other anticoagulants (AABB Technical Manual, 20th Ed.).", hint: "Collect serum and EDTA blood.", mentorTip: "Separate serum within 2 hours. Hemolyzed samples are unacceptable — hemolysis masks agglutination!", reference: "AABB Technical Manual, 20th Ed.", requiredInstrument: "blood_tubes" },
  { id: 2, title: "Prepare Cell Suspensions", description: "Prepare 2-5% cell suspensions: patient's RBCs and donor's RBCs in saline. Wash cells 3 times.", duration: 10, principle: "Washing removes plasma proteins and complement that could cause false results. 2-5% suspension is optimal for visual agglutination reading. Over-concentrated suspensions mask weak reactions (AABB).", hint: "Wash and prepare 2-5% suspensions.", mentorTip: "Wash 3× with normal saline! Inadequate washing = false positives from complement or fibrinogen.", reference: "AABB Technical Manual", requiredInstrument: "saline", quiz: { question: "Why must RBCs be washed before cross-matching?", correct: 1, options: ["To remove hemoglobin", "To remove plasma proteins and complement that cause false results", "To increase cell concentration", "To kill bacteria"] } },
  { id: 3, title: "Major Cross-Match Setup", description: "Add 2 drops patient's serum + 1 drop donor's RBC suspension in a labeled tube.", duration: 8, principle: "MAJOR cross-match detects antibodies in the PATIENT's serum that would react with DONOR's RBCs. This is the most critical test — incompatible transfusion can cause fatal hemolytic reactions (AABB).", hint: "Patient serum + Donor cells.", mentorTip: "⚠️ The MAJOR cross-match is the most important! It protects the PATIENT from incompatible donor blood.", reference: "AABB Technical Manual", requiredInstrument: "patient_serum", quiz: { question: "What does the major cross-match detect?", correct: 0, options: ["Antibodies in patient serum against donor RBCs", "Antibodies in donor serum against patient RBCs", "ABO blood group", "Rh factor"] } },
  { id: 4, title: "Minor Cross-Match Setup", description: "Add 2 drops donor's serum/plasma + 1 drop patient's RBC suspension in another tube.", duration: 8, principle: "MINOR cross-match detects antibodies in the DONOR's serum against PATIENT's RBCs. Less critical because donor antibodies are diluted in the patient's plasma volume, but still important (AABB).", hint: "Donor serum + Patient cells.", mentorTip: "Minor cross-match is less critical but still important — especially with whole blood transfusion!", reference: "AABB Technical Manual", requiredInstrument: "donor_serum" },
  { id: 5, title: "Immediate Spin Phase", description: "Centrifuge both tubes at 1000 rpm for 1 minute. Gently resuspend and check for agglutination or hemolysis.", duration: 10, principle: "Immediate spin (IS) phase detects ABO incompatibility and other IgM antibodies (anti-A, anti-B, anti-M, anti-N). Most acute hemolytic reactions are caught here (AABB).", hint: "Centrifuge and check for clumping.", mentorTip: "Gently resuspend the button — don't shake! Look for agglutination AND hemolysis (pink supernatant).", reference: "AABB Technical Manual; WHO Blood Safety", requiredInstrument: "centrifuge" },
  { id: 6, title: "Incubation Phase (37°C)", description: "Add 2 drops LISS (Low Ionic Strength Solution) or 22% albumin. Incubate at 37°C for 15-30 minutes.", duration: 15, principle: "37°C enhances IgG antibody binding (warm antibodies: anti-D, anti-K, anti-Fy, anti-Jk). LISS reduces the zeta potential, allowing IgG molecules to bridge between RBCs more easily (AABB).", hint: "Add LISS and incubate at 37°C.", mentorTip: "LISS shortens incubation to 10-15 min vs 30-60 min with albumin. Both enhance IgG sensitization.", reference: "AABB Technical Manual", requiredInstrument: "liss", quiz: { question: "What type of antibodies are enhanced at the 37°C incubation phase?", correct: 2, options: ["IgA antibodies", "IgM (cold) antibodies", "IgG (warm) antibodies like anti-D, anti-K", "IgE antibodies"] } },
  { id: 7, title: "AHG (Coombs) Phase", description: "Wash cells 3-4 times with saline. Add 2 drops Anti-Human Globulin (AHG/Coombs) reagent. Centrifuge and read.", duration: 12, principle: "AHG (Coombs) reagent bridges IgG-coated RBCs, making agglutination visible. Washing is critical — residual serum neutralizes AHG, causing false negatives. This phase detects clinically significant antibodies (AABB).", hint: "Wash thoroughly, add AHG, read.", mentorTip: "⚠️ CRITICAL: 3-4 washes with LARGE volumes of saline! Residual protein neutralizes AHG → false negative → potentially fatal incompatible transfusion!", reference: "AABB Technical Manual", requiredInstrument: "ahg" },
  { id: 8, title: "Read and Interpret", description: "Grade agglutination: 0 (compatible) to 4+ (strongly incompatible). No agglutination in any phase = compatible.", duration: 0, principle: "Grading: 4+ = one solid clump, clear background. 3+ = large clumps, clear. 2+ = medium clumps, slightly turbid. 1+ = small clumps, turbid. 0 = no agglutination = COMPATIBLE. Any positive = INCOMPATIBLE (AABB).", hint: "Grade agglutination 0 to 4+.", mentorTip: "Add IgG-coated check cells to all NEGATIVE AHG tests to confirm AHG was active. If check cells don't agglutinate, the AHG was neutralized — REPEAT the entire test!", reference: "AABB Technical Manual; WHO", requiredInstrument: "magnifier" },
];

function CrossMatchTubes({ phase }: { phase: number }) {
  const tubeData = [
    { label: "Major", pos: [-0.6, 0, 0] as [number, number, number] },
    { label: "Minor", pos: [0.6, 0, 0] as [number, number, number] },
  ];
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[2, 0.15, 0.6]} />
        <meshStandardMaterial color="#666" metalness={0.4} />
      </mesh>
      {tubeData.map((tube) => (
        <group key={tube.label} position={tube.pos}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 1.0, 16, 1, true]} />
            <meshStandardMaterial color="#ddd" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {phase >= 1 && (
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.3, 16]} />
              <meshStandardMaterial color="#fbbf24" transparent opacity={0.5} />
            </mesh>
          )}
          {phase >= 1 && (
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
              <meshStandardMaterial color="#dc2626" transparent opacity={0.7} />
            </mesh>
          )}
          {phase >= 5 && (
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
              <meshStandardMaterial color="#22c55e" transparent opacity={0.4} />
            </mesh>
          )}
          <Text position={[0, 1.1, 0.12]} fontSize={0.1} color="#666" anchorX="center">
            {tube.label}
          </Text>
        </group>
      ))}
      {phase >= 5 && (
        <group position={[1.8, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.7, 16]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          <Text position={[0, 0.8, 0.16]} fontSize={0.07} color="#22c55e" anchorX="center">AHG</Text>
        </group>
      )}
    </group>
  );
}

export function CrossMatching3D() {
  return (
    <SimulatorShell
      title="Cross-Matching — IAT (Indirect Antiglobulin Test)"
      icon={<Heart className="h-5 w-5 text-primary" />}
      references={["AABB Technical Manual", "WHO Blood Safety"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border rounded">
              <p className="font-medium">Major Cross-Match</p>
              <p className="text-green-600 font-bold">Compatible (0)</p>
              <p className="text-muted-foreground">No agglutination in IS, 37°C, or AHG phase</p>
            </div>
            <div className="p-2 border rounded">
              <p className="font-medium">Minor Cross-Match</p>
              <p className="text-green-600 font-bold">Compatible (0)</p>
              <p className="text-muted-foreground">No agglutination detected</p>
            </div>
          </div>
          <p className="text-green-700 dark:text-green-400 font-medium">✅ Blood unit is compatible for transfusion</p>
        </div>
      )}
    >
      {({ currentStep }) => {
        const phase = currentStep >= 6 ? 6 : currentStep >= 5 ? 5 : currentStep >= 4 ? 4 : currentStep >= 2 ? 2 : currentStep >= 1 ? 1 : 0;
        return (
          <Canvas camera={{ position: [2.5, 2, 2.5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <CrossMatchTubes phase={phase} />
            <OrbitControls enablePan={false} />
          </Canvas>
        );
      }}
    </SimulatorShell>
  );
}
