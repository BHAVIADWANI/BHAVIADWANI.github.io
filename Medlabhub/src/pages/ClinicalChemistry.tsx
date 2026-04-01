import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FlaskConical, Activity, Beaker, TestTubes, ShieldCheck, BookOpen, Calculator, BarChart3 } from "lucide-react";
import { TestInterpreter } from "@/components/chemistry/TestInterpreter";
import { QCInterpreter } from "@/components/chemistry/QCInterpreter";

const metabolicPanels = {
  bmp: {
    name: "Basic Metabolic Panel (BMP)",
    tests: [
      { name: "Glucose (Fasting)", range: "70–100 mg/dL", unit: "mg/dL", significance: "Evaluates carbohydrate metabolism. Elevated in diabetes mellitus, Cushing syndrome, pancreatitis. Decreased in insulinoma, Addison disease, hepatic failure.", method: "Hexokinase/Glucose oxidase" },
      { name: "Blood Urea Nitrogen (BUN)", range: "7–20 mg/dL", unit: "mg/dL", significance: "Measures urea nitrogen, the end product of protein metabolism. Elevated in renal disease, dehydration, GI bleeding, high-protein diet. Decreased in liver disease, malnutrition.", method: "Urease/Glutamate dehydrogenase" },
      { name: "Creatinine", range: "0.6–1.2 mg/dL", unit: "mg/dL", significance: "Byproduct of creatine phosphate metabolism in muscle. More specific indicator of renal function than BUN. Elevated in renal impairment, rhabdomyolysis.", method: "Jaffe reaction / Enzymatic" },
      { name: "Sodium (Na⁺)", range: "136–145 mEq/L", unit: "mEq/L", significance: "Major extracellular cation. Hyponatremia: SIADH, diuretics, adrenal insufficiency. Hypernatremia: dehydration, diabetes insipidus, Cushing syndrome.", method: "Ion-selective electrode (ISE)" },
      { name: "Potassium (K⁺)", range: "3.5–5.0 mEq/L", unit: "mEq/L", significance: "Major intracellular cation. Hyperkalemia: renal failure, Addison disease, hemolysis. Hypokalemia: diuretics, vomiting, Cushing syndrome.", method: "Ion-selective electrode (ISE)" },
      { name: "Chloride (Cl⁻)", range: "98–106 mEq/L", unit: "mEq/L", significance: "Major extracellular anion. Follows sodium changes. Elevated in dehydration, renal tubular acidosis. Decreased in vomiting, metabolic alkalosis.", method: "Ion-selective electrode (ISE)" },
      { name: "CO₂ (Bicarbonate)", range: "23–29 mEq/L", unit: "mEq/L", significance: "Reflects acid-base status. Decreased in metabolic acidosis (DKA, renal failure, lactic acidosis). Increased in metabolic alkalosis, vomiting.", method: "Enzymatic (phosphoenolpyruvate carboxylase)" },
      { name: "Calcium (Total)", range: "8.5–10.5 mg/dL", unit: "mg/dL", significance: "Essential for neuromuscular function, coagulation, bone metabolism. Hypercalcemia: hyperparathyroidism, malignancy. Hypocalcemia: hypoparathyroidism, vitamin D deficiency.", method: "Arsenazo III / o-Cresolphthalein complexone" },
    ],
  },
  cmp: {
    name: "Comprehensive Metabolic Panel (CMP)",
    tests: [
      { name: "Total Protein", range: "6.0–8.3 g/dL", unit: "g/dL", significance: "Sum of albumin and globulins. Elevated in dehydration, multiple myeloma, chronic inflammation. Decreased in malnutrition, liver disease, nephrotic syndrome.", method: "Biuret reaction" },
      { name: "Albumin", range: "3.5–5.0 g/dL", unit: "g/dL", significance: "Major plasma protein synthesized by liver. Maintains oncotic pressure. Decreased in liver disease, nephrotic syndrome, malnutrition, burns.", method: "Bromcresol green (BCG) / Bromcresol purple (BCP)" },
      { name: "Bilirubin (Total)", range: "0.1–1.2 mg/dL", unit: "mg/dL", significance: "Product of heme degradation. Elevated in hepatitis, biliary obstruction, hemolytic anemia. Direct bilirubin elevated in obstructive jaundice.", method: "Diazo reaction (Jendrassik-Grof)" },
      { name: "ALP (Alkaline Phosphatase)", range: "44–147 IU/L", unit: "IU/L", significance: "Found in liver, bone, intestine, placenta. Elevated in biliary obstruction, bone disease (Paget's), pregnancy. Isoenzymes distinguish source.", method: "p-Nitrophenylphosphate substrate" },
      { name: "AST (Aspartate Aminotransferase)", range: "10–40 IU/L", unit: "IU/L", significance: "Found in liver, heart, skeletal muscle, kidney. Elevated in hepatocellular damage, MI, muscle injury. Less specific for liver than ALT.", method: "NADH coupled reaction (IFCC)" },
      { name: "ALT (Alanine Aminotransferase)", range: "7–56 IU/L", unit: "IU/L", significance: "More specific for hepatocellular damage than AST. Elevated in hepatitis, drug-induced liver injury. ALT > AST suggests viral hepatitis; AST > ALT suggests alcoholic liver disease.", method: "NADH coupled reaction (IFCC)" },
    ],
  },
};

const liverPanel = [
  { name: "AST / ALT Ratio", significance: "Ratio >2 strongly suggests alcoholic liver disease (De Ritis ratio). Ratio <1 suggests viral hepatitis. Both markedly elevated (>1000 IU/L) in acute viral hepatitis, drug/toxin-induced injury (acetaminophen)." },
  { name: "GGT (Gamma-Glutamyl Transferase)", range: "9–48 IU/L", significance: "Highly sensitive for hepatobiliary disease. Markedly elevated in biliary obstruction and alcoholism. Used to confirm hepatic origin of elevated ALP." },
  { name: "LDH (Lactate Dehydrogenase)", range: "140–280 IU/L", significance: "Non-specific marker found in many tissues. 5 isoenzymes: LDH-1,2 (heart, RBCs), LDH-4,5 (liver, skeletal muscle). Elevated in MI, hemolytic anemia, liver disease, malignancy." },
  { name: "5'-Nucleotidase", range: "0–17 IU/L", significance: "Specific for hepatobiliary disease. Elevated in biliary obstruction. Used to confirm hepatic origin of elevated ALP when GGT is unavailable." },
  { name: "Ammonia", range: "15–45 µg/dL", significance: "Product of amino acid deamination, converted to urea by liver. Elevated in hepatic encephalopathy, Reye syndrome, urea cycle defects. Specimen must be kept on ice." },
];

const renalFunction = [
  { name: "eGFR", range: ">60 mL/min/1.73m²", significance: "Estimated glomerular filtration rate calculated from creatinine, age, sex, race (CKD-EPI equation preferred). Stages: G1 (≥90), G2 (60-89), G3a (45-59), G3b (30-44), G4 (15-29), G5 (<15)." },
  { name: "BUN/Creatinine Ratio", range: "10:1 – 20:1", significance: "Ratio >20:1 suggests pre-renal azotemia (dehydration, CHF, GI bleeding). Ratio <10:1 suggests intrinsic renal disease or low protein intake." },
  { name: "Cystatin C", range: "0.6–1.0 mg/L", significance: "Alternative GFR marker not affected by muscle mass, diet, or sex. More accurate in elderly, pediatric, and malnourished patients. Combined with creatinine for CKD-EPI equation." },
  { name: "Uric Acid", range: "M: 3.5–7.2 mg/dL; F: 2.6–6.0 mg/dL", significance: "End product of purine metabolism. Elevated in gout, renal failure, tumor lysis syndrome, pre-eclampsia. Decreased in Wilson disease, Fanconi syndrome." },
  { name: "Microalbumin (Urine)", range: "<30 mg/g creatinine", significance: "Early marker of diabetic nephropathy. 30-300 mg/g = moderately increased albuminuria. >300 mg/g = severely increased albuminuria. Annual screening recommended for diabetics." },
];

const cardiacMarkers = [
  { name: "Troponin I / Troponin T (hs-cTn)", range: "<14 ng/L (99th percentile)", significance: "Gold standard for myocardial injury. Highly specific and sensitive for MI. Rises 3-6 hours post-MI, peaks 12-24 hours. High-sensitivity assays detect subclinical injury. Serial measurements required (0h, 3h algorithm)." },
  { name: "CK-MB", range: "<5.0 ng/mL", significance: "CK isoenzyme from cardiac muscle. Less specific than troponin. Useful for detecting reinfarction (shorter half-life). CK-MB index >5% suggests cardiac source." },
  { name: "BNP / NT-proBNP", range: "BNP: <100 pg/mL; NT-proBNP: <300 pg/mL", significance: "Released by ventricular myocytes in response to volume overload/wall stress. Used to diagnose and monitor heart failure. Age-adjusted cutoffs for NT-proBNP." },
  { name: "Myoglobin", range: "<70 ng/mL", significance: "Early but non-specific marker of muscle injury. Rises 1-3 hours post-MI but also elevated in skeletal muscle injury, rhabdomyolysis, renal failure." },
  { name: "D-Dimer", range: "<500 ng/mL FEU", significance: "Fibrin degradation product. High negative predictive value for DVT/PE. Elevated in DIC, surgery, trauma, pregnancy, malignancy. Age-adjusted cutoff: age × 10 ng/mL for patients >50 years." },
];

const qcContent = [
  { title: "Levey-Jennings Charts", content: "Plot QC results over time against mean ± 1SD, 2SD, 3SD. Visualize trends, shifts, and random error. Each analyte has its own chart. Minimum 20 data points to establish acceptable range." },
  { title: "Westgard Rules", content: "Multi-rule QC system: 1₂s (warning), 1₃s (random error), 2₂s (systematic error), R₄s (random error), 4₁s (shift), 10x̄ (shift). A run is rejected when any rejection rule is violated." },
  { title: "Delta Checks", content: "Compare current patient result with previous result. Flag significant changes that may indicate specimen mix-up, IV contamination, or acute clinical change." },
  { title: "Proficiency Testing (PT)", content: "External QC program (e.g., CAP surveys). Unknown samples analyzed and results compared to peer group. Required for laboratory accreditation." },
  { title: "Method Validation", content: "Required before implementing new test methods. Includes precision, accuracy, linearity, AMR, reference range verification, and interference studies. CLSI EP documents provide guidelines." },
];

export default function ClinicalChemistry() {
  const [activeTab, setActiveTab] = useState("interpreter");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Clinical Chemistry
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Comprehensive reference for clinical chemistry analytes, interactive test interpretation, methodologies, clinical significance, and quality control — based on Tietz, Bishop, and Kaplan & Pesce.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="interpreter" className="gap-1.5 text-xs"><Calculator className="h-3.5 w-3.5" /> Test Interpreter</TabsTrigger>
            <TabsTrigger value="metabolic" className="gap-1.5 text-xs"><Beaker className="h-3.5 w-3.5" /> Metabolic Panels</TabsTrigger>
            <TabsTrigger value="liver" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Liver Function</TabsTrigger>
            <TabsTrigger value="renal" className="gap-1.5 text-xs"><TestTubes className="h-3.5 w-3.5" /> Renal Function</TabsTrigger>
            <TabsTrigger value="cardiac" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Cardiac Markers</TabsTrigger>
            <TabsTrigger value="qc" className="gap-1.5 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Quality Control</TabsTrigger>
            <TabsTrigger value="qc-interpreter" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> QC Charts & Westgard</TabsTrigger>
          </TabsList>

          <TabsContent value="interpreter">
            <TestInterpreter />
          </TabsContent>

          <TabsContent value="metabolic" className="space-y-6">
            {Object.values(metabolicPanels).map((panel) => (
              <Card key={panel.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{panel.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="space-y-4">
                      {panel.tests.map((test) => (
                        <div key={test.name} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-semibold">{test.name}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">{test.range}</Badge>
                              <Badge variant="secondary" className="text-xs">{test.method}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.significance}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="liver" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liver Function Tests & Hepatic Markers</CardTitle>
                <CardDescription>Assessment of hepatocellular damage, synthetic function, and biliary obstruction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {liverPanel.map((test) => (
                  <div key={test.name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold">{test.name}</h4>
                      {test.range && <Badge variant="outline">{test.range}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{test.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renal Function Assessment</CardTitle>
                <CardDescription>Evaluation of glomerular filtration, tubular function, and kidney injury markers (KDIGO Guidelines)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renalFunction.map((test) => (
                  <div key={test.name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold">{test.name}</h4>
                      <Badge variant="outline">{test.range}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{test.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cardiac" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cardiac Biomarkers</CardTitle>
                <CardDescription>Diagnosis and monitoring of ACS, heart failure, and thromboembolic events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cardiacMarkers.map((marker) => (
                  <div key={marker.name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold">{marker.name}</h4>
                      <Badge variant="outline">{marker.range}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{marker.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Control & Assurance</CardTitle>
                <CardDescription>Statistical QC methods, proficiency testing, and method validation (CLSI C24-Ed4)</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {qcContent.map((item, i) => (
                    <AccordionItem key={i} value={`qc-${i}`}>
                      <AccordionTrigger>{item.title}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{item.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qc-interpreter">
            <QCInterpreter />
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong>References:</strong> Burtis CA, Bruns DE. Tietz Fundamentals of Clinical Chemistry and Molecular Diagnostics, 8th ed. Bishop ML et al. Clinical Chemistry, 8th ed. CLSI documents EP05, EP06, EP09, EP15, C24, C28-A3c.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
