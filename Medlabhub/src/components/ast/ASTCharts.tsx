import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

interface ASTEntry {
  id: number;
  antibiotic: string;
  result: "S" | "I" | "R";
  mic?: string;
  zone?: string;
}

interface ASTChartsProps {
  entries: ASTEntry[];
  organism: string;
}

const COLORS = {
  S: "hsl(160, 84%, 39%)",
  I: "hsl(38, 92%, 50%)",
  R: "hsl(0, 72%, 51%)",
};

export function ASTCharts({ entries, organism }: ASTChartsProps) {
  if (entries.length === 0) return null;

  const validEntries = entries.filter((e) => e.antibiotic);

  // Bar chart data
  const barData = validEntries.map((e) => ({
    name: e.antibiotic.length > 12 ? e.antibiotic.substring(0, 12) + "…" : e.antibiotic,
    fullName: e.antibiotic,
    S: e.result === "S" ? 1 : 0,
    I: e.result === "I" ? 1 : 0,
    R: e.result === "R" ? 1 : 0,
  }));

  // Pie chart data
  const stats = {
    S: validEntries.filter((e) => e.result === "S").length,
    I: validEntries.filter((e) => e.result === "I").length,
    R: validEntries.filter((e) => e.result === "R").length,
  };
  const pieData = [
    { name: "Susceptible", value: stats.S, color: COLORS.S },
    { name: "Intermediate", value: stats.I, color: COLORS.I },
    { name: "Resistant", value: stats.R, color: COLORS.R },
  ].filter((d) => d.value > 0);

  // Antibiogram heatmap data
  const heatmapData = validEntries.map((e) => ({
    antibiotic: e.antibiotic,
    result: e.result,
    mic: e.mic || "-",
    color: COLORS[e.result],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Graphical Analysis — {organism || "Unknown Organism"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
            <TabsTrigger value="heatmap">Antibiogram</TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Bar dataKey="S" name="Susceptible" fill={COLORS.S} stackId="a" />
                <Bar dataKey="I" name="Intermediate" fill={COLORS.I} stackId="a" />
                <Bar dataKey="R" name="Resistant" fill={COLORS.R} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="pie">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="heatmap">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Antibiogram for <span className="italic font-medium">{organism}</span>
              </p>
              <div className="grid gap-2">
                {heatmapData.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ borderLeftWidth: "4px", borderLeftColor: item.color }}
                  >
                    <span className="text-sm font-medium">{item.antibiotic}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">
                        MIC: {item.mic}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: item.color + "20",
                          color: item.color,
                        }}
                      >
                        {item.result === "S" ? "Susceptible" : item.result === "I" ? "Intermediate" : "Resistant"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
