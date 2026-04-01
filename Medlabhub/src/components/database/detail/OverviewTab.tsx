import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, Shapes, FlaskConical, TreePine, Route, Globe, Thermometer, Stethoscope 
} from "lucide-react";
import type { Organism } from "@/lib/organismData";
import { gramStainVisuals, cellShapeVisuals, arrangementVisuals, oxygenVisuals } from "@/lib/microbiologyVisuals";
import { OrganismImageGallery } from "./OrganismImageGallery";

interface OverviewTabProps {
  organism: Organism;
}

export function OverviewTab({ organism }: OverviewTabProps) {
  const gramVisual = gramStainVisuals[organism.gramStain];
  const shapeVisual = cellShapeVisuals[organism.shape];

  return (
    <div className="space-y-6">
      {/* Reference Images */}
      <OrganismImageGallery organismName={organism.name} />

      {/* Taxonomy */}
      {organism.taxonomy && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              🧬 Taxonomy
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Domain:</span> <span className="ml-2 font-medium">{organism.taxonomy.domain}</span></div>
            <div><span className="text-muted-foreground">Phylum:</span> <span className="ml-2 font-medium">{organism.taxonomy.phylum}</span></div>
            <div><span className="text-muted-foreground">Class:</span> <span className="ml-2 font-medium">{organism.taxonomy.class}</span></div>
            <div><span className="text-muted-foreground">Order:</span> <span className="ml-2 font-medium">{organism.taxonomy.order}</span></div>
            <div><span className="text-muted-foreground">Family:</span> <span className="ml-2 font-medium">{organism.taxonomy.family}</span></div>
          </CardContent>
        </Card>
      )}

      {/* Morphology with visual indicators */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shapes className="h-4 w-4 text-primary" />
            🔬 Morphology
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Shape:</span>
            <span className="text-lg">{shapeVisual?.emoji || "🦠"}</span>
            <span className="font-medium">{organism.shape}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Arrangement:</span>
            <span className="ml-2">
              {arrangementVisuals[organism.arrangement]?.emoji || "🔵"}{" "}
              <span className="font-medium">{organism.arrangement}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Gram Stain:</span>
            <div className={`w-4 h-4 rounded-full ${gramVisual?.color || "bg-gray-400"}`} />
            <span className="font-medium">{organism.gramStain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Oxygen:</span>
            <span>{oxygenVisuals[organism.oxygen]?.emoji || "💨"}</span>
            <span className="font-medium">{organism.oxygen}</span>
          </div>
        </CardContent>
      </Card>

      {/* Biochemical Profile */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            ⚗️ Biochemical Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(organism.characteristics).map(([key, value]) => {
            const isPositive = typeof value === "string" && value.includes("Positive");
            const isBoolTrue = typeof value === "boolean" && value;
            return (
              <div key={key} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground capitalize flex items-center gap-1.5">
                  {isPositive || isBoolTrue ? "✅" : typeof value === "boolean" && !value ? "❌" : "🔹"}
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <Badge
                  variant={isPositive ? "default" : "outline"}
                  className="text-xs"
                >
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Habitat & Ecology */}
      <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <TreePine className="h-4 w-4 text-primary" />
          🌍 Habitat & Ecology
        </h4>
        <p className="text-muted-foreground text-sm">{organism.habitat}</p>
      </div>

      {/* Transmission */}
      {organism.transmission && (
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            🔄 Transmission
          </h4>
          <p className="text-muted-foreground text-sm">{organism.transmission}</p>
        </div>
      )}

      {/* Epidemiology */}
      {organism.epidemiology && (
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            📊 Epidemiology
          </h4>
          <p className="text-muted-foreground text-sm">{organism.epidemiology}</p>
        </div>
      )}

      {/* Culture Conditions */}
      {organism.cultureConditions && (
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-primary" />
            🧫 Culture Conditions
          </h4>
          <p className="text-muted-foreground text-sm">{organism.cultureConditions}</p>
        </div>
      )}

      {/* Clinical Significance */}
      <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          🏥 Clinical Significance
        </h4>
        <p className="text-muted-foreground text-sm">{organism.clinicalSignificance}</p>
      </div>
    </div>
  );
}
