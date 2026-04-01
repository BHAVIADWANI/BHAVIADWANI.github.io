import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Microscope, Palette, BookOpen, Layers } from "lucide-react";

const tissueProcessing = [
  { step: "1. Fixation", description: "Preserves tissue morphology and prevents autolysis. 10% Neutral Buffered Formalin (NBF) is standard fixative (10:1 fixative:tissue ratio). Formalin = 37% formaldehyde solution; 10% NBF = 3.7% formaldehyde. Cross-links proteins. Fixation time: 6-24 hours for small biopsies, 24-48 hours for larger specimens. Zenker's fixative (mercury-based): excellent nuclear detail. Bouin's fixative (picric acid): testicular biopsies, GI biopsies. B5 fixative: lymph node biopsies (superior nuclear detail). Carnoy's fixative: rapid fixation, preserves glycogen." },
  { step: "2. Grossing (Gross Examination)", description: "Macroscopic examination and description of specimen. Orientation, measurements, color, consistency, lesion identification. Representative sections selected for microscopic examination. Margins evaluated (inked for orientation). Cassettes labeled with patient/specimen information. Decalcification required for bone/calcified tissue (EDTA for immunohistochemistry, formic acid/HCl for speed)." },
  { step: "3. Processing (Tissue Processor)", description: "Dehydration → Clearing → Infiltration. Dehydration: graded ethanol series (70% → 80% → 95% → 100%). Removes water from tissue. Clearing: xylene (most common) replaces ethanol. Makes tissue translucent. Carcinogenic — substitutes available (limonene-based). Infiltration: molten paraffin wax (56-58°C) replaces xylene. Automated processors run overnight (12-14 hours). Microwave processing reduces time significantly." },
  { step: "4. Embedding", description: "Tissue oriented in molten paraffin in mold/cassette. Proper orientation critical for correct plane of section. Embedding center maintains paraffin at 60°C. Cool on cold plate to solidify. Results in paraffin block ready for sectioning. Poor embedding → artifacts, incorrect diagnosis." },
  { step: "5. Microtomy (Sectioning)", description: "Rotary microtome cuts paraffin blocks at 4-5 µm thickness (routine H&E). Sections floated on warm water bath (42-44°C) to remove wrinkles. Picked up on glass slides (charged/coated slides for IHC). Dried in oven (60°C, 30 min) or air-dried overnight. Frozen sections: cryostat at -20°C, 5-10 µm, used for intraoperative consultation (10-20 minutes turnaround)." },
  { step: "6. Staining & Coverslipping", description: "Deparaffinization (xylene) → Rehydration (graded alcohols to water) → Stain → Dehydrate → Clear → Coverslip with mounting medium. H&E is routine stain. Automated staining platforms standardize quality. Coverslipping: manual or automated. DPX or Permount mounting medium." },
];

const stainingTechniques = [
  { stain: "Hematoxylin & Eosin (H&E)", target: "Routine stain", mechanism: "Hematoxylin (basic dye, blue) stains nuclei (acidic DNA/RNA). Eosin (acidic dye, pink/red) stains cytoplasm and extracellular matrix (basic proteins). Harris hematoxylin most common. Progressive vs. regressive methods. Blue nuclei = basophilic, pink cytoplasm = eosinophilic." },
  { stain: "Periodic Acid-Schiff (PAS)", target: "Glycogen, mucin, basement membranes, fungi", mechanism: "Periodic acid oxidizes vicinal diols → aldehydes. Schiff reagent (fuchsin-sulfurous acid) reacts with aldehydes → magenta color. PAS-diastase: diastase digests glycogen — if staining disappears, it was glycogen. Highlights: basement membranes (renal), fungi (Histoplasma, Cryptococcus), glycogen storage diseases, erythroleukemia (M6)." },
  { stain: "Masson's Trichrome", target: "Collagen, fibrosis", mechanism: "Three-color stain: nuclei (dark blue/black — iron hematoxylin), cytoplasm/muscle/RBCs (red — Biebrich scarlet-acid fuchsin), collagen (blue/green — aniline blue or light green). Evaluates fibrosis in liver biopsies (Metavir score), cardiac tissue, kidney." },
  { stain: "Reticulin (Gordon-Sweets / Gomori)", target: "Reticular fibers (Type III collagen)", mechanism: "Silver impregnation technique. Reticular fibers = black, background = pale. Essential for evaluating bone marrow architecture: myelofibrosis grading, hairy cell leukemia, liver architecture (hepatocellular carcinoma loses reticulin framework)." },
  { stain: "Prussian Blue (Perls')", target: "Hemosiderin (iron)", mechanism: "Potassium ferrocyanide + HCl reacts with ferric iron → blue precipitate. Evaluates iron stores in bone marrow (sideroblasts, ringed sideroblasts in MDS), hemochromatosis (liver), hemosiderosis. Graded 0-4+ in bone marrow aspirate." },
  { stain: "Congo Red", target: "Amyloid", mechanism: "Congo red binds to β-pleated sheet structure of amyloid. Apple-green birefringence under polarized light is pathognomonic for amyloid. Used in cardiac, renal, GI, fat pad biopsies. Amyloidosis types: AL (primary, lambda light chains), AA (secondary, serum amyloid A)." },
  { stain: "Ziehl-Neelsen (Acid-Fast)", target: "Mycobacteria (TB), Nocardia", mechanism: "Carbolfuchsin (hot) penetrates mycolic acid cell wall. Acid-alcohol decolorization removes stain from non-acid-fast organisms. Methylene blue counterstain. AFB = red rods against blue background. Fite modification for M. leprae (weaker acid-fast). Kinyoun = cold method." },
  { stain: "Grocott's Methenamine Silver (GMS)", target: "Fungi", mechanism: "Silver nitrate reacts with aldehydes (from periodic acid oxidation of fungal cell wall polysaccharides) → black fungal elements against green counterstain. Gold standard for Pneumocystis jirovecii, Aspergillus, Histoplasma. Also highlights Nocardia." },
  { stain: "Mucicarmine", target: "Mucin (epithelial), Cryptococcus capsule", mechanism: "Carmine dye stains acidic mucopolysaccharides deep rose/red. Highlights: mucin-secreting adenocarcinomas, Cryptococcus neoformans capsule (diagnostic). Alcian blue (pH 2.5): alternative for acid mucins." },
  { stain: "Oil Red O / Sudan Black", target: "Lipids", mechanism: "Fat-soluble dyes stain neutral lipids and triglycerides. MUST use frozen sections (formalin fixation and paraffin processing dissolve lipids). Evaluates fatty liver disease (steatosis), lipid storage diseases, fat embolism. Sudan Black B also used in cytochemistry for granulocytic lineage (AML)." },
  { stain: "Giemsa", target: "Blood cells, parasites, Helicobacter", mechanism: "Romanowsky-type stain. Azure B (basic) + Eosin (acidic). Stains nuclei blue, cytoplasm pink. Used for bone marrow aspirate smears, touch preps, H. pylori in gastric biopsies, Leishmania amastigotes, toxoplasma. Giemsa banding in cytogenetics." },
];

const ihcMarkers = [
  { marker: "Cytokeratins (CK, AE1/AE3, CAM5.2)", type: "Epithelial", significance: "Pan-epithelial markers confirming carcinoma vs. other malignancies. CK7+/CK20-: lung, breast, ovary, endometrium, thyroid. CK7-/CK20+: colorectal. CK7+/CK20+: urothelial, pancreatic, mucinous ovarian. CK7-/CK20-: hepatocellular, renal, prostate, squamous cell." },
  { marker: "Vimentin", type: "Mesenchymal", significance: "Intermediate filament in mesenchymal cells. Positive in sarcomas, melanoma, lymphoma, renal cell carcinoma, endometrial carcinoma. Internal positive control (most cells express vimentin). Also positive in some carcinomas with EMT." },
  { marker: "CD45 (LCA, Leukocyte Common Antigen)", type: "Hematopoietic", significance: "Pan-leukocyte marker. Confirms lymphoma/leukemia vs. carcinoma/sarcoma/melanoma. Negative in most non-hematopoietic tumors. Essential first step in undifferentiated malignancy workup." },
  { marker: "S-100", type: "Neural crest / Melanocytic", significance: "Positive in melanoma, schwannoma, neurofibroma, granular cell tumor, Langerhans cell histiocytosis, chondrocytes. Sensitive but not specific for melanoma (use with SOX10, HMB-45, Melan-A for melanoma)." },
  { marker: "HMB-45 / Melan-A / SOX10", type: "Melanocytic", significance: "Melanoma markers. HMB-45: specific but not sensitive for melanoma (also positive in PEComa, angiomyolipoma). Melan-A (MART-1): sensitive for melanoma, positive in adrenal cortex. SOX10: nuclear marker, sensitive and specific for melanoma and nerve sheath tumors." },
  { marker: "Ki-67 (MIB-1)", type: "Proliferation", significance: "Nuclear protein expressed in all phases of cell cycle except G0. Proliferation index (percentage of positive cells) indicates growth rate. High Ki-67: aggressive tumors, higher grade. Used in breast cancer (cutoff varies, >20% = high), neuroendocrine tumors (WHO grading: G1 <3%, G2 3-20%, G3 >20%), lymphoma." },
  { marker: "ER / PR (Estrogen/Progesterone Receptor)", type: "Hormonal", significance: "Nuclear staining in breast carcinoma. ER+ and/or PR+: favorable prognosis, eligible for hormonal therapy (tamoxifen, aromatase inhibitors). Allred scoring system (intensity + proportion). ≥1% positive = positive per ASCO/CAP guidelines." },
  { marker: "HER2/neu (c-erbB-2)", type: "Growth factor receptor", significance: "Membrane staining. Overexpressed in ~15-20% breast cancers. IHC scoring: 0, 1+ (negative), 2+ (equivocal → FISH), 3+ (positive). HER2+ eligible for targeted therapy (trastuzumab/Herceptin). Also tested in gastric/GEJ adenocarcinoma." },
  { marker: "p63 / p40", type: "Squamous", significance: "Nuclear markers of squamous differentiation. p63 positive in squamous cell carcinoma, urothelial carcinoma, myoepithelial cells. p40 (ΔNp63): more specific for squamous differentiation than p63. Used to distinguish squamous (p40+/TTF1-) from adenocarcinoma (p40-/TTF1+) in lung." },
  { marker: "TTF-1 (Thyroid Transcription Factor-1)", type: "Lung / Thyroid", significance: "Nuclear marker positive in lung adenocarcinoma (~80%) and thyroid carcinoma (papillary, follicular). Negative in squamous cell carcinoma of lung. Also positive in small cell carcinoma. Key marker for identifying primary lung adenocarcinoma vs. metastasis." },
];

const cytologyFindings = [
  { specimen: "Pap Smear (Cervical Cytology)", description: "Bethesda System reporting: Specimen adequacy → General categorization → Epithelial cell abnormalities. NILM (Negative for Intraepithelial Lesion or Malignancy). ASC-US (Atypical Squamous Cells of Undetermined Significance) → HPV triage. LSIL (Low-grade SIL) = HPV/CIN 1. HSIL (High-grade SIL) = CIN 2/3. Squamous Cell Carcinoma. AGC (Atypical Glandular Cells). HPV types 16, 18 = high-risk (responsible for ~70% cervical cancers). Koilocytes: perinuclear halo + nuclear irregularity = pathognomonic for HPV." },
  { specimen: "Thyroid FNA (Fine Needle Aspiration)", description: "Bethesda System for Reporting Thyroid Cytopathology (6 categories): I. Non-diagnostic (repeat FNA). II. Benign (follow-up). III. AUS/FLUS (Atypia of Undetermined Significance, repeat FNA or molecular testing). IV. Follicular Neoplasm/SFN (lobectomy, cannot distinguish adenoma from carcinoma on cytology alone). V. Suspicious for Malignancy (lobectomy/thyroidectomy). VI. Malignant (thyroidectomy). Papillary thyroid carcinoma features: Intranuclear pseudoinclusions, nuclear grooves, psammoma bodies, 'Orphan Annie' nuclei." },
  { specimen: "Body Fluid Cytology (Pleural, Peritoneal, Pericardial)", description: "Malignant effusions: tumor cells in clusters or single cells with high N:C ratio, irregular nuclear membranes, prominent nucleoli, mitotic figures. Reactive mesothelial cells can mimic malignancy. Cell block preparation provides tissue for IHC. Mesothelioma vs. adenocarcinoma: Calretinin+, CK5/6+, WT-1+ (mesothelioma); CEA+, MOC-31+, BerEP4+, TTF-1+ (adenocarcinoma). Light green inclusions in mesothelial cells are normal." },
  { specimen: "Urine Cytology", description: "Best for detecting high-grade urothelial carcinoma. Paris System for Reporting Urinary Cytology: Negative, Atypical Urothelial Cells (AUC), Suspicious for HGUC, HGUC, LGUC (rarely diagnosed on cytology), Other malignancies. Key features of HGUC: markedly increased N:C ratio (>0.7), hyperchromasia, irregular nuclear contours, coarse chromatin." },
];

export default function Pathology() {
  const [activeTab, setActiveTab] = useState("processing");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Pathology (Histopathology & Cytology)
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Tissue processing, special staining techniques, immunohistochemistry markers, and cytology interpretation — based on Bancroft's Theory and Practice of Histological Techniques (8th ed.), Dabbs' Diagnostic Immunohistochemistry (6th ed.), and Cibas & Ducatman's Cytology (5th ed.).
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="processing" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" /> Tissue Processing</TabsTrigger>
            <TabsTrigger value="staining" className="gap-1.5 text-xs"><Palette className="h-3.5 w-3.5" /> Special Stains</TabsTrigger>
            <TabsTrigger value="ihc" className="gap-1.5 text-xs"><Microscope className="h-3.5 w-3.5" /> Immunohistochemistry</TabsTrigger>
            <TabsTrigger value="cytology" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" /> Cytology</TabsTrigger>
          </TabsList>

          <TabsContent value="processing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tissue Processing Pipeline</CardTitle>
                <CardDescription>From specimen receipt to slide preparation (Ref: Bancroft's Histological Techniques, 8th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tissueProcessing.map((step) => (
                  <div key={step.step} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{step.step}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staining" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histochemical Staining Techniques</CardTitle>
                <CardDescription>Special stains for tissue characterization and pathogen identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stainingTechniques.map((stain) => (
                  <div key={stain.stain} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{stain.stain}</h4>
                      <Badge variant="outline" className="text-xs">{stain.target}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stain.mechanism}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ihc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immunohistochemistry (IHC) Markers</CardTitle>
                <CardDescription>Diagnostic markers for tumor classification and targeted therapy (Ref: Dabbs, Diagnostic IHC, 6th ed.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ihcMarkers.map((marker) => (
                  <div key={marker.marker} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{marker.marker}</h4>
                      <Badge variant="secondary" className="text-xs">{marker.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{marker.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cytology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnostic Cytology</CardTitle>
                <CardDescription>Cytological interpretation and reporting systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cytologyFindings.map((cyt) => (
                  <div key={cyt.specimen} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{cyt.specimen}</h4>
                    <p className="text-sm text-muted-foreground">{cyt.description}</p>
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
                <strong>References:</strong> Bancroft JD, Gamble M. Theory and Practice of Histological Techniques, 8th ed. Dabbs DJ. Diagnostic Immunohistochemistry, 6th ed. Cibas ES, Ducatman BS. Cytology: Diagnostic Principles and Clinical Correlates, 5th ed. Kumar V, Abbas AK, Aster JC. Robbins & Cotran Pathologic Basis of Disease, 10th ed.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
