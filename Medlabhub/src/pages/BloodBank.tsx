import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Droplets, Activity, BookOpen, ShieldCheck, AlertTriangle } from "lucide-react";

const bloodGroups = [
  { group: "A", antigens: "A antigen on RBCs", antibodies: "Anti-B (IgM) in plasma", frequency: "White: 40%, Black: 27%, Asian: 28%", genotypes: "AA or AO", notes: "A₁ subgroup (80%) reacts strongly with anti-A; A₂ (20%) reacts weakly. A₂ individuals may develop anti-A₁ (clinically insignificant lectin-reactive antibody). A₁ cells react with Dolichos biflorus lectin." },
  { group: "B", antigens: "B antigen on RBCs", antibodies: "Anti-A (IgM) in plasma", frequency: "White: 11%, Black: 20%, Asian: 27%", genotypes: "BB or BO", notes: "B subgroups are rare. Acquired B phenotype can occur in intestinal bacterial infections (bacterial enzymes modify A antigen to appear B-like). Usually detected by weakened B antigen reactivity." },
  { group: "AB", antigens: "A and B antigens on RBCs", antibodies: "Neither anti-A nor anti-B", frequency: "White: 4%, Black: 4%, Asian: 5%", genotypes: "AB", notes: "Universal plasma donor (no ABO antibodies). AB+ is universal platelet donor. Rarest ABO type in most populations. Cannot produce isohemagglutinins against A or B." },
  { group: "O", antigens: "H antigen only (no A or B)", antibodies: "Anti-A and Anti-B (IgM + IgG)", frequency: "White: 45%, Black: 49%, Asian: 40%", genotypes: "OO", notes: "Universal RBC donor. Group O plasma contains anti-A and anti-B (both IgM and IgG — significant for transfusion). Bombay phenotype (Oh): lacks H antigen, has anti-H, anti-A, anti-B. Extremely rare, can only receive Bombay blood." },
];

const rhSystem = [
  { antigen: "D (Rho)", significance: "Most immunogenic Rh antigen. Rh-positive = D antigen present (85% Caucasians). Rh-negative = D antigen absent. Anti-D is IgG (does NOT activate complement). Causes HDN (hemolytic disease of newborn) and delayed hemolytic transfusion reactions. Weak D (Du): quantitative reduction in D antigen — type as Rh-positive for donors, Rh-negative for recipients (policy varies)." },
  { antigen: "C, c, E, e", significance: "Next most common Rh antigens. Fisher-Race nomenclature: DCe (R₁, most common in Caucasians), DcE (R₂), Dce (R₀, most common in African Americans), dce (r). Anti-c and anti-E are clinically significant — can cause HDN and transfusion reactions. Rh null phenotype: lacks all Rh antigens, chronic hemolytic anemia (stomatocytes on smear)." },
];

const otherBloodGroupSystems = [
  { system: "Kell (K/k)", significance: "K (Kell) antigen is highly immunogenic (second only to D). Anti-K causes severe HDN (suppresses erythropoiesis rather than hemolysis) and transfusion reactions. k (cellano) is high-frequency antigen. Kell antigens destroyed by treating RBCs with DTT/AET — useful in antibody identification." },
  { system: "Duffy (Fya/Fyb)", significance: "Duffy-negative phenotype Fy(a-b-) common in African Americans (~68%), confers resistance to Plasmodium vivax malaria (Duffy antigen = receptor for merozoite invasion). Anti-Fya more common than anti-Fyb. Clinically significant — causes HDN and transfusion reactions." },
  { system: "Kidd (Jka/Jkb)", significance: "Anti-Jka and anti-Jkb are notorious for causing delayed hemolytic transfusion reactions (DHTR). Antibody titers drop rapidly below detectable levels, then cause anamnestic response upon re-exposure. 'Kidd kills' — dosage effect, complement activation, intravascular hemolysis. Jk(a-b-) phenotype resistant to urea lysis." },
  { system: "Lewis (Lea/Leb)", significance: "Lewis antigens are NOT intrinsic to RBCs — adsorbed from plasma. IgM antibodies, do NOT cause HDN (cannot cross placenta). Le(a+b-) or Le(a-b+) common. Le(a-b-) in ~22% African Americans. Clinically insignificant — room temperature reactive, rarely cause transfusion reactions." },
  { system: "MNSs", significance: "Anti-M: naturally occurring IgM, usually clinically insignificant (room temperature reactive). Anti-S and anti-s: IgG, clinically significant — can cause HDN and transfusion reactions. Anti-U: found in S-s- individuals (rare, mainly African descent), clinically significant." },
];

const compatibilityTesting = [
  { step: "1. ABO/Rh Typing", description: "Forward typing: Patient RBCs + anti-A, anti-B, anti-D reagents. Reverse typing: Patient serum/plasma + known A₁ cells, B cells (and optionally O cells). Forward and reverse must agree. Discrepancies require investigation before issuing blood. Gel column technology and solid-phase methods increasingly replace tube testing." },
  { step: "2. Antibody Screen (Indirect Antiglobulin Test)", description: "Patient serum/plasma tested against 2-3 group O screening cells with known antigen profiles. Three phases: immediate spin (RT), 37°C incubation, AHG (Coombs) phase. PEG or LISS enhancement media reduce incubation time. Positive screen requires antibody identification using an 11-cell panel." },
  { step: "3. Antibody Identification", description: "Patient serum tested against 11+ panel cells with known antigen phenotypes. Rule out antigens: if cell is positive for antigen and reaction is negative, that antibody is excluded. Rule of three: 3 antigen-positive reactive cells and 3 antigen-negative non-reactive cells for statistical significance. Consider dosage, enzyme treatment, and autocontrol." },
  { step: "4. Crossmatch", description: "Major crossmatch: Patient serum + Donor RBCs. IS (immediate spin) crossmatch acceptable if current antibody screen is negative and no history of clinically significant antibodies. AHG crossmatch required if screen is positive or history of antibodies. Electronic/computer crossmatch: if two concordant ABO typings on file, negative screen, and validated system." },
  { step: "5. Direct Antiglobulin Test (DAT)", description: "Detects antibodies or complement already coating patient RBCs in vivo. Polyspecific AHG added to washed patient RBCs. If positive, monospecific anti-IgG and anti-C3d determine type of coating. Positive DAT: warm AIHA (IgG ± C3d), cold AIHA (C3d only), HDN, transfusion reaction, drug-induced." },
];

const transfusionReactions = [
  { type: "Acute Hemolytic Transfusion Reaction (AHTR)", timing: "During or within 24h", cause: "ABO incompatibility (most common cause: clerical error)", symptoms: "Fever, chills, flank/back pain, hemoglobinuria, hypotension, DIC, renal failure. Can be fatal.", management: "STOP transfusion immediately. Maintain IV access with normal saline. Send post-transfusion samples for DAT, repeat ABO/Rh, visual hemolysis check, bilirubin, haptoglobin, LDH, urine hemoglobin. Report to blood bank. Support renal function." },
  { type: "Delayed Hemolytic Transfusion Reaction (DHTR)", timing: "3-14 days post-transfusion", cause: "Anamnestic antibody response (commonly Kidd, Rh, Kell, Duffy)", symptoms: "Unexplained decrease in hemoglobin, mild jaundice, positive DAT, fever. Often mild but can be severe (especially anti-Jka).", management: "Identify antibody. Provide antigen-negative units for future transfusions. Update patient antibody history." },
  { type: "Febrile Non-Hemolytic (FNHTR)", timing: "During or within 4h", cause: "Cytokines from WBCs in stored blood, or recipient antibodies to donor WBC antigens (HLA)", symptoms: "Temperature rise ≥1°C, chills, rigors. No hemolysis.", management: "Slow/stop transfusion, rule out hemolytic reaction. Antipyretics. Leukoreduced products for prevention in recurrent cases." },
  { type: "Allergic / Urticarial", timing: "During transfusion", cause: "Recipient IgE against donor plasma proteins", symptoms: "Mild: urticaria, itching, hives. Can usually continue transfusion after antihistamine.", management: "Mild: diphenhydramine, may resume slowly. Severe/anaphylactic: STOP, epinephrine, supportive care. Washed RBCs for prevention." },
  { type: "Anaphylactic Transfusion Reaction", timing: "After few mL of blood", cause: "Anti-IgA antibodies in IgA-deficient recipient", symptoms: "Severe hypotension, bronchospasm, laryngeal edema, no fever. Can be fatal.", management: "STOP immediately. Epinephrine, airway management, IV fluids. Future: washed cellular products or IgA-deficient donor products." },
  { type: "TRALI (Transfusion-Related Acute Lung Injury)", timing: "Within 6 hours", cause: "Donor anti-HLA or anti-HNA antibodies activate recipient neutrophils in pulmonary vasculature", symptoms: "Acute respiratory distress, bilateral pulmonary infiltrates, hypoxia, non-cardiogenic pulmonary edema. Leading cause of transfusion-related mortality.", management: "Supportive: O₂, mechanical ventilation if needed. No diuretics (non-cardiogenic). Donor implicated should be deferred. Mitigation: male-predominant plasma policies." },
  { type: "TACO (Transfusion-Associated Circulatory Overload)", timing: "Within 6-12 hours", cause: "Volume overload, especially in elderly, cardiac/renal disease", symptoms: "Dyspnea, orthopnea, hypertension, jugular venous distention, pulmonary edema. Elevated BNP.", management: "Slow transfusion rate, diuretics, upright positioning. Distinguish from TRALI by elevated BNP, positive fluid balance, response to diuretics." },
];

const componentTherapy = [
  { component: "Packed Red Blood Cells (PRBCs)", storage: "1-6°C, 42 days (CPDA-1: 35 days, AS-1/3/5: 42 days)", hct: "55-80%", indication: "Symptomatic anemia, acute blood loss. One unit raises Hgb ~1 g/dL and Hct ~3% in 70 kg adult. ABO/Rh compatible required. Leukoreduced to prevent FNHTR, CMV transmission, HLA alloimmunization." },
  { component: "Fresh Frozen Plasma (FFP)", storage: "-18°C or below, 1 year", hct: "N/A", indication: "Coagulation factor replacement: DIC, warfarin reversal (if PCC unavailable), TTP (plasma exchange), massive transfusion, liver disease. Contains ALL coagulation factors. Must be ABO compatible (contains isohemagglutinins). Thaw at 37°C, transfuse within 24 hours." },
  { component: "Platelets", storage: "20-24°C with agitation, 5 days", hct: "N/A", indication: "Thrombocytopenia or platelet dysfunction with bleeding. Prophylactic: <10,000/µL (stable), <50,000 (surgery), <100,000 (neurosurgery). One apheresis unit should raise count by 30,000-60,000/µL. ABO compatible preferred. Rh compatibility important for Rh-negative females of childbearing age." },
  { component: "Cryoprecipitate", storage: "-18°C, 1 year", hct: "N/A", indication: "Rich in fibrinogen (150-250 mg/unit), Factor VIII, Factor XIII, von Willebrand factor, fibronectin. Primary use: fibrinogen replacement in DIC, massive transfusion (fibrinogen <100 mg/dL). Dose: 1 unit per 5-10 kg body weight. Pool of 5-10 units typical adult dose." },
];

export default function BloodBank() {
  const [activeTab, setActiveTab] = useState("abo");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            Blood Bank (Immunohematology)
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            ABO/Rh blood group systems, compatibility testing, transfusion reactions, and component therapy — based on Harmening's Modern Blood Banking & Transfusion Practices (7th ed.), AABB Technical Manual (21st ed.), and Quinley's Immunohematology (4th ed.).
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="abo" className="gap-1.5 text-xs"><Droplets className="h-3.5 w-3.5" /> ABO/Rh System</TabsTrigger>
            <TabsTrigger value="other" className="gap-1.5 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Other Blood Groups</TabsTrigger>
            <TabsTrigger value="compatibility" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Compatibility Testing</TabsTrigger>
            <TabsTrigger value="reactions" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Transfusion Reactions</TabsTrigger>
            <TabsTrigger value="components" className="gap-1.5 text-xs"><Heart className="h-3.5 w-3.5" /> Component Therapy</TabsTrigger>
          </TabsList>

          <TabsContent value="abo" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">ABO Blood Group System</CardTitle><CardDescription>Landsteiner's Law: If an antigen is present on RBCs, the corresponding antibody is absent from plasma, and vice versa.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {bloodGroups.map((bg) => (
                  <div key={bg.group} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-lg">Group {bg.group}</h4>
                      <Badge variant="outline">{bg.frequency}</Badge>
                      <Badge variant="secondary" className="text-xs">Genotype: {bg.genotypes}</Badge>
                    </div>
                    <p className="text-sm"><strong>Antigens:</strong> <span className="text-muted-foreground">{bg.antigens}</span></p>
                    <p className="text-sm"><strong>Antibodies:</strong> <span className="text-muted-foreground">{bg.antibodies}</span></p>
                    <p className="text-sm text-muted-foreground">{bg.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Rh Blood Group System</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {rhSystem.map((rh) => (
                  <div key={rh.antigen} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold">{rh.antigen}</h4>
                    <p className="text-sm text-muted-foreground">{rh.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Other Clinically Significant Blood Group Systems</CardTitle><CardDescription>Beyond ABO and Rh (Ref: AABB Technical Manual, 21st ed.)</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {otherBloodGroupSystems.map((sys) => (
                  <div key={sys.system} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{sys.system}</h4>
                    <p className="text-sm text-muted-foreground">{sys.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compatibility" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Pre-Transfusion Compatibility Testing</CardTitle><CardDescription>Step-by-step process ensuring safe blood transfusion</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {compatibilityTesting.map((step) => (
                  <div key={step.step} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{step.step}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reactions" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Transfusion Reactions</CardTitle><CardDescription>Recognition, management, and prevention (Ref: Harmening, Modern Blood Banking, 7th ed.)</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {transfusionReactions.map((rx) => (
                  <div key={rx.type} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{rx.type}</h4>
                      <Badge variant="outline" className="text-xs">{rx.timing}</Badge>
                    </div>
                    <p className="text-sm"><strong>Cause:</strong> <span className="text-muted-foreground">{rx.cause}</span></p>
                    <p className="text-sm"><strong>Symptoms:</strong> <span className="text-muted-foreground">{rx.symptoms}</span></p>
                    <p className="text-sm"><strong>Management:</strong> <span className="text-muted-foreground">{rx.management}</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Blood Component Therapy</CardTitle><CardDescription>Preparation, storage, and clinical indications</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {componentTherapy.map((comp) => (
                  <div key={comp.component} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{comp.component}</h4>
                      <Badge variant="outline" className="text-xs">{comp.storage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{comp.indication}</p>
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
                <strong>References:</strong> Harmening DM. Modern Blood Banking & Transfusion Practices, 7th ed. AABB Technical Manual, 21st ed. Quinley ED. Immunohematology: Principles and Practice, 4th ed. Fung MK, et al. AABB Technical Manual, 20th ed.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
