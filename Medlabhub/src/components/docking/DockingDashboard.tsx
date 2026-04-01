import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Settings, Play, BarChart3, Eye, BrainCircuit, Search, GraduationCap, Target, Atom, Zap, Wand2 } from "lucide-react";
import { ProteinSearch } from "./ProteinSearch";
import { LigandSearch } from "./LigandSearch";
import { DockingUploadPanel } from "./DockingUploadPanel";
import { DockingParameterPanel } from "./DockingParameterPanel";
import { DockingRunner } from "./DockingRunner";
import { DockingResultsViewer } from "./DockingResultsViewer";
import { Molecule3DViewer } from "./Molecule3DViewer";
import { DockingAIInterpreter } from "./DockingAIInterpreter";
import { DockingTutorial } from "./DockingTutorial";
import { BindingPocketDetector } from "./BindingPocketDetector";
import { SMILESLigandBuilder } from "./SMILESLigandBuilder";
import { InteractionAnalysis } from "./InteractionAnalysis";
import { EasyDockingMode } from "./EasyDockingMode";
import { Badge } from "@/components/ui/badge";

export interface DockingJob {
  proteinData: string | null;
  proteinName: string;
  ligandData: string | null;
  ligandName: string;
  ligandFormat: string;
  gridCenter: { x: number; y: number; z: number };
  gridSize: { x: number; y: number; z: number };
  exhaustiveness: number;
  numModes: number;
}

export interface DockingResult {
  id: string;
  bindingEnergy: number;
  poses: DockingPose[];
  ligandName: string;
  proteinName: string;
  timestamp: string;
  exhaustiveness: number;
  gridCenter: { x: number; y: number; z: number };
  gridSize: { x: number; y: number; z: number };
}

export interface DockingPose {
  rank: number;
  energy: number;
  rmsd_lb: number;
  rmsd_ub: number;
  poseData: string;
}

export function DockingDashboard() {
  const [activeTab, setActiveTab] = useState("easy");
  const [job, setJob] = useState<DockingJob>({
    proteinData: null,
    proteinName: "",
    ligandData: null,
    ligandName: "",
    ligandFormat: "sdf",
    gridCenter: { x: 0, y: 0, z: 0 },
    gridSize: { x: 20, y: 20, z: 20 },
    exhaustiveness: 8,
    numModes: 9,
  });
  const [result, setResult] = useState<DockingResult | null>(null);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="easy" className="gap-1.5 text-xs">
          <Wand2 className="h-3.5 w-3.5" /> Easy Mode
        </TabsTrigger>
        <TabsTrigger value="tutorial" className="gap-1.5 text-xs">
          <GraduationCap className="h-3.5 w-3.5" /> Tutorial
        </TabsTrigger>
        <TabsTrigger value="upload" className="gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" /> Input Molecules
        </TabsTrigger>
        <TabsTrigger value="pdb-search" className="gap-1.5 text-xs">
          <Search className="h-3.5 w-3.5" /> PDB Search
        </TabsTrigger>
        <TabsTrigger value="ligand-search" className="gap-1.5 text-xs">
          <Search className="h-3.5 w-3.5" /> PubChem
        </TabsTrigger>
        <TabsTrigger value="smiles" className="gap-1.5 text-xs">
          <Atom className="h-3.5 w-3.5" /> SMILES Builder
        </TabsTrigger>
        <TabsTrigger value="pockets" className="gap-1.5 text-xs">
          <Target className="h-3.5 w-3.5" /> Pocket Detect
        </TabsTrigger>
        <TabsTrigger value="parameters" className="gap-1.5 text-xs">
          <Settings className="h-3.5 w-3.5" /> Parameters
        </TabsTrigger>
        <TabsTrigger value="run" className="gap-1.5 text-xs">
          <Play className="h-3.5 w-3.5" /> Run Docking
        </TabsTrigger>
        <TabsTrigger value="results" className="gap-1.5 text-xs">
          <BarChart3 className="h-3.5 w-3.5" /> Results
          {result && <Badge variant="secondary" className="ml-1 text-[10px] px-1">{result.bindingEnergy.toFixed(1)}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="interactions" className="gap-1.5 text-xs">
          <Zap className="h-3.5 w-3.5" /> Interactions
        </TabsTrigger>
        <TabsTrigger value="viewer" className="gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" /> 3D Viewer
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-1.5 text-xs">
          <BrainCircuit className="h-3.5 w-3.5" /> AI Interpreter
        </TabsTrigger>
      </TabsList>

      <TabsContent value="easy">
        <EasyDockingMode job={job} setJob={setJob} onResult={(r) => setResult(r)} onSwitchTab={setActiveTab} />
      </TabsContent>
      <TabsContent value="tutorial">
        <DockingTutorial />
      </TabsContent>
      <TabsContent value="upload">
        <DockingUploadPanel job={job} setJob={setJob} />
      </TabsContent>
      <TabsContent value="pdb-search">
        <ProteinSearch onSelect={(data, name) => setJob(j => ({ ...j, proteinData: data, proteinName: name }))} />
      </TabsContent>
      <TabsContent value="ligand-search">
        <LigandSearch onSelect={(data, name, fmt) => setJob(j => ({ ...j, ligandData: data, ligandName: name, ligandFormat: fmt }))} />
      </TabsContent>
      <TabsContent value="smiles">
        <SMILESLigandBuilder onSelect={(data, name, fmt) => setJob(j => ({ ...j, ligandData: data, ligandName: name, ligandFormat: fmt }))} />
      </TabsContent>
      <TabsContent value="pockets">
        <BindingPocketDetector job={job} setJob={setJob} />
      </TabsContent>
      <TabsContent value="parameters">
        <DockingParameterPanel job={job} setJob={setJob} />
      </TabsContent>
      <TabsContent value="run">
        <DockingRunner job={job} onResult={(r) => { setResult(r); setActiveTab("results"); }} />
      </TabsContent>
      <TabsContent value="results">
        <DockingResultsViewer result={result} />
      </TabsContent>
      <TabsContent value="interactions">
        <InteractionAnalysis result={result} />
      </TabsContent>
      <TabsContent value="viewer">
        <Molecule3DViewer proteinData={job.proteinData} ligandData={job.ligandData} ligandFormat={job.ligandFormat} result={result} />
      </TabsContent>
      <TabsContent value="ai">
        <DockingAIInterpreter result={result} />
      </TabsContent>
    </Tabs>
  );
}
