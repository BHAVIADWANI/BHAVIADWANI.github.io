import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface MolecularTabProps {
  organism: Organism;
}

function getExternalLinks(organism: Organism) {
  const encoded = encodeURIComponent(organism.name);
  const encodedPlus = organism.name.replace(/\s+/g, "+");
  return [
    {
      name: "NCBI Taxonomy",
      url: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=${encodedPlus}`,
    },
    {
      name: "NCBI PubMed",
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encoded}`,
    },
    {
      name: "UniProt",
      url: `https://www.uniprot.org/uniprotkb?query=${encoded}`,
    },
    {
      name: "KEGG Organism",
      url: `https://www.genome.jp/dbget-bin/www_bfind_sub?mode=bfind&max_hit=10&dbkey=genome&keywords=${encodeURIComponent(organism.genus)}`,
    },
    {
      name: "BV-BRC",
      url: `https://www.bv-brc.org/view/Taxonomy/?keyword(${encoded})`,
    },
    {
      name: "Wikipedia",
      url: `https://en.wikipedia.org/wiki/${organism.name.replace(/\s+/g, "_")}`,
    },
  ];
}

export function MolecularTab({ organism }: MolecularTabProps) {
  const links = getExternalLinks(organism);

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Genomic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Genome Size</span>
            <span className="font-mono">{organism.molecular.genome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GC Content</span>
            <span className="font-mono">{organism.molecular.gcContent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Genes</span>
            <span className="font-mono">{organism.molecular.genes}</span>
          </div>
          {organism.molecular.plasmids && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plasmids</span>
              <span className="font-mono">{organism.molecular.plasmids}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {organism.molecular.notableGenes && (
        <div className="space-y-3">
          <h4 className="font-semibold">Notable Genes</h4>
          <div className="flex flex-wrap gap-2">
            {organism.molecular.notableGenes.map((gene) => (
              <Badge key={gene} variant="outline" className="font-mono">
                {gene}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">External Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {links.map((link) => (
            <Button
              key={link.name}
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-2"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {link.name}
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
