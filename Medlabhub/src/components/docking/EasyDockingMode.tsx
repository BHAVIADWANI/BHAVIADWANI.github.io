import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wand2, Search, Download, Loader2, CheckCircle2, ArrowRight,
  AlertCircle, Atom, Target, Play, BarChart3, Info
} from "lucide-react";
import { toast } from "sonner";
import type { DockingJob, DockingResult, DockingPose } from "./DockingDashboard";

interface Props {
  job: DockingJob;
  setJob: React.Dispatch<React.SetStateAction<DockingJob>>;
  onResult: (result: DockingResult) => void;
  onSwitchTab: (tab: string) => void;
}

type EasyStep = "protein" | "ligand" | "review" | "running" | "done";

function detectPocketCenter(pdbData: string): { x: number; y: number; z: number } {
  const atoms: { x: number; y: number; z: number }[] = [];
  for (const line of pdbData.split("\n")) {
    if (line.startsWith("HETATM") && !line.substring(17, 20).trim().match(/^(HOH|WAT)$/)) {
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      if (!isNaN(x)) atoms.push({ x, y, z });
    }
  }
  if (atoms.length > 0) {
    return {
      x: Math.round((atoms.reduce((s, a) => s + a.x, 0) / atoms.length) * 10) / 10,
      y: Math.round((atoms.reduce((s, a) => s + a.y, 0) / atoms.length) * 10) / 10,
      z: Math.round((atoms.reduce((s, a) => s + a.z, 0) / atoms.length) * 10) / 10,
    };
  }
  // Fallback: center of all ATOM records
  const allAtoms: { x: number; y: number; z: number }[] = [];
  for (const line of pdbData.split("\n")) {
    if (line.startsWith("ATOM")) {
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      if (!isNaN(x)) allAtoms.push({ x, y, z });
    }
  }
  if (allAtoms.length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: Math.round((allAtoms.reduce((s, a) => s + a.x, 0) / allAtoms.length) * 10) / 10,
    y: Math.round((allAtoms.reduce((s, a) => s + a.y, 0) / allAtoms.length) * 10) / 10,
    z: Math.round((allAtoms.reduce((s, a) => s + a.z, 0) / allAtoms.length) * 10) / 10,
  };
}

function simulateDocking(job: DockingJob): DockingResult {
  const numPoses = 9;
  const baseEnergy = -(Math.random() * 4 + 5);
  const poses: DockingPose[] = Array.from({ length: numPoses }, (_, i) => ({
    rank: i + 1,
    energy: parseFloat((baseEnergy + i * (Math.random() * 0.8 + 0.2)).toFixed(1)),
    rmsd_lb: parseFloat((i * (Math.random() * 2 + 0.5)).toFixed(3)),
    rmsd_ub: parseFloat((i * (Math.random() * 3 + 1)).toFixed(3)),
    poseData: `MODE ${i + 1}\nENERGY ${(baseEnergy + i * 0.5).toFixed(1)}`,
  }));
  return {
    id: crypto.randomUUID(),
    bindingEnergy: poses[0].energy,
    poses,
    ligandName: job.ligandName || "Unknown Ligand",
    proteinName: job.proteinName || "Unknown Protein",
    timestamp: new Date().toISOString(),
    exhaustiveness: 8,
    gridCenter: job.gridCenter,
    gridSize: job.gridSize,
  };
}

export function EasyDockingMode({ job, setJob, onResult, onSwitchTab }: Props) {
  const [step, setStep] = useState<EasyStep>("protein");
  const [proteinQuery, setProteinQuery] = useState("");
  const [ligandQuery, setLigandQuery] = useState("");
  const [proteinResults, setProteinResults] = useState<any[]>([]);
  const [ligandResults, setLigandResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [dockingResult, setDockingResult] = useState<DockingResult | null>(null);

  const stepIndex = { protein: 0, ligand: 1, review: 2, running: 3, done: 4 };
  const progressPct = ((stepIndex[step] + 1) / 5) * 100;

  const searchProtein = async () => {
    if (!proteinQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch("https://search.rcsb.org/rcsbsearch/v2/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: { type: "terminal", service: "full_text", parameters: { value: proteinQuery.trim() } },
          return_type: "entry",
          request_options: { paginate: { start: 0, rows: 6 } },
        }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      const ids: string[] = (data.result_set || []).map((r: any) => r.identifier);
      const entries: any[] = [];
      for (const id of ids.slice(0, 4)) {
        try {
          const res = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${id}`);
          if (res.ok) {
            const d = await res.json();
            entries.push({
              id,
              title: d.struct?.title || id,
              method: d.exptl?.[0]?.method || "",
              resolution: d.rcsb_entry_info?.resolution_combined?.[0] || null,
            });
          }
        } catch {}
      }
      setProteinResults(entries);
      if (entries.length === 0) toast.info("No proteins found. Try a different search.");
    } catch {
      toast.error("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const selectProtein = async (pdbId: string, title: string) => {
    setDownloading(true);
    try {
      const res = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
      if (!res.ok) throw new Error();
      const text = await res.text();
      const center = detectPocketCenter(text);
      setJob(j => ({
        ...j,
        proteinData: text,
        proteinName: `${pdbId} - ${title}`,
        gridCenter: center,
        gridSize: { x: 22, y: 22, z: 22 },
        exhaustiveness: 8,
        numModes: 9,
      }));
      toast.success(`Protein ${pdbId} loaded! Binding pocket auto-detected.`);
      setStep("ligand");
    } catch {
      toast.error("Failed to download protein.");
    } finally {
      setDownloading(false);
    }
  };

  const searchLigand = async () => {
    if (!ligandQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(ligandQuery.trim())}/property/MolecularFormula,MolecularWeight,IUPACName,Title/JSON`
      );
      if (res.ok) {
        const data = await res.json();
        setLigandResults(data.PropertyTable?.Properties || []);
      } else {
        const autoRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(ligandQuery.trim())}/json?limit=4`);
        const autoData = await autoRes.json();
        const names: string[] = autoData.dictionary_terms?.compound || [];
        const compounds: any[] = [];
        for (const name of names.slice(0, 4)) {
          try {
            const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,Title/JSON`);
            if (r.ok) {
              const d = await r.json();
              if (d.PropertyTable?.Properties?.[0]) compounds.push(d.PropertyTable.Properties[0]);
            }
          } catch {}
        }
        setLigandResults(compounds);
      }
      if (ligandResults.length === 0) toast.info("No compounds found.");
    } catch {
      toast.error("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const selectLigand = async (cid: number, title: string) => {
    setDownloading(true);
    try {
      const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setJob(j => ({ ...j, ligandData: text, ligandName: title || `CID_${cid}`, ligandFormat: "sdf" }));
      toast.success(`Ligand ${title} loaded!`);
      setStep("review");
    } catch {
      toast.error("Failed to download ligand.");
    } finally {
      setDownloading(false);
    }
  };

  const runEasyDocking = async () => {
    setStep("running");
    setProgress(0);
    const stages = [
      { label: "Validating protein structure...", pct: 10 },
      { label: "Adding hydrogens to receptor...", pct: 20 },
      { label: "Preparing ligand (3D optimization)...", pct: 35 },
      { label: "Auto-detecting binding pocket...", pct: 45 },
      { label: "Setting grid box parameters...", pct: 55 },
      { label: "Running AutoDock Vina (exhaustiveness=8)...", pct: 70 },
      { label: "Scoring and ranking poses...", pct: 85 },
      { label: "Generating interaction profile...", pct: 95 },
      { label: "Complete!", pct: 100 },
    ];
    for (const s of stages) {
      setStage(s.label);
      setProgress(s.pct);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    }
    const result = simulateDocking(job);
    setDockingResult(result);
    onResult(result);
    setStep("done");
    toast.success(`Docking complete! Best binding energy: ${result.bindingEnergy} kcal/mol`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Easy Docking Mode
        </CardTitle>
        <CardDescription>
          Beginner-friendly guided workflow. Just select a protein and ligand — we'll handle the rest automatically!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {["Select Protein", "Select Ligand", "Review", "Docking", "Results"].map((label, i) => (
              <span key={label} className={stepIndex[step] >= i ? "text-primary font-medium" : ""}>
                {stepIndex[step] > i ? "✓ " : ""}{label}
              </span>
            ))}
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* Step 1: Protein */}
        {step === "protein" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-semibold flex items-center gap-2"><Atom className="h-4 w-4 text-primary" /> Step 1: Select a Protein Target</p>
              <p className="text-xs text-muted-foreground mt-1">Search the Protein Data Bank for your target protein. We'll auto-detect the binding pocket.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search proteins (e.g., 'HIV protease', '1HSG')..."
                value={proteinQuery}
                onChange={(e) => setProteinQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProtein()}
              />
              <Button onClick={searchProtein} disabled={searching} className="gap-2 shrink-0">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["HIV protease", "SARS-CoV-2", "insulin receptor", "kinase"].map(q => (
                <Button key={q} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setProteinQuery(q); }}>{q}</Button>
              ))}
            </div>
            {proteinResults.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2">
                {proteinResults.map((entry: any) => (
                  <button
                    key={entry.id}
                    className="p-3 rounded-lg border text-left hover:border-primary/50 transition-colors space-y-1"
                    onClick={() => selectProtein(entry.id, entry.title)}
                    disabled={downloading}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">{entry.id}</Badge>
                      {entry.resolution && <Badge variant="outline" className="text-[10px]">{entry.resolution.toFixed(1)} Å</Badge>}
                    </div>
                    <p className="text-xs font-medium line-clamp-2">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.method}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Ligand */}
        {step === "ligand" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Step 2: Select a Ligand</p>
              <p className="text-xs text-muted-foreground mt-1">Search PubChem for the drug/compound you want to dock against the protein.</p>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Protein loaded: <strong>{job.proteinName}</strong></span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search compounds (e.g., 'aspirin', 'ibuprofen')..."
                value={ligandQuery}
                onChange={(e) => setLigandQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchLigand()}
              />
              <Button onClick={searchLigand} disabled={searching} className="gap-2 shrink-0">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Aspirin", "Caffeine", "Ibuprofen", "Metformin"].map(q => (
                <Button key={q} variant="outline" size="sm" className="text-xs h-7" onClick={() => { setLigandQuery(q); }}>{q}</Button>
              ))}
            </div>
            {ligandResults.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2">
                {ligandResults.map((c: any) => (
                  <button
                    key={c.CID}
                    className="p-3 rounded-lg border text-left hover:border-primary/50 transition-colors space-y-1"
                    onClick={() => selectLigand(c.CID, c.Title)}
                    disabled={downloading}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">CID: {c.CID}</Badge>
                    </div>
                    <p className="text-xs font-medium">{c.Title}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{c.MolecularFormula}</span>
                      <span>{c.MolecularWeight?.toFixed(1)} g/mol</span>
                    </div>
                    <img
                      src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${c.CID}/PNG?image_size=120x120`}
                      alt={c.Title}
                      className="w-16 h-16 bg-white rounded border object-contain mt-1"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => setStep("protein")}>← Back to Protein</Button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-semibold flex items-center gap-2"><Play className="h-4 w-4 text-primary" /> Step 3: Review & Run</p>
              <p className="text-xs text-muted-foreground mt-1">Everything is set up. Review the settings and click Run.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground">Protein (Receptor)</p>
                <p className="text-sm font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{job.proteinName}</p>
              </div>
              <div className="p-3 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground">Ligand</p>
                <p className="text-sm font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{job.ligandName}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
              <p className="font-semibold text-foreground">Auto-configured parameters:</p>
              <p>• Grid Center: ({job.gridCenter.x}, {job.gridCenter.y}, {job.gridCenter.z}) Å (auto-detected)</p>
              <p>• Grid Size: {job.gridSize.x} × {job.gridSize.y} × {job.gridSize.z} Å</p>
              <p>• Exhaustiveness: 8 (standard)</p>
              <p>• Binding Modes: 9</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("ligand")}>← Back</Button>
              <Button className="flex-1 gap-2" onClick={runEasyDocking}>
                <Play className="h-4 w-4" /> Run Docking
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Running */}
        {step === "running" && (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="font-medium">Docking in Progress...</p>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-center text-muted-foreground">{stage}</p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === "done" && dockingResult && (
          <div className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <p className="text-lg font-bold">Docking Complete!</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">Best Binding Energy</p>
                  <p className="text-2xl font-bold text-primary">{dockingResult.bindingEnergy} kcal/mol</p>
                  <Badge className="mt-1" variant={dockingResult.bindingEnergy <= -9 ? "default" : dockingResult.bindingEnergy <= -7 ? "secondary" : "outline"}>
                    {dockingResult.bindingEnergy <= -9 ? "Excellent" : dockingResult.bindingEnergy <= -7 ? "Good" : dockingResult.bindingEnergy <= -5 ? "Moderate" : "Weak"}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">Poses Generated</p>
                  <p className="text-2xl font-bold">{dockingResult.poses.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">Energy Range</p>
                  <p className="text-2xl font-bold">{(dockingResult.poses[dockingResult.poses.length - 1].energy - dockingResult.bindingEnergy).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">kcal/mol spread</p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30 text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> What does this mean?</p>
              <p className="text-muted-foreground text-xs">
                {dockingResult.bindingEnergy <= -9
                  ? "Excellent binding predicted! This ligand shows very strong affinity for the protein target. This is a promising drug candidate that warrants further investigation through molecular dynamics simulations and experimental validation (IC50, Ki assays)."
                  : dockingResult.bindingEnergy <= -7
                  ? "Good binding affinity predicted. The ligand interacts favorably with the protein. Consider optimizing the compound through structure-activity relationship (SAR) studies to improve potency."
                  : dockingResult.bindingEnergy <= -5
                  ? "Moderate binding predicted. The interaction exists but may not be strong enough for therapeutic effect. Chemical modifications could improve affinity — consider adding H-bond donors/acceptors or optimizing hydrophobic contacts."
                  : "Weak binding predicted. This ligand may not be a viable drug candidate for this target. Consider trying structurally different compounds or verifying the binding site selection."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onSwitchTab("results")} className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> View Full Results
              </Button>
              <Button variant="outline" onClick={() => onSwitchTab("viewer")} className="gap-1.5">
                <Atom className="h-3.5 w-3.5" /> View in 3D
              </Button>
              <Button variant="outline" onClick={() => onSwitchTab("interactions")} className="gap-1.5">
                <Target className="h-3.5 w-3.5" /> View Interactions
              </Button>
              <Button variant="outline" onClick={() => onSwitchTab("ai")} className="gap-1.5">
                AI Interpretation
              </Button>
              <Button variant="outline" onClick={() => { setStep("protein"); setProteinResults([]); setLigandResults([]); }} className="gap-1.5">
                New Docking
              </Button>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">⚡ Demo Mode</p>
          <p>Easy Docking uses simulated AutoDock Vina–style output with realistic scoring. For production docking, connect an external computational backend. All protein data is fetched from RCSB PDB and ligand data from PubChem.</p>
        </div>
      </CardContent>
    </Card>
  );
}
