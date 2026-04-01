import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FlaskConical, Microscope, Dna } from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface ConfirmatoryTestsProps {
  organism: Organism;
  matchedTraits: string[];
}

const confirmatoryTestDatabase: Record<string, { tests: { name: string; purpose: string; expected: string; method: string }[]; resources: { label: string; url: string }[] }> = {
  "Staphylococcus aureus": {
    tests: [
      { name: "Tube Coagulase Test", purpose: "Definitive identification", expected: "Clot formation within 4 hours", method: "Mix bacterial colony with rabbit plasma, incubate at 35°C" },
      { name: "Latex Agglutination (Protein A/Clumping Factor)", purpose: "Rapid confirmation", expected: "Agglutination within 30 seconds", method: "Commercial kit (e.g., Staphaurex)" },
      { name: "Mannitol Salt Agar", purpose: "Selective/differential media", expected: "Yellow colonies (mannitol fermentation)", method: "Inoculate MSA, 24-48h at 35°C" },
      { name: "DNase Test", purpose: "Confirmatory for S. aureus", expected: "Clear zone around colonies on DNase agar with HCl", method: "DNase agar with methyl green or toluidine blue" },
      { name: "mecA Gene PCR", purpose: "MRSA detection", expected: "Band at 533 bp", method: "PCR with mecA-specific primers" },
    ],
    resources: [
      { label: "NCBI Taxonomy", url: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=Staphylococcus+aureus" },
      { label: "UniProt Proteome", url: "https://www.uniprot.org/taxonomy/1280" },
      { label: "KEGG Organism", url: "https://www.genome.jp/kegg-bin/show_organism?org=sau" },
    ],
  },
  "Escherichia coli": {
    tests: [
      { name: "Indole Test", purpose: "Key identification marker", expected: "Cherry-red ring with Kovac's reagent", method: "Tryptone broth, 24h, add Kovac's reagent" },
      { name: "EMB Agar", purpose: "Selective/differential", expected: "Green metallic sheen colonies", method: "Inoculate EMB, 24h at 35°C" },
      { name: "MacConkey Agar", purpose: "Lactose fermentation", expected: "Pink/red colonies (lactose fermenter)", method: "Inoculate MacConkey, 24h at 35°C" },
      { name: "MUG Test", purpose: "Rapid E. coli confirmation", expected: "Fluorescence under UV (β-glucuronidase positive)", method: "Commercial MUG substrate" },
      { name: "O157:H7 Sorbitol MacConkey", purpose: "STEC screening", expected: "Colorless colonies (sorbitol non-fermenter)", method: "SMAC agar, 24h at 35°C" },
    ],
    resources: [
      { label: "NCBI Genome", url: "https://www.ncbi.nlm.nih.gov/genome/?term=Escherichia+coli" },
      { label: "BacDive Entry", url: "https://bacdive.dsmz.de/search?search=Escherichia+coli" },
      { label: "CDC E. coli", url: "https://www.cdc.gov/e-coli/index.html" },
    ],
  },
  "Streptococcus pneumoniae": {
    tests: [
      { name: "Optochin Susceptibility", purpose: "Presumptive identification", expected: "Zone of inhibition ≥14 mm", method: "BAP with optochin disk, 18-24h CO₂" },
      { name: "Bile Solubility Test", purpose: "Definitive confirmation", expected: "Colony lysis with 10% sodium deoxycholate", method: "Drop bile salt on alpha-hemolytic colony" },
      { name: "Quellung Reaction", purpose: "Serotype determination", expected: "Capsule swelling under microscopy", method: "Mix with type-specific antisera" },
      { name: "Latex Agglutination (CSF)", purpose: "Rapid antigen detection", expected: "Agglutination with pneumococcal antisera", method: "Commercial latex kit on CSF" },
    ],
    resources: [
      { label: "NCBI Taxonomy", url: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=Streptococcus+pneumoniae" },
      { label: "WHO Pneumococcal", url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/pneumonia" },
    ],
  },
  "Pseudomonas aeruginosa": {
    tests: [
      { name: "Cetrimide Agar", purpose: "Selective medium", expected: "Yellow-green fluorescent colonies", method: "Inoculate cetrimide agar, 24-48h at 35-42°C" },
      { name: "Growth at 42°C", purpose: "Differentiate from other Pseudomonas", expected: "Growth present", method: "Nutrient agar at 42°C, 24h" },
      { name: "Pyocyanin Production", purpose: "Species identification", expected: "Blue-green diffusible pigment", method: "Mueller-Hinton or Pseudomonas P agar" },
      { name: "Oxidase Test", purpose: "Screening for non-fermenters", expected: "Positive (dark purple within 10 seconds)", method: "Tetramethyl-p-phenylenediamine reagent" },
    ],
    resources: [
      { label: "NCBI Genome", url: "https://www.ncbi.nlm.nih.gov/genome/?term=Pseudomonas+aeruginosa" },
      { label: "CDC Pseudomonas", url: "https://www.cdc.gov/pseudomonas-aeruginosa/index.html" },
    ],
  },
};

// Generate generic confirmatory tests based on organism characteristics
function getGenericTests(organism: Organism, matchedTraits: string[]): { name: string; purpose: string; expected: string; method: string }[] {
  const tests: { name: string; purpose: string; expected: string; method: string }[] = [];

  if (!matchedTraits.includes("Gram stain")) {
    tests.push({ name: "Gram Stain Verification", purpose: "Confirm morphology", expected: `${organism.gramStain} ${organism.shape}`, method: "Heat-fixed smear, Crystal violet → Iodine → Decolorize → Safranin" });
  }
  if (organism.characteristics.catalase && !matchedTraits.includes("Catalase")) {
    tests.push({ name: "Catalase Test", purpose: "Differentiate genera", expected: organism.characteristics.catalase, method: "3% H₂O₂ on colony, observe bubbling" });
  }
  if (organism.characteristics.oxidase && !matchedTraits.includes("Oxidase")) {
    tests.push({ name: "Oxidase Test", purpose: "Screen oxidase status", expected: organism.characteristics.oxidase, method: "Kovac's oxidase reagent on filter paper" });
  }
  if (organism.labIdentification.length > 0) {
    const labTest = organism.labIdentification[0];
    tests.push({ name: labTest, purpose: "Key identification test", expected: "Refer to standard procedure", method: "Follow CLSI/ASM guidelines" });
  }

  // Always suggest molecular confirmation
  tests.push({ name: "16S rRNA Gene Sequencing", purpose: "Definitive molecular identification", expected: `≥99% match to ${organism.name}`, method: "PCR amplification → Sanger sequencing → BLAST against NCBI/SILVA" });

  return tests;
}

export function ConfirmatoryTests({ organism, matchedTraits }: ConfirmatoryTestsProps) {
  const specific = confirmatoryTestDatabase[organism.name];
  const tests = specific?.tests || getGenericTests(organism, matchedTraits);
  const resources = specific?.resources || [
    { label: "NCBI Taxonomy", url: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=${encodeURIComponent(organism.name)}` },
    { label: "PubMed Literature", url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(organism.name)}` },
    { label: "UniProt", url: `https://www.uniprot.org/taxonomy/?query=${encodeURIComponent(organism.name)}` },
    { label: "KEGG", url: `https://www.genome.jp/dbget-bin/www_bfind_sub?mode=bfind&max_hit=1&dbkey=genome&keywords=${encodeURIComponent(organism.name)}` },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            Recommended Confirmatory Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tests.map((test, i) => (
            <div key={i} className="p-3 rounded-lg bg-background border space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                <span className="font-semibold text-sm">{test.name}</span>
              </div>
              <p className="text-xs text-muted-foreground"><strong>Purpose:</strong> {test.purpose}</p>
              <p className="text-xs text-muted-foreground"><strong>Expected:</strong> {test.expected}</p>
              <p className="text-xs text-muted-foreground"><strong>Method:</strong> {test.method}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Dna className="h-4 w-4 text-primary" />
            Scientific Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {resources.map((r) => (
              <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {r.label}
                </Badge>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
