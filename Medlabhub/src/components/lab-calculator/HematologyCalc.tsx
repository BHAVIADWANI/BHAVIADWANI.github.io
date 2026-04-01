import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorCard } from "./CalculatorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HematologyCalc() {
  const [hb, setHb] = useState(0);
  const [hct, setHct] = useState(0);
  const [rbc, setRbc] = useState(0);

  const mcv = rbc ? ((hct / rbc) * 10).toFixed(1) : "";
  const mch = rbc ? ((hb / rbc) * 10).toFixed(1) : "";
  const mchc = hct ? ((hb / hct) * 100).toFixed(1) : "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">RBC Indices Calculator</CardTitle>
          <p className="text-xs text-muted-foreground">Based on Rodak's Hematology — Enter CBC values to calculate indices</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div><Label className="text-xs">Hemoglobin (g/dL)</Label><Input type="number" step="any" onChange={e => setHb(parseFloat(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Hematocrit (%)</Label><Input type="number" step="any" onChange={e => setHct(parseFloat(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">RBC Count (×10¹²/L)</Label><Input type="number" step="any" onChange={e => setRbc(parseFloat(e.target.value) || 0)} /></div>
          </div>

          {(mcv || mch || mchc) && (
            <div className="grid sm:grid-cols-3 gap-3">
              {mcv && (
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground">MCV (Mean Corpuscular Volume)</p>
                  <p className="text-lg font-bold">{mcv} fL</p>
                  <p className="text-[10px] font-mono text-muted-foreground">= (Hct/RBC) × 10</p>
                  <p className="text-[10px]">Normal: 80–100 fL</p>
                </div>
              )}
              {mch && (
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground">MCH (Mean Corpuscular Hb)</p>
                  <p className="text-lg font-bold">{mch} pg</p>
                  <p className="text-[10px] font-mono text-muted-foreground">= (Hb/RBC) × 10</p>
                  <p className="text-[10px]">Normal: 27–33 pg</p>
                </div>
              )}
              {mchc && (
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground">MCHC (Mean Corpuscular Hb Conc.)</p>
                  <p className="text-lg font-bold">{mchc} g/dL</p>
                  <p className="text-[10px] font-mono text-muted-foreground">= (Hb/Hct) × 100</p>
                  <p className="text-[10px]">Normal: 32–36 g/dL</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <WBCCorrection />
        <ReticulocyteCount />
      </div>
    </div>
  );
}

function WBCCorrection() {
  const [wbc, setWbc] = useState(0);
  const [nrbc, setNrbc] = useState(0);
  const corrected = nrbc > 0 ? ((wbc * 100) / (100 + nrbc)).toFixed(0) : "";
  return (
    <CalculatorCard title="Corrected WBC Count" formula="Corrected WBC = (WBC × 100) / (100 + nRBC)" reference="Rodak's Hematology"
      result={corrected ? `${Number(corrected).toLocaleString()} /µL` : undefined}
      steps={corrected ? [`Corrected = (${wbc} × 100) / (100 + ${nrbc}) = ${corrected}`] : []}>
      <div><Label className="text-xs">Uncorrected WBC (/µL)</Label><Input type="number" onChange={e => setWbc(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">nRBC per 100 WBC</Label><Input type="number" onChange={e => setNrbc(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}

function ReticulocyteCount() {
  const [retic, setRetic] = useState(0);
  const [hct, setHct] = useState(0);
  const corrected = hct ? ((retic * hct) / 45).toFixed(2) : "";
  return (
    <CalculatorCard title="Corrected Reticulocyte Count" formula="CRC = Retic% × (Patient Hct / 45)" reference="Rodak's Hematology"
      result={corrected ? `${corrected}%` : undefined}
      steps={corrected ? [`CRC = ${retic} × (${hct}/45) = ${corrected}%`] : []}>
      <div><Label className="text-xs">Reticulocyte Count (%)</Label><Input type="number" step="any" onChange={e => setRetic(parseFloat(e.target.value) || 0)} /></div>
      <div><Label className="text-xs">Patient Hematocrit (%)</Label><Input type="number" step="any" onChange={e => setHct(parseFloat(e.target.value) || 0)} /></div>
    </CalculatorCard>
  );
}
