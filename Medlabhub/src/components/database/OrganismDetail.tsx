import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Dna,
  Shield,
  Activity,
  FlaskConical,
  Download,
} from "lucide-react";
import type { Organism } from "@/lib/organismData";
import { OverviewTab } from "./detail/OverviewTab";
import { MolecularTab } from "./detail/MolecularTab";
import { ResistanceTab } from "./detail/ResistanceTab";
import { ClinicalTab } from "./detail/ClinicalTab";
import { LabTab } from "./detail/LabTab";
import { generateOrganismPdf } from "@/lib/generatePdf";

interface OrganismDetailProps {
  organism: Organism | null;
  open: boolean;
  onClose: () => void;
}

export function OrganismDetail({ organism, open, onClose }: OrganismDetailProps) {
  if (!organism) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl italic">
                {organism.name}
              </SheetTitle>
              <p className="text-muted-foreground mt-1">
                {organism.genus} genus • {organism.gramStain}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateOrganismPdf(organism)}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Badge
                variant={organism.pathogenic ? "destructive" : "secondary"}
                className="shrink-0"
              >
                {organism.pathogenic ? "Pathogenic" : "Commensal"}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="molecular" className="gap-1.5">
              <Dna className="h-4 w-4" />
              <span className="hidden sm:inline">Molecular</span>
            </TabsTrigger>
            <TabsTrigger value="resistance" className="gap-1.5">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">AMR</span>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="gap-1.5">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Clinical</span>
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-1.5">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Lab</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab organism={organism} /></TabsContent>
          <TabsContent value="molecular"><MolecularTab organism={organism} /></TabsContent>
          <TabsContent value="resistance"><ResistanceTab organism={organism} /></TabsContent>
          <TabsContent value="clinical"><ClinicalTab organism={organism} /></TabsContent>
          <TabsContent value="lab"><LabTab organism={organism} /></TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
