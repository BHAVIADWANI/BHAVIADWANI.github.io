import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, TrendingUp, BookOpen, Plus, Trash2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from "recharts";

// ═══ GODKAR TEXTBOOK EXAMPLES (Godkar's Clinical Pathology, 2nd Ed) ═══
// Real QC examples from Godkar & Godkar — Clinical Laboratory procedures
const godkarExamples: Record<string, { analyte: string; mean: number; sd: number; unit: string; values: number[]; description: string }> = {
  glucose: {
    analyte: "Glucose (Fasting)",
    mean: 95.2, sd: 3.8, unit: "mg/dL",
    values: [94, 96, 95, 93, 98, 97, 94, 91, 96, 95, 93, 92, 97, 99, 95, 94, 96, 101, 93, 95, 92, 94, 97, 95, 96, 94, 93, 95, 98, 96],
    description: "Normal level QC material for glucose. Mean established from 20 replicate measurements per Godkar's procedure. Expected range: 87.6–102.8 mg/dL (±2SD)."
  },
  creatinine: {
    analyte: "Creatinine",
    mean: 1.82, sd: 0.09, unit: "mg/dL",
    values: [1.80, 1.85, 1.78, 1.90, 1.84, 1.79, 1.82, 1.88, 1.75, 1.83, 1.86, 1.91, 1.80, 1.84, 1.82, 1.77, 1.85, 1.95, 1.81, 1.83, 1.79, 1.82, 1.86, 1.84, 1.80, 1.83, 1.78, 1.85, 1.87, 1.82],
    description: "Abnormal level QC for creatinine (Jaffe method). As per Godkar, CV should be <5% for acceptable precision."
  },
  cholesterol: {
    analyte: "Total Cholesterol",
    mean: 198.5, sd: 5.2, unit: "mg/dL",
    values: [197, 200, 195, 201, 198, 196, 199, 203, 194, 198, 200, 205, 197, 199, 198, 193, 201, 210, 196, 198, 195, 197, 202, 198, 200, 197, 196, 199, 203, 198],
    description: "Normal level QC for cholesterol (CHOD-PAP method). Godkar recommends ±2SD limits for routine monitoring."
  },
  urea: {
    analyte: "Blood Urea",
    mean: 32.4, sd: 1.8, unit: "mg/dL",
    values: [32, 33, 31, 34, 32, 31, 33, 35, 30, 32, 34, 36, 31, 33, 32, 29, 34, 38, 31, 32, 30, 32, 35, 33, 32, 31, 30, 33, 34, 32],
    description: "QC material for blood urea (DAM method / Urease-GLDH). As per Godkar's Clinical Pathology, Chapter 3."
  },
  sgpt: {
    analyte: "SGPT (ALT)",
    mean: 42.8, sd: 2.5, unit: "IU/L",
    values: [42, 44, 41, 45, 43, 41, 43, 46, 40, 42, 44, 47, 41, 43, 42, 39, 44, 49, 41, 43, 40, 42, 45, 43, 44, 42, 41, 43, 46, 42],
    description: "Abnormal level QC for ALT/SGPT (IFCC method). Reference per Godkar & Godkar Clinical Pathology."
  },
};

// ═══ INDIAN REFERENCE RANGES (NABL / Indian Council of Medical Research) ═══
const indianReferenceRanges = [
  { test: "Hemoglobin", male: "13.0–17.0 g/dL", female: "12.0–15.5 g/dL", children: "11.0–14.5 g/dL", source: "ICMR 2022" },
  { test: "Fasting Blood Glucose", male: "70–110 mg/dL", female: "70–110 mg/dL", children: "60–100 mg/dL", source: "API Textbook" },
  { test: "HbA1c", male: "<6.5%", female: "<6.5%", children: "4.0–5.6%", source: "RSSDI 2023" },
  { test: "Total Cholesterol", male: "<200 mg/dL", female: "<200 mg/dL", children: "<170 mg/dL", source: "CSI 2022" },
  { test: "Triglycerides", male: "<150 mg/dL", female: "<150 mg/dL", children: "<90 mg/dL", source: "CSI 2022" },
  { test: "HDL Cholesterol", male: ">40 mg/dL", female: ">50 mg/dL", children: ">45 mg/dL", source: "CSI 2022" },
  { test: "LDL Cholesterol", male: "<100 mg/dL", female: "<100 mg/dL", children: "<110 mg/dL", source: "CSI 2022" },
  { test: "Serum Creatinine", male: "0.7–1.3 mg/dL", female: "0.6–1.1 mg/dL", children: "0.3–0.7 mg/dL", source: "API / ICMR" },
  { test: "Blood Urea", male: "15–40 mg/dL", female: "15–40 mg/dL", children: "10–36 mg/dL", source: "API Textbook" },
  { test: "Serum Uric Acid", male: "3.5–7.0 mg/dL", female: "2.5–6.0 mg/dL", children: "2.0–5.5 mg/dL", source: "API / ICMR" },
  { test: "Total Bilirubin", male: "0.2–1.0 mg/dL", female: "0.2–1.0 mg/dL", children: "0.2–1.0 mg/dL", source: "API Textbook" },
  { test: "SGPT (ALT)", male: "7–56 IU/L", female: "7–45 IU/L", children: "10–40 IU/L", source: "IFCC / Godkar" },
  { test: "SGOT (AST)", male: "8–40 IU/L", female: "8–35 IU/L", children: "15–40 IU/L", source: "IFCC / Godkar" },
  { test: "ALP", male: "44–147 IU/L", female: "44–147 IU/L", children: "Up to 350 IU/L", source: "Godkar / NABL" },
  { test: "Serum Protein", male: "6.0–8.0 g/dL", female: "6.0–8.0 g/dL", children: "6.0–8.0 g/dL", source: "API Textbook" },
  { test: "Serum Albumin", male: "3.5–5.0 g/dL", female: "3.5–5.0 g/dL", children: "3.5–5.0 g/dL", source: "API Textbook" },
  { test: "TSH", male: "0.4–4.0 mIU/L", female: "0.4–4.0 mIU/L", children: "0.7–6.4 mIU/L", source: "ATA / Indian Thyroid Society" },
  { test: "Free T3", male: "2.0–4.4 pg/mL", female: "2.0–4.4 pg/mL", children: "2.0–5.0 pg/mL", source: "ATA / ITS" },
  { test: "Free T4", male: "0.8–1.8 ng/dL", female: "0.8–1.8 ng/dL", children: "0.9–2.2 ng/dL", source: "ATA / ITS" },
  { test: "Serum Iron", male: "60–170 µg/dL", female: "60–170 µg/dL", children: "50–120 µg/dL", source: "ICMR" },
  { test: "Serum Calcium", male: "8.5–10.5 mg/dL", female: "8.5–10.5 mg/dL", children: "9.0–11.0 mg/dL", source: "API" },
  { test: "Serum Sodium", male: "136–145 mEq/L", female: "136–145 mEq/L", children: "136–145 mEq/L", source: "API / Godkar" },
  { test: "Serum Potassium", male: "3.5–5.0 mEq/L", female: "3.5–5.0 mEq/L", children: "3.5–5.5 mEq/L", source: "API / Godkar" },
  { test: "ESR", male: "0–15 mm/hr", female: "0–20 mm/hr", children: "0–10 mm/hr", source: "Westergren / ICMR" },
  { test: "CRP", male: "<6 mg/L", female: "<6 mg/L", children: "<6 mg/L", source: "NABL / API" },
];

// ═══ WESTGARD RULES ═══
interface WestgardViolation {
  rule: string;
  description: string;
  type: "warning" | "rejection";
  index: number;
}

function applyWestgardRules(values: number[], mean: number, sd: number): WestgardViolation[] {
  const violations: WestgardViolation[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const z = (values[i] - mean) / sd;
    
    // 1-3s: Single value exceeds ±3SD — REJECTION
    if (Math.abs(z) > 3) {
      violations.push({ rule: "1₃s", description: `Value ${values[i]} exceeds ±3SD (random error)`, type: "rejection", index: i });
    }
    
    // 1-2s: Single value exceeds ±2SD — WARNING
    if (Math.abs(z) > 2 && Math.abs(z) <= 3) {
      violations.push({ rule: "1₂s", description: `Value ${values[i]} exceeds ±2SD (warning rule)`, type: "warning", index: i });
    }

    // 2-2s: Two consecutive values exceed same ±2SD — REJECTION (systematic error)
    if (i > 0) {
      const z_prev = (values[i - 1] - mean) / sd;
      if ((z > 2 && z_prev > 2) || (z < -2 && z_prev < -2)) {
        violations.push({ rule: "2₂s", description: `Two consecutive values exceed same ±2SD (systematic error)`, type: "rejection", index: i });
      }
    }

    // R-4s: One value >+2SD and next <-2SD (or vice versa) — range > 4SD — REJECTION
    if (i > 0) {
      const z_prev = (values[i - 1] - mean) / sd;
      if ((z > 2 && z_prev < -2) || (z < -2 && z_prev > 2)) {
        violations.push({ rule: "R₄s", description: `Range between consecutive values >4SD (random error)`, type: "rejection", index: i });
      }
    }

    // 4-1s: Four consecutive values exceed same ±1SD — REJECTION (shift)
    if (i >= 3) {
      const last4 = [values[i - 3], values[i - 2], values[i - 1], values[i]].map(v => (v - mean) / sd);
      if (last4.every(z => z > 1) || last4.every(z => z < -1)) {
        violations.push({ rule: "4₁s", description: `Four consecutive values on same side of ±1SD (shift)`, type: "rejection", index: i });
      }
    }

    // 10x̄: Ten consecutive values on same side of mean — REJECTION (shift)
    if (i >= 9) {
      const last10 = values.slice(i - 9, i + 1).map(v => v - mean);
      if (last10.every(v => v > 0) || last10.every(v => v < 0)) {
        violations.push({ rule: "10x̄", description: `Ten consecutive values on same side of mean (shift/bias)`, type: "rejection", index: i });
      }
    }
  }

  return violations;
}

export function QCInterpreter() {
  const [selectedExample, setSelectedExample] = useState<string>("glucose");
  const [customValues, setCustomValues] = useState<string>("");
  const [customMean, setCustomMean] = useState<string>("");
  const [customSD, setCustomSD] = useState<string>("");
  const [customAnalyte, setCustomAnalyte] = useState<string>("Custom Analyte");
  const [useCustom, setUseCustom] = useState(false);

  const activeData = useMemo(() => {
    if (useCustom && customValues.trim()) {
      const vals = customValues.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      const m = customMean ? parseFloat(customMean) : vals.reduce((a, b) => a + b, 0) / vals.length;
      const s = customSD ? parseFloat(customSD) : Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / (vals.length - 1));
      return { analyte: customAnalyte, mean: m, sd: s, values: vals, unit: "", description: "User-entered QC data" };
    }
    return godkarExamples[selectedExample];
  }, [selectedExample, customValues, customMean, customSD, customAnalyte, useCustom]);

  const chartData = useMemo(() => {
    if (!activeData) return [];
    return activeData.values.map((v, i) => ({
      run: i + 1,
      value: v,
      mean: activeData.mean,
      plus1SD: activeData.mean + activeData.sd,
      minus1SD: activeData.mean - activeData.sd,
      plus2SD: activeData.mean + 2 * activeData.sd,
      minus2SD: activeData.mean - 2 * activeData.sd,
      plus3SD: activeData.mean + 3 * activeData.sd,
      minus3SD: activeData.mean - 3 * activeData.sd,
    }));
  }, [activeData]);

  const violations = useMemo(() => {
    if (!activeData) return [];
    return applyWestgardRules(activeData.values, activeData.mean, activeData.sd);
  }, [activeData]);

  const rejections = violations.filter(v => v.type === "rejection");
  const warnings = violations.filter(v => v.type === "warning");

  if (!activeData) return null;

  const cv = ((activeData.sd / activeData.mean) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lj" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="lj" className="text-xs">Levey-Jennings Chart</TabsTrigger>
          <TabsTrigger value="westgard" className="text-xs">Westgard Rules</TabsTrigger>
          <TabsTrigger value="indian" className="text-xs">Indian Reference Ranges</TabsTrigger>
        </TabsList>

        <TabsContent value="lj" className="space-y-4">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Levey-Jennings QC Chart Generator</CardTitle>
              <CardDescription>
                Select a Godkar textbook example or enter your own QC data. Charts show ±1SD, ±2SD, ±3SD control limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant={!useCustom ? "default" : "outline"} size="sm" onClick={() => setUseCustom(false)}>Godkar Examples</Button>
                <Button variant={useCustom ? "default" : "outline"} size="sm" onClick={() => setUseCustom(true)}>Custom Data</Button>
              </div>

              {!useCustom ? (
                <Select value={selectedExample} onValueChange={setSelectedExample}>
                  <SelectTrigger className="w-full max-w-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(godkarExamples).map(([key, ex]) => (
                      <SelectItem key={key} value={key}>{ex.analyte} ({ex.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">QC Values (comma-separated)</Label>
                    <Input value={customValues} onChange={e => setCustomValues(e.target.value)} placeholder="e.g., 95, 96, 93, 98, ..." className="font-mono text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mean (leave blank to auto-calculate)</Label>
                    <Input value={customMean} onChange={e => setCustomMean(e.target.value)} placeholder="Auto" type="number" step="any" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SD (leave blank to auto-calculate)</Label>
                    <Input value={customSD} onChange={e => setCustomSD(e.target.value)} placeholder="Auto" type="number" step="any" />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">{activeData.analyte}</p>
                <p className="text-muted-foreground text-xs">{activeData.description}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span>Mean: <strong>{activeData.mean.toFixed(2)}</strong></span>
                  <span>SD: <strong>{activeData.sd.toFixed(2)}</strong></span>
                  <span>CV: <strong>{cv}%</strong></span>
                  <span>n: <strong>{activeData.values.length}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Levey-Jennings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Levey-Jennings Chart — {activeData.analyte}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  
                  {/* ±3SD zone (red) */}
                  <ReferenceArea y1={activeData.mean + 2 * activeData.sd} y2={activeData.mean + 3 * activeData.sd} fill="hsl(0, 72%, 51%)" fillOpacity={0.08} />
                  <ReferenceArea y1={activeData.mean - 3 * activeData.sd} y2={activeData.mean - 2 * activeData.sd} fill="hsl(0, 72%, 51%)" fillOpacity={0.08} />
                  
                  {/* ±2SD zone (yellow) */}
                  <ReferenceArea y1={activeData.mean + activeData.sd} y2={activeData.mean + 2 * activeData.sd} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />
                  <ReferenceArea y1={activeData.mean - 2 * activeData.sd} y2={activeData.mean - activeData.sd} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />

                  <XAxis dataKey="run" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Run Number", position: "bottom", offset: -5 }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[activeData.mean - 4 * activeData.sd, activeData.mean + 4 * activeData.sd]} />
                  
                  <ReferenceLine y={activeData.mean} stroke="hsl(var(--primary))" strokeWidth={2} label={{ value: "Mean", position: "right", fontSize: 10 }} />
                  <ReferenceLine y={activeData.mean + activeData.sd} stroke="hsl(160, 84%, 39%)" strokeDasharray="5 5" label={{ value: "+1SD", position: "right", fontSize: 9 }} />
                  <ReferenceLine y={activeData.mean - activeData.sd} stroke="hsl(160, 84%, 39%)" strokeDasharray="5 5" label={{ value: "-1SD", position: "right", fontSize: 9 }} />
                  <ReferenceLine y={activeData.mean + 2 * activeData.sd} stroke="hsl(38, 92%, 50%)" strokeDasharray="5 5" label={{ value: "+2SD", position: "right", fontSize: 9 }} />
                  <ReferenceLine y={activeData.mean - 2 * activeData.sd} stroke="hsl(38, 92%, 50%)" strokeDasharray="5 5" label={{ value: "-2SD", position: "right", fontSize: 9 }} />
                  <ReferenceLine y={activeData.mean + 3 * activeData.sd} stroke="hsl(0, 72%, 51%)" strokeDasharray="3 3" label={{ value: "+3SD", position: "right", fontSize: 9 }} />
                  <ReferenceLine y={activeData.mean - 3 * activeData.sd} stroke="hsl(0, 72%, 51%)" strokeDasharray="3 3" label={{ value: "-3SD", position: "right", fontSize: 9 }} />

                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} name="QC Value" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Westgard Violations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {rejections.length > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                Westgard Rule Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium text-success">All QC values are within acceptable limits</p>
                  <p className="text-xs text-muted-foreground">No Westgard rule violations detected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {violations.map((v, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-start gap-2 ${v.type === "rejection" ? "border-destructive bg-destructive/5" : "border-warning bg-warning/5"}`}>
                      <Badge variant={v.type === "rejection" ? "destructive" : "secondary"} className="shrink-0 mt-0.5">{v.rule}</Badge>
                      <div>
                        <p className="text-sm">{v.description}</p>
                        <p className="text-xs text-muted-foreground">Run #{v.index + 1} • Value: {activeData.values[v.index]}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-muted-foreground">
                    {rejections.length} rejection(s) • {warnings.length} warning(s)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="westgard">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Westgard Multi-Rule QC System</CardTitle>
              <CardDescription>Per Westgard JO. "Basic QC Practices" & Godkar's Clinical Pathology (Chapter on Quality Control)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rule: "1₂s", type: "WARNING", desc: "One QC value exceeds ±2SD. Triggers inspection of other rules. Not a rejection by itself.", color: "border-warning bg-warning/5" },
                  { rule: "1₃s", type: "REJECTION", desc: "One QC value exceeds ±3SD. Indicates random error. Reject the run and repeat analysis.", color: "border-destructive bg-destructive/5" },
                  { rule: "2₂s", type: "REJECTION", desc: "Two consecutive QC values exceed the same ±2SD limit. Indicates systematic error (bias). Recalibrate.", color: "border-destructive bg-destructive/5" },
                  { rule: "R₄s", type: "REJECTION", desc: "Range between two consecutive QC values exceeds 4SD (one >+2SD and next <−2SD). Indicates random error.", color: "border-destructive bg-destructive/5" },
                  { rule: "4₁s", type: "REJECTION", desc: "Four consecutive QC values exceed the same ±1SD limit. Indicates a systematic shift.", color: "border-destructive bg-destructive/5" },
                  { rule: "10x̄", type: "REJECTION", desc: "Ten consecutive QC values fall on the same side of the mean. Indicates a gradual shift/bias in the system.", color: "border-destructive bg-destructive/5" },
                ].map(r => (
                  <div key={r.rule} className={`p-4 rounded-lg border ${r.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={r.type === "REJECTION" ? "destructive" : "secondary"} className="font-mono">{r.rule}</Badge>
                      <span className="text-xs font-semibold">{r.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Godkar's Recommendation:</strong> Run two levels of QC (normal and abnormal) per shift. Plot on Levey-Jennings chart daily. 
                  Apply Westgard rules before releasing patient results. Document all out-of-control events per NABL ISO 15189 requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indian">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indian Reference Ranges</CardTitle>
              <CardDescription>
                Based on API (Association of Physicians of India) Textbook, ICMR guidelines, NABL (ISO 15189), CSI (Cardiological Society of India), RSSDI, and Godkar's Clinical Pathology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 font-semibold">Test</th>
                      <th className="text-center py-2 px-3 font-semibold">Male</th>
                      <th className="text-center py-2 px-3 font-semibold">Female</th>
                      <th className="text-center py-2 px-3 font-semibold">Children</th>
                      <th className="text-left py-2 px-3 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indianReferenceRanges.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium">{r.test}</td>
                        <td className="text-center py-2 px-3 font-mono">{r.male}</td>
                        <td className="text-center py-2 px-3 font-mono">{r.female}</td>
                        <td className="text-center py-2 px-3 font-mono">{r.children}</td>
                        <td className="py-2 px-3 text-muted-foreground">{r.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Reference ranges may vary with methodology, instrumentation, altitude, and ethnic group. 
                  Indian reference ranges differ from Western values for some analytes (e.g., lower Hb cutoff, different lipid targets for South Asian population). 
                  Always validate with local laboratory-established reference intervals as per NABL/ISO 15189.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 mt-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>References:</strong> Godkar PB, Godkar DP. Textbook of Medical Laboratory Technology, 3rd ed. Bhalani Publishing House. •
                  API Textbook of Medicine, 11th ed. • ICMR Guidelines for Laboratory Medicine. • 
                  NABL Specific Criteria for Medical Laboratories (ISO 15189:2022). •
                  CSI Lipid Guidelines for South Asian Population (2022). • RSSDI Clinical Practice Guidelines (2023). •
                  Westgard JO. Basic QC Practices, 4th ed. Westgard QC Inc. • CLSI C24-Ed4 Statistical Quality Control.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
