import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Microscope, Activity, BookOpen, Target } from "lucide-react";

const immunoglobulins = [
  { name: "IgG", percentage: "75-80%", halfLife: "23 days", significance: "Most abundant immunoglobulin. Crosses placenta (only Ig to do so) — provides passive immunity to newborn. Four subclasses (IgG1-4). Opsonization, complement activation (classical pathway), ADCC, neutralization. Secondary immune response. Elevated in chronic infections, autoimmune disease, multiple myeloma (monoclonal)." },
  { name: "IgA", percentage: "10-15%", halfLife: "6 days", significance: "Predominant Ig in secretions (saliva, tears, breast milk, GI/respiratory mucosa). Secretory IgA = dimer + J chain + secretory component. Does NOT activate complement. Selective IgA deficiency is most common primary immunodeficiency (1:600). Associated with anaphylactic transfusion reactions if anti-IgA antibodies present." },
  { name: "IgM", percentage: "5-10%", halfLife: "5 days", significance: "Largest immunoglobulin (pentamer). First antibody produced in primary immune response. Most efficient at complement activation (classical pathway) and agglutination. Isohemagglutinins (anti-A, anti-B) are IgM. Does not cross placenta. Elevated IgM in newborn suggests intrauterine infection (TORCH)." },
  { name: "IgE", percentage: "<0.01%", halfLife: "2 days", significance: "Lowest serum concentration. Binds to Fc receptors on mast cells and basophils. Mediates Type I (immediate) hypersensitivity: allergic rhinitis, asthma, anaphylaxis. Elevated in parasitic infections (helminths), atopic diseases, allergic bronchopulmonary aspergillosis, hyper-IgE syndrome." },
  { name: "IgD", percentage: "<1%", halfLife: "3 days", significance: "Found primarily on surface of mature naïve B cells as antigen receptor (with IgM). Role in B cell activation and differentiation. Minimal serum levels. Function still being researched." },
];

const hypersensitivityTypes = [
  { type: "Type I — Immediate (Anaphylactic)", mechanism: "IgE-mediated. Allergen cross-links IgE on mast cells/basophils → degranulation → release of histamine, leukotrienes, prostaglandins.", examples: "Anaphylaxis, allergic rhinitis, asthma, urticaria, food allergies, drug allergies (penicillin). Skin testing: wheal-and-flare within 15-20 minutes.", mediators: "Histamine, leukotrienes (C4, D4, E4), prostaglandin D2, platelet-activating factor, tryptase (marker of mast cell activation)." },
  { type: "Type II — Cytotoxic (Antibody-mediated)", mechanism: "IgG or IgM directed against cell surface or extracellular matrix antigens → complement activation, ADCC, opsonization → cell destruction.", examples: "Autoimmune hemolytic anemia (warm AIHA: IgG; cold AIHA: IgM), hemolytic disease of newborn (HDN), Goodpasture syndrome, transfusion reactions (acute hemolytic), myasthenia gravis (anti-AChR), Graves disease (stimulatory anti-TSH receptor).", mediators: "IgG, IgM, complement (C3b, MAC), NK cells, macrophages." },
  { type: "Type III — Immune Complex", mechanism: "Antigen-antibody complexes deposit in tissues → complement activation → neutrophil recruitment → tissue damage. Arthus reaction (local) vs. serum sickness (systemic).", examples: "Systemic lupus erythematosus (SLE), post-streptococcal glomerulonephritis, polyarteritis nodosa, serum sickness, rheumatoid arthritis, Farmer's lung (with Type IV). Lab: ↓complement (C3, C4), positive ANA, anti-dsDNA.", mediators: "IgG immune complexes, complement (C3a, C5a = anaphylatoxins), neutrophils, lysosomal enzymes." },
  { type: "Type IV — Delayed (Cell-mediated)", mechanism: "T cell-mediated (no antibody). Sensitized T cells (CD4+ Th1 or CD8+ CTL) react with antigen → cytokine release → macrophage activation → tissue damage. Peaks 48-72 hours.", examples: "Contact dermatitis (poison ivy, nickel), tuberculin skin test (PPD/Mantoux), granulomatous diseases (TB, sarcoidosis), transplant rejection (acute cellular), type 1 diabetes (β-cell destruction), multiple sclerosis.", mediators: "CD4+ T cells, CD8+ T cells, macrophages, IFN-γ, TNF-α, IL-2." },
];

const autoimmunePanels = [
  { test: "ANA (Antinuclear Antibody)", method: "IIF on HEp-2 cells", patterns: "Homogeneous (anti-dsDNA, anti-histone), Speckled (anti-Sm, anti-RNP, anti-SSA/SSB), Nucleolar (anti-RNA Pol III, scleroderma), Centromere (limited scleroderma/CREST). Positive in >95% SLE, but low specificity. Titer >1:160 clinically significant." },
  { test: "Anti-dsDNA", method: "Crithidia luciliae IIF / ELISA", patterns: "Highly specific for SLE (>95% specificity). Correlates with disease activity and lupus nephritis. Titers fluctuate with disease flares. Part of ACR/EULAR SLE classification criteria." },
  { test: "Anti-Smith (Anti-Sm)", method: "ELISA / Immunodiffusion", patterns: "Most specific antibody for SLE (99% specificity, but only 25-30% sensitivity). Directed against snRNP proteins. Does not correlate with disease activity." },
  { test: "Anti-SSA/Ro & Anti-SSB/La", method: "ELISA", patterns: "Sjögren syndrome (both SSA and SSB), Neonatal lupus (SSA crosses placenta → congenital heart block), Subacute cutaneous lupus. SSA+ with ANA-negative lupus is possible." },
  { test: "Rheumatoid Factor (RF)", method: "Latex agglutination / Nephelometry", patterns: "IgM antibody against Fc portion of IgG. Present in ~80% RA but non-specific. Also positive in Sjögren's, SLE, endocarditis, hepatitis C, sarcoidosis, and healthy elderly." },
  { test: "Anti-CCP (Anti-Cyclic Citrullinated Peptide)", method: "ELISA", patterns: "Highly specific for rheumatoid arthritis (>95% specificity). More specific than RF. Positive early in disease, even before clinical symptoms. Predicts erosive disease." },
  { test: "c-ANCA / p-ANCA", method: "IIF on ethanol-fixed neutrophils", patterns: "c-ANCA (anti-PR3): Granulomatosis with polyangiitis (Wegener's) — 90% sensitivity. p-ANCA (anti-MPO): Microscopic polyangiitis, eosinophilic granulomatosis (Churg-Strauss). Confirm with ELISA for PR3/MPO." },
  { test: "Complement (C3, C4, CH50)", method: "Nephelometry / Hemolytic assay", patterns: "Decreased in active SLE (immune complex consumption), post-streptococcal GN, hereditary angioedema (↓C4 only), severe liver disease. CH50 = 0 suggests complete complement deficiency. C2 deficiency: most common complement deficiency, associated with SLE." },
];

const serologyTests = [
  { test: "RPR / VDRL (Syphilis Screening)", description: "Non-treponemal tests detecting anti-cardiolipin (reagin) antibodies. Flocculation tests. Used for screening and monitoring treatment. Titer decreases with successful treatment (fourfold decline). Biological false positives: SLE, pregnancy, viral infections, elderly. Confirm with FTA-ABS or TP-PA." },
  { test: "FTA-ABS (Fluorescent Treponemal Antibody-Absorption)", description: "Confirmatory treponemal test. IIF using T. pallidum as antigen. Remains positive for life (cannot monitor treatment). First to become positive in primary syphilis. Specific but cannot distinguish past from current infection." },
  { test: "Monospot (Heterophile Antibody Test)", description: "Detects heterophile antibodies (IgM) in infectious mononucleosis (EBV). Paul-Bunnell test modified by Davidsohn differential absorption. Agglutinates horse/sheep RBCs. False negative in children <4 years. Confirm with EBV-specific antibodies (VCA IgM, EA, EBNA)." },
  { test: "ASO (Anti-Streptolysin O)", description: "Detects antibodies to streptolysin O of Group A Streptococcus. Elevated in post-streptococcal sequelae: acute rheumatic fever, post-streptococcal glomerulonephritis. Titer >200 IU/mL significant. Anti-DNase B is alternative/supplementary test." },
  { test: "CRP (C-Reactive Protein)", description: "Acute phase reactant produced by liver in response to IL-6. Rapid rise (within 6-8 hours) and fall with inflammation. hs-CRP <1.0 mg/L (low cardiovascular risk), 1-3 (moderate), >3 (high risk). More responsive than ESR to changes in inflammation." },
  { test: "ESR (Erythrocyte Sedimentation Rate)", description: "Non-specific marker of inflammation. Westergren method is reference. Elevated in infection, autoimmune disease, malignancy, pregnancy. Very high (>100 mm/hr): multiple myeloma, temporal arteritis, severe infection, malignancy. Influenced by fibrinogen and immunoglobulin levels." },
];

export default function Immunology() {
  const [activeTab, setActiveTab] = useState("immunoglobulins");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Immunology & Serology
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Immunoglobulin classes, hypersensitivity reactions, autoimmune markers, and serological testing — based on Turgeon's Immunology & Serology in Laboratory Medicine (7th ed.), Abbas' Cellular and Molecular Immunology (10th ed.), and Stevens' Clinical Immunology and Serology (4th ed.).
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="immunoglobulins" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" /> Immunoglobulins</TabsTrigger>
            <TabsTrigger value="hypersensitivity" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Hypersensitivity</TabsTrigger>
            <TabsTrigger value="autoimmune" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" /> Autoimmune Panel</TabsTrigger>
            <TabsTrigger value="serology" className="gap-1.5 text-xs"><Microscope className="h-3.5 w-3.5" /> Serology Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="immunoglobulins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immunoglobulin Classes</CardTitle>
                <CardDescription>Structure, function, and clinical significance of the five immunoglobulin classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {immunoglobulins.map((ig) => (
                  <div key={ig.name} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{ig.name}</h4>
                      <Badge variant="outline">{ig.percentage} of serum Ig</Badge>
                      <Badge variant="secondary" className="text-xs">t½ {ig.halfLife}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ig.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hypersensitivity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gell & Coombs Hypersensitivity Classification</CardTitle>
                <CardDescription>Four types of immunologic tissue injury (Ref: Abbas, Cellular & Molecular Immunology, 10th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hypersensitivityTypes.map((h) => (
                  <div key={h.type} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{h.type}</h4>
                    <p className="text-sm"><strong>Mechanism:</strong> <span className="text-muted-foreground">{h.mechanism}</span></p>
                    <p className="text-sm"><strong>Examples:</strong> <span className="text-muted-foreground">{h.examples}</span></p>
                    <p className="text-sm"><strong>Key Mediators:</strong> <span className="text-muted-foreground">{h.mediators}</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autoimmune" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Autoimmune Marker Panel</CardTitle>
                <CardDescription>Laboratory diagnosis of autoimmune diseases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {autoimmunePanels.map((a) => (
                  <div key={a.test} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{a.test}</h4>
                      <Badge variant="secondary" className="text-xs">{a.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.patterns}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="serology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serological Testing</CardTitle>
                <CardDescription>Diagnostic serology for infectious and inflammatory diseases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {serologyTests.map((s) => (
                  <div key={s.test} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{s.test}</h4>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
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
                <strong>References:</strong> Turgeon ML. Immunology & Serology in Laboratory Medicine, 7th ed. Abbas AK, et al. Cellular and Molecular Immunology, 10th ed. Stevens CD, Miller LE. Clinical Immunology and Serology, 4th ed. Detrick B, et al. Manual of Molecular and Clinical Laboratory Immunology, 8th ed.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
