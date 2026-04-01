import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DockingJob } from "./DockingDashboard";

interface Props {
  job: DockingJob;
  setJob: React.Dispatch<React.SetStateAction<DockingJob>>;
}

function ParamTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs"><p className="text-xs">{text}</p></TooltipContent>
    </Tooltip>
  );
}

export function DockingParameterPanel({ job, setJob }: Props) {
  const updateGrid = (field: "gridCenter" | "gridSize", axis: "x" | "y" | "z", value: string) => {
    const num = parseFloat(value) || 0;
    setJob(j => ({ ...j, [field]: { ...j[field], [axis]: num } }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Grid Box Configuration
          </CardTitle>
          <CardDescription>
            Define the search space for docking. The grid box should encompass the binding site of the protein.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="font-semibold">Grid Center (Å)</Label>
              <ParamTooltip text="Center coordinates of the docking search box in Angstroms. Set this to the center of the binding pocket." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["x", "y", "z"] as const).map(axis => (
                <div key={axis} className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">{axis}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={job.gridCenter[axis]}
                    onChange={(e) => updateGrid("gridCenter", axis, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="font-semibold">Grid Size (Å)</Label>
              <ParamTooltip text="Dimensions of the docking search box. Larger boxes cover more surface but take longer." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["x", "y", "z"] as const).map(axis => (
                <div key={axis} className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">{axis}</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    max="126"
                    value={job.gridSize[axis]}
                    onChange={(e) => updateGrid("gridSize", axis, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Docking Parameters
          </CardTitle>
          <CardDescription>
            Configure AutoDock Vina parameters. Higher exhaustiveness gives more accurate results but takes longer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Exhaustiveness</Label>
                <ParamTooltip text="Controls thoroughness of the search. Default is 8. Higher values (16-32) improve accuracy for flexible ligands." />
              </div>
              <span className="text-sm font-mono text-primary">{job.exhaustiveness}</span>
            </div>
            <Slider
              value={[job.exhaustiveness]}
              onValueChange={([v]) => setJob(j => ({ ...j, exhaustiveness: v }))}
              min={1}
              max={64}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {job.exhaustiveness <= 4 ? "Fast (lower accuracy)" : job.exhaustiveness <= 12 ? "Standard" : job.exhaustiveness <= 32 ? "Thorough" : "Very thorough (slow)"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Number of Binding Modes</Label>
                <ParamTooltip text="Maximum number of binding poses to generate. Default is 9." />
              </div>
              <span className="text-sm font-mono text-primary">{job.numModes}</span>
            </div>
            <Slider
              value={[job.numModes]}
              onValueChange={([v]) => setJob(j => ({ ...j, numModes: v }))}
              min={1}
              max={20}
              step={1}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">AutoDock Vina Parameters Reference:</p>
            <p>• <strong>Exhaustiveness 8:</strong> Default — good balance of speed and accuracy</p>
            <p>• <strong>Exhaustiveness 32:</strong> Recommended for publication-quality results</p>
            <p>• <strong>Grid size 20×20×20 Å:</strong> Typical for a single binding pocket</p>
            <p>• <strong>Grid size 40×40×40 Å:</strong> For blind docking or large binding sites</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
