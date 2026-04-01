import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mediaTypes = [
  { name: "Nutrient Agar", powder: 28, ph: "7.4 ± 0.2", sterilization: "Autoclave at 121°C for 15 min", use: "General purpose cultivation" },
  { name: "MacConkey Agar", powder: 49.53, ph: "7.1 ± 0.2", sterilization: "Autoclave at 121°C for 15 min", use: "Selective for Gram-negative, differentiates lactose fermenters" },
  { name: "Blood Agar Base", powder: 40, ph: "7.3 ± 0.2", sterilization: "Autoclave at 121°C for 15 min, cool to 50°C, add 5% sterile defibrinated blood", use: "Enriched medium, hemolysis detection" },
  { name: "Sabouraud Dextrose Agar", powder: 65, ph: "5.6 ± 0.2", sterilization: "Autoclave at 121°C for 15 min", use: "Fungal cultivation" },
  { name: "Mueller-Hinton Agar", powder: 38, ph: "7.3 ± 0.1", sterilization: "Autoclave at 121°C for 15 min", use: "Antibiotic susceptibility testing (CLSI standard)" },
  { name: "Eosin Methylene Blue Agar", powder: 36, ph: "7.2 ± 0.2", sterilization: "Autoclave at 121°C for 15 min", use: "Selective/differential for Gram-negative" },
  { name: "Mannitol Salt Agar", powder: 111, ph: "7.4 ± 0.2", sterilization: "Autoclave at 121°C for 15 min", use: "Selective for Staphylococcus" },
  { name: "Chocolate Agar", powder: 40, ph: "7.2 ± 0.2", sterilization: "Autoclave base at 121°C, cool to 80°C, add 5% blood, hold 10 min", use: "Enriched medium for fastidious organisms" },
];

export function CultureMediaPrep() {
  const [selected, setSelected] = useState(mediaTypes[0].name);
  const [volume, setVolume] = useState(500);
  const media = mediaTypes.find(m => m.name === selected)!;
  const powderNeeded = (media.powder / 1000) * volume;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Culture Media Preparation Calculator</CardTitle>
        <CardDescription>Based on manufacturer specifications & Bailey & Scott's Diagnostic Microbiology</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Select Medium</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{mediaTypes.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Required Volume (mL)</Label>
            <Input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">{media.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Standard:</span> {media.powder} g/L</div>
            <div><span className="text-muted-foreground">pH:</span> {media.ph}</div>
            <div><span className="text-muted-foreground">Use:</span> {media.use}</div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 space-y-2">
          <p className="font-semibold text-sm">Preparation for {volume} mL:</p>
          <div className="space-y-1 text-sm">
            <p>1. Weigh <strong>{powderNeeded.toFixed(2)} g</strong> of {media.name} powder</p>
            <p>2. Add to <strong>{volume} mL</strong> of distilled water</p>
            <p>3. Mix thoroughly to dissolve</p>
            <p>4. Adjust pH to <strong>{media.ph}</strong></p>
            <p>5. {media.sterilization}</p>
            <p>6. Pour into sterile Petri dishes (~20 mL per plate)</p>
          </div>
          <Badge variant="outline" className="text-[10px]">Approx. {Math.floor(volume / 20)} plates</Badge>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Formula: Powder (g) = ({media.powder} g / 1000 mL) × {volume} mL = {powderNeeded.toFixed(2)} g
        </p>
      </CardContent>
    </Card>
  );
}
