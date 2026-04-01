import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Circle, Wind } from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface OrganismCardProps {
  organism: Organism;
  onSelect: (organism: Organism) => void;
}

function getGramIcon(gramStain: string) {
  if (gramStain.includes("Positive")) return "🟣";
  if (gramStain.includes("Negative")) return "🔴";
  return "⚪";
}

function getShapeIcon(shape: string) {
  const map: Record<string, string> = {
    Cocci: "⚫", Bacilli: "🔬", Coccobacilli: "💊", Spirilla: "🌀",
    Vibrio: "🌊", Pleomorphic: "🔷", Yeast: "🍄", Filamentous: "🧬",
  };
  return map[shape] || "🦠";
}

export function OrganismCard({ organism, onSelect }: OrganismCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
      onClick={() => onSelect(organism)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg" title={organism.shape}>{getShapeIcon(organism.shape)}</span>
              <h3 className="font-semibold italic text-lg truncate">
                {organism.name}
              </h3>
              <Badge
                variant={organism.pathogenic ? "destructive" : "secondary"}
                className="shrink-0"
              >
                {organism.pathogenic ? "Pathogenic" : "Commensal"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
              <span>{getGramIcon(organism.gramStain)}</span>
              {organism.genus} • {organism.gramStain} • {organism.shape}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs gap-1">
                <Wind className="h-3 w-3" />
                {organism.oxygen}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {organism.characteristics.catalase} Catalase
              </Badge>
              <Badge variant="outline" className="text-xs">
                {organism.characteristics.oxidase} Oxidase
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {organism.clinicalSignificance}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
