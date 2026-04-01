import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, AlertCircle, Loader2, Atom } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { DockingJob, DockingResult, DockingPose } from "./DockingDashboard";

interface Props {
  job: DockingJob;
  onResult: (result: DockingResult) => void;
}

// Simulated docking engine — generates realistic mock results
function simulateDocking(job: DockingJob): DockingResult {
  const numPoses = job.numModes;
  const baseEnergy = -(Math.random() * 4 + 5); // -5 to -9 kcal/mol

  const poses: DockingPose[] = Array.from({ length: numPoses }, (_, i) => ({
    rank: i + 1,
    energy: parseFloat((baseEnergy + i * (Math.random() * 0.8 + 0.2)).toFixed(1)),
    rmsd_lb: parseFloat((i * (Math.random() * 2 + 0.5)).toFixed(3)),
    rmsd_ub: parseFloat((i * (Math.random() * 3 + 1)).toFixed(3)),
    poseData: `MODE ${i + 1}\nENERGY ${(baseEnergy + i * 0.5).toFixed(1)}\nSIMULATED POSE DATA`,
  }));

  return {
    id: crypto.randomUUID(),
    bindingEnergy: poses[0].energy,
    poses,
    ligandName: job.ligandName || "Unknown Ligand",
    proteinName: job.proteinName || "Unknown Protein",
    timestamp: new Date().toISOString(),
    exhaustiveness: job.exhaustiveness,
    gridCenter: job.gridCenter,
    gridSize: job.gridSize,
  };
}

export function DockingRunner({ job, onResult }: Props) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");

  const canRun = job.proteinData && job.ligandData;

  const runDocking = async () => {
    if (!canRun) {
      toast.error("Please load both a protein and a ligand before running docking.");
      return;
    }

    setRunning(true);
    setProgress(0);

    const stages = [
      { label: "Validating input files...", pct: 10 },
      { label: "Preparing receptor (adding hydrogens, charges)...", pct: 25 },
      { label: "Converting ligand format (Open Babel)...", pct: 35 },
      { label: "Generating grid maps...", pct: 50 },
      { label: "Running AutoDock Vina (exhaustiveness=" + job.exhaustiveness + ")...", pct: 70 },
      { label: "Scoring binding poses...", pct: 85 },
      { label: "Ranking results...", pct: 95 },
      { label: "Complete!", pct: 100 },
    ];

    for (const s of stages) {
      setStage(s.label);
      setProgress(s.pct);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    }

    const result = simulateDocking(job);
    onResult(result);
    setRunning(false);
    toast.success(`Docking complete! Best binding energy: ${result.bindingEnergy} kcal/mol`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5 text-primary" />
          Run Molecular Docking
        </CardTitle>
        <CardDescription>
          Submit your docking job. The simulation engine will process the protein–ligand docking and return binding poses with energy scores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status summary */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border space-y-2">
            <p className="text-sm font-medium">Protein (Receptor)</p>
            {job.proteinData ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{job.proteinName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Not loaded</span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-lg border space-y-2">
            <p className="text-sm font-medium">Ligand</p>
            {job.ligandData ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{job.ligandName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Not loaded</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 text-xs space-y-1">
          <p><strong>Grid Center:</strong> ({job.gridCenter.x}, {job.gridCenter.y}, {job.gridCenter.z}) Å</p>
          <p><strong>Grid Size:</strong> {job.gridSize.x} × {job.gridSize.y} × {job.gridSize.z} Å</p>
          <p><strong>Exhaustiveness:</strong> {job.exhaustiveness}</p>
          <p><strong>Binding Modes:</strong> {job.numModes}</p>
        </div>

        {running && (
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {stage}
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={!canRun || running}
          onClick={runDocking}
        >
          {running ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {running ? "Docking in Progress..." : "Run Docking Simulation"}
        </Button>

        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">⚡ Demo Mode</p>
          <p>This runs a simulated docking engine with realistic AutoDock Vina–style output. To run real computations, connect an external docking server (AWS/GCP VM with AutoDock Vina Docker container).</p>
        </div>
      </CardContent>
    </Card>
  );
}
