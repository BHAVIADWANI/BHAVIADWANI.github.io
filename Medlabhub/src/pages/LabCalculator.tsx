import { useState, lazy, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LabIntelligenceHub } from "@/components/lab-calculator/LabIntelligenceHub";
import { FloatingScientificCalc } from "@/components/lab-calculator/FloatingScientificCalc";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

const BasicCalculations = lazy(() => import("@/components/lab-calculator/BasicCalculations").then(m => ({ default: m.BasicCalculations })));
const UnitConverter = lazy(() => import("@/components/lab-calculator/UnitConverter").then(m => ({ default: m.UnitConverter })));
const SolutionPreparation = lazy(() => import("@/components/lab-calculator/SolutionPreparation").then(m => ({ default: m.SolutionPreparation })));
const CultureMediaPrep = lazy(() => import("@/components/lab-calculator/CultureMediaPrep").then(m => ({ default: m.CultureMediaPrep })));
const MolecularBioCalc = lazy(() => import("@/components/lab-calculator/MolecularBioCalc").then(m => ({ default: m.MolecularBioCalc })));
const HematologyCalc = lazy(() => import("@/components/lab-calculator/HematologyCalc").then(m => ({ default: m.HematologyCalc })));
const ClinicalChemCalc = lazy(() => import("@/components/lab-calculator/ClinicalChemCalc").then(m => ({ default: m.ClinicalChemCalc })));
const ChemicalDatabase = lazy(() => import("@/components/lab-calculator/ChemicalDatabase").then(m => ({ default: m.ChemicalDatabase })));
const DataAnalysisTools = lazy(() => import("@/components/lab-calculator/DataAnalysisTools").then(m => ({ default: m.DataAnalysisTools })));

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FlaskConical, ArrowRightLeft, TestTubes, Dna, Droplets, Activity, Database, BarChart3 } from "lucide-react";

const advancedTabs = [
  { value: "basic", label: "Basic", icon: Calculator },
  { value: "units", label: "Units", icon: ArrowRightLeft },
  { value: "solutions", label: "Solutions", icon: TestTubes },
  { value: "media", label: "Media", icon: FlaskConical },
  { value: "molecular", label: "Molecular", icon: Dna },
  { value: "hematology", label: "Hematology", icon: Droplets },
  { value: "chemistry", label: "Chemistry", icon: Activity },
  { value: "chemicals", label: "Chemicals", icon: Database },
  { value: "analysis", label: "Analysis", icon: BarChart3 },
];

export default function LabCalculator() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lab Intelligence</h1>
            <p className="text-muted-foreground text-sm">AI-powered laboratory calculation system — ask anything, get validated results.</p>
          </div>
          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-1.5 shrink-0"
          >
            <Settings2 className="h-4 w-4" />
            {showAdvanced ? "AI Mode" : "Advanced"}
          </Button>
        </div>

        {showAdvanced ? (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {advancedTabs.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs">
                  <t.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <Suspense fallback={<div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>}>
              <TabsContent value="basic"><BasicCalculations /></TabsContent>
              <TabsContent value="units"><UnitConverter /></TabsContent>
              <TabsContent value="solutions"><SolutionPreparation /></TabsContent>
              <TabsContent value="media"><CultureMediaPrep /></TabsContent>
              <TabsContent value="molecular"><MolecularBioCalc /></TabsContent>
              <TabsContent value="hematology"><HematologyCalc /></TabsContent>
              <TabsContent value="chemistry"><ClinicalChemCalc /></TabsContent>
              <TabsContent value="chemicals"><ChemicalDatabase /></TabsContent>
              <TabsContent value="analysis"><DataAnalysisTools /></TabsContent>
            </Suspense>
          </Tabs>
        ) : (
          <LabIntelligenceHub />
        )}
      </main>
      <FloatingScientificCalc />
      <Footer />
    </div>
  );
}
