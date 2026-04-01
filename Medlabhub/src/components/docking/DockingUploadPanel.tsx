import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import type { DockingJob } from "./DockingDashboard";

interface Props {
  job: DockingJob;
  setJob: React.Dispatch<React.SetStateAction<DockingJob>>;
}

export function DockingUploadPanel({ job, setJob }: Props) {
  const proteinRef = useRef<HTMLInputElement>(null);
  const ligandRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: "protein" | "ligand") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (type === "protein") {
        if (!file.name.endsWith(".pdb") && !file.name.endsWith(".pdbqt")) {
          toast.error("Please upload a .pdb or .pdbqt file for the protein.");
          return;
        }
        setJob(j => ({ ...j, proteinData: content, proteinName: file.name }));
        toast.success(`Protein loaded: ${file.name}`);
      } else {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!["sdf", "mol2", "pdbqt", "mol", "pdb"].includes(ext)) {
          toast.error("Please upload a .sdf, .mol2, .mol, .pdb, or .pdbqt file for the ligand.");
          return;
        }
        setJob(j => ({ ...j, ligandData: content, ligandName: file.name, ligandFormat: ext === "mol2" ? "mol2" : ext === "pdbqt" ? "pdbqt" : "sdf" }));
        toast.success(`Ligand loaded: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const clearFile = (type: "protein" | "ligand") => {
    if (type === "protein") {
      setJob(j => ({ ...j, proteinData: null, proteinName: "" }));
    } else {
      setJob(j => ({ ...j, ligandData: null, ligandName: "" }));
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Protein (Receptor)
          </CardTitle>
          <CardDescription>
            Upload a protein structure file (.pdb or .pdbqt) or use the PDB Search tab to fetch from RCSB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={proteinRef} type="file" accept=".pdb,.pdbqt" className="hidden" onChange={handleFileUpload("protein")} />
          {job.proteinData ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.proteinName}</p>
                <p className="text-xs text-muted-foreground">{(job.proteinData.length / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => clearFile("protein")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full h-32 border-dashed gap-2" onClick={() => proteinRef.current?.click()}>
              <Upload className="h-5 w-5" />
              Upload Protein File (.pdb / .pdbqt)
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Ligand (Small Molecule)
          </CardTitle>
          <CardDescription>
            Upload a ligand structure file (.sdf, .mol2, .pdbqt) or use the PubChem tab to search compounds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={ligandRef} type="file" accept=".sdf,.mol2,.pdbqt,.mol,.pdb" className="hidden" onChange={handleFileUpload("ligand")} />
          {job.ligandData ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.ligandName}</p>
                <p className="text-xs text-muted-foreground">{(job.ligandData.length / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => clearFile("ligand")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full h-32 border-dashed gap-2" onClick={() => ligandRef.current?.click()}>
              <Upload className="h-5 w-5" />
              Upload Ligand File (.sdf / .mol2 / .pdbqt)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
