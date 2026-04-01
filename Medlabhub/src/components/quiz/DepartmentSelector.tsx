import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departments, type Department } from "@/lib/departmentQuestions";
import { Microscope, FlaskConical, Droplets, HeartPulse, Dna } from "lucide-react";

const departmentIcons: Record<Department, React.ComponentType<{ className?: string }>> = {
  microbiology: Microscope,
  "clinical-chemistry": FlaskConical,
  hematology: HeartPulse,
  "blood-bank": Droplets,
  "molecular-biology": Dna,
};

interface DepartmentSelectorProps {
  selected: Department | null;
  onSelect: (dept: Department) => void;
}

export function DepartmentSelector({ selected, onSelect }: DepartmentSelectorProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {departments.map((dept) => {
        const Icon = departmentIcons[dept.id];
        const isSelected = selected === dept.id;
        return (
          <button key={dept.id} onClick={() => onSelect(dept.id)} className="text-left">
            <Card className={`transition-all cursor-pointer hover:border-primary/50 ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-muted/30"}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{dept.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{dept.description}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
