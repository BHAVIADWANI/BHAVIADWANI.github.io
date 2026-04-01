import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Atom, FlaskConical, Download, Info, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSelect: (data: string, name: string, format: string) => void;
}

interface MoleculeInfo {
  smiles: string;
  formula: string;
  weight: number;
  iupac: string;
  cid: number;
}

const EXAMPLE_SMILES = [
  { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(O)=O" },
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C)C(=O)N2C" },
  { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(O)=O" },
  { name: "Paracetamol", smiles: "CC(=O)NC1=CC=C(O)C=C1" },
  { name: "Penicillin G", smiles: "CC1(C)SC2C(NC(=O)CC3=CC=CC=C3)C(=O)N2C1C(O)=O" },
  { name: "Metformin", smiles: "CN(C)C(=N)NC(=N)N" },
];

export function SMILESLigandBuilder({ onSelect }: Props) {
  const [smiles, setSmiles] = useState("");
  const [loading, setLoading] = useState(false);
  const [molInfo, setMolInfo] = useState<MoleculeInfo | null>(null);

  const lookupSMILES = async (smilesInput: string) => {
    if (!smilesInput.trim()) {
      toast.error("Please enter a SMILES string.");
      return;
    }
    setLoading(true);
    setMolInfo(null);

    try {
      // Use PubChem to resolve SMILES to compound info
      const searchRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smilesInput.trim())}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`
      );

      if (!searchRes.ok) throw new Error("SMILES not recognized by PubChem");

      const data = await searchRes.json();
      const props = data.PropertyTable?.Properties?.[0];
      if (!props) throw new Error("No compound data found");

      setMolInfo({
        smiles: props.CanonicalSMILES || smilesInput,
        formula: props.MolecularFormula || "Unknown",
        weight: props.MolecularWeight || 0,
        iupac: props.IUPACName || "Unknown",
        cid: props.CID || 0,
      });

      toast.success("SMILES resolved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve SMILES. Check the notation.");
    } finally {
      setLoading(false);
    }
  };

  const loadAsSDF = async () => {
    if (!molInfo?.cid) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${molInfo.cid}/SDF`
      );
      if (!res.ok) throw new Error("Failed to download SDF");
      const sdfData = await res.text();
      onSelect(sdfData, molInfo.iupac || `CID_${molInfo.cid}`, "sdf");
      toast.success("Ligand loaded from SMILES!");
    } catch {
      toast.error("Failed to fetch 3D structure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5 text-primary" />
          SMILES Ligand Builder
        </CardTitle>
        <CardDescription>
          Enter a SMILES string to resolve and load a ligand. SMILES (Simplified Molecular-Input Line-Entry System) is a text-based notation for chemical structures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info box */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1 mb-1">
            <Info className="h-3.5 w-3.5" /> What is SMILES?
          </p>
          <p>SMILES (Simplified Molecular-Input Line-Entry System) represents chemical structures as ASCII text. For example, <code className="bg-muted px-1 rounded">CC(=O)OC1=CC=CC=C1C(O)=O</code> represents Aspirin. The notation encodes atoms, bonds, rings, and branching.</p>
          <p className="mt-1"><strong>Reference:</strong> Weininger, D. (1988). SMILES. J. Chem. Inf. Comput. Sci., 28(1), 31–36.</p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label>SMILES String</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., CC(=O)OC1=CC=CC=C1C(O)=O"
              value={smiles}
              onChange={(e) => setSmiles(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupSMILES(smiles)}
              className="font-mono text-sm"
            />
            <Button onClick={() => lookupSMILES(smiles)} disabled={loading} className="gap-2 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              Resolve
            </Button>
          </div>
        </div>

        {/* Quick examples */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Examples</Label>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_SMILES.map((ex) => (
              <Button
                key={ex.name}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setSmiles(ex.smiles);
                  lookupSMILES(ex.smiles);
                }}
              >
                {ex.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Result */}
        {molInfo && (
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Compound Resolved</span>
              <Badge variant="secondary" className="font-mono text-xs">CID: {molInfo.cid}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">IUPAC Name:</span>{" "}
                <span className="font-medium">{molInfo.iupac}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Formula:</span>{" "}
                <span className="font-medium font-mono">{molInfo.formula}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Molecular Weight:</span>{" "}
                <span className="font-medium">{molInfo.weight.toFixed(2)} g/mol</span>
              </div>
              <div>
                <span className="text-muted-foreground">Canonical SMILES:</span>{" "}
                <span className="font-mono text-xs">{molInfo.smiles}</span>
              </div>
            </div>

            <Button className="w-full gap-2" onClick={loadAsSDF} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Load 3D Structure as Ligand
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
