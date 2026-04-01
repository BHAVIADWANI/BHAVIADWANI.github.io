import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function StatisticsCalc() {
  const [dataStr, setDataStr] = useState("");
  const values = dataStr.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  const n = values.length;
  const mean = n ? values.reduce((a, b) => a + b, 0) / n : 0;
  const variance = n > 1 ? values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const sem = n ? sd / Math.sqrt(n) : 0;
  const sorted = [...values].sort((a, b) => a - b);
  const median = n ? (n % 2 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2) : 0;
  const min = n ? sorted[0] : 0;
  const max = n ? sorted[n - 1] : 0;
  const cv = mean ? ((sd / mean) * 100).toFixed(2) : "0";

  const chartData = values.map((v, i) => ({ index: i + 1, value: v }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Descriptive Statistics</CardTitle>
        <CardDescription>Enter comma-separated values</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Data values (comma-separated)</Label>
          <Input placeholder="e.g., 12.5, 13.2, 11.8, 14.1, 12.9" value={dataStr} onChange={e => setDataStr(e.target.value)} />
        </div>
        {n > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "n", value: n },
                { label: "Mean", value: mean.toFixed(4) },
                { label: "Median", value: median.toFixed(4) },
                { label: "SD", value: sd.toFixed(4) },
                { label: "SEM", value: sem.toFixed(4) },
                { label: "CV%", value: cv },
                { label: "Min", value: min.toFixed(4) },
                { label: "Max", value: max.toFixed(4) },
              ].map(s => (
                <div key={s.label} className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-bold font-mono">{s.value}</p>
                </div>
              ))}
            </div>
            {chartData.length > 1 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TTestCalc() {
  const [data1, setData1] = useState("");
  const [data2, setData2] = useState("");
  const g1 = data1.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  const g2 = data2.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

  let tStat = "", df = "", significant = "";
  if (g1.length > 1 && g2.length > 1) {
    const m1 = g1.reduce((a, b) => a + b, 0) / g1.length;
    const m2 = g2.reduce((a, b) => a + b, 0) / g2.length;
    const v1 = g1.reduce((s, v) => s + (v - m1) ** 2, 0) / (g1.length - 1);
    const v2 = g2.reduce((s, v) => s + (v - m2) ** 2, 0) / (g2.length - 1);
    const se = Math.sqrt(v1 / g1.length + v2 / g2.length);
    if (se > 0) {
      const t = (m1 - m2) / se;
      const d = g1.length + g2.length - 2;
      tStat = t.toFixed(4);
      df = d.toString();
      significant = Math.abs(t) > 2.0 ? "Likely significant (|t| > 2.0)" : "Likely not significant (|t| ≤ 2.0)";
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Two-Sample t-Test (Estimation)</CardTitle>
        <CardDescription>Enter two groups of comma-separated values</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div><Label className="text-xs">Group 1</Label><Input placeholder="12, 14, 13, 15" value={data1} onChange={e => setData1(e.target.value)} /></div>
        <div><Label className="text-xs">Group 2</Label><Input placeholder="10, 11, 12, 13" value={data2} onChange={e => setData2(e.target.value)} /></div>
        {tStat && (
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 space-y-1 text-sm">
            <p>t-statistic: <strong>{tStat}</strong></p>
            <p>Degrees of freedom: <strong>{df}</strong></p>
            <p>{significant}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DataAnalysisTools() {
  return (
    <Tabs defaultValue="stats">
      <TabsList className="mb-4">
        <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
        <TabsTrigger value="ttest" className="text-xs">t-Test</TabsTrigger>
      </TabsList>
      <TabsContent value="stats"><StatisticsCalc /></TabsContent>
      <TabsContent value="ttest"><TTestCalc /></TabsContent>
    </Tabs>
  );
}
