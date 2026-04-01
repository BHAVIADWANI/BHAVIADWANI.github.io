import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Beaker, Target, Dna, Stethoscope, Shield, FileSearch, Wrench, TestTube } from "lucide-react";
import { VirtualLabSimulator } from "@/components/virtual-lab/VirtualLabSimulator";
import { BiochemicalTestSimulator } from "@/components/virtual-lab/BiochemicalTestSimulator";
import { ASTSimulator } from "@/components/virtual-lab/ASTSimulator";
import { MolecularSimulator } from "@/components/virtual-lab/MolecularSimulator";
import { DepartmentCaseSimulator } from "@/components/virtual-lab/DepartmentCaseSimulator";
import { FASTAAnalyzer } from "@/components/molecular/FASTAAnalyzer";
import { ResistanceGeneDetector } from "@/components/molecular/ResistanceGeneDetector";
import { LabInstruments } from "@/components/virtual-lab/LabInstruments";
import BioLabContent from "@/components/biolab/BioLabContent";

export default function MolecularBiology() {
  const [activeTab, setActiveTab] = useState("biolab");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Virtual Microbiology Lab
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Interactive lab simulations from sample collection through identification. Practice Gram staining, biochemical testing, AST, molecular techniques, sequence analysis, and resistance gene detection — all with AI-powered tutoring.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="biolab" className="gap-1.5 text-xs"><TestTube className="h-3.5 w-3.5" /> BioLab 3D</TabsTrigger>
            <TabsTrigger value="lab" className="gap-1.5 text-xs"><FlaskConical className="h-3.5 w-3.5" /> Workflow Sim</TabsTrigger>
            <TabsTrigger value="biochem" className="gap-1.5 text-xs"><Beaker className="h-3.5 w-3.5" /> Biochemical</TabsTrigger>
            <TabsTrigger value="ast" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" /> AST</TabsTrigger>
            <TabsTrigger value="molecular" className="gap-1.5 text-xs"><Dna className="h-3.5 w-3.5" /> Molecular</TabsTrigger>
            <TabsTrigger value="fasta" className="gap-1.5 text-xs"><FileSearch className="h-3.5 w-3.5" /> FASTA / 16S rRNA</TabsTrigger>
            <TabsTrigger value="resistance" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" /> Resistance Genes</TabsTrigger>
            <TabsTrigger value="instruments" className="gap-1.5 text-xs"><Wrench className="h-3.5 w-3.5" /> Lab Instruments</TabsTrigger>
            <TabsTrigger value="cases" className="gap-1.5 text-xs"><Stethoscope className="h-3.5 w-3.5" /> Case Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="biolab"><BioLabContent /></TabsContent>
          <TabsContent value="lab"><VirtualLabSimulator /></TabsContent>
          <TabsContent value="biochem"><BiochemicalTestSimulator /></TabsContent>
          <TabsContent value="ast"><ASTSimulator /></TabsContent>
          <TabsContent value="molecular"><MolecularSimulator /></TabsContent>
          <TabsContent value="fasta"><FASTAAnalyzer /></TabsContent>
          <TabsContent value="resistance"><ResistanceGeneDetector /></TabsContent>
          <TabsContent value="instruments"><LabInstruments /></TabsContent>
          <TabsContent value="cases"><DepartmentCaseSimulator /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
