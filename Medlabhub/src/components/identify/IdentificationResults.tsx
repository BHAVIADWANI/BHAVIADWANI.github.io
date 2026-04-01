import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Dna,
  Shield,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { identifyOrganisms } from "@/lib/identifyOrganism";
import { generateOrganismPdf } from "@/lib/generatePdf";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmatoryTests } from "./ConfirmatoryTests";

interface IdentificationResultsProps {
  formData: {
    gramStain: string;
    cellShape: string;
    arrangement: string;
    motility: string;
    oxygen: string;
    catalase: string;
    oxidase: string;
    biochemicalTests: string[];
    colonyColor: string;
    hemolysis: string;
  };
  onBack: () => void;
}

export function IdentificationResults({ formData, onBack }: IdentificationResultsProps) {
  const results = useMemo(() => identifyOrganisms(formData), [formData]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = results[selectedIdx];

  if (results.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-warning" />
        <h2 className="text-2xl font-bold">No Matches Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The characteristics you entered did not match any organisms in our database.
          Try adjusting your inputs or adding more biochemical test results.
        </p>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Start Over
        </Button>
      </div>
    );
  }

  const org = selected.organism;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Identification
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateOrganismPdf(org)}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Link to={`/database`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              View in Database
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg">Top Matches</h3>
          {results.map((result, idx) => (
            <Card
              key={result.organism.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedIdx === idx ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedIdx(idx)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold italic truncate">{result.organism.name}</h4>
                    <p className="text-sm text-muted-foreground">{result.organism.gramStain}</p>
                  </div>
                  <Badge
                    variant={result.confidence >= 80 ? "default" : result.confidence >= 50 ? "secondary" : "outline"}
                    className={result.confidence >= 80 ? "bg-success text-success-foreground" : ""}
                  >
                    {result.confidence}%
                  </Badge>
                </div>
                <Progress value={result.confidence} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {result.matchedTraits.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl italic">{org.name}</CardTitle>
                  <CardDescription className="text-base">
                    {org.genus} genus • {org.gramStain} • {selected.confidence}% match
                  </CardDescription>
                </div>
                <Badge variant={org.pathogenic ? "destructive" : "secondary"}>
                  {org.pathogenic ? "Pathogenic" : "Commensal"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Matched traits summary */}
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-success mb-2">Matched Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {selected.matchedTraits.map((t) => (
                    <Badge key={t} variant="outline" className="border-success/30 text-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Morphology
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Shape", org.shape],
                      ["Arrangement", org.arrangement],
                      ["Oxygen", org.oxygen],
                      ["Motility", org.characteristics.motility],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Biochemical
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Catalase", org.characteristics.catalase],
                      ["Oxidase", org.characteristics.oxidase],
                      ...(org.characteristics.hemolysis ? [["Hemolysis", org.characteristics.hemolysis]] : []),
                      ...(org.characteristics.coagulase ? [["Coagulase", org.characteristics.coagulase]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-muted-foreground">{k}</span>
                        <Badge variant={String(v).includes("Positive") ? "default" : "outline"} className="text-xs">
                          {v}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clinical */}
              <div className="space-y-3">
                <h4 className="font-semibold">Clinical Significance</h4>
                <p className="text-sm text-muted-foreground">{org.clinicalSignificance}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    Resistance
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[...org.resistance.intrinsic, ...org.resistance.acquired].map((r) => (
                      <Badge key={r} variant="destructive" className="text-xs">{r}</Badge>
                    ))}
                    {org.resistance.intrinsic.length === 0 && org.resistance.acquired.length === 0 && (
                      <span className="text-sm text-muted-foreground">Generally susceptible</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-success">
                    Treatment
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {org.treatment.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs border-success/30 text-success">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diseases */}
              <div className="space-y-3">
                <h4 className="font-semibold">Associated Diseases</h4>
                <div className="flex flex-wrap gap-1.5">
                  {org.diseases.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                  ))}
                </div>
              </div>

              {/* Molecular */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Dna className="h-4 w-4 text-primary" />
                  Molecular Data
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Genome", org.molecular.genome],
                    ["GC%", org.molecular.gcContent],
                    ["Genes", org.molecular.genes],
                    ...(org.molecular.plasmids ? [["Plasmids", org.molecular.plasmids]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-xs text-muted-foreground">{k}</div>
                      <div className="font-mono text-sm font-medium">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmatory Tests */}
              <ConfirmatoryTests organism={org} matchedTraits={selected.matchedTraits} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
