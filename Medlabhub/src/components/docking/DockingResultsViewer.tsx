import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DockingResult } from "./DockingDashboard";

interface Props {
  result: DockingResult | null;
}

function getAffinityLabel(energy: number): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (energy <= -9) return { label: "Excellent", variant: "default" };
  if (energy <= -7) return { label: "Good", variant: "secondary" };
  if (energy <= -5) return { label: "Moderate", variant: "outline" };
  return { label: "Weak", variant: "destructive" };
}

export function DockingResultsViewer({ result }: Props) {
  if (!result) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No Docking Results</p>
          <p className="text-sm text-muted-foreground">Run a docking simulation first to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  const bestPose = result.poses[0];
  const affinity = getAffinityLabel(bestPose.energy);

  const downloadResults = () => {
    const log = [
      `Molecular Docking Results — MicroID`,
      `====================================`,
      `Protein: ${result.proteinName}`,
      `Ligand: ${result.ligandName}`,
      `Exhaustiveness: ${result.exhaustiveness}`,
      `Grid Center: (${result.gridCenter.x}, ${result.gridCenter.y}, ${result.gridCenter.z}) Å`,
      `Grid Size: ${result.gridSize.x} × ${result.gridSize.y} × ${result.gridSize.z} Å`,
      `Date: ${new Date(result.timestamp).toLocaleString()}`,
      ``,
      `Mode | Affinity (kcal/mol) | RMSD l.b. | RMSD u.b.`,
      `-----+---------------------+-----------+----------`,
      ...result.poses.map(p =>
        `  ${String(p.rank).padStart(2)}  |     ${p.energy.toFixed(1).padStart(6)}          | ${p.rmsd_lb.toFixed(3).padStart(7)}   | ${p.rmsd_ub.toFixed(3).padStart(7)}`
      ),
    ].join("\n");

    const blob = new Blob([log], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `docking_${result.proteinName}_${result.ligandName}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Best Binding Affinity</p>
            <p className="text-3xl font-bold text-primary">{bestPose.energy}</p>
            <p className="text-sm text-muted-foreground">kcal/mol</p>
            <Badge variant={affinity.variant} className="mt-2">{affinity.label}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Total Poses</p>
            <p className="text-3xl font-bold">{result.poses.length}</p>
            <p className="text-sm text-muted-foreground">binding modes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Energy Range</p>
            <p className="text-3xl font-bold">
              {(result.poses[result.poses.length - 1].energy - bestPose.energy).toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">kcal/mol spread</p>
          </CardContent>
        </Card>
      </div>

      {/* Poses table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Binding Poses
            </CardTitle>
            <CardDescription>
              {result.proteinName} + {result.ligandName}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadResults}>
            <Download className="h-3.5 w-3.5" />
            Download Log
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Mode</TableHead>
                <TableHead>Affinity (kcal/mol)</TableHead>
                <TableHead>RMSD l.b.</TableHead>
                <TableHead>RMSD u.b.</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.poses.map((pose) => {
                const a = getAffinityLabel(pose.energy);
                return (
                  <TableRow key={pose.rank}>
                    <TableCell className="font-mono">{pose.rank}</TableCell>
                    <TableCell className="font-mono font-bold">{pose.energy.toFixed(1)}</TableCell>
                    <TableCell className="font-mono">{pose.rmsd_lb.toFixed(3)}</TableCell>
                    <TableCell className="font-mono">{pose.rmsd_ub.toFixed(3)}</TableCell>
                    <TableCell><Badge variant={a.variant}>{a.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
