import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, Bug, Swords, OctagonAlert, Pill, ShieldCheck, Stethoscope 
} from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface ClinicalTabProps {
  organism: Organism;
}

export function ClinicalTab({ organism }: ClinicalTabProps) {
  return (
    <div className="space-y-6">
      {/* Incubation Period */}
      {organism.incubationPeriod && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Incubation Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{organism.incubationPeriod}</p>
          </CardContent>
        </Card>
      )}

      {/* Associated Diseases */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Bug className="h-4 w-4 text-primary" />
          Associated Diseases
        </h4>
        <div className="flex flex-wrap gap-2">
          {organism.diseases.map((disease) => (
            <Badge key={disease} variant="secondary">
              {disease}
            </Badge>
          ))}
        </div>
      </div>

      {/* Virulence Factors */}
      {organism.virulenceFactors && organism.virulenceFactors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Swords className="h-4 w-4 text-destructive" />
            Virulence Factors
          </h4>
          <div className="space-y-2">
            {organism.virulenceFactors.map((factor, index) => (
              <div
                key={factor}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complications */}
      {organism.complications && organism.complications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-destructive flex items-center gap-2">
            <OctagonAlert className="h-4 w-4" />
            Complications
          </h4>
          <div className="flex flex-wrap gap-2">
            {organism.complications.map((complication) => (
              <Badge key={complication} variant="outline" className="border-destructive/50 text-destructive">
                {complication}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Treatment */}
      <div className="space-y-3">
        <h4 className="font-semibold text-success flex items-center gap-2">
          <Pill className="h-4 w-4" />
          Recommended Treatment
        </h4>
        <div className="flex flex-wrap gap-2">
          {organism.treatment.map((drug) => (
            <Badge
              key={drug}
              variant="outline"
              className="border-success text-success"
            >
              {drug}
            </Badge>
          ))}
        </div>
      </div>

      {/* Prevention */}
      {organism.prevention && organism.prevention.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Prevention & Prophylaxis
          </h4>
          <div className="space-y-2">
            {organism.prevention.map((measure, index) => (
              <div
                key={measure}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{measure}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Significance */}
      <div className="space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          Clinical Significance
        </h4>
        <p className="text-muted-foreground text-sm">
          {organism.clinicalSignificance}
        </p>
      </div>
    </div>
  );
}
