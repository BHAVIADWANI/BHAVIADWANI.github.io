import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2, MapPin, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DockingJob } from "./DockingDashboard";

interface Pocket {
  id: number;
  center: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
  volume: number;
  score: number;
  residues: string[];
}

interface Props {
  job: DockingJob;
  setJob: React.Dispatch<React.SetStateAction<DockingJob>>;
}

// Geometric pocket detection from PDB ATOM coordinates
function detectPocketsFromPDB(pdbData: string): Pocket[] {
  const atoms: { x: number; y: number; z: number; resName: string; resSeq: number; chain: string }[] = [];

  for (const line of pdbData.split("\n")) {
    if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      const resName = line.substring(17, 20).trim();
      const resSeq = parseInt(line.substring(22, 26));
      const chain = line.substring(21, 22).trim();
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        atoms.push({ x, y, z, resName, resSeq, chain });
      }
    }
  }

  if (atoms.length === 0) return [];

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const a of atoms) {
    minX = Math.min(minX, a.x); minY = Math.min(minY, a.y); minZ = Math.min(minZ, a.z);
    maxX = Math.max(maxX, a.x); maxY = Math.max(maxY, a.y); maxZ = Math.max(maxZ, a.z);
  }

  // Grid-based cavity detection
  const gridSpacing = 2.0;
  const probeRadius = 1.4; // water probe
  const pocketThreshold = 3.5; // Å from nearest atom for cavity
  
  const cavityPoints: { x: number; y: number; z: number }[] = [];

  for (let gx = minX - 4; gx <= maxX + 4; gx += gridSpacing) {
    for (let gy = minY - 4; gy <= maxY + 4; gy += gridSpacing) {
      for (let gz = minZ - 4; gz <= maxZ + 4; gz += gridSpacing) {
        let minDist = Infinity;
        let nearCount = 0;
        for (const a of atoms) {
          const d = Math.sqrt((gx - a.x) ** 2 + (gy - a.y) ** 2 + (gz - a.z) ** 2);
          if (d < minDist) minDist = d;
          if (d < 6) nearCount++;
        }
        // Point is in a cavity if it's not inside protein but surrounded by it
        if (minDist > probeRadius + 1.0 && minDist < pocketThreshold + 3 && nearCount > 8) {
          cavityPoints.push({ x: gx, y: gy, z: gz });
        }
      }
    }
  }

  if (cavityPoints.length === 0) {
    // Fallback: use centroid of HETATM or center of protein
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    return [{
      id: 1,
      center: { x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10, z: Math.round(cz * 10) / 10 },
      size: { x: 22, y: 22, z: 22 },
      volume: 10648,
      score: 0.5,
      residues: ["Center of protein (fallback)"],
    }];
  }

  // Cluster cavity points using simple distance-based clustering
  const clusters: { x: number; y: number; z: number }[][] = [];
  const visited = new Set<number>();
  
  for (let i = 0; i < cavityPoints.length; i++) {
    if (visited.has(i)) continue;
    const cluster: { x: number; y: number; z: number }[] = [cavityPoints[i]];
    visited.add(i);
    for (let j = i + 1; j < cavityPoints.length; j++) {
      if (visited.has(j)) continue;
      const p1 = cavityPoints[i];
      const p2 = cavityPoints[j];
      const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
      if (d < 8) {
        cluster.push(cavityPoints[j]);
        visited.add(j);
      }
    }
    if (cluster.length >= 3) clusters.push(cluster);
  }

  // Convert clusters to pockets
  const pockets: Pocket[] = clusters
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
    .map((cluster, idx) => {
      const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
      const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
      const cz = cluster.reduce((s, p) => s + p.z, 0) / cluster.length;

      // Find nearby residues
      const nearbyRes = new Set<string>();
      for (const a of atoms) {
        const d = Math.sqrt((cx - a.x) ** 2 + (cy - a.y) ** 2 + (cz - a.z) ** 2);
        if (d < 8) {
          nearbyRes.add(`${a.chain}:${a.resName}${a.resSeq}`);
        }
      }

      const extentX = Math.max(...cluster.map(p => Math.abs(p.x - cx))) * 2 + 6;
      const extentY = Math.max(...cluster.map(p => Math.abs(p.y - cy))) * 2 + 6;
      const extentZ = Math.max(...cluster.map(p => Math.abs(p.z - cz))) * 2 + 6;

      return {
        id: idx + 1,
        center: { x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10, z: Math.round(cz * 10) / 10 },
        size: { x: Math.round(Math.min(extentX, 40)), y: Math.round(Math.min(extentY, 40)), z: Math.round(Math.min(extentZ, 40)) },
        volume: Math.round(cluster.length * gridSpacing ** 3),
        score: Math.min(1, cluster.length / 30),
        residues: Array.from(nearbyRes).slice(0, 12),
      };
    });

  return pockets;
}

export function BindingPocketDetector({ job, setJob }: Props) {
  const [detecting, setDetecting] = useState(false);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [selectedPocket, setSelectedPocket] = useState<number | null>(null);

  const detect = async () => {
    if (!job.proteinData) {
      toast.error("Please load a protein structure first.");
      return;
    }
    setDetecting(true);
    setPockets([]);
    setSelectedPocket(null);

    // Simulate computation time
    await new Promise(r => setTimeout(r, 1200));

    const detected = detectPocketsFromPDB(job.proteinData);
    setPockets(detected);
    setDetecting(false);

    if (detected.length > 0) {
      toast.success(`Detected ${detected.length} potential binding pocket(s)`);
    } else {
      toast.info("No significant pockets detected. Try blind docking.");
    }
  };

  const applyPocket = (pocket: Pocket) => {
    setSelectedPocket(pocket.id);
    setJob(j => ({
      ...j,
      gridCenter: pocket.center,
      gridSize: pocket.size,
    }));
    toast.success(`Grid box set to Pocket ${pocket.id}: center (${pocket.center.x}, ${pocket.center.y}, ${pocket.center.z})`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Binding Pocket Detection
        </CardTitle>
        <CardDescription>
          Automatically detect potential binding pockets in the loaded protein structure using geometric cavity analysis. Detected pockets can be used to set grid box parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> How it works
          </p>
          <p>Uses a grid-based geometric analysis to identify solvent-accessible cavities in the protein structure. Points inside the protein surface that are surrounded by atoms but not buried are clustered into potential binding pockets.</p>
          <p className="mt-1"><strong>Reference:</strong> Hendlich, M. et al. (1997). LIGSITE. Protein Engineering, 10(1), 39–46.</p>
        </div>

        <Button
          className="w-full gap-2"
          onClick={detect}
          disabled={detecting || !job.proteinData}
        >
          {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
          {detecting ? "Analyzing protein surface..." : "Detect Binding Pockets"}
        </Button>

        {!job.proteinData && (
          <p className="text-sm text-muted-foreground text-center">Load a protein structure first to detect binding pockets.</p>
        )}

        {pockets.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Detected Pockets ({pockets.length})</h4>
            {pockets.map((pocket) => (
              <div
                key={pocket.id}
                className={`p-4 rounded-lg border transition-colors space-y-2 cursor-pointer ${
                  selectedPocket === pocket.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => applyPocket(pocket)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Pocket {pocket.id}</span>
                    {selectedPocket === pocket.id && (
                      <Badge variant="default" className="text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Selected
                      </Badge>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-[10px]">
                        Score: {(pocket.score * 100).toFixed(0)}%
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Higher score = larger, more defined cavity</p></TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Center:</span>{" "}
                    ({pocket.center.x}, {pocket.center.y}, {pocket.center.z}) Å
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Size:</span>{" "}
                    {pocket.size.x}×{pocket.size.y}×{pocket.size.z} Å
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Volume:</span> ~{pocket.volume} ų
                  </div>
                </div>

                {pocket.residues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pocket.residues.slice(0, 8).map((r, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-mono">{r}</Badge>
                    ))}
                    {pocket.residues.length > 8 && (
                      <Badge variant="outline" className="text-[10px]">+{pocket.residues.length - 8} more</Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
