import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, Search, ExternalLink, BarChart3, AlertTriangle } from "lucide-react";

interface AnalysisResult {
  header: string;
  length: number;
  gcContent: number;
  atContent: number;
  nucleotideFreq: { A: number; T: number; G: number; C: number };
  possibleOrganism: string;
  confidence: number;
  ncbiLink: string;
  silvaLink: string;
}

// Simplified 16S rRNA signature matching
const signatureDatabase: { organism: string; signatures: string[]; gcRange: [number, number] }[] = [
  { organism: "Escherichia coli", signatures: ["AAATTGAAGAG", "TGGCTCAG", "CTGCTGCCTCCCGTAG"], gcRange: [50, 52] },
  { organism: "Staphylococcus aureus", signatures: ["AACGGCTCACC", "TACCGGGGTAT"], gcRange: [32, 34] },
  { organism: "Pseudomonas aeruginosa", signatures: ["TGGGGAATAAG", "CTTCGGGTTGT"], gcRange: [66, 68] },
  { organism: "Streptococcus pneumoniae", signatures: ["GATCCTGGCTCAG", "CAGCAGTAGGG"], gcRange: [39, 41] },
  { organism: "Klebsiella pneumoniae", signatures: ["TGGCTCAGATTG", "CCTGAGCCAG"], gcRange: [57, 58] },
  { organism: "Mycobacterium tuberculosis", signatures: ["GCGGTGTGTACAA", "TCCGTAGGT"], gcRange: [65, 66] },
  { organism: "Bacillus subtilis", signatures: ["CGGCTAACTAC", "GCAACGCGAAG"], gcRange: [43, 44] },
  { organism: "Salmonella enterica", signatures: ["GCGGCAGGCCTAAC", "TGGCTCAG"], gcRange: [52, 53] },
];

function analyzeSequence(fasta: string): AnalysisResult | null {
  const lines = fasta.trim().split("\n");
  if (lines.length < 2) return null;

  const header = lines[0].startsWith(">") ? lines[0].slice(1).trim() : "Unknown Sequence";
  const sequence = lines.slice(lines[0].startsWith(">") ? 1 : 0).join("").replace(/\s/g, "").toUpperCase();

  if (sequence.length < 10) return null;

  const counts = { A: 0, T: 0, G: 0, C: 0 };
  for (const c of sequence) {
    if (c in counts) counts[c as keyof typeof counts]++;
  }

  const total = counts.A + counts.T + counts.G + counts.C;
  const gcContent = total > 0 ? ((counts.G + counts.C) / total) * 100 : 0;
  const atContent = 100 - gcContent;

  // Match against signature database
  let bestMatch = { organism: "Unknown", score: 0 };
  for (const entry of signatureDatabase) {
    let score = 0;
    for (const sig of entry.signatures) {
      if (sequence.includes(sig)) score += 30;
    }
    // GC content proximity bonus
    const gcDiff = Math.abs(gcContent - (entry.gcRange[0] + entry.gcRange[1]) / 2);
    if (gcDiff < 5) score += 20;
    if (gcDiff < 2) score += 10;

    if (score > bestMatch.score) {
      bestMatch = { organism: entry.organism, score };
    }
  }

  const confidence = Math.min(95, Math.max(15, bestMatch.score));

  return {
    header,
    length: sequence.length,
    gcContent: Math.round(gcContent * 100) / 100,
    atContent: Math.round(atContent * 100) / 100,
    nucleotideFreq: counts,
    possibleOrganism: bestMatch.organism,
    confidence,
    ncbiLink: `https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&DATABASE=16S_ribosomal_RNA&QUERY=${encodeURIComponent(sequence.slice(0, 500))}`,
    silvaLink: `https://www.arb-silva.de/search/`,
  };
}

const exampleFasta = `>16S_rRNA_Escherichia_coli_K12
AAATTGAAGAGTTTGATCATGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGT
AACAGGAAGAAGCTTGCTTCTTTGCTGACGAGTGGCGGACGGGTGAGTAATGTCTGGGAAACTGCCTGAT
GGAGGGGGATAACTACTGGAAACGGTAGCTAATACCGCATAACGTCGCAAGACCAAAGAGGGGGACCTTAGG
GCCTTCGGGTTGTAAAGATGACTTTAAGTTGACGAGTGGCGGACGGGTGAG`;

export function FASTAAnalyzer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeSequence(input));
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            FASTA Sequence Analyzer & 16S rRNA Identification
          </CardTitle>
          <CardDescription>
            Paste a DNA sequence in FASTA format for GC content analysis, nucleotide composition, and preliminary 16S rRNA organism matching. For definitive identification, use the NCBI BLAST link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste FASTA sequence here...\n\n>sequence_header\nATCGATCGATCG...`}
            className="font-mono text-xs min-h-[160px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={!input.trim() || analyzing} className="gap-2">
              <Search className="h-4 w-4" />
              {analyzing ? "Analyzing..." : "Analyze Sequence"}
            </Button>
            <Button variant="outline" onClick={() => setInput(exampleFasta)}>
              Load Example (E. coli 16S)
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sequence Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Header</span>
                  <span className="font-mono text-xs max-w-[200px] truncate">{result.header}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Length</span>
                  <Badge variant="secondary">{result.length.toLocaleString()} bp</Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">GC Content</span>
                  <Badge variant="default">{result.gcContent}%</Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">AT Content</span>
                  <Badge variant="outline">{result.atContent}%</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground">Nucleotide Composition</p>
                {(["A", "T", "G", "C"] as const).map((nt) => {
                  const total = result.nucleotideFreq.A + result.nucleotideFreq.T + result.nucleotideFreq.G + result.nucleotideFreq.C;
                  const pct = total > 0 ? (result.nucleotideFreq[nt] / total) * 100 : 0;
                  const colors = { A: "bg-green-500", T: "bg-red-500", G: "bg-blue-500", C: "bg-yellow-500" };
                  return (
                    <div key={nt} className="flex items-center gap-2">
                      <span className="font-mono text-xs w-4">{nt}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${colors[nt]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{result.nucleotideFreq[nt]} ({pct.toFixed(1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                16S rRNA Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-sm font-medium">Preliminary Match</p>
                <p className="text-lg font-bold italic">{result.possibleOrganism}</p>
                <div className="flex items-center gap-2">
                  <Progress value={result.confidence} className="h-2 flex-1" />
                  <Badge variant={result.confidence >= 60 ? "default" : "secondary"}>
                    {result.confidence}%
                  </Badge>
                </div>
                {result.confidence < 60 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low confidence — use NCBI BLAST for definitive identification
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">External Verification</p>
                <div className="flex flex-wrap gap-2">
                  <a href={result.ncbiLink} target="_blank" rel="noopener noreferrer">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1">
                      <ExternalLink className="h-3 w-3" /> NCBI BLAST
                    </Badge>
                  </a>
                  <a href={result.silvaLink} target="_blank" rel="noopener noreferrer">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1">
                      <ExternalLink className="h-3 w-3" /> SILVA rRNA Database
                    </Badge>
                  </a>
                  <a href="https://www.ezbiocloud.net/identify" target="_blank" rel="noopener noreferrer">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 gap-1">
                      <ExternalLink className="h-3 w-3" /> EzBioCloud 16S ID
                    </Badge>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
