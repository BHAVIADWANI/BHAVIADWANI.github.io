import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorCard } from "./CalculatorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function DNAConcentration() {
  const [a260, setA260] = useState(0);
  const [dilution, setDilution] = useState(1);
  const conc = a260 * 50 * dilution;
  return (
    <CalculatorCard title="DNA Concentration" formula="[DNA] = A260 × 50 µg/mL × Dilution Factor" reference="Sambrook & Russell" result={conc ? `${conc.toFixed(2)} µg/mL` : undefined}
      steps={conc ? [`[DNA] = ${a260} × 50 × ${dilution} = ${conc.toFixed(2)} µg/mL`] : []}>
      <div><Label className="text-xs">A260 Reading</Label><Input type="number" step="any" onChange={e => setA260(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Dilution Factor</Label><Input type="number" value={dilution} onChange={e => setDilution(parseFloat(e.target.value) || 1)} /></div>
    </CalculatorCard>
  );
}

function RNAConcentration() {
  const [a260, setA260] = useState(0);
  const [dilution, setDilution] = useState(1);
  const conc = a260 * 40 * dilution;
  return (
    <CalculatorCard title="RNA Concentration" formula="[RNA] = A260 × 40 µg/mL × Dilution Factor" reference="Sambrook & Russell" result={conc ? `${conc.toFixed(2)} µg/mL` : undefined}
      steps={conc ? [`[RNA] = ${a260} × 40 × ${dilution} = ${conc.toFixed(2)} µg/mL`] : []}>
      <div><Label className="text-xs">A260 Reading</Label><Input type="number" step="any" onChange={e => setA260(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Dilution Factor</Label><Input type="number" value={dilution} onChange={e => setDilution(parseFloat(e.target.value) || 1)} /></div>
    </CalculatorCard>
  );
}

function PCRMasterMix() {
  const [reactions, setReactions] = useState(1);
  const extra = reactions + 1; // one extra for pipetting error
  const buffer10x = 2.5 * extra;
  const dntps = 0.5 * extra;
  const fwdPrimer = 1 * extra;
  const revPrimer = 1 * extra;
  const taq = 0.125 * extra;
  const water = 25 * extra - (buffer10x + dntps + fwdPrimer + revPrimer + taq);
  return (
    <CalculatorCard title="PCR Master Mix" formula="Standard 25 µL reaction × (n+1)" reference="Sambrook & Russell"
      result={reactions ? `Master mix for ${reactions} reactions (+ 1 extra)` : undefined}
      steps={reactions ? [
        `10× Buffer: ${buffer10x.toFixed(1)} µL`,
        `dNTPs (10 mM): ${dntps.toFixed(1)} µL`,
        `Fwd Primer (10 µM): ${fwdPrimer.toFixed(1)} µL`,
        `Rev Primer (10 µM): ${revPrimer.toFixed(1)} µL`,
        `Taq Polymerase: ${taq.toFixed(2)} µL`,
        `Nuclease-free water: ${water.toFixed(1)} µL`,
        `Total: ${(25 * extra).toFixed(1)} µL (aliquot ${(25 - 1).toFixed(0)} µL + 1 µL template per tube)`
      ] : []}>
      <div><Label className="text-xs">Number of Reactions</Label><Input type="number" value={reactions} onChange={e => setReactions(parseInt(e.target.value) || 1)} /></div>
    </CalculatorCard>
  );
}

function PrimerDilution() {
  const [stockNmol, setStockNmol] = useState(0);
  const [desiredConc, setDesiredConc] = useState(100);
  const volume = stockNmol && desiredConc ? ((stockNmol * 1000) / desiredConc).toFixed(1) : "";
  return (
    <CalculatorCard title="Primer Reconstitution" formula="Volume (µL) = (nmol × 1000) / Desired µM" reference="Sambrook & Russell"
      result={volume ? `Add ${volume} µL TE buffer` : undefined}
      steps={volume ? [`V = (${stockNmol} × 1000) / ${desiredConc} = ${volume} µL`] : []}>
      <div><Label className="text-xs">Primer Amount (nmol)</Label><Input type="number" onChange={e => setStockNmol(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Desired Concentration (µM)</Label><Input type="number" value={desiredConc} onChange={e => setDesiredConc(parseFloat(e.target.value) || 100)} /></div>
    </CalculatorCard>
  );
}

function GelLoading() {
  const [dnaConc, setDnaConc] = useState(0);
  const [desiredMass, setDesiredMass] = useState(100);
  const vol = dnaConc ? (desiredMass / dnaConc).toFixed(2) : "";
  return (
    <CalculatorCard title="Gel Loading Calculation" formula="Volume = Desired mass (ng) / Concentration (ng/µL)" reference="Sambrook & Russell"
      result={vol ? `Load ${vol} µL of DNA sample` : undefined}
      steps={vol ? [`V = ${desiredMass} / ${dnaConc} = ${vol} µL`] : []}>
      <div><Label className="text-xs">DNA Concentration (ng/µL)</Label><Input type="number" step="any" onChange={e => setDnaConc(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Desired DNA Mass (ng)</Label><Input type="number" value={desiredMass} onChange={e => setDesiredMass(parseFloat(e.target.value) || 100)} /></div>
    </CalculatorCard>
  );
}

export function MolecularBioCalc() {
  return (
    <Tabs defaultValue="dna">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        <TabsTrigger value="dna" className="text-xs">DNA Conc.</TabsTrigger>
        <TabsTrigger value="rna" className="text-xs">RNA Conc.</TabsTrigger>
        <TabsTrigger value="pcr" className="text-xs">PCR Mix</TabsTrigger>
        <TabsTrigger value="primer" className="text-xs">Primer Dilution</TabsTrigger>
        <TabsTrigger value="gel" className="text-xs">Gel Loading</TabsTrigger>
      </TabsList>
      <TabsContent value="dna"><DNAConcentration /></TabsContent>
      <TabsContent value="rna"><RNAConcentration /></TabsContent>
      <TabsContent value="pcr"><PCRMasterMix /></TabsContent>
      <TabsContent value="primer"><PrimerDilution /></TabsContent>
      <TabsContent value="gel"><GelLoading /></TabsContent>
    </Tabs>
  );
}
