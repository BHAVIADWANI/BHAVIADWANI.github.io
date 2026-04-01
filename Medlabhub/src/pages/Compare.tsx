import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, Search, X, ArrowRight } from "lucide-react";
import { organismDatabase, type Organism } from "@/lib/organismData";

function OrganismPicker({ label, selected, onSelect, onClear }: {
  label: string;
  selected: Organism | null;
  onSelect: (o: Organism) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = organismDatabase.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClear}><X className="h-4 w-4" /></Button>
          </div>
          <p className="text-lg font-semibold italic">{selected.name}</p>
          <Badge variant={selected.pathogenic ? "destructive" : "secondary"} className="w-fit">
            {selected.pathogenic ? "Pathogenic" : "Commensal"}
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organisms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No organisms found.</p>
            )}
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => onSelect(o)}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <span className="italic font-medium">{o.name}</span>
                <span className="text-muted-foreground ml-2">• {o.gramStain}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="px-4 py-2 text-xs text-muted-foreground border-t">
          {filtered.length} organism{filtered.length !== 1 ? "s" : ""} available
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonRow({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
  const isDifferent = valueA !== valueB;
  return (
    <div className={`grid grid-cols-3 gap-4 p-3 rounded-lg text-sm ${isDifferent ? "bg-accent/10" : ""}`}>
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className={isDifferent ? "font-semibold" : ""}>{valueA}</div>
      <div className={isDifferent ? "font-semibold" : ""}>{valueB}</div>
    </div>
  );
}

const Compare = () => {
  const [organismA, setOrganismA] = useState<Organism | null>(null);
  const [organismB, setOrganismB] = useState<Organism | null>(null);

  const canCompare = organismA && organismB;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organism Comparison</h1>
          <p className="text-muted-foreground">Compare two organisms side-by-side across morphology, resistance, and treatment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <OrganismPicker label="Organism A" selected={organismA} onSelect={setOrganismA} onClear={() => setOrganismA(null)} />
          <OrganismPicker label="Organism B" selected={organismB} onSelect={setOrganismB} onClear={() => setOrganismB(null)} />
        </div>

        {canCompare && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                Comparison Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">Highlighted rows indicate differences between organisms.</p>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-3 gap-4 p-3 text-sm font-semibold border-b mb-2">
                <div>Property</div>
                <div className="italic">{organismA.name}</div>
                <div className="italic">{organismB.name}</div>
              </div>

              <ComparisonRow label="Gram Stain" valueA={organismA.gramStain} valueB={organismB.gramStain} />
              <ComparisonRow label="Shape" valueA={organismA.shape} valueB={organismB.shape} />
              <ComparisonRow label="Arrangement" valueA={organismA.arrangement} valueB={organismB.arrangement} />
              <ComparisonRow label="Oxygen" valueA={organismA.oxygen} valueB={organismB.oxygen} />
              <ComparisonRow label="Catalase" valueA={organismA.characteristics.catalase} valueB={organismB.characteristics.catalase} />
              <ComparisonRow label="Oxidase" valueA={organismA.characteristics.oxidase} valueB={organismB.characteristics.oxidase} />
              <ComparisonRow label="Motility" valueA={organismA.characteristics.motility} valueB={organismB.characteristics.motility} />
              <ComparisonRow label="Hemolysis" valueA={organismA.characteristics.hemolysis || "N/A"} valueB={organismB.characteristics.hemolysis || "N/A"} />
              <ComparisonRow label="Coagulase" valueA={organismA.characteristics.coagulase || "N/A"} valueB={organismB.characteristics.coagulase || "N/A"} />
              <ComparisonRow label="Spore-forming" valueA={organismA.characteristics.sporeForming !== undefined ? (organismA.characteristics.sporeForming ? "Yes" : "No") : "N/A"} valueB={organismB.characteristics.sporeForming !== undefined ? (organismB.characteristics.sporeForming ? "Yes" : "No") : "N/A"} />

              <div className="border-t my-4" />
              <div className="grid grid-cols-3 gap-4 p-3 text-sm font-semibold">
                <div>Resistance</div>
                <div />
                <div />
              </div>
              <ComparisonRow label="Intrinsic" valueA={organismA.resistance.intrinsic.join(", ") || "None"} valueB={organismB.resistance.intrinsic.join(", ") || "None"} />
              <ComparisonRow label="Acquired" valueA={organismA.resistance.acquired.join(", ") || "None"} valueB={organismB.resistance.acquired.join(", ") || "None"} />
              <ComparisonRow label="Mechanism" valueA={organismA.resistance.mechanism} valueB={organismB.resistance.mechanism} />

              <div className="border-t my-4" />
              <div className="grid grid-cols-3 gap-4 p-3 text-sm font-semibold">
                <div>Clinical</div>
                <div />
                <div />
              </div>
              <ComparisonRow label="Diseases" valueA={organismA.diseases.join(", ")} valueB={organismB.diseases.join(", ")} />
              <ComparisonRow label="Treatment" valueA={organismA.treatment.join(", ")} valueB={organismB.treatment.join(", ")} />
              <ComparisonRow label="Habitat" valueA={organismA.habitat} valueB={organismB.habitat} />
            </CardContent>
          </Card>
        )}

        {!canCompare && (
          <div className="text-center py-16 text-muted-foreground">
            <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Select two organisms above to see a detailed comparison.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
