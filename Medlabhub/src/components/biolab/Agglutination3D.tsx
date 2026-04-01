// @ts-nocheck
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Shield } from "lucide-react";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "slide", label: "Glass Slide", color: "#e8e8e8" },
  { key: "antigen", label: "Antigen Suspension", color: "#f5f5dc" },
  { key: "serum", label: "Patient Serum", color: "#fbbf24" },
  { key: "saline", label: "Normal Saline", color: "#93c5fd" },
  { key: "stick", label: "Applicator Stick", color: "#a0845e" },
  { key: "magnifier", label: "Magnifier", color: "#6b7280" },
];

const tests = [
  { name: "Widal Test (Salmonella O)", positive: true, titer: "1:160" },
  { name: "Widal Test (Salmonella H)", positive: true, titer: "1:320" },
  { name: "Brucella", positive: false, titer: "<1:80" },
  { name: "ASO (Anti-Streptolysin O)", positive: true, titer: "1:200" },
];

const steps: SimStep[] = [
  { id: 1, title: "Prepare Slide", description: "Place a clean, grease-free glass slide on the bench. Mark two circles: TEST and CONTROL.", duration: 5, principle: "A grease-free slide ensures proper spreading of reagents. Circles help organize test and control reactions and prevent cross-contamination (Tietz Clinical Chemistry).", hint: "Clean slide, mark two circles.", mentorTip: "Use a wax pencil or marker to draw circles. Ensure the slide is completely dry and grease-free!", reference: "Tietz Textbook of Clinical Chemistry", requiredInstrument: "slide" },
  { id: 2, title: "Add Antigen Suspension", description: "Place one drop of antigen suspension (e.g., Salmonella O/H antigens) in each circle.", duration: 5, principle: "Commercial antigen suspensions contain killed/inactivated organisms or purified antigens. They are standardized to give consistent agglutination reactions (WHO Serology Manual).", hint: "Add antigen to both circles.", mentorTip: "Shake antigen bottle well before use! Settled antigens give false-negative results.", reference: "WHO Manual of Serological Tests", requiredInstrument: "antigen", quiz: { question: "What type of antigen is used in the Widal test?", correct: 1, options: ["Live bacteria", "Killed Salmonella with O and H antigens", "Purified DNA", "Patient's own cells"] } },
  { id: 3, title: "Add Patient Serum", description: "Add one drop of undiluted patient serum to the TEST circle. Add one drop of normal saline to the CONTROL circle.", duration: 5, principle: "Patient serum contains antibodies (if present) that will react with the antigen. The control (saline) rules out autoagglutination of the antigen suspension (Tietz).", hint: "Serum to test, saline to control.", mentorTip: "Always include a negative control! Autoagglutination = invalid test. If control agglutinates, discard and repeat.", reference: "Tietz; WHO Manual", requiredInstrument: "serum" },
  { id: 4, title: "Mix Gently", description: "Using a wooden applicator stick, mix each circle separately in a rotary motion for 1 minute.", duration: 10, principle: "Gentle rotary mixing ensures complete antigen-antibody interaction. Use separate sticks for test and control to prevent false positives from carryover.", hint: "Mix with rotary motion.", mentorTip: "⚠️ Use a SEPARATE stick for each circle! Cross-contamination = false results.", reference: "WHO Serology Manual; Tietz", requiredInstrument: "stick", quiz: { question: "Why must separate applicator sticks be used for test and control?", correct: 0, options: ["To prevent cross-contamination and false results", "To save time", "Because the sticks are single-use", "For better mixing"] } },
  { id: 5, title: "Rock the Slide", description: "Gently tilt the slide back and forth for 2 minutes to facilitate antigen-antibody interaction.", duration: 12, principle: "Rocking increases contact between antigens and antibodies, accelerating the lattice formation required for visible agglutination. The IgM pentamer is most efficient at agglutination (Tietz).", hint: "Tilt slide gently for 2 min.", mentorTip: "Rock gently — don't splash! Read within 2 minutes; drying at edges mimics agglutination.", reference: "Tietz Clinical Chemistry" },
  { id: 6, title: "Observe Agglutination", description: "Examine against a dark background. Positive = granular clumping. Negative = smooth, milky suspension.", duration: 0, principle: "Agglutination = antibody cross-links particulate antigens forming visible clumps. Grading: 4+ (large clumps, clear background), 3+, 2+, 1+ (fine granularity), 0 (smooth/negative). The titer is the highest dilution showing 2+ agglutination (WHO).", hint: "Look for clumping = positive.", mentorTip: "🔍 Use a dark background for reading. Ensure the control is NEGATIVE before reporting test results!", reference: "WHO; Tietz Clinical Chemistry", requiredInstrument: "magnifier" },
];

function SlideView({ showDrops, showMixed, showResult }: { showDrops: boolean; showMixed: boolean; showResult: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[3, 0.05, 1.2]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.8, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[-0.8, 0.04, -0.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.1} color="#333">TEST</Text>
      <mesh position={[0.8, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[0.8, 0.04, -0.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.1} color="#333">CONTROL</Text>
      {showDrops && (
        <>
          <mesh position={[-0.8, 0.04, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
            <meshStandardMaterial color={showResult ? "#e8d5a0" : "#f5f5dc"} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.8, 0.04, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
            <meshStandardMaterial color="#f5f5dc" transparent opacity={0.5} />
          </mesh>
        </>
      )}
      {showResult && [...Array(15)].map((_, i) => {
        const angle = (i * 137.5 * Math.PI) / 180;
        const r = (i * 0.013) % 0.2;
        return (
          <mesh key={`clump-${i}`} position={[-0.8 + Math.cos(angle) * r, 0.06, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.02 + (i * 0.007) % 0.02, 8, 8]} />
            <meshStandardMaterial color="#c4956a" />
          </mesh>
        );
      })}
    </group>
  );
}

export function Agglutination3D() {
  return (
    <SimulatorShell
      title="Agglutination Tests — Slide Method (Widal, ASO, Brucella)"
      icon={<Shield className="h-5 w-5 text-primary" />}
      references={["Tietz", "WHO Serology Manual"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr><th className="p-2 text-left">Test</th><th className="p-2">Titer</th><th className="p-2">Result</th></tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.name} className="border-t">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2 text-center font-mono">{t.titer}</td>
                  <td className={`p-2 text-center font-bold ${t.positive ? "text-destructive" : "text-green-600"}`}>
                    {t.positive ? "Positive" : "Negative"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    >
      {({ currentStep }) => (
        <Canvas camera={{ position: [0, 2.5, 2], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <SlideView showDrops={currentStep >= 1} showMixed={currentStep >= 3} showResult={currentStep >= 5} />
          <OrbitControls enablePan={false} />
        </Canvas>
      )}
    </SimulatorShell>
  );
}
