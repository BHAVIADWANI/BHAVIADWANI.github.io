import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ZAxis, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface ASTEntry {
  antibiotic: string;
  result: "S" | "I" | "R";
  mic?: string;
  zone?: string;
}

interface StrainRecord {
  id: string;
  sample_id: string;
  organism: string;
  ast_organism: string | null;
  ast_results: ASTEntry[];
  created_at: string;
  referring_physician: string | null;
}

interface ComparativeAnalysisProps {
  records: StrainRecord[];
  organism: string;
}

const COLORS = {
  S: "hsl(160, 84%, 39%)",
  I: "hsl(38, 92%, 50%)",
  R: "hsl(0, 72%, 51%)",
};

export function ComparativeAnalysis({ records, organism }: ComparativeAnalysisProps) {
  // Build per-strain resistance rate data
  const strainData = useMemo(() => {
    return records.map((r) => {
      const total = r.ast_results.length;
      const s = r.ast_results.filter((e) => e.result === "S").length;
      const i = r.ast_results.filter((e) => e.result === "I").length;
      const rr = r.ast_results.filter((e) => e.result === "R").length;
      return {
        strainId: r.sample_id,
        S: s,
        I: i,
        R: rr,
        total,
        resistanceRate: total > 0 ? Math.round((rr / total) * 100) : 0,
      };
    });
  }, [records]);

  // Build scatter data: each point = one antibiotic result for one strain
  const scatterData = useMemo(() => {
    const points: { strainId: string; antibiotic: string; zone: number; result: string; color: string }[] = [];
    records.forEach((r) => {
      r.ast_results.forEach((e) => {
        if (e.zone && !isNaN(Number(e.zone))) {
          points.push({
            strainId: r.sample_id,
            antibiotic: e.antibiotic,
            zone: Number(e.zone),
            result: e.result,
            color: COLORS[e.result as keyof typeof COLORS],
          });
        }
      });
    });
    return points;
  }, [records]);

  // Scatter data indexed by numeric values for x-axis
  const scatterIndexed = useMemo(() => {
    const antibiotics = [...new Set(scatterData.map((d) => d.antibiotic))];
    return scatterData.map((d) => ({
      ...d,
      x: antibiotics.indexOf(d.antibiotic),
      y: d.zone,
      antibioticLabel: d.antibiotic,
    }));
  }, [scatterData]);

  const antibioticsForScatter = useMemo(() => [...new Set(scatterData.map((d) => d.antibiotic))], [scatterData]);

  // Aggregate pie: all results across all strains
  const aggregatePie = useMemo(() => {
    let s = 0, i = 0, r = 0;
    records.forEach((rec) => {
      rec.ast_results.forEach((e) => {
        if (e.result === "S") s++;
        else if (e.result === "I") i++;
        else r++;
      });
    });
    return [
      { name: "Susceptible", value: s, color: COLORS.S },
      { name: "Intermediate", value: i, color: COLORS.I },
      { name: "Resistant", value: r, color: COLORS.R },
    ].filter((d) => d.value > 0);
  }, [records]);

  // Per-antibiotic resistance comparison across strains
  const antibioticComparison = useMemo(() => {
    const map: Record<string, { S: number; I: number; R: number }> = {};
    records.forEach((r) => {
      r.ast_results.forEach((e) => {
        if (!e.antibiotic) return;
        if (!map[e.antibiotic]) map[e.antibiotic] = { S: 0, I: 0, R: 0 };
        map[e.antibiotic][e.result]++;
      });
    });
    return Object.entries(map).map(([name, counts]) => ({ name: name.length > 12 ? name.substring(0, 12) + "…" : name, fullName: name, ...counts }));
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">Comparative Analysis</h3>
        <Badge variant="outline" className="italic">{organism}</Badge>
        <Badge variant="secondary">{records.length} strains</Badge>
      </div>

      <Tabs defaultValue="resistance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="resistance">Resistance Comparison</TabsTrigger>
          <TabsTrigger value="antibiotic">Antibiotic Breakdown</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="resistance">
          <Card>
            <CardHeader><CardTitle className="text-base">Resistance Rate by Strain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={strainData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="strainId" angle={-45} textAnchor="end" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Legend />
                  <Bar dataKey="S" name="Susceptible" fill={COLORS.S} stackId="a" />
                  <Bar dataKey="I" name="Intermediate" fill={COLORS.I} stackId="a" />
                  <Bar dataKey="R" name="Resistant" fill={COLORS.R} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="antibiotic">
          <Card>
            <CardHeader><CardTitle className="text-base">Per-Antibiotic Results (All Strains Combined)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={antibioticComparison} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Legend />
                  <Bar dataKey="S" name="Susceptible" fill={COLORS.S} stackId="a" />
                  <Bar dataKey="I" name="Intermediate" fill={COLORS.I} stackId="a" />
                  <Bar dataKey="R" name="Resistant" fill={COLORS.R} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Diameter Scatter Plot (All Strains)</CardTitle>
              <p className="text-xs text-muted-foreground">Each dot = one antibiotic-strain result. Y-axis = zone diameter (mm). Colors: green=S, amber=I, red=R.</p>
            </CardHeader>
            <CardContent>
              {scatterIndexed.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No zone diameter data available. Enter zone measurements for scatter plot.</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      domain={[-0.5, antibioticsForScatter.length - 0.5]}
                      tickFormatter={(val: number) => antibioticsForScatter[val]?.substring(0, 8) || ""}
                      ticks={antibioticsForScatter.map((_, i) => i)}
                      label={{ value: "Antibiotic", position: "bottom", offset: 40, style: { fill: "hsl(var(--muted-foreground))" } }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Zone (mm)", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))" } }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                      formatter={(_: any, __: any, props: any) => []}
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-card border rounded-lg p-2 text-xs shadow-md">
                            <p className="font-medium">{d.antibioticLabel}</p>
                            <p>Strain: {d.strainId}</p>
                            <p>Zone: {d.y} mm</p>
                            <p style={{ color: d.color }}>Result: {d.result}</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={scatterIndexed} isAnimationActive={false}>
                      {scatterIndexed.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader><CardTitle className="text-base">Overall Distribution (All Strains)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={aggregatePie}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {aggregatePie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
