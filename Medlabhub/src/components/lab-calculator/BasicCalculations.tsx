import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorCard } from "./CalculatorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function useCalc<T extends Record<string, number>>(defaults: T) {
  const [values, setValues] = useState(defaults);
  const set = (key: keyof T, v: string) => setValues(p => ({ ...p, [key]: parseFloat(v) || 0 }));
  return { values, set };
}

function MolarityCalc() {
  const { values: v, set } = useCalc({ mass: 0, mw: 0, volume: 0 });
  const result = v.mw && v.volume ? (v.mass / v.mw / v.volume).toFixed(4) : "";
  const steps = result ? [
    `Moles = Mass / MW = ${v.mass} / ${v.mw} = ${(v.mass / v.mw).toFixed(4)} mol`,
    `Molarity = Moles / Volume = ${(v.mass / v.mw).toFixed(4)} / ${v.volume} = ${result} M`
  ] : [];
  return (
    <CalculatorCard title="Molarity (M)" formula="M = mass (g) / (MW × Volume (L))" reference="Tietz Clinical Chemistry" result={result ? `${result} M` : undefined} steps={steps}>
      <div><Label className="text-xs">Mass (g)</Label><Input type="number" placeholder="0" onChange={e => set("mass", e.target.value)} /></div>
      <div><Label className="text-xs">Molecular Weight (g/mol)</Label><Input type="number" placeholder="0" onChange={e => set("mw", e.target.value)} /></div>
      <div><Label className="text-xs">Volume (L)</Label><Input type="number" placeholder="0" onChange={e => set("volume", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function NormalityCalc() {
  const { values: v, set } = useCalc({ molarity: 0, nFactor: 0 });
  const result = v.molarity && v.nFactor ? (v.molarity * v.nFactor).toFixed(4) : "";
  return (
    <CalculatorCard title="Normality (N)" formula="N = Molarity × n-factor" reference="CLSI Standards" result={result ? `${result} N` : undefined}
      steps={result ? [`N = ${v.molarity} × ${v.nFactor} = ${result}`] : []}>
      <div><Label className="text-xs">Molarity (M)</Label><Input type="number" placeholder="0" onChange={e => set("molarity", e.target.value)} /></div>
      <div><Label className="text-xs">n-factor</Label><Input type="number" placeholder="0" onChange={e => set("nFactor", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function DilutionCalc() {
  const { values: v, set } = useCalc({ c1: 0, v1: 0, c2: 0 });
  const result = v.c1 && v.c2 ? ((v.c1 * v.v1) / v.c2).toFixed(4) : "";
  return (
    <CalculatorCard title="Dilution (C1V1 = C2V2)" formula="V2 = (C1 × V1) / C2" reference="WHO Laboratory Manual" result={result ? `V2 = ${result} mL` : undefined}
      steps={result ? [`V2 = (${v.c1} × ${v.v1}) / ${v.c2} = ${result}`] : []}>
      <div><Label className="text-xs">C1 (initial conc.)</Label><Input type="number" placeholder="0" onChange={e => set("c1", e.target.value)} /></div>
      <div><Label className="text-xs">V1 (initial vol. mL)</Label><Input type="number" placeholder="0" onChange={e => set("v1", e.target.value)} /></div>
      <div><Label className="text-xs">C2 (final conc.)</Label><Input type="number" placeholder="0" onChange={e => set("c2", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function PHCalc() {
  const { values: v, set } = useCalc({ hConc: 0 });
  const result = v.hConc > 0 ? (-Math.log10(v.hConc)).toFixed(4) : "";
  return (
    <CalculatorCard title="pH Calculation" formula="pH = -log₁₀[H⁺]" reference="Tietz Clinical Chemistry" result={result ? `pH = ${result}` : undefined}
      steps={result ? [`pH = -log₁₀(${v.hConc}) = ${result}`] : []}>
      <div><Label className="text-xs">[H⁺] concentration (M)</Label><Input type="number" step="any" placeholder="0.001" onChange={e => set("hConc", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function CFUCalc() {
  const { values: v, set } = useCalc({ colonies: 0, dilution: 0, volume: 0 });
  const result = v.dilution && v.volume ? (v.colonies / (v.dilution * v.volume)).toFixed(0) : "";
  return (
    <CalculatorCard title="CFU/mL Calculation" formula="CFU/mL = Colonies / (Dilution factor × Volume plated)" reference="Bailey & Scott's Diagnostic Microbiology" result={result ? `${Number(result).toLocaleString()} CFU/mL` : undefined}
      steps={result ? [`CFU/mL = ${v.colonies} / (${v.dilution} × ${v.volume}) = ${result}`] : []}>
      <div><Label className="text-xs">Number of Colonies</Label><Input type="number" placeholder="0" onChange={e => set("colonies", e.target.value)} /></div>
      <div><Label className="text-xs">Dilution Factor</Label><Input type="number" step="any" placeholder="0.001" onChange={e => set("dilution", e.target.value)} /></div>
      <div><Label className="text-xs">Volume Plated (mL)</Label><Input type="number" step="any" placeholder="0.1" onChange={e => set("volume", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function SerialDilutionCalc() {
  const { values: v, set } = useCalc({ initial: 0, factor: 0, steps: 0 });
  const result = v.initial && v.factor && v.steps ? (v.initial * Math.pow(1 / v.factor, v.steps)).toExponential(4) : "";
  return (
    <CalculatorCard title="Serial Dilution" formula="Final = Initial × (1/DF)ⁿ" reference="Jawetz Medical Microbiology" result={result ? `${result}` : undefined}
      steps={result ? [`Final = ${v.initial} × (1/${v.factor})^${v.steps} = ${result}`] : []}>
      <div><Label className="text-xs">Initial Concentration</Label><Input type="number" placeholder="0" onChange={e => set("initial", e.target.value)} /></div>
      <div><Label className="text-xs">Dilution Factor</Label><Input type="number" placeholder="10" onChange={e => set("factor", e.target.value)} /></div>
      <div><Label className="text-xs">Number of Steps</Label><Input type="number" placeholder="0" onChange={e => set("steps", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function PercentSolutionCalc() {
  const { values: v, set } = useCalc({ solute: 0, total: 0 });
  const wv = v.total ? ((v.solute / v.total) * 100).toFixed(2) : "";
  return (
    <CalculatorCard title="Percentage Solution (% w/v)" formula="% w/v = (mass solute / volume solution) × 100" reference="CLSI Standards" result={wv ? `${wv}% w/v` : undefined}
      steps={wv ? [`% w/v = (${v.solute} g / ${v.total} mL) × 100 = ${wv}%`] : []}>
      <div><Label className="text-xs">Solute Mass (g)</Label><Input type="number" placeholder="0" onChange={e => set("solute", e.target.value)} /></div>
      <div><Label className="text-xs">Solution Volume (mL)</Label><Input type="number" placeholder="0" onChange={e => set("total", e.target.value)} /></div>
    </CalculatorCard>
  );
}

function CellConcentrationCalc() {
  const { values: v, set } = useCalc({ cells: 0, squares: 0, dilution: 0 });
  const result = v.squares && v.dilution ? ((v.cells / v.squares) * v.dilution * 10000).toFixed(0) : "";
  return (
    <CalculatorCard title="Cell Concentration (Hemocytometer)" formula="Cells/mL = (Count / Squares) × Dilution × 10⁴" reference="Rodak's Hematology" result={result ? `${Number(result).toLocaleString()} cells/mL` : undefined}
      steps={result ? [`Cells/mL = (${v.cells} / ${v.squares}) × ${v.dilution} × 10000 = ${result}`] : []}>
      <div><Label className="text-xs">Total Cell Count</Label><Input type="number" placeholder="0" onChange={e => set("cells", e.target.value)} /></div>
      <div><Label className="text-xs">Squares Counted</Label><Input type="number" placeholder="5" onChange={e => set("squares", e.target.value)} /></div>
      <div><Label className="text-xs">Dilution Factor</Label><Input type="number" placeholder="1" onChange={e => set("dilution", e.target.value)} /></div>
    </CalculatorCard>
  );
}

export function BasicCalculations() {
  return (
    <Tabs defaultValue="molarity">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        <TabsTrigger value="molarity" className="text-xs">Molarity</TabsTrigger>
        <TabsTrigger value="normality" className="text-xs">Normality</TabsTrigger>
        <TabsTrigger value="dilution" className="text-xs">Dilution</TabsTrigger>
        <TabsTrigger value="ph" className="text-xs">pH</TabsTrigger>
        <TabsTrigger value="cfu" className="text-xs">CFU</TabsTrigger>
        <TabsTrigger value="serial" className="text-xs">Serial Dilution</TabsTrigger>
        <TabsTrigger value="percent" className="text-xs">% Solution</TabsTrigger>
        <TabsTrigger value="cell" className="text-xs">Cell Conc.</TabsTrigger>
      </TabsList>
      <TabsContent value="molarity"><MolarityCalc /></TabsContent>
      <TabsContent value="normality"><NormalityCalc /></TabsContent>
      <TabsContent value="dilution"><DilutionCalc /></TabsContent>
      <TabsContent value="ph"><PHCalc /></TabsContent>
      <TabsContent value="cfu"><CFUCalc /></TabsContent>
      <TabsContent value="serial"><SerialDilutionCalc /></TabsContent>
      <TabsContent value="percent"><PercentSolutionCalc /></TabsContent>
      <TabsContent value="cell"><CellConcentrationCalc /></TabsContent>
    </Tabs>
  );
}
