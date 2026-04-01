import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ExternalLink, Loader2, Info, Atom } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PDBEntry {
  identifier: string;
  title: string;
  experimental_method: string;
  resolution: number | null;
  organism: string;
  classification: string;
  depositionDate: string;
  polymerCount: number;
  molecularWeight: number | null;
}

interface Props {
  onSelect: (data: string, name: string) => void;
}

export function ProteinSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PDBEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const searchPDB = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSelectedDetail(null);
    setDetailData(null);
    try {
      const response = await fetch("https://search.rcsb.org/rcsbsearch/v2/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: {
            type: "terminal",
            service: "full_text",
            parameters: { value: query.trim() },
          },
          return_type: "entry",
          request_options: { paginate: { start: 0, rows: 12 } },
        }),
      });

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      const ids: string[] = (data.result_set || []).map((r: any) => r.identifier);

      if (ids.length === 0) {
        setResults([]);
        toast.info("No results found. Try a different keyword or PDB ID.");
        return;
      }

      const entries: PDBEntry[] = [];
      for (const id of ids.slice(0, 10)) {
        try {
          const entryRes = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${id}`);
          if (entryRes.ok) {
            const d = await entryRes.json();
            entries.push({
              identifier: id,
              title: d.struct?.title || id,
              experimental_method: d.exptl?.[0]?.method || "Unknown",
              resolution: d.rcsb_entry_info?.resolution_combined?.[0] || null,
              organism: d.rcsb_entry_info?.deposited_polymer_entity_instance_count
                ? "" : "",
              classification: d.struct_keywords?.pdbx_keywords || "",
              depositionDate: d.rcsb_accession_info?.deposit_date || "",
              polymerCount: d.rcsb_entry_info?.deposited_polymer_entity_instance_count || 0,
              molecularWeight: d.rcsb_entry_info?.molecular_weight || null,
            });
          }
        } catch {}
      }

      // Fetch organism info from polymer entities
      for (const entry of entries) {
        try {
          const polyRes = await fetch(`https://data.rcsb.org/rest/v1/core/polymer_entity/${entry.identifier}/1`);
          if (polyRes.ok) {
            const polyData = await polyRes.json();
            const src = polyData.rcsb_entity_source_organism?.[0];
            entry.organism = src?.ncbi_scientific_name || src?.scientific_name || "Unknown organism";
          }
        } catch {
          entry.organism = "";
        }
      }

      setResults(entries);
    } catch (err) {
      toast.error("Failed to search PDB. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (pdbId: string) => {
    if (selectedDetail === pdbId) {
      setSelectedDetail(null);
      setDetailData(null);
      return;
    }
    setSelectedDetail(pdbId);
    setDetailLoading(true);
    try {
      const [entryRes, polyRes] = await Promise.all([
        fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`),
        fetch(`https://data.rcsb.org/rest/v1/core/polymer_entity/${pdbId}/1`),
      ]);
      const entryData = entryRes.ok ? await entryRes.json() : {};
      const polyData = polyRes.ok ? await polyRes.json() : {};

      setDetailData({
        title: entryData.struct?.title || pdbId,
        method: entryData.exptl?.[0]?.method || "Unknown",
        resolution: entryData.rcsb_entry_info?.resolution_combined?.[0] || null,
        organism: polyData.rcsb_entity_source_organism?.[0]?.ncbi_scientific_name || "Unknown",
        gene: polyData.rcsb_entity_source_organism?.[0]?.ncbi_gene_names?.join(", ") || "",
        description: polyData.entity_poly?.pdbx_description || entryData.struct?.pdbx_descriptor || "",
        uniprotId: polyData.rcsb_polymer_entity_container_identifiers?.uniprot_ids?.[0] || null,
        classification: entryData.struct_keywords?.pdbx_keywords || "",
        deposited: entryData.rcsb_accession_info?.deposit_date || "",
        atomCount: entryData.rcsb_entry_info?.deposited_atom_count || 0,
        chains: entryData.rcsb_entry_info?.deposited_polymer_entity_instance_count || 0,
        weight: entryData.rcsb_entry_info?.molecular_weight || null,
        citation: entryData.rcsb_primary_citation?.title || "",
        authors: entryData.rcsb_primary_citation?.rcsb_authors?.slice(0, 3)?.join(", ") || "",
        journal: entryData.rcsb_primary_citation?.rcsb_journal_abbrev || "",
        year: entryData.rcsb_primary_citation?.year || "",
      });
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const downloadPDB = async (pdbId: string) => {
    setDownloading(pdbId);
    try {
      const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
      if (!response.ok) throw new Error("Download failed");
      const text = await response.text();
      onSelect(text, `${pdbId}.pdb`);
      toast.success(`Protein ${pdbId} loaded successfully!`);
    } catch {
      toast.error(`Failed to download ${pdbId}. Check your connection.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          RCSB Protein Data Bank Search
        </CardTitle>
        <CardDescription>
          Search the <a href="https://www.rcsb.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">Protein Data Bank (PDB)</a> for
          experimentally-determined protein structures. Click any result to view details before loading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search proteins (e.g., 'HIV protease', '1HSG', 'insulin receptor', 'kinase')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPDB()}
          />
          <Button onClick={searchPDB} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-1.5">
          {["1HSG (HIV Protease)", "6LU7 (SARS-CoV-2)", "1BNA (DNA)", "4HHB (Hemoglobin)", "1UBQ (Ubiquitin)"].map(ex => {
            const id = ex.split(" ")[0];
            return (
              <Button key={id} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setQuery(id); }}>
                {ex}
              </Button>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{results.length} results found</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {results.map((entry) => (
                <div key={entry.identifier} className="rounded-lg border bg-card hover:border-primary/50 transition-colors overflow-hidden">
                  <div className="p-4 space-y-2 cursor-pointer" onClick={() => fetchDetail(entry.identifier)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">{entry.identifier}</Badge>
                        {entry.resolution && (
                          <Badge variant="outline" className="text-[10px]">{entry.resolution.toFixed(1)} Å</Badge>
                        )}
                      </div>
                      <a href={`https://www.rcsb.org/structure/${entry.identifier}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{entry.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{entry.experimental_method}</span>
                      {entry.organism && <span>• {entry.organism}</span>}
                      {entry.classification && <span>• {entry.classification}</span>}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {selectedDetail === entry.identifier && (
                    <div className="border-t bg-muted/30 p-4 space-y-3">
                      {detailLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading protein details...
                        </div>
                      ) : detailData ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Organism:</span>{" "}
                              <span className="font-medium">{detailData.organism}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Method:</span>{" "}
                              <span className="font-medium">{detailData.method}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Resolution:</span>{" "}
                              <span className="font-medium">{detailData.resolution ? `${detailData.resolution.toFixed(2)} Å` : "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Chains:</span>{" "}
                              <span className="font-medium">{detailData.chains}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Atoms:</span>{" "}
                              <span className="font-medium">{detailData.atomCount?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mol. Weight:</span>{" "}
                              <span className="font-medium">{detailData.weight ? `${(detailData.weight / 1000).toFixed(1)} kDa` : "N/A"}</span>
                            </div>
                            {detailData.gene && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Gene:</span>{" "}
                                <span className="font-medium">{detailData.gene}</span>
                              </div>
                            )}
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Classification:</span>{" "}
                              <span className="font-medium">{detailData.classification}</span>
                            </div>
                          </div>
                          {detailData.uniprotId && (
                            <a
                              href={`https://www.uniprot.org/uniprot/${detailData.uniprotId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Atom className="h-3 w-3" /> UniProt: {detailData.uniprotId}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {detailData.citation && (
                            <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                              📖 {detailData.authors} ({detailData.year}). {detailData.citation}. {detailData.journal}.
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}

                  <div className="p-3 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5"
                      disabled={downloading === entry.identifier}
                      onClick={() => downloadPDB(entry.identifier)}
                    >
                      {downloading === entry.identifier ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Load as Receptor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1 mb-1">
            <Info className="h-3.5 w-3.5" /> Tips for better results
          </p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Search by PDB ID (e.g., "1HSG") for exact matches</li>
            <li>Search by protein name (e.g., "HIV protease") for broader results</li>
            <li>Prefer structures with resolution &lt; 2.5 Å for docking</li>
            <li>X-ray crystallography structures are generally preferred</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
