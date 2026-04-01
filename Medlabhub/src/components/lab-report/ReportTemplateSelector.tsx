import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reportTemplates, ReportTemplate } from "@/lib/labReportTemplates";
import { FileText, Droplets, Beaker, Heart, Pill, Activity, TestTube, Microscope, ClipboardList } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  cbc: Droplets,
  lft: Beaker,
  rft: Activity,
  lipid: Heart,
  glucose: Pill,
  thyroid: Activity,
  urine: TestTube,
  micro: Microscope,
  fullbody: ClipboardList,
};

interface Props {
  onSelect: (template: ReportTemplate) => void;
}

export function ReportTemplateSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportTemplates.map((t) => {
        const Icon = iconMap[t.id] || FileText;
        return (
          <Card
            key={t.id}
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            onClick={() => onSelect(t)}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t.shortName}</h3>
                  <Badge variant="outline" className="text-[10px]">{t.parameters.length} parameters</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
