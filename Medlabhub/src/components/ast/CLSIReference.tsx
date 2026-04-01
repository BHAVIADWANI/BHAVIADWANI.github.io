import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FlaskConical, FileText, ShieldCheck } from "lucide-react";
import { clsiGuidelines, getRelevantBreakpoints, type CLSIBreakpoint } from "@/lib/clsiData";

interface CLSIReferenceProps {
  organism: string;
}

const categoryIcons = {
  general: BookOpen,
  testing: FlaskConical,
  reporting: FileText,
  quality: ShieldCheck,
};

function BreakpointTable({ breakpoints }: { breakpoints: CLSIBreakpoint[] }) {
  if (breakpoints.length === 0) return (
    <p className="text-sm text-muted-foreground">No specific CLSI breakpoints available for this organism group.</p>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-3 font-semibold">Antibiotic</th>
            <th className="text-center py-2 px-2 font-semibold text-success">S</th>
            <th className="text-center py-2 px-2 font-semibold text-warning">I</th>
            <th className="text-center py-2 px-2 font-semibold text-destructive">R</th>
            <th className="text-left py-2 pl-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {breakpoints.map((bp, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-1.5 pr-3 font-medium">{bp.antibiotic}</td>
              <td className="text-center py-1.5 px-2 font-mono text-success">{bp.susceptible}</td>
              <td className="text-center py-1.5 px-2 font-mono text-warning">{bp.intermediate}</td>
              <td className="text-center py-1.5 px-2 font-mono text-destructive">{bp.resistant}</td>
              <td className="py-1.5 pl-2 text-muted-foreground">{bp.notes || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CLSIReference({ organism }: CLSIReferenceProps) {
  const breakpoints = getRelevantBreakpoints(organism);
  const grouped = {
    general: clsiGuidelines.filter((g) => g.category === "general"),
    testing: clsiGuidelines.filter((g) => g.category === "testing"),
    reporting: clsiGuidelines.filter((g) => g.category === "reporting"),
    quality: clsiGuidelines.filter((g) => g.category === "quality"),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            CLSI Breakpoints — {organism || "Select Organism"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Based on CLSI M100 Performance Standards (MIC in µg/mL)
          </p>
        </CardHeader>
        <CardContent>
          <BreakpointTable breakpoints={breakpoints} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            CLSI Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {(Object.entries(grouped) as [keyof typeof grouped, typeof clsiGuidelines][]).map(
              ([category, guidelines]) => {
                const Icon = categoryIcons[category];
                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-sm capitalize">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category} ({guidelines.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {guidelines.map((g, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-sm font-medium">{g.title}</p>
                            <p className="text-xs text-muted-foreground">{g.content}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
