import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ExternalLink, AlertTriangle } from "lucide-react";

const resistanceGenes = [
  { gene: "mecA", organism: "Staphylococcus aureus", resistance: "Methicillin/Oxacillin (MRSA)", mechanism: "Encodes PBP2a (altered penicillin-binding protein) with low affinity for β-lactams", size: "2.1 kb", detection: "PCR (533 bp amplicon)", clinicalRelevance: "Critical — defines MRSA. Requires vancomycin or alternatives.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/2861464", cardLink: "https://card.mcmaster.ca/ontology/36911" },
  { gene: "vanA", organism: "Enterococcus faecium/faecalis", resistance: "Vancomycin (VRE)", mechanism: "Encodes D-Ala-D-Lac ligase, altering vancomycin target site", size: "10.8 kb operon", detection: "PCR, gene probe", clinicalRelevance: "High-level vancomycin resistance (MIC ≥64 µg/mL). Major infection control concern.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/4535693", cardLink: "https://card.mcmaster.ca/ontology/40537" },
  { gene: "blaNDM-1", organism: "Enterobacteriaceae", resistance: "Carbapenems (CRE)", mechanism: "Metallo-β-lactamase hydrolyzes all β-lactams including carbapenems", size: "813 bp", detection: "PCR, Modified Hodge Test, CarbaNP test", clinicalRelevance: "Pan-resistant. WHO critical priority. Limited treatment options (colistin, ceftazidime-avibactam).", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/11044898", cardLink: "https://card.mcmaster.ca/ontology/36728" },
  { gene: "blaKPC", organism: "Klebsiella pneumoniae", resistance: "Carbapenems", mechanism: "Serine carbapenemase (Ambler class A)", size: "882 bp", detection: "PCR, mCIM, CarbaNP", clinicalRelevance: "Endemic in US healthcare facilities. Requires combination therapy.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/6382982", cardLink: "https://card.mcmaster.ca/ontology/39774" },
  { gene: "blaCTX-M", organism: "Enterobacteriaceae", resistance: "Extended-spectrum cephalosporins (ESBL)", mechanism: "Extended-spectrum β-lactamase hydrolyzing 3rd-gen cephalosporins", size: "876 bp", detection: "PCR, Double-disk synergy test, CLSI ESBL screen", clinicalRelevance: "Most common ESBL globally. Carbapenems are treatment of choice.", ncbiGene: "https://www.ncbi.nlm.nih.gov/pathogens/refgene/#blaCTX-M", cardLink: "https://card.mcmaster.ca/ontology/36248" },
  { gene: "mcr-1", organism: "Enterobacteriaceae", resistance: "Colistin", mechanism: "Phosphoethanolamine transferase modifying lipid A", size: "1626 bp", detection: "PCR, broth microdilution MIC", clinicalRelevance: "Plasmid-mediated colistin resistance. Threatens last-resort therapy.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/56543370", cardLink: "https://card.mcmaster.ca/ontology/40295" },
  { gene: "ermB", organism: "Multiple species", resistance: "Macrolides, Lincosamides, Streptogramins B (MLSB)", mechanism: "23S rRNA methyltransferase causing ribosomal target modification", size: "738 bp", detection: "PCR, D-zone test for inducible resistance", clinicalRelevance: "Cross-resistance to erythromycin, clindamycin, azithromycin.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/3514218", cardLink: "https://card.mcmaster.ca/ontology/36220" },
  { gene: "qnrA/B/S", organism: "Enterobacteriaceae", resistance: "Fluoroquinolones", mechanism: "Qnr protein protects DNA gyrase from quinolone inhibition", size: "657 bp", detection: "PCR", clinicalRelevance: "Low-level resistance; facilitates selection of higher-level resistance.", ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/4417680", cardLink: "https://card.mcmaster.ca/ontology/36649" },
];

export function ResistanceGeneDetector() {
  const [selectedOrganism, setSelectedOrganism] = useState<string>("");

  const organisms = [...new Set(resistanceGenes.map((g) => g.organism))];
  const filtered = selectedOrganism
    ? resistanceGenes.filter((g) => g.organism === selectedOrganism)
    : resistanceGenes;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Resistance Gene Database
          </CardTitle>
          <CardDescription>
            Key antimicrobial resistance genes with detection methods, mechanisms, and links to NCBI and CARD databases.
            Based on WHO priority pathogen list and EUCAST/CLSI guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrganism} onValueChange={setSelectedOrganism}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Filter by organism..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organisms</SelectItem>
              {organisms.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filtered.map((gene) => (
          <Card key={gene.gene} className="border-destructive/20">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold font-mono text-lg">{gene.gene}</h3>
                  <p className="text-sm text-muted-foreground italic">{gene.organism}</p>
                </div>
                <Badge variant="destructive">{gene.resistance}</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Mechanism</p>
                    <p>{gene.mechanism}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Gene Size</p>
                    <p>{gene.size}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Detection Method</p>
                    <p>{gene.detection}</p>
                  </div>
                  <div className="p-2 rounded bg-destructive/5 border border-destructive/10">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Clinical Relevance
                    </p>
                    <p className="text-xs mt-1">{gene.clinicalRelevance}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a href={gene.ncbiGene} target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> NCBI Gene
                  </Badge>
                </a>
                <a href={gene.cardLink} target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> CARD Database
                  </Badge>
                </a>
                <a href={`https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance`} target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> WHO AMR
                  </Badge>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
