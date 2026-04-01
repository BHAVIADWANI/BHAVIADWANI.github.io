import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorCard } from "./CalculatorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EnzymeActivity() {
  const [deltaA, setDeltaA] = useState(0);
  const [totalVol, setTotalVol] = useState(0);
  const [epsilon, setEpsilon] = useState(0);
  const [path, setPath] = useState(1);
  const [sampleVol, setSampleVol] = useState(0);
  const activity = epsilon && path && sampleVol ? ((deltaA * totalVol) / (epsilon * path * sampleVol)).toExponential(4) : "";
  return (
    <CalculatorCard title="Enzyme Activity (IU/L)" formula="Activity = (ΔA/min × Vt) / (ε × l × Vs)" reference="Tietz Clinical Chemistry"
      result={activity ? `${activity} IU/L` : undefined}
      steps={activity ? [`Activity = (${deltaA} × ${totalVol}) / (${epsilon} × ${path} × ${sampleVol}) = ${activity}`] : []}>
      <div><Label className="text-xs">ΔA/min</Label><Input type="number" step="any" onChange={e => setDeltaA(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Total Volume (mL)</Label><Input type="number" step="any" onChange={e => setTotalVol(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Molar Absorptivity (ε)</Label><Input type="number" step="any" onChange={e => setEpsilon(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Path Length (cm)</Label><Input type="number" value={path} onChange={e => setPath(parseFloat(e.target.value) || 1)} /></div>
      <div><Label className="text-xs">Sample Volume (mL)</Label><Input type="number" step="any" onChange={e => setSampleVol(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function BeerLambert() {
  const [absStd, setAbsStd] = useState(0);
  const [absSample, setAbsSample] = useState(0);
  const [concStd, setConcStd] = useState(0);
  const result = absStd ? ((absSample / absStd) * concStd).toFixed(4) : "";
  return (
    <CalculatorCard title="Concentration (Beer-Lambert)" formula="C(sample) = (A(sample) / A(std)) × C(std)" reference="Tietz Clinical Chemistry"
      result={result ? `${result}` : undefined}
      steps={result ? [`C = (${absSample} / ${absStd}) × ${concStd} = ${result}`] : []}>
      <div><Label className="text-xs">Absorbance (Standard)</Label><Input type="number" step="any" onChange={e => setAbsStd(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Absorbance (Sample)</Label><Input type="number" step="any" onChange={e => setAbsSample(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Concentration (Standard)</Label><Input type="number" step="any" onChange={e => setConcStd(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function AnionGap() {
  const [na, setNa] = useState(0);
  const [cl, setCl] = useState(0);
  const [hco3, setHco3] = useState(0);
  const gap = na ? (na - (cl + hco3)).toFixed(1) : "";
  return (
    <CalculatorCard title="Anion Gap" formula="AG = Na⁺ - (Cl⁻ + HCO₃⁻)" reference="Tietz Clinical Chemistry"
      result={gap ? `${gap} mEq/L (Normal: 8–12)` : undefined}
      steps={gap ? [`AG = ${na} - (${cl} + ${hco3}) = ${gap} mEq/L`] : []}>
      <div><Label className="text-xs">Na⁺ (mEq/L)</Label><Input type="number" step="any" onChange={e => setNa(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Cl⁻ (mEq/L)</Label><Input type="number" step="any" onChange={e => setCl(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">HCO₃⁻ (mEq/L)</Label><Input type="number" step="any" onChange={e => setHco3(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function OsmolalityCalc() {
  const [na, setNa] = useState(0);
  const [glucose, setGlucose] = useState(0);
  const [bun, setBun] = useState(0);
  const osm = na ? (2 * na + glucose / 18 + bun / 2.8).toFixed(1) : "";
  return (
    <CalculatorCard title="Calculated Osmolality" formula="Osm = 2(Na⁺) + Glucose/18 + BUN/2.8" reference="Tietz Clinical Chemistry"
      result={osm ? `${osm} mOsm/kg (Normal: 275–295)` : undefined}
      steps={osm ? [`Osm = 2(${na}) + ${glucose}/18 + ${bun}/2.8 = ${osm}`] : []}>
      <div><Label className="text-xs">Na⁺ (mEq/L)</Label><Input type="number" step="any" onChange={e => setNa(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Glucose (mg/dL)</Label><Input type="number" step="any" onChange={e => setGlucose(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">BUN (mg/dL)</Label><Input type="number" step="any" onChange={e => setBun(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

export function ClinicalChemCalc() {
  return (
    <Tabs defaultValue="enzyme">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        <TabsTrigger value="enzyme" className="text-xs">Enzyme Activity</TabsTrigger>
        <TabsTrigger value="beer" className="text-xs">Beer-Lambert</TabsTrigger>
        <TabsTrigger value="anion" className="text-xs">Anion Gap</TabsTrigger>
        <TabsTrigger value="osm" className="text-xs">Osmolality</TabsTrigger>
      </TabsList>
      <TabsContent value="enzyme"><EnzymeActivity /></TabsContent>
      <TabsContent value="beer"><BeerLambert /></TabsContent>
      <TabsContent value="anion"><AnionGap /></TabsContent>
      <TabsContent value="osm"><OsmolalityCalc /></TabsContent>
    </Tabs>
  );
}
