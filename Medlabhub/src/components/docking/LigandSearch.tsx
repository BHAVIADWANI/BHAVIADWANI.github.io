import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ExternalLink, Loader2, Info, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PubChemCompound {
  CID: number;
  MolecularFormula: string;
  MolecularWeight: number;
  IUPACName: string;
  Title: string;
  XLogP?: number;
  HBondDonorCount?: number;
  HBondAcceptorCount?: number;
  RotatableBondCount?: number;
  TPSA?: number;
}

interface Props {
  onSelect: (data: string, name: string, format: string) => void;
}

export function LigandSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PubChemCompound[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [expandedCID, setExpandedCID] = useState<number | null>(null);

  const searchPubChem = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setExpandedCID(null);
    try {
      const props = "MolecularFormula,MolecularWeight,IUPACName,Title,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,TPSA";
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query.trim())}/property/${props}/JSON`
      );
      if (!response.ok) {
        // Try CID search
        const cidRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${encodeURIComponent(query.trim())}/property/${props}/JSON`
        );
        if (!cidRes.ok) throw new Error("Not found");
        const cidData = await cidRes.json();
        setResults(cidData.PropertyTable?.Properties || []);
        return;
      }
      const data = await response.json();
      setResults(data.PropertyTable?.Properties || []);
    } catch {
      try {
        const autoRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query.trim())}/json?limit=8`
        );
        const autoData = await autoRes.json();
        const names: string[] = autoData.dictionary_terms?.compound || [];
        if (names.length === 0) {
          setResults([]);
          toast.info("No compounds found. Try a different name or CID.");
          return;
        }
        const props = "MolecularFormula,MolecularWeight,IUPACName,Title,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,TPSA";
        const compounds: PubChemCompound[] = [];
        for (const name of names.slice(0, 6)) {
          try {
            const res = await fetch(
              `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/${props}/JSON`
            );
            if (res.ok) {
              const d = await res.json();
              const p = d.PropertyTable?.Properties?.[0];
              if (p) compounds.push(p);
            }
          } catch {}
        }
        setResults(compounds);
      } catch {
        setResults([]);
        toast.info("No compounds found.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSDF = async (cid: number, title: string) => {
    setDownloading(cid);
    try {
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`
      );
      if (!response.ok) throw new Error("Download failed");
      const text = await response.text();
      onSelect(text, `${title || `CID_${cid}`}.sdf`, "sdf");
      toast.success(`Ligand ${title || cid} loaded successfully!`);
    } catch {
      toast.error(`Failed to download compound ${cid}`);
    } finally {
      setDownloading(null);
    }
  };

  const checkLipinski = (c: PubChemCompound) => {
    const violations: string[] = [];
    if (c.MolecularWeight > 500) violations.push("MW > 500");
    if (c.XLogP !== undefined && c.XLogP > 5) violations.push("LogP > 5");
    if (c.HBondDonorCount !== undefined && c.HBondDonorCount > 5) violations.push("HBD > 5");
    if (c.HBondAcceptorCount !== undefined && c.HBondAcceptorCount > 10) violations.push("HBA > 10");
    return violations;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          PubChem Compound Search
        </CardTitle>
        <CardDescription>
          Search <a href="https://pubchem.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline">PubChem</a> for
          ligand molecules. Includes drug-likeness assessment (Lipinski's Rule of Five) and 2D structure preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search compounds (e.g., 'aspirin', 'ibuprofen', 'caffeine', or CID number)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPubChem()}
          />
          <Button onClick={searchPubChem} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-1.5">
          {["Aspirin", "Ibuprofen", "Caffeine", "Metformin", "Paracetamol", "Penicillin"].map(name => (
            <Button key={name} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setQuery(name); }}>
              {name}
            </Button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((compound) => {
              const violations = checkLipinski(compound);
              const isExpanded = expandedCID === compound.CID;
              return (
                <div key={compound.CID} className="rounded-lg border bg-card hover:border-primary/50 transition-colors overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">CID: {compound.CID}</Badge>
                        {violations.length === 0 ? (
                          <Badge variant="default" className="text-[10px]">Drug-like ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">{violations.length} Lipinski violation{violations.length > 1 ? "s" : ""}</Badge>
                        )}
                      </div>
                      <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.CID}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>

                    <p className="text-sm font-medium">{compound.Title || compound.IUPACName}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="font-mono">{compound.MolecularFormula}</span>
                      <span>{compound.MolecularWeight?.toFixed(2)} g/mol</span>
                      {compound.XLogP !== undefined && <span>LogP: {compound.XLogP.toFixed(1)}</span>}
                    </div>

                    {/* 2D Structure Preview */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.CID}/PNG?image_size=200x200`}
                        alt={`2D structure of ${compound.Title}`}
                        className="w-28 h-28 rounded border bg-white object-contain shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {compound.HBondDonorCount !== undefined && (
                            <div><span className="text-muted-foreground">H-Bond Donors:</span> {compound.HBondDonorCount}</div>
                          )}
                          {compound.HBondAcceptorCount !== undefined && (
                            <div><span className="text-muted-foreground">H-Bond Acceptors:</span> {compound.HBondAcceptorCount}</div>
                          )}
                          {compound.RotatableBondCount !== undefined && (
                            <div><span className="text-muted-foreground">Rotatable Bonds:</span> {compound.RotatableBondCount}</div>
                          )}
                          {compound.TPSA !== undefined && (
                            <div><span className="text-muted-foreground">TPSA:</span> {compound.TPSA.toFixed(1)} Å²</div>
                          )}
                        </div>
                        {compound.IUPACName && compound.IUPACName !== compound.Title && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 italic">{compound.IUPACName}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5"
                      disabled={downloading === compound.CID}
                      onClick={() => downloadSDF(compound.CID, compound.Title)}
                    >
                      {downloading === compound.CID ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Load as Ligand (SDF)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1 mb-1">
            <Info className="h-3.5 w-3.5" /> Drug-Likeness (Lipinski's Rule of Five)
          </p>
          <p>A compound is considered "drug-like" if it satisfies: MW ≤ 500, LogP ≤ 5, H-bond donors ≤ 5, H-bond acceptors ≤ 10.</p>
          <p className="mt-1"><strong>Reference:</strong> Lipinski, C.A. et al. (2001). Adv. Drug Deliv. Rev., 46(1-3), 3–26.</p>
        </div>
      </CardContent>
    </Card>
  );
}
