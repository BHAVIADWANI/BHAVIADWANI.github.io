import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Microscope, FlaskConical, Beaker, Activity, Shield, Dna, Droplets, ScanLine } from "lucide-react";
import { labInstruments, type LabInstrument } from "@/lib/labInstrumentsData";
import { InstrumentImage } from "./InstrumentImage";

export function LabInstruments() {
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("Microbiology");

  const departments = Object.keys(labInstruments);
  const allInstruments = departments.flatMap(d => labInstruments[d]);
  const filteredBySearch = search
    ? allInstruments.filter(inst =>
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.department.toLowerCase().includes(search.toLowerCase()) ||
        inst.applications.some(a => a.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  const displayInstruments = filteredBySearch || labInstruments[activeDept] || [];

  const deptIcons: Record<string, React.ReactNode> = {
    "Microbiology": <Microscope className="h-3.5 w-3.5" />,
    "Hematology": <Activity className="h-3.5 w-3.5" />,
    "Clinical Chemistry": <FlaskConical className="h-3.5 w-3.5" />,
    "Molecular Biology": <Dna className="h-3.5 w-3.5" />,
    "Blood Bank": <Droplets className="h-3.5 w-3.5" />,
    "Immunology": <Shield className="h-3.5 w-3.5" />,
    "Histopathology": <ScanLine className="h-3.5 w-3.5" />,
  };

  const totalCount = allInstruments.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Laboratory Instruments Encyclopedia
            <Badge variant="secondary" className="ml-2">{totalCount} Instruments</Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive department-wise instruments with validated principles, parts, manufacturers, and applications.
            Covering {departments.length} departments. Sign in to upload instrument images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search instruments, departments, or applications..."
              className="pl-9"
            />
          </div>

          {!filteredBySearch ? (
            <Tabs value={activeDept} onValueChange={setActiveDept}>
              <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                {departments.map(dept => (
                  <TabsTrigger key={dept} value={dept} className="gap-1.5 text-xs">
                    {deptIcons[dept]} {dept}
                    <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                      {labInstruments[dept].length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {departments.map(dept => (
                <TabsContent key={dept} value={dept}>
                  <InstrumentList instruments={labInstruments[dept]} showDepartment={false} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Found {displayInstruments.length} instrument{displayInstruments.length !== 1 ? 's' : ''} matching "{search}"
              </p>
              <InstrumentList instruments={displayInstruments} showDepartment />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>References:</strong> Bancroft's Theory and Practice of Histological Techniques •
            Tietz Fundamentals of Clinical Chemistry and Molecular Diagnostics •
            Rodak's Hematology: Clinical Principles and Applications •
            Jawetz, Melnick & Adelberg's Medical Microbiology •
            Bailey & Scott's Diagnostic Microbiology •
            AABB Technical Manual •
            Janeway's Immunobiology •
            Molecular Cloning: A Laboratory Manual (Sambrook & Russell) •
            Godkar's Textbook of Medical Laboratory Technology •
            Manufacturer specifications from official documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function InstrumentList({ instruments, showDepartment = false }: { instruments: LabInstrument[]; showDepartment?: boolean }) {
  if (instruments.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No instruments found.</p>;
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {instruments.map((inst, idx) => (
        <AccordionItem key={`${inst.name}-${idx}`} value={`${inst.name}-${idx}`} className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="shrink-0">
                <InstrumentImage instrumentName={inst.name} size="sm" />
              </div>
              <div>
                <span className="font-medium text-sm">{inst.name}</span>
                {showDepartment && (
                  <Badge variant="outline" className="ml-2 text-[10px]">{inst.department}</Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="md:flex gap-4">
              <div className="md:w-56 shrink-0 mb-4 md:mb-0">
                <InstrumentImage instrumentName={inst.name} size="lg" />
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-[10px]">{inst.department}</Badge>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-primary mb-1">Principle / Mechanism of Action</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{inst.principle}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-primary mb-1">Parts & Functions</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1.5 pr-3 font-semibold">Part</th>
                          <th className="text-left py-1.5 font-semibold">Function</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inst.parts.map((p, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-1.5 pr-3 font-medium">{p.part}</td>
                            <td className="py-1.5 text-muted-foreground">{p.function}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-primary mb-1">Manufacturers</h4>
                  <div className="flex flex-wrap gap-1">
                    {inst.manufacturers.map((m, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-primary mb-1">Applications</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {inst.applications.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                {inst.references && inst.references.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-primary mb-1">Key References</h4>
                    <p className="text-xs text-muted-foreground italic">{inst.references.join(" • ")}</p>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
