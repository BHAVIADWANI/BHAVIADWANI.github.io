import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, RotateCw, Palette, Info, EyeOff, Crosshair } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DockingResult } from "./DockingDashboard";

interface Props {
  proteinData: string | null;
  ligandData: string | null;
  ligandFormat: string;
  result: DockingResult | null;
}

type ProteinStyle = "cartoon" | "stick" | "sphere" | "line" | "surface";

export function Molecule3DViewer({ proteinData, ligandData, ligandFormat, result }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [proteinStyle, setProteinStyle] = useState<ProteinStyle>("cartoon");
  const [showProtein, setShowProtein] = useState(true);
  const [showLigand, setShowLigand] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [atomInfo, setAtomInfo] = useState<string | null>(null);

  const initViewer = async () => {
    if (!containerRef.current) return;

    try {
      const $3Dmol = await import("3dmol");
      containerRef.current.innerHTML = "";

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: "0x1a1a2e",
        antialias: true,
      });

      viewerRef.current = viewer;

      if (proteinData) {
        const format = proteinData.includes("ATOM") || proteinData.includes("HETATM") ? "pdb" : "pdbqt";
        viewer.addModel(proteinData, format);
        applyProteinStyle(viewer, proteinStyle, 0);
      }

      if (ligandData) {
        const fmt = ligandFormat === "mol2" ? "mol2" : ligandFormat === "pdbqt" ? "pdbqt" : "sdf";
        viewer.addModel(ligandData, fmt);
        viewer.setStyle({ model: proteinData ? 1 : 0 }, {
          stick: { colorscheme: "greenCarbon", radius: 0.15 },
        });
      }

      // Add click handler for atom info
      viewer.setClickable({}, true, (atom: any) => {
        if (atom) {
          const info = [
            atom.resn ? `Residue: ${atom.resn}${atom.resi || ""}` : "",
            atom.atom ? `Atom: ${atom.atom}` : "",
            atom.elem ? `Element: ${atom.elem}` : "",
            atom.chain ? `Chain: ${atom.chain}` : "",
            atom.b ? `B-factor: ${atom.b.toFixed(1)}` : "",
            `Position: (${atom.x?.toFixed(1)}, ${atom.y?.toFixed(1)}, ${atom.z?.toFixed(1)})`,
          ].filter(Boolean).join(" | ");
          setAtomInfo(info);

          // Highlight the clicked atom
          viewer.addLabel(atom.resn + (atom.resi || ""), {
            position: { x: atom.x, y: atom.y, z: atom.z },
            backgroundColor: "rgba(0,0,0,0.7)",
            fontColor: "white",
            fontSize: 10,
          });
          viewer.render();
        }
      });

      viewer.zoomTo();
      viewer.render();
    } catch (err) {
      console.error("3Dmol initialization error:", err);
    }
  };

  const applyProteinStyle = (viewer: any, style: ProteinStyle, modelIndex: number) => {
    const styleMap: Record<ProteinStyle, any> = {
      cartoon: { cartoon: { color: "spectrum" } },
      stick: { stick: { colorscheme: "Jmol", radius: 0.1 } },
      sphere: { sphere: { colorscheme: "Jmol", scale: 0.3 } },
      line: { line: { colorscheme: "Jmol" } },
      surface: { cartoon: { color: "spectrum", opacity: 0.5 } },
    };
    viewer.setStyle({ model: modelIndex }, styleMap[style]);
    viewer.render();
  };

  useEffect(() => {
    if (proteinData || ligandData) {
      initViewer();
    }
  }, [proteinData, ligandData]);

  useEffect(() => {
    if (viewerRef.current && proteinData) {
      applyProteinStyle(viewerRef.current, proteinStyle, 0);
    }
  }, [proteinStyle]);

  useEffect(() => {
    if (!viewerRef.current) return;
    if (proteinData) {
      viewerRef.current.setStyle({ model: 0 }, showProtein
        ? { cartoon: { color: "spectrum" } }
        : {}
      );
    }
    if (ligandData) {
      const ligandModel = proteinData ? 1 : 0;
      viewerRef.current.setStyle({ model: ligandModel }, showLigand
        ? { stick: { colorscheme: "greenCarbon", radius: 0.15 } }
        : {}
      );
    }
    viewerRef.current.render();
  }, [showProtein, showLigand]);

  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.removeAllLabels();
      viewerRef.current.zoomTo();
      viewerRef.current.render();
      setAtomInfo(null);
    }
  };

  const hasData = proteinData || ligandData;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              3D Molecular Viewer
            </CardTitle>
            <CardDescription>
              Interactive visualization powered by 3Dmol.js. Rotate: left-click drag. Zoom: scroll. Click atoms for details.
            </CardDescription>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={proteinStyle} onValueChange={(v) => setProteinStyle(v as ProteinStyle)}>
                <SelectTrigger className="w-32">
                  <Palette className="h-3.5 w-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="stick">Stick</SelectItem>
                  <SelectItem value="sphere">Sphere</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={resetView} title="Reset view">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {hasData && (
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <Switch id="show-protein" checked={showProtein} onCheckedChange={setShowProtein} />
                <Label htmlFor="show-protein" className="text-xs">Protein</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="show-ligand" checked={showLigand} onCheckedChange={setShowLigand} />
                <Label htmlFor="show-ligand" className="text-xs">Ligand</Label>
              </div>
            </div>
          )}

          {hasData ? (
            <div
              ref={containerRef}
              className="w-full rounded-lg overflow-hidden border"
              style={{ height: "500px", position: "relative" }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border rounded-lg bg-muted/30" style={{ height: "500px" }}>
              <Eye className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg font-medium">No Molecules Loaded</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload or search for a protein and/or ligand to visualize them in 3D.
              </p>
            </div>
          )}

          {atomInfo && (
            <div className="p-3 rounded-lg border bg-muted/50 text-sm font-mono">
              <span className="text-primary font-semibold">🔬 Atom Info:</span> {atomInfo}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation Panel */}
      {hasData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Viewer Legend & Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {proteinData && (
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-red-500 inline-block" />
                    Protein (Colored Ribbon)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shows the 3D structure of the target protein. The rainbow coloring (spectrum) goes from blue (N-terminus) to red (C-terminus), representing the amino acid sequence order.
                  </p>
                </div>
              )}
              {ligandData && (
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    Ligand (Green Sticks)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The small molecule that binds to the protein. Shown as stick model with green carbon atoms. Other elements: red (O), blue (N), yellow (S).
                  </p>
                </div>
              )}
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <Crosshair className="h-3 w-3 text-primary" />
                  Binding Pocket
                </p>
                <p className="text-xs text-muted-foreground">
                  The cavity in the protein where the ligand fits. Defined by the grid box parameters. Use Pocket Detection to auto-identify this region.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <p className="font-semibold flex items-center gap-2">🖱️ Controls</p>
                <p className="text-xs text-muted-foreground">
                  <strong>Left-click drag:</strong> Rotate. <strong>Scroll:</strong> Zoom. <strong>Right-click drag:</strong> Translate. <strong>Click atom:</strong> View details.
                </p>
              </div>
            </div>
            {result && (
              <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Docking Result Loaded</p>
                <p>Best binding affinity: <strong className="text-primary">{result.bindingEnergy} kcal/mol</strong> ({result.poses.length} poses). The ligand pose shown represents the lowest-energy (best) binding configuration predicted by the scoring function.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
