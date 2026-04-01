import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConversionGroup {
  label: string;
  units: { name: string; toBase: number }[];
  baseUnit: string;
}

const groups: ConversionGroup[] = [
  { label: "Mass", baseUnit: "g", units: [
    { name: "kg", toBase: 1000 }, { name: "g", toBase: 1 }, { name: "mg", toBase: 0.001 }, { name: "µg", toBase: 1e-6 }
  ]},
  { label: "Volume", baseUnit: "L", units: [
    { name: "L", toBase: 1 }, { name: "mL", toBase: 0.001 }, { name: "µL", toBase: 1e-6 }
  ]},
  { label: "Concentration", baseUnit: "M", units: [
    { name: "M", toBase: 1 }, { name: "mM", toBase: 0.001 }, { name: "µM", toBase: 1e-6 }
  ]},
  { label: "Temperature", baseUnit: "°C", units: [
    { name: "°C", toBase: 1 }, { name: "K", toBase: 1 }
  ]},
  { label: "Time", baseUnit: "s", units: [
    { name: "hours", toBase: 3600 }, { name: "minutes", toBase: 60 }, { name: "seconds", toBase: 1 }
  ]},
  { label: "Length", baseUnit: "mm", units: [
    { name: "mm", toBase: 1 }, { name: "µm", toBase: 0.001 }, { name: "nm", toBase: 1e-6 }
  ]},
];

function Converter({ group }: { group: ConversionGroup }) {
  const [value, setValue] = useState("");
  const [from, setFrom] = useState(group.units[0].name);
  const [to, setTo] = useState(group.units[1]?.name || group.units[0].name);

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    if (group.label === "Temperature") {
      if (from === "°C" && to === "K") return (v + 273.15).toFixed(4);
      if (from === "K" && to === "°C") return (v - 273.15).toFixed(4);
      return v.toFixed(4);
    }
    const fromUnit = group.units.find(u => u.name === from)!;
    const toUnit = group.units.find(u => u.name === to)!;
    return ((v * fromUnit.toBase) / toUnit.toBase).toExponential(6);
  };

  const result = convert();

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-lg">{group.label} Conversion</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Value</Label>
            <Input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value" />
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{group.units.map(u => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{group.units.map(u => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {result && (
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <p className="text-sm font-semibold">{value} {from} = {result} {to}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UnitConverter() {
  return (
    <Tabs defaultValue="Mass">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        {groups.map(g => <TabsTrigger key={g.label} value={g.label} className="text-xs">{g.label}</TabsTrigger>)}
      </TabsList>
      {groups.map(g => (
        <TabsContent key={g.label} value={g.label}><Converter group={g} /></TabsContent>
      ))}
    </Tabs>
  );
}
