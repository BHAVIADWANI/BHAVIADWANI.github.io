// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Environment } from "@react-three/drei";
import { Dna } from "lucide-react";
import * as THREE from "three";
import { SimulatorShell, SimStep, SimInstrument } from "./SimulatorShell";

const instruments: SimInstrument[] = [
  { key: "edta_tube", label: "EDTA Blood Tube", color: "#dc2626" },
  { key: "lysis_buffer", label: "RBC Lysis Buffer", color: "#aa3355" },
  { key: "centrifuge", label: "Centrifuge", color: "#9ca3af" },
  { key: "pipette", label: "Micropipette", color: "#6b7280" },
  { key: "proteinase_k", label: "Proteinase K + SDS", color: "#f59e0b" },
  { key: "phenol_chcl3", label: "Phenol-Chloroform", color: "#ccaa44" },
  { key: "ethanol", label: "Ice-Cold Ethanol", color: "#d0e0f0" },
  { key: "glass_rod", label: "Glass Rod", color: "#e8e8ff" },
  { key: "wash_ethanol", label: "70% Ethanol", color: "#c0d0e8" },
  { key: "te_buffer", label: "TE Buffer (pH 8.0)", color: "#93c5fd" },
  { key: "nanodrop", label: "NanoDrop", color: "#22c55e" },
];

const steps: SimStep[] = [
  { id: 1, title: "Collect Blood Sample", description: "Collect 5 mL EDTA blood and transfer to a sterile tube.", duration: 5, principle: "EDTA is the preferred anticoagulant for DNA extraction as it chelates Mg²⁺, inhibiting DNases that would degrade DNA. K₂EDTA is recommended (Sambrook & Russell, Molecular Cloning).", hint: "Collect EDTA blood sample.", mentorTip: "Mix gently by inversion. Vigorous mixing causes shearing of high-molecular-weight DNA!", reference: "Sambrook & Russell, Molecular Cloning, 3rd Ed.", requiredInstrument: "edta_tube" },
  { id: 2, title: "Add Lysis Buffer", description: "Add RBC lysis buffer (NH₄Cl) to lyse red blood cells. Mix gently.", duration: 10, principle: "RBC lysis buffer (ammonium chloride, 155 mM) selectively lyses RBCs by osmotic shock while preserving WBC nuclei. This removes hemoglobin which inhibits downstream reactions (Sambrook & Russell).", hint: "Add lysis buffer to remove RBCs.", mentorTip: "Incubate on ice for 10-15 min. Check for clearing — solution should become translucent when RBCs are fully lysed.", reference: "Sambrook & Russell", requiredInstrument: "lysis_buffer", quiz: { question: "Why is RBC lysis the first step in DNA extraction from blood?", correct: 1, options: ["To release DNA from RBCs", "To remove hemoglobin (a PCR inhibitor) and isolate WBC pellet", "To denature proteins", "To precipitate DNA"] } },
  { id: 3, title: "Centrifuge (10 min)", description: "Centrifuge at 3000 rpm for 10 min to pellet WBC.", duration: 12, principle: "Centrifugation pellets WBCs (which contain nuclear DNA) while lysed RBC membranes and hemoglobin remain in the supernatant.", hint: "Centrifuge to pellet WBCs.", mentorTip: "Balance the centrifuge! White pellet = WBCs. If pellet is red, repeat the lysis step.", reference: "Sambrook & Russell", requiredInstrument: "centrifuge" },
  { id: 4, title: "Discard Supernatant", description: "Carefully remove supernatant. Keep the WBC pellet.", duration: 5, principle: "The supernatant contains lysed RBC debris and hemoglobin. The white WBC pellet at the bottom contains the genomic DNA within intact nuclei.", hint: "Remove supernatant, keep pellet.", mentorTip: "Pour off carefully — don't disturb the pellet! A small amount of residual supernatant is OK.", reference: "Sambrook & Russell", requiredInstrument: "pipette" },
  { id: 5, title: "Add Proteinase K + SDS", description: "Add Proteinase K (200 µg/mL) and SDS (1%) to digest proteins. Incubate at 56°C overnight.", duration: 15, principle: "SDS (sodium dodecyl sulfate) lyses WBC membranes and denatures proteins. Proteinase K digests denatured proteins (especially histones and nucleases), liberating DNA from the chromatin complex (Sambrook & Russell).", hint: "Digest proteins with Proteinase K.", mentorTip: "56°C is optimal for Proteinase K. Overnight incubation ensures complete digestion. Solution should become clear and viscous.", reference: "Sambrook & Russell; CLSI MM13", requiredInstrument: "proteinase_k", quiz: { question: "What is the role of Proteinase K in DNA extraction?", correct: 2, options: ["To lyse RBCs", "To precipitate DNA", "To digest proteins (histones, nucleases) bound to DNA", "To denature DNA"] } },
  { id: 6, title: "Add Phenol-Chloroform", description: "Add equal volume phenol:chloroform:isoamyl alcohol (25:24:1). Mix by inversion.", duration: 10, principle: "Phenol denatures and partitions proteins into the organic phase. Chloroform stabilizes the interface. Isoamyl alcohol reduces foaming. DNA remains in the aqueous (upper) phase (Sambrook & Russell).", hint: "Add phenol-chloroform and mix.", mentorTip: "⚠️ SAFETY: Phenol is corrosive! Work in fume hood with gloves. Mix by gentle inversion — don't vortex (shears DNA).", reference: "Sambrook & Russell", requiredInstrument: "phenol_chcl3", quiz: { question: "In phenol-chloroform extraction, where does DNA partition?", correct: 0, options: ["Upper aqueous phase", "Lower organic phase", "Interface", "It precipitates out"] } },
  { id: 7, title: "Centrifuge (15 min)", description: "Centrifuge at 12,000 rpm for 15 min. Carefully collect the upper aqueous phase.", duration: 12, principle: "High-speed centrifugation creates three layers: upper aqueous (DNA), white interface (denatured proteins), lower organic (phenol + lipids). Only the aqueous phase is collected.", hint: "Collect upper aqueous phase only.", mentorTip: "Use a wide-bore pipette tip to avoid shearing. Don't touch the interface — protein contamination reduces DNA purity.", reference: "Sambrook & Russell", requiredInstrument: "centrifuge" },
  { id: 8, title: "Add Chilled Ethanol", description: "Add 2× volume ice-cold absolute ethanol. DNA precipitates as white strands.", duration: 10, principle: "Ethanol reduces water activity, causing DNA to precipitate out of solution. Adding 1/10 volume 3M sodium acetate (pH 5.2) provides cations to neutralize DNA's negative charges, facilitating precipitation (Sambrook & Russell).", hint: "Add cold ethanol to precipitate DNA.", mentorTip: "🧬 You should see white, stringy DNA precipitate! If not visible, add more sodium acetate and incubate at -20°C for 30 min.", reference: "Sambrook & Russell", requiredInstrument: "ethanol" },
  { id: 9, title: "Spool DNA", description: "Use a glass rod to gently spool the precipitated DNA strands.", duration: 8, principle: "High-molecular-weight genomic DNA forms visible strands that can be wound around a glass rod. This 'spooling' method selectively collects DNA while leaving smaller RNA and contaminants behind.", hint: "Spool DNA on glass rod.", mentorTip: "Rotate the rod slowly in one direction — DNA wraps around it like cotton candy! This is a beautiful moment in molecular biology.", reference: "Sambrook & Russell", requiredInstrument: "glass_rod" },
  { id: 10, title: "Wash with 70% Ethanol", description: "Wash DNA pellet with 70% ethanol to remove co-precipitated salts.", duration: 6, principle: "70% ethanol removes salts (NaCl, sodium acetate) while keeping DNA precipitated. 100% ethanol would not dissolve salts effectively. This wash improves A260/A230 ratio.", hint: "Wash with 70% ethanol.", mentorTip: "Don't over-dry after washing — completely dry DNA is very difficult to redissolve!", reference: "Sambrook & Russell", requiredInstrument: "wash_ethanol" },
  { id: 11, title: "Air Dry Pellet", description: "Air dry the DNA pellet for 5 minutes at room temperature.", duration: 8, principle: "Residual ethanol must evaporate as it inhibits downstream enzymatic reactions (restriction digestion, PCR). Brief air drying is sufficient — over-drying makes DNA insoluble.", hint: "Air dry briefly.", mentorTip: "5 min max! DNA should look translucent, not white and flaky. Over-dried DNA won't dissolve.", reference: "Sambrook & Russell" },
  { id: 12, title: "Dissolve in TE Buffer", description: "Dissolve purified DNA in TE buffer (10 mM Tris, 1 mM EDTA, pH 8.0). Store at -20°C.", duration: 5, principle: "TE buffer (pH 8.0) keeps DNA in solution and stable. Tris maintains pH. EDTA chelates Mg²⁺ required by DNases, protecting DNA from degradation. Store at -20°C for long-term (Sambrook & Russell).", hint: "Dissolve in TE buffer.", mentorTip: "Let DNA dissolve at 4°C overnight for best results. Don't vortex — gentle pipetting only!", reference: "Sambrook & Russell", requiredInstrument: "te_buffer" },
  { id: 13, title: "Check on NanoDrop", description: "Measure A260/A280 ratio. Pure DNA: 1.8 ± 0.1. Concentration should be adequate for downstream use.", duration: 0, principle: "UV spectrophotometry: A260 measures nucleic acids. A260/A280 = 1.8 indicates pure DNA (protein contamination lowers this). A260/A230 > 2.0 indicates no salt/phenol contamination. Concentration (ng/µL) = A260 × 50 × dilution factor.", hint: "Check purity with NanoDrop.", mentorTip: "🔬 Target: A260/A280 = 1.8 ± 0.1, concentration > 50 ng/µL. If ratio < 1.6, re-extract with phenol-chloroform.", reference: "Sambrook & Russell; CLSI MM13", requiredInstrument: "nanodrop" },
];

function TestTube3D({ position, liquidColor, liquidHeight, label, isActive, isSpinning }: {
  position: [number, number, number]; liquidColor: string; liquidHeight: number; label: string; isActive: boolean; isSpinning: boolean;
}) {
  const tubeRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (tubeRef.current && isSpinning) tubeRef.current.rotation.y += delta * 8; });
  return (
    <group position={position} ref={tubeRef}>
      <mesh><cylinderGeometry args={[0.12, 0.08, 1.2, 16]} /><meshPhysicalMaterial color="#e8e8f0" transparent opacity={0.35} roughness={0.05} transmission={0.4} /></mesh>
      <mesh position={[0, -0.3 + liquidHeight * 0.3, 0]}><cylinderGeometry args={[0.1, 0.07, liquidHeight * 0.6, 16]} /><meshStandardMaterial color={liquidColor} transparent opacity={0.8} /></mesh>
      {isActive && <pointLight position={[0, 0, 0.3]} intensity={0.5} color={liquidColor} distance={1} />}
      <Text position={[0, -0.8, 0]} fontSize={0.06} color="#666">{label}</Text>
    </group>
  );
}

function Centrifuge3D({ position, isRunning }: { position: [number, number, number]; isRunning: boolean }) {
  const rotorRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (rotorRef.current && isRunning) rotorRef.current.rotation.y += delta * 15; });
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.5, 0.5, 0.3, 32]} /><meshStandardMaterial color="#a0a0b0" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.52, 0.52, 0.05, 32]} /><meshStandardMaterial color="#b0b0c0" metalness={0.8} roughness={0.2} /></mesh>
      <mesh ref={rotorRef} position={[0, 0.05, 0]}><torusGeometry args={[0.3, 0.04, 8, 6]} /><meshStandardMaterial color="#707080" metalness={0.9} /></mesh>
      <mesh position={[0.4, 0.1, 0.3]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={isRunning ? "#00ff44" : "#444"} /></mesh>
      <Text position={[0, -0.3, 0.5]} fontSize={0.06} color="#666">Centrifuge</Text>
    </group>
  );
}

function DNAStrands({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.children.forEach((child, i) => { child.position.y = Math.sin(state.clock.elapsedTime + i * 0.5) * 0.1; });
    }
  });
  if (!visible) return null;
  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.8) * 0.15, i * 0.05 - 0.2, Math.cos(i * 0.8) * 0.15]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} /><meshStandardMaterial color="#f0f0ff" emissive="#aabbff" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Text position={[0, 0.4, 0]} fontSize={0.08} color="#4466cc">DNA Precipitate</Text>
    </group>
  );
}

function NanoDropView({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[0, 1.5, 0]}>
      <mesh><planeGeometry args={[2, 1.2]} /><meshBasicMaterial color="#111822" /></mesh>
      <Text position={[0, 0.35, 0.01]} fontSize={0.09} color="#00ff88">NanoDrop Result</Text>
      <Text position={[0, 0.1, 0.01]} fontSize={0.07} color="#88ccff">A260/A280 = 1.82</Text>
      <Text position={[0, -0.1, 0.01]} fontSize={0.07} color="#88ccff">Concentration: 145.3 ng/µL</Text>
      <Text position={[0, -0.3, 0.01]} fontSize={0.06} color="#00ff66">✓ Pure genomic DNA</Text>
    </group>
  );
}

function LabScene({ currentStep, isTimerActive }: { currentStep: number; isTimerActive: boolean }) {
  const step = steps[currentStep];
  const isSpinning = isTimerActive && (step?.title.includes("Centrifuge"));
  const showDNA = currentStep >= 7;
  const showNanoDrop = step?.title === "Check on NanoDrop";
  const getLiquidColor = () => {
    if (currentStep < 2) return "#cc2244";
    if (currentStep < 4) return "#dd6666";
    if (currentStep < 6) return "#aa8866";
    if (currentStep < 7) return "#ccbb88";
    if (currentStep < 9) return "#e8e8f0";
    return "#c0d0e8";
  };
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[-3, 4, -2]} intensity={0.3} color="#e0d0f0" />
      <mesh position={[0, -0.5, 0]} receiveShadow><boxGeometry args={[5, 0.1, 3]} /><meshStandardMaterial color="#d4c4a8" /></mesh>
      {!showNanoDrop && (
        <TestTube3D position={[0, 0.3, 0]} liquidColor={getLiquidColor()} liquidHeight={0.7} label="Sample" isActive={isTimerActive} isSpinning={false} />
      )}
      {step?.title === "Add Lysis Buffer" && <TestTube3D position={[-0.8, 0.3, 0]} liquidColor="#aa3355" liquidHeight={0.5} label="Lysis Buffer" isActive isSpinning={false} />}
      {step?.title === "Add Phenol-Chloroform" && <TestTube3D position={[-0.8, 0.3, 0]} liquidColor="#ccaa44" liquidHeight={0.6} label="Phenol-CHCl₃" isActive isSpinning={false} />}
      {step?.title === "Add Chilled Ethanol" && <TestTube3D position={[-0.8, 0.3, 0]} liquidColor="#d0e0f0" liquidHeight={0.5} label="Ice Ethanol" isActive isSpinning={false} />}
      <Centrifuge3D position={[1.5, -0.2, 0]} isRunning={isSpinning} />
      <DNAStrands visible={showDNA && !showNanoDrop} />
      {step?.title === "Spool DNA" && (
        <mesh position={[0.3, 0.8, 0]}><cylinderGeometry args={[0.02, 0.02, 1.5, 8]} /><meshPhysicalMaterial color="#e8e8ff" transparent opacity={0.5} transmission={0.5} /></mesh>
      )}
      <NanoDropView visible={showNanoDrop} />
      {!showNanoDrop && <Text position={[0, 2, 0]} fontSize={0.12} color="#333" maxWidth={4} textAlign="center">{step?.title || "Complete"}</Text>}
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={7} />
      <Environment preset="studio" />
    </>
  );
}

export function DNAExtraction3D() {
  return (
    <SimulatorShell
      title="DNA Extraction — Phenol-Chloroform Method"
      icon={<Dna className="h-5 w-5 text-primary" />}
      references={["Sambrook & Russell", "CLSI MM13", "WHO"]}
      steps={steps}
      instruments={instruments}
      renderResults={() => (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ A260/A280 = <strong className="text-foreground">1.82</strong> (Pure DNA: 1.8 ± 0.1)</p>
          <p>✅ Concentration: <strong className="text-foreground">145.3 ng/µL</strong></p>
          <p>✅ Pure genomic DNA ready for PCR, restriction digestion, or sequencing</p>
        </div>
      )}
    >
      {({ currentStep, isTimerActive }) => (
        <Canvas camera={{ position: [0, 2, 4.5], fov: 45 }}>
          <LabScene currentStep={currentStep} isTimerActive={isTimerActive} />
        </Canvas>
      )}
    </SimulatorShell>
  );
}
