import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldX, Cog } from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface ResistanceTabProps {
  organism: Organism;
}

export function ResistanceTab({ organism }: ResistanceTabProps) {
  return (
    <div className="space-y-6">
      {organism.resistance.intrinsic.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            Intrinsic Resistance
          </h4>
          <div className="flex flex-wrap gap-2">
            {organism.resistance.intrinsic.map((drug) => (
              <Badge key={drug} variant="secondary">
                {drug}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-destructive flex items-center gap-2">
          <ShieldX className="h-4 w-4" />
          Acquired Resistance
        </h4>
        <div className="flex flex-wrap gap-2">
          {organism.resistance.acquired.length > 0 ? (
            organism.resistance.acquired.map((drug) => (
              <Badge key={drug} variant="destructive">
                {drug}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">Rare</span>
          )}
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cog className="h-4 w-4 text-primary" />
            Resistance Mechanism
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {organism.resistance.mechanism}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
