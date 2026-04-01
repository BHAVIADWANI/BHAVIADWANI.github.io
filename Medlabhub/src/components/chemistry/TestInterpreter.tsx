import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface TestDef {
  name: string;
  unit: string;
  refLow: number;
  refHigh: number;
  criticalLow?: number;
  criticalHigh?: number;
  highConditions: string[];
  lowConditions: string[];
  method: string;
}

const testPanels: Record<string, { name: string; tests: TestDef[] }> = {
  liver: {
    name: "Liver Function Tests",
    tests: [
      { name: "ALT", unit: "IU/L", refLow: 7, refHigh: 56, criticalHigh: 1000, highConditions: ["Viral hepatitis", "Drug-induced liver injury", "Ischemic hepatitis", "Autoimmune hepatitis"], lowConditions: ["Pyridoxine (B6) deficiency"], method: "NADH coupled reaction (IFCC)" },
      { name: "AST", unit: "IU/L", refLow: 10, refHigh: 40, criticalHigh: 1000, highConditions: ["Hepatocellular damage", "Myocardial infarction", "Muscle injury", "Hemolysis"], lowConditions: ["Uremia", "Pyridoxine deficiency"], method: "NADH coupled reaction (IFCC)" },
      { name: "ALP", unit: "IU/L", refLow: 44, refHigh: 147, highConditions: ["Biliary obstruction", "Bone disease (Paget's)", "Pregnancy (3rd trimester)", "Liver metastases"], lowConditions: ["Hypothyroidism", "Zinc deficiency", "Malnutrition"], method: "p-Nitrophenylphosphate substrate" },
      { name: "GGT", unit: "IU/L", refLow: 9, refHigh: 48, highConditions: ["Alcoholic liver disease", "Biliary obstruction", "Pancreatic disease", "Drug induction (phenytoin, barbiturates)"], lowConditions: ["Hypothyroidism"], method: "γ-Glutamyl-p-nitroanilide substrate" },
      { name: "Total Bilirubin", unit: "mg/dL", refLow: 0.1, refHigh: 1.2, criticalHigh: 15, highConditions: ["Hepatitis", "Hemolytic anemia", "Biliary obstruction", "Gilbert syndrome", "Neonatal jaundice"], lowConditions: [], method: "Diazo reaction (Jendrassik-Grof)" },
      { name: "Albumin", unit: "g/dL", refLow: 3.5, refHigh: 5.0, criticalLow: 1.5, highConditions: ["Dehydration"], lowConditions: ["Liver cirrhosis", "Nephrotic syndrome", "Malnutrition", "Burns", "Chronic inflammation"], method: "Bromcresol green (BCG)" },
    ],
  },
  renal: {
    name: "Renal Function Tests",
    tests: [
      { name: "Creatinine", unit: "mg/dL", refLow: 0.6, refHigh: 1.2, criticalHigh: 10, highConditions: ["Acute kidney injury", "Chronic kidney disease", "Rhabdomyolysis", "Dehydration"], lowConditions: ["Decreased muscle mass", "Liver disease"], method: "Jaffe reaction / Enzymatic" },
      { name: "BUN", unit: "mg/dL", refLow: 7, refHigh: 20, criticalHigh: 100, highConditions: ["Renal failure", "Dehydration", "GI bleeding", "High-protein diet", "Congestive heart failure"], lowConditions: ["Liver failure", "Malnutrition", "Overhydration"], method: "Urease/Glutamate dehydrogenase" },
      { name: "eGFR", unit: "mL/min/1.73m²", refLow: 90, refHigh: 120, criticalLow: 15, highConditions: ["Hyperfiltration (early diabetes)"], lowConditions: ["CKD Stage 3a (45-59)", "CKD Stage 3b (30-44)", "CKD Stage 4 (15-29)", "CKD Stage 5 (<15) — Dialysis"], method: "CKD-EPI equation" },
      { name: "Uric Acid", unit: "mg/dL", refLow: 3.5, refHigh: 7.2, highConditions: ["Gout", "Renal failure", "Tumor lysis syndrome", "Pre-eclampsia", "Lesch-Nyhan syndrome"], lowConditions: ["Wilson disease", "Fanconi syndrome", "SIADH"], method: "Uricase/Peroxidase" },
    ],
  },
  thyroid: {
    name: "Thyroid Function Tests",
    tests: [
      { name: "TSH", unit: "mIU/L", refLow: 0.4, refHigh: 4.0, criticalLow: 0.01, criticalHigh: 50, highConditions: ["Primary hypothyroidism", "Hashimoto's thyroiditis", "Iodine deficiency", "TSH-producing pituitary adenoma"], lowConditions: ["Hyperthyroidism (Graves disease)", "Secondary hypothyroidism", "Thyroiditis (subacute)", "Excess thyroid hormone"], method: "Chemiluminescence immunoassay (CLIA)" },
      { name: "Free T4", unit: "ng/dL", refLow: 0.8, refHigh: 1.8, highConditions: ["Graves disease", "Thyroiditis", "Excess levothyroxine", "Struma ovarii"], lowConditions: ["Hypothyroidism", "Severe illness (sick euthyroid)", "Pituitary insufficiency"], method: "Competitive immunoassay" },
      { name: "Free T3", unit: "pg/mL", refLow: 2.3, refHigh: 4.2, highConditions: ["T3 thyrotoxicosis", "Graves disease", "Early hyperthyroidism"], lowConditions: ["Hypothyroidism", "Non-thyroidal illness", "Malnutrition"], method: "Competitive immunoassay" },
    ],
  },
  lipid: {
    name: "Lipid Panel",
    tests: [
      { name: "Total Cholesterol", unit: "mg/dL", refLow: 0, refHigh: 200, highConditions: ["Hypercholesterolemia", "Familial hyperlipidemia", "Hypothyroidism", "Nephrotic syndrome", "Diabetes mellitus"], lowConditions: ["Hyperthyroidism", "Liver disease", "Malnutrition", "Malabsorption"], method: "Cholesterol oxidase/esterase" },
      { name: "LDL Cholesterol", unit: "mg/dL", refLow: 0, refHigh: 100, highConditions: ["Atherosclerosis risk", "Familial hypercholesterolemia", "High-fat diet", "Hypothyroidism"], lowConditions: ["Hyperthyroidism", "Malabsorption"], method: "Friedewald equation or direct assay" },
      { name: "HDL Cholesterol", unit: "mg/dL", refLow: 40, refHigh: 60, highConditions: ["Cardioprotective (>60 mg/dL)", "Exercise", "Moderate alcohol intake"], lowConditions: ["Increased CVD risk (<40 mg/dL)", "Metabolic syndrome", "Smoking", "Obesity"], method: "Direct homogeneous assay" },
      { name: "Triglycerides", unit: "mg/dL", refLow: 0, refHigh: 150, criticalHigh: 500, highConditions: ["Metabolic syndrome", "Diabetes mellitus", "Pancreatitis risk (>500)", "Alcohol abuse", "Hypothyroidism"], lowConditions: ["Malnutrition", "Hyperthyroidism"], method: "Lipase/Glycerol kinase" },
    ],
  },
  coagulation: {
    name: "Coagulation Studies",
    tests: [
      { name: "PT", unit: "seconds", refLow: 11, refHigh: 13.5, criticalHigh: 30, highConditions: ["Warfarin therapy", "Liver disease", "DIC", "Vitamin K deficiency", "Factor VII deficiency"], lowConditions: [], method: "Thromboplastin + CaCl₂" },
      { name: "INR", unit: "ratio", refLow: 0.8, refHigh: 1.2, criticalHigh: 5, highConditions: ["Warfarin overdose", "Liver failure", "DIC", "Vitamin K deficiency"], lowConditions: [], method: "Calculated from PT ratio" },
      { name: "aPTT", unit: "seconds", refLow: 25, refHigh: 35, criticalHigh: 100, highConditions: ["Heparin therapy", "Hemophilia A/B", "von Willebrand disease", "DIC", "Lupus anticoagulant"], lowConditions: [], method: "Contact activation + CaCl₂" },
      { name: "D-Dimer", unit: "ng/mL FEU", refLow: 0, refHigh: 500, highConditions: ["DVT/PE", "DIC", "Post-surgery", "Pregnancy", "Malignancy", "Infection/sepsis"], lowConditions: [], method: "Latex-enhanced immunoturbidimetric" },
      { name: "Fibrinogen", unit: "mg/dL", refLow: 200, refHigh: 400, criticalLow: 100, criticalHigh: 700, highConditions: ["Acute phase response", "Pregnancy", "Inflammation", "Malignancy"], lowConditions: ["DIC", "Liver disease", "Hyperfibrinolysis", "Afibrinogenemia"], method: "Clauss method (thrombin time-based)" },
    ],
  },
};

export function TestInterpreter() {
  const [panel, setPanel] = useState("liver");
  const [values, setValues] = useState<Record<string, string>>({});

  const currentPanel = testPanels[panel];

  const getStatus = (test: TestDef, val: number) => {
    if (test.criticalHigh && val >= test.criticalHigh) return "critical-high";
    if (test.criticalLow && val <= test.criticalLow) return "critical-low";
    if (val > test.refHigh) return "high";
    if (val < test.refLow) return "low";
    return "normal";
  };

  const interpretedResults = currentPanel.tests.map((test) => {
    const raw = values[test.name];
    const val = raw ? parseFloat(raw) : null;
    const status = val !== null && !isNaN(val) ? getStatus(test, val) : null;
    return { test, val, status };
  });

  const hasResults = interpretedResults.some((r) => r.val !== null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interactive Test Interpreter</CardTitle>
          <CardDescription>
            Enter patient values to get automated interpretation with reference ranges, clinical conditions, and critical alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={panel} onValueChange={(v) => { setPanel(v); setValues({}); }}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(testPanels).map(([key, p]) => (
                <SelectItem key={key} value={key}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentPanel.tests.map((test) => (
              <div key={test.name} className="space-y-1">
                <Label className="text-xs font-medium">{test.name} ({test.unit})</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={`${test.refLow} - ${test.refHigh}`}
                  value={values[test.name] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [test.name]: e.target.value }))}
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Ref: {test.refLow} – {test.refHigh} {test.unit}</p>
              </div>
            ))}
          </div>

          {hasResults && (
            <Button variant="outline" size="sm" onClick={() => setValues({})}>Clear All</Button>
          )}
        </CardContent>
      </Card>

      {hasResults && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Interpretation Results</h3>
          {interpretedResults.filter((r) => r.val !== null).map(({ test, val, status }) => (
            <Card key={test.name} className={
              status === "critical-high" || status === "critical-low" ? "border-destructive bg-destructive/5" :
              status === "high" || status === "low" ? "border-yellow-500/50 bg-yellow-500/5" :
              "border-green-500/30 bg-green-500/5"
            }>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {status === "normal" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {status === "high" && <TrendingUp className="h-4 w-4 text-yellow-600" />}
                    {status === "low" && <TrendingDown className="h-4 w-4 text-yellow-600" />}
                    {(status === "critical-high" || status === "critical-low") && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <span className="font-semibold">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{val} {test.unit}</span>
                    <Badge variant={
                      status === "normal" ? "default" :
                      status === "critical-high" || status === "critical-low" ? "destructive" : "secondary"
                    } className={status === "normal" ? "bg-green-600" : ""}>
                      {status === "normal" ? "Normal" :
                       status === "high" ? "↑ High" :
                       status === "low" ? "↓ Low" :
                       status === "critical-high" ? "⚠️ CRITICAL HIGH" : "⚠️ CRITICAL LOW"}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Reference: {test.refLow} – {test.refHigh} {test.unit} • Method: {test.method}</p>

                {status && status !== "normal" && (
                  <div className="pt-1">
                    <p className="text-xs font-medium mb-1">Possible conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {(status === "high" || status === "critical-high" ? test.highConditions : test.lowConditions).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                <strong>References:</strong> Tietz Fundamentals of Clinical Chemistry, 8th ed. • CLSI C28-A3c Reference Intervals • 
                <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="underline">PubMed</a>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
