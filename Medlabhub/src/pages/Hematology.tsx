import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Droplets, Microscope, Activity, BookOpen, ShieldCheck } from "lucide-react";

const cbcParameters = [
  { name: "WBC (White Blood Cell Count)", range: "4,500–11,000/µL", significance: "Leukocytosis: infection, inflammation, leukemia, stress. Leukopenia: aplastic anemia, chemotherapy, viral infection, SLE. Differential count identifies specific cell line abnormalities.", category: "WBC" },
  { name: "Neutrophils", range: "40–70% (1,800–7,700/µL)", significance: "First responders to bacterial infection. Left shift (↑bands >10%) indicates acute bacterial infection. Neutrophilia: bacterial infection, inflammation, CML. Neutropenia: drug-induced, viral, aplastic anemia, severe sepsis.", category: "WBC" },
  { name: "Lymphocytes", range: "20–40% (1,000–4,800/µL)", significance: "T-cells (cell-mediated immunity), B-cells (humoral immunity), NK cells. Lymphocytosis: viral infection (EBV, CMV), CLL, pertussis. Lymphopenia: HIV/AIDS, corticosteroids, radiation.", category: "WBC" },
  { name: "Monocytes", range: "2–8% (200–950/µL)", significance: "Precursors to tissue macrophages. Monocytosis: chronic infections (TB, endocarditis), autoimmune disease, CMML. Monocytopenia: hairy cell leukemia, aplastic anemia.", category: "WBC" },
  { name: "Eosinophils", range: "1–4% (0–450/µL)", significance: "Eosinophilia: parasitic infections, allergic reactions, asthma, Churg-Strauss, hypereosinophilic syndrome, Hodgkin lymphoma. Eosinopenia: Cushing syndrome, acute stress.", category: "WBC" },
  { name: "Basophils", range: "0–1% (0–200/µL)", significance: "Contain histamine and heparin granules. Basophilia: CML (hallmark), polycythemia vera, hypothyroidism. Very rare basopenia has limited clinical significance.", category: "WBC" },
  { name: "RBC (Red Blood Cell Count)", range: "M: 4.5–5.5 × 10⁶/µL; F: 4.0–5.0 × 10⁶/µL", significance: "Erythrocytosis: polycythemia vera, dehydration, chronic hypoxia. Decreased: anemia (iron deficiency, B12/folate deficiency, chronic disease, hemolytic).", category: "RBC" },
  { name: "Hemoglobin (Hgb)", range: "M: 14–18 g/dL; F: 12–16 g/dL", significance: "Oxygen-carrying protein. WHO anemia criteria: M <13 g/dL, F <12 g/dL. MCV classifies anemia: microcytic (<80 fL), normocytic (80-100), macrocytic (>100).", category: "RBC" },
  { name: "Hematocrit (Hct)", range: "M: 42–52%; F: 37–47%", significance: "Packed cell volume. Approximately 3× hemoglobin value. Spuriously elevated in dehydration. Rule of three: Hgb × 3 ≈ Hct (±3). Critical values: <15% or >60%.", category: "RBC" },
  { name: "MCV", range: "80–100 fL", significance: "Mean Corpuscular Volume = Hct/RBC × 10. Microcytic (<80): iron deficiency, thalassemia, sideroblastic anemia, lead poisoning. Macrocytic (>100): B12/folate deficiency, liver disease, MDS, reticulocytosis.", category: "RBC Indices" },
  { name: "MCH", range: "27–33 pg", significance: "Mean Corpuscular Hemoglobin = Hgb/RBC × 10. Parallels MCV. Decreased in hypochromic anemias (iron deficiency, thalassemia).", category: "RBC Indices" },
  { name: "MCHC", range: "32–36 g/dL", significance: "Mean Corpuscular Hemoglobin Concentration = Hgb/Hct × 100. Increased (>36 g/dL): spherocytosis, sickle cell disease. Decreased: iron deficiency, thalassemia.", category: "RBC Indices" },
  { name: "RDW", range: "11.5–14.5%", significance: "Red cell Distribution Width. Measures anisocytosis. Elevated RDW: iron deficiency anemia (distinguishes from thalassemia minor which has normal RDW), mixed nutritional deficiency, early response to therapy.", category: "RBC Indices" },
  { name: "Platelet Count", range: "150,000–400,000/µL", significance: "Thrombocytosis: reactive (infection, iron deficiency) vs. primary (essential thrombocythemia, CML). Thrombocytopenia: ITP, TTP/HUS, DIC, heparin-induced, aplastic anemia, hypersplenism.", category: "Platelets" },
  { name: "MPV", range: "7.4–10.4 fL", significance: "Mean Platelet Volume. Large platelets suggest increased production (ITP, recovery from thrombocytopenia). Small platelets suggest decreased production (aplastic anemia, chemotherapy).", category: "Platelets" },
  { name: "Reticulocyte Count", range: "0.5–1.5% (25,000–75,000/µL)", significance: "Immature RBCs reflecting bone marrow erythropoietic activity. Corrected reticulocyte count = Retic% × (Patient Hct / Normal Hct). RPI >3: adequate marrow response (hemolysis, hemorrhage). RPI <2: inadequate response.", category: "RBC" },
];

const bloodSmearFindings = [
  { finding: "Schistocytes (Helmet cells, fragments)", associations: "Microangiopathic hemolytic anemia (MAHA): TTP/HUS, DIC, malignant hypertension, mechanical heart valves, HELLP syndrome. >1% strongly suggests MAHA." },
  { finding: "Spherocytes", associations: "Hereditary spherocytosis (most common cause), warm autoimmune hemolytic anemia (AIHA), ABO HDN. Osmotically fragile, increased MCHC. Confirmed by osmotic fragility test, EMA binding assay." },
  { finding: "Target Cells (Codocytes)", associations: "Thalassemia, hemoglobin C disease, liver disease, iron deficiency (severe), post-splenectomy. Increased surface area to volume ratio." },
  { finding: "Sickle Cells (Drepanocytes)", associations: "Sickle cell disease (HbSS). Formed under low O₂ tension due to HbS polymerization. Confirmed by hemoglobin electrophoresis and solubility test." },
  { finding: "Howell-Jolly Bodies", associations: "Nuclear remnants in RBCs. Post-splenectomy, functional asplenia (sickle cell), megaloblastic anemia. Single, round, dark purple inclusion." },
  { finding: "Basophilic Stippling", associations: "Aggregated ribosomes. Lead poisoning, thalassemia, sideroblastic anemia, pyrimidine-5'-nucleotidase deficiency. Coarse stippling more clinically significant." },
  { finding: "Rouleaux Formation", associations: "RBCs stacked like coins. Multiple myeloma, Waldenström macroglobulinemia, chronic inflammation (↑fibrinogen, ↑immunoglobulins). Elevated ESR." },
  { finding: "Auer Rods", associations: "Pathognomonic for AML (especially M3/APL). Crystallized myeloperoxidase granules in myeloblasts. Multiple Auer rods (faggot cells) = APL with t(15;17)." },
  { finding: "Toxic Granulation / Döhle Bodies", associations: "Reactive changes in neutrophils during severe infection/inflammation. Toxic granulation = prominent azurophilic granules. Döhle bodies = pale blue cytoplasmic inclusions (rough ER)." },
  { finding: "Hypersegmented Neutrophils", associations: "≥5 lobes in one neutrophil or ≥5% with 5 lobes = hypersegmentation. Megaloblastic anemia (B12 or folate deficiency). Most specific peripheral smear finding for megaloblastic anemia." },
  { finding: "Tear Drop Cells (Dacrocytes)", associations: "Myelofibrosis (primary or secondary), myelophthisic anemia, thalassemia major. Associated with extramedullary hematopoiesis and leukoerythroblastic picture." },
];

const coagulationTests = [
  { name: "PT (Prothrombin Time)", range: "11–13.5 seconds", significance: "Measures extrinsic pathway (Factor VII) and common pathway (X, V, II, fibrinogen). Prolonged in warfarin therapy, liver disease, vitamin K deficiency, DIC. Used to calculate INR for warfarin monitoring." },
  { name: "INR", range: "Therapeutic: 2.0–3.0 (standard); 2.5–3.5 (mechanical heart valve)", significance: "International Normalized Ratio standardizes PT across reagents. INR = (Patient PT / Mean Normal PT)^ISI. Critical for warfarin dosing. INR >4.5 = bleeding risk." },
  { name: "aPTT (Activated Partial Thromboplastin Time)", range: "25–35 seconds", significance: "Measures intrinsic pathway (XII, XI, IX, VIII) and common pathway. Prolonged in heparin therapy, hemophilia A (VIII) and B (IX), von Willebrand disease, lupus anticoagulant. Mixing study distinguishes factor deficiency from inhibitor." },
  { name: "Fibrinogen", range: "200–400 mg/dL", significance: "Acute phase reactant and coagulation Factor I. Decreased in DIC (consumption), severe liver disease, dysfibrinogenemia. Increased in acute inflammation, pregnancy. Critical <100 mg/dL." },
  { name: "D-Dimer", range: "<500 ng/mL FEU", significance: "Fibrin degradation product. High sensitivity, low specificity for VTE. Negative D-dimer effectively rules out DVT/PE in low-risk patients. Elevated in DIC, surgery, trauma, pregnancy, malignancy." },
  { name: "Bleeding Time (historical)", range: "2–9 minutes", significance: "Historically used to assess platelet function (now largely replaced by PFA-100). Prolonged in thrombocytopenia, von Willebrand disease, aspirin use, uremia. Template method (Ivy) standardized the test." },
  { name: "Mixing Study", range: "Corrects if factor deficiency", significance: "Patient plasma mixed 1:1 with normal plasma. If PT/aPTT corrects: factor deficiency. If doesn't correct: inhibitor present (lupus anticoagulant, factor-specific inhibitor). Incubation at 37°C for 2 hours detects time-dependent inhibitors (Factor VIII inhibitor)." },
  { name: "Thrombin Time (TT)", range: "14–19 seconds", significance: "Measures conversion of fibrinogen to fibrin by thrombin. Prolonged in heparin contamination (corrects with reptilase time), low/abnormal fibrinogen, FDPs, dabigatran. Reptilase time normal in heparin, prolonged in dysfibrinogenemia." },
];

const hemoglobinopathies = [
  { condition: "Sickle Cell Disease (HbSS)", description: "Point mutation: Glu→Val at position 6 of β-globin. HbS polymerizes under low O₂ → sickling. Vaso-occlusive crises, splenic sequestration, aplastic crisis (parvovirus B19), acute chest syndrome. Diagnosis: Hb electrophoresis shows HbS 80-90%, HbF 2-20%, absent HbA. Newborn screening: HbFS pattern." },
  { condition: "Sickle Cell Trait (HbAS)", description: "Heterozygous carrier. Usually asymptomatic but may sickle under extreme conditions (high altitude, severe dehydration). Protective against Plasmodium falciparum malaria. Electrophoresis: HbA 55-60%, HbS 35-45%." },
  { condition: "β-Thalassemia Major", description: "Absent β-globin chain production (β⁰/β⁰). Severe anemia by 6 months of age. Cooley anemia: hepatosplenomegaly, skeletal deformities, iron overload. Transfusion-dependent. Electrophoresis: HbF 60-90%, ↑HbA2. Target cells, nucleated RBCs on smear." },
  { condition: "β-Thalassemia Minor (Trait)", description: "Heterozygous (β⁺/β or β⁰/β). Mild microcytic hypochromic anemia mimicking iron deficiency. Key distinguishing features: normal/elevated RBC count, normal RDW, elevated HbA2 (3.5-7%). Mentzer index (MCV/RBC): <13 suggests thalassemia, >13 suggests iron deficiency." },
  { condition: "α-Thalassemia", description: "Deletion of α-globin genes (chromosome 16). 4 genes: Silent carrier (αα/α-), α-thal trait (αα/-- or α-/α-), HbH disease (α-/--), Hydrops fetalis (--/--). HbH inclusions (β₄ tetramers) seen with supravital stain. Bart's hydrops (γ₄) is fatal in utero." },
  { condition: "Hemoglobin C Disease", description: "Glu→Lys at position 6 of β-globin. HbCC: mild hemolytic anemia with target cells, HbC crystals on smear. HbSC disease: compound heterozygote, milder than HbSS but increased risk of retinopathy and avascular necrosis." },
];

export default function Hematology() {
  const [activeTab, setActiveTab] = useState("cbc");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Droplets className="h-8 w-8 text-primary" />
            Hematology
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Complete blood count analysis, peripheral blood smear interpretation, coagulation studies, and hemoglobinopathies — based on Rodak's Hematology (6th ed.), Harmening's Clinical Hematology (6th ed.), and Turgeon's Clinical Hematology (6th ed.).
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="cbc" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> CBC Parameters</TabsTrigger>
            <TabsTrigger value="smear" className="gap-1.5 text-xs"><Microscope className="h-3.5 w-3.5" /> Blood Smear</TabsTrigger>
            <TabsTrigger value="coagulation" className="gap-1.5 text-xs"><Droplets className="h-3.5 w-3.5" /> Coagulation</TabsTrigger>
            <TabsTrigger value="hemoglobin" className="gap-1.5 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Hemoglobinopathies</TabsTrigger>
          </TabsList>

          <TabsContent value="cbc" className="space-y-4">
            {["WBC", "RBC", "RBC Indices", "Platelets"].map((cat) => (
              <Card key={cat}>
                <CardHeader><CardTitle className="text-lg">{cat} Parameters</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {cbcParameters.filter(p => p.category === cat).map((param) => (
                    <div key={param.name} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-sm">{param.name}</h4>
                        <Badge variant="outline" className="text-xs">{param.range}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{param.significance}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="smear" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peripheral Blood Smear Morphology</CardTitle>
                <CardDescription>Key morphologic findings and their clinical associations (Ref: Rodak's Hematology, 6th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bloodSmearFindings.map((f) => (
                  <div key={f.finding} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{f.finding}</h4>
                    <p className="text-sm text-muted-foreground">{f.associations}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coagulation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coagulation Studies</CardTitle>
                <CardDescription>Hemostasis testing: primary, secondary, and fibrinolysis (Ref: Harmening's Clinical Hematology, 6th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {coagulationTests.map((test) => (
                  <div key={test.name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold text-sm">{test.name}</h4>
                      <Badge variant="outline" className="text-xs">{test.range}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{test.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hemoglobin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hemoglobinopathies & Thalassemias</CardTitle>
                <CardDescription>Qualitative and quantitative hemoglobin disorders (Ref: Turgeon's Clinical Hematology, 6th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hemoglobinopathies.map((h) => (
                  <div key={h.condition} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{h.condition}</h4>
                    <p className="text-sm text-muted-foreground">{h.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong>References:</strong> Rodak BF, et al. Hematology: Clinical Principles and Applications, 6th ed. Harmening DM. Clinical Hematology and Fundamentals of Hemostasis, 6th ed. Turgeon ML. Clinical Hematology: Theory and Procedures, 6th ed. Keohane EM, et al. Rodak's Hematology, 6th ed.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
