import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTubes, Thermometer, ClipboardList } from "lucide-react";
import type { Organism } from "@/lib/organismData";

interface LabTabProps {
  organism: Organism;
}

export function LabTab({ organism }: LabTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <TestTubes className="h-4 w-4 text-primary" />
          Laboratory Identification Methods
        </h4>
        <div className="space-y-2">
          {organism.labIdentification.map((method, index) => (
            <div
              key={method}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                {index + 1}
              </div>
              <span className="text-sm">{method}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Culture Conditions */}
      {organism.cultureConditions && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              Culture Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{organism.cultureConditions}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Key Characteristics Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Catalase:</span>
            <span className="ml-2 font-medium">{organism.characteristics.catalase}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Oxidase:</span>
            <span className="ml-2 font-medium">{organism.characteristics.oxidase}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Motility:</span>
            <span className="ml-2 font-medium">{organism.characteristics.motility}</span>
          </div>
          {organism.characteristics.hemolysis && (
            <div>
              <span className="text-muted-foreground">Hemolysis:</span>
              <span className="ml-2 font-medium">{organism.characteristics.hemolysis}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
