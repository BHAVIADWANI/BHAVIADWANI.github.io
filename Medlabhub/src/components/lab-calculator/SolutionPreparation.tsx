import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorCard } from "./CalculatorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MolarSolution() {
  const [molarity, setMolarity] = useState(0);
  const [mw, setMw] = useState(0);
  const [volume, setVolume] = useState(0);
  const mass = molarity * mw * volume;
  const steps = mass ? [
    `Mass = Molarity × MW × Volume`,
    `Mass = ${molarity} × ${mw} × ${volume}`,
    `Mass = ${mass.toFixed(4)} g`,
    `Dissolve ${mass.toFixed(4)} g in distilled water and make up to ${(volume * 1000).toFixed(0)} mL`
  ] : [];
  return (
    <CalculatorCard title="Molar Solution Preparation" formula="Mass (g) = Molarity × MW × Volume (L)" reference="Tietz Clinical Chemistry" result={mass ? `${mass.toFixed(4)} g needed` : undefined} steps={steps}>
      <div><Label className="text-xs">Desired Molarity (M)</Label><Input type="number" onChange={e => setMolarity(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Molecular Weight (g/mol)</Label><Input type="number" onChange={e => setMw(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Final Volume (L)</Label><Input type="number" onChange={e => setVolume(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function NormalSolution() {
  const [normality, setNormality] = useState(0);
  const [ew, setEw] = useState(0);
  const [volume, setVolume] = useState(0);
  const mass = normality * ew * volume;
  return (
    <CalculatorCard title="Normal Solution Preparation" formula="Mass (g) = Normality × EW × Volume (L)" reference="CLSI Standards" result={mass ? `${mass.toFixed(4)} g needed` : undefined}
      steps={mass ? [`Mass = ${normality} × ${ew} × ${volume} = ${mass.toFixed(4)} g`] : []}>
      <div><Label className="text-xs">Desired Normality (N)</Label><Input type="number" onChange={e => setNormality(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Equivalent Weight (g/eq)</Label><Input type="number" onChange={e => setEw(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Final Volume (L)</Label><Input type="number" onChange={e => setVolume(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function BufferPrep() {
  const [acidConc, setAcidConc] = useState(0);
  const [baseConc, setBaseConc] = useState(0);
  const [pka, setPka] = useState(0);
  const ph = pka && baseConc && acidConc ? (pka + Math.log10(baseConc / acidConc)).toFixed(4) : "";
  return (
    <CalculatorCard title="Buffer pH (Henderson-Hasselbalch)" formula="pH = pKa + log([A⁻]/[HA])" reference="Tietz Clinical Chemistry" result={ph ? `pH = ${ph}` : undefined}
      steps={ph ? [`pH = ${pka} + log(${baseConc}/${acidConc}) = ${ph}`] : []}>
      <div><Label className="text-xs">pKa</Label><Input type="number" step="any" onChange={e => setPka(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">[A⁻] Base (M)</Label><Input type="number" step="any" onChange={e => setBaseConc(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">[HA] Acid (M)</Label><Input type="number" step="any" onChange={e => setAcidConc(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function StockDilution() {
  const [c1, setC1] = useState(0);
  const [c2, setC2] = useState(0);
  const [v2, setV2] = useState(0);
  const v1 = c1 ? ((c2 * v2) / c1).toFixed(4) : "";
  return (
    <CalculatorCard title="Stock Solution Dilution" formula="V1 = (C2 × V2) / C1" reference="WHO Laboratory Manual" result={v1 ? `Take ${v1} mL of stock, add water to ${v2} mL` : undefined}
      steps={v1 ? [`V1 = (${c2} × ${v2}) / ${c1} = ${v1} mL`] : []}>
      <div><Label className="text-xs">Stock Concentration (C1)</Label><Input type="number" onChange={e => setC1(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Desired Concentration (C2)</Label><Input type="number" onChange={e => setC2(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Final Volume (V2 mL)</Label><Input type="number" onChange={e => setV2(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

export function SolutionPreparation() {
  return (
    <Tabs defaultValue="molar">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        <TabsTrigger value="molar" className="text-xs">Molar Solution</TabsTrigger>
        <TabsTrigger value="normal" className="text-xs">Normal Solution</TabsTrigger>
        <TabsTrigger value="buffer" className="text-xs">Buffer pH</TabsTrigger>
        <TabsTrigger value="stock" className="text-xs">Stock Dilution</TabsTrigger>
      </TabsList>
      <TabsContent value="molar"><MolarSolution /></TabsContent>
      <TabsContent value="normal"><NormalSolution /></TabsContent>
      <TabsContent value="buffer"><BufferPrep /></TabsContent>
      <TabsContent value="stock"><StockDilution /></TabsContent>
    </Tabs>
  );
}
