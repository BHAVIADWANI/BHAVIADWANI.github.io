import { useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Shield, TrendingUp, FileSpreadsheet, FileText, File } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface ASTEntry {
  antibiotic: string;
  result: "S" | "I" | "R";
  mic?: string;
  zone?: string;
}

interface SavedRecord {
  id: string;
  sample_id: string;
  organism: string;
  ast_organism: string | null;
  ast_results: ASTEntry[];
  created_at: string;
  referring_physician: string | null;
  sample_type: string;
  notes: string | null;
}

const COLORS = {
  S: "hsl(160, 84%, 39%)",
  I: "hsl(38, 92%, 50%)",
  R: "hsl(0, 72%, 51%)",
};

export function ASTAdvancedAnalytics({ records }: { records: SavedRecord[] }) {
  // ═══ 1. ANTIBIOGRAM ═══
  const antibiogram = useMemo(() => {
    if (records.length === 0) return { organisms: [], antibiotics: [], matrix: {} as any };
    const organisms = [...new Set(records.map(r => r.ast_organism || r.organism))];
    const allAntibiotics = [...new Set(records.flatMap(r => r.ast_results.map(e => e.antibiotic)).filter(Boolean))];
    
    const matrix: Record<string, Record<string, { s: number; i: number; r: number; total: number }>> = {};
    organisms.forEach(org => {
      matrix[org] = {};
      allAntibiotics.forEach(ab => { matrix[org][ab] = { s: 0, i: 0, r: 0, total: 0 }; });
    });
    
    records.forEach(r => {
      const org = r.ast_organism || r.organism;
      r.ast_results.forEach(e => {
        if (!e.antibiotic || !matrix[org]?.[e.antibiotic]) return;
        matrix[org][e.antibiotic][e.result.toLowerCase() as "s" | "i" | "r"]++;
        matrix[org][e.antibiotic].total++;
      });
    });
    return { organisms, antibiotics: allAntibiotics, matrix };
  }, [records]);

  // ═══ 2. RESISTANCE PERCENTAGES ═══
  const resistancePercentages = useMemo(() => {
    const map: Record<string, { s: number; i: number; r: number; total: number }> = {};
    records.forEach(r => {
      r.ast_results.forEach(e => {
        if (!e.antibiotic) return;
        if (!map[e.antibiotic]) map[e.antibiotic] = { s: 0, i: 0, r: 0, total: 0 };
        map[e.antibiotic][e.result.toLowerCase() as "s" | "i" | "r"]++;
        map[e.antibiotic].total++;
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({
        name: name.length > 14 ? name.substring(0, 14) + "…" : name,
        fullName: name,
        "Susceptible %": d.total > 0 ? Math.round((d.s / d.total) * 100) : 0,
        "Intermediate %": d.total > 0 ? Math.round((d.i / d.total) * 100) : 0,
        "Resistant %": d.total > 0 ? Math.round((d.r / d.total) * 100) : 0,
        total: d.total,
      }))
      .sort((a, b) => b["Resistant %"] - a["Resistant %"]);
  }, [records]);

  // ═══ 3. MDR DETECTION ═══
  const mdrAnalysis = useMemo(() => {
    // MDR: resistant to ≥1 agent in ≥3 antimicrobial categories (CLSI/EUCAST)
    const antibioticCategories: Record<string, string> = {
      "Penicillin": "Penicillins", "Ampicillin": "Penicillins", "Oxacillin": "Penicillins",
      "Amoxicillin-Clavulanate": "β-lactam combinations", "Piperacillin-Tazobactam": "β-lactam combinations", "Ampicillin-Sulbactam": "β-lactam combinations",
      "Ceftriaxone": "Cephalosporins", "Cefotaxime": "Cephalosporins", "Ceftazidime": "Cephalosporins", "Cefepime": "Cephalosporins", "Cefoxitin": "Cephalosporins",
      "Meropenem": "Carbapenems", "Imipenem": "Carbapenems", "Ertapenem": "Carbapenems",
      "Gentamicin": "Aminoglycosides", "Amikacin": "Aminoglycosides", "Tobramycin": "Aminoglycosides",
      "Ciprofloxacin": "Fluoroquinolones", "Levofloxacin": "Fluoroquinolones", "Moxifloxacin": "Fluoroquinolones",
      "Vancomycin": "Glycopeptides", "Linezolid": "Oxazolidinones", "Daptomycin": "Lipopeptides",
      "Trimethoprim-Sulfamethoxazole": "Folate pathway inhibitors",
      "Clindamycin": "Lincosamides", "Erythromycin": "Macrolides", "Azithromycin": "Macrolides",
      "Tetracycline": "Tetracyclines", "Doxycycline": "Tetracyclines", "Tigecycline": "Glycylcyclines",
      "Colistin": "Polymyxins", "Nitrofurantoin": "Nitrofurans", "Fosfomycin": "Phosphonic acids",
      "Rifampin": "Ansamycins",
      "Ceftazidime-Avibactam": "Cephalosporin-BLI", "Ceftolozane-Tazobactam": "Cephalosporin-BLI", "Cefiderocol": "Siderophore cephalosporins",
    };

    return records.map(r => {
      const org = r.ast_organism || r.organism;
      const resistantCategories = new Set<string>();
      const resistantDrugs: string[] = [];
      r.ast_results.forEach(e => {
        if (e.result === "R" && e.antibiotic) {
          const cat = antibioticCategories[e.antibiotic] || "Other";
          resistantCategories.add(cat);
          resistantDrugs.push(e.antibiotic);
        }
      });
      const categoryCount = resistantCategories.size;
      let classification = "Non-MDR";
      if (categoryCount >= 3) classification = "MDR";
      if (categoryCount >= 5) classification = "XDR";
      if (r.ast_results.length > 0 && r.ast_results.every(e => e.result === "R")) classification = "PDR";
      
      return {
        strainId: r.sample_id,
        organism: org,
        classification,
        categoryCount,
        categories: [...resistantCategories],
        resistantDrugs,
        totalTested: r.ast_results.length,
        date: r.created_at,
      };
    });
  }, [records]);

  // ═══ 4. RESISTANCE TRENDS OVER TIME ═══
  const trendData = useMemo(() => {
    const byMonth: Record<string, { s: number; i: number; r: number; total: number }> = {};
    records.forEach(r => {
      const month = r.created_at.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { s: 0, i: 0, r: 0, total: 0 };
      r.ast_results.forEach(e => {
        byMonth[month][e.result.toLowerCase() as "s" | "i" | "r"]++;
        byMonth[month].total++;
      });
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month,
        "Resistance Rate": d.total > 0 ? Math.round((d.r / d.total) * 100) : 0,
        "Susceptibility Rate": d.total > 0 ? Math.round((d.s / d.total) * 100) : 0,
        "Intermediate Rate": d.total > 0 ? Math.round((d.i / d.total) * 100) : 0,
        tests: d.total,
      }));
  }, [records]);

  // ═══ 5. ANTIBIOTIC EFFECTIVENESS RANKING ═══
  const effectivenessRanking = useMemo(() => {
    return [...resistancePercentages]
      .sort((a, b) => b["Susceptible %"] - a["Susceptible %"])
      .slice(0, 15);
  }, [resistancePercentages]);

  // ═══ 6. RADAR CHART DATA ═══
  const radarData = useMemo(() => {
    return resistancePercentages.slice(0, 8).map(d => ({
      antibiotic: d.name,
      resistance: d["Resistant %"],
      susceptibility: d["Susceptible %"],
    }));
  }, [resistancePercentages]);

  // ═══ 7. SCATTER DATA ═══
  const scatterData = useMemo(() => {
    const points: { antibiotic: string; zone: number; result: string; color: string; strain: string; x: number }[] = [];
    const allAb = [...new Set(records.flatMap(r => r.ast_results.filter(e => e.zone).map(e => e.antibiotic)))];
    records.forEach(r => {
      r.ast_results.forEach(e => {
        if (e.zone && !isNaN(Number(e.zone))) {
          points.push({
            antibiotic: e.antibiotic,
            zone: Number(e.zone),
            result: e.result,
            color: COLORS[e.result],
            strain: r.sample_id,
            x: allAb.indexOf(e.antibiotic),
          });
        }
      });
    });
    return { points, antibiotics: allAb };
  }, [records]);

  // ═══ HEATMAP COLOR ═══
  const getHeatColor = (pct: number) => {
    if (pct >= 80) return "bg-destructive/80 text-destructive-foreground";
    if (pct >= 50) return "bg-destructive/40 text-foreground";
    if (pct >= 30) return "bg-warning/50 text-foreground";
    if (pct >= 10) return "bg-warning/20 text-foreground";
    return "bg-success/20 text-foreground";
  };

  // ═══ EXPORT FUNCTIONS ═══
  const exportCSV = () => {
    const rows: string[][] = [["Antibiotic", "Susceptible %", "Intermediate %", "Resistant %", "Total Tests"]];
    resistancePercentages.forEach(d => {
      rows.push([d.fullName, String(d["Susceptible %"]), String(d["Intermediate %"]), String(d["Resistant %"]), String(d.total)]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `AST_Analysis_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Resistance %
    const ws1 = XLSX.utils.json_to_sheet(resistancePercentages.map(d => ({
      Antibiotic: d.fullName, "Susceptible %": d["Susceptible %"], "Intermediate %": d["Intermediate %"], "Resistant %": d["Resistant %"], "Total Tests": d.total,
    })));
    XLSX.utils.book_append_sheet(wb, ws1, "Resistance Percentages");

    // Sheet 2: MDR
    const ws2 = XLSX.utils.json_to_sheet(mdrAnalysis.map(d => ({
      "Strain ID": d.strainId, Organism: d.organism, Classification: d.classification, "Resistant Categories": d.categoryCount,
      "Categories": d.categories.join("; "), "Resistant Drugs": d.resistantDrugs.join("; "), "Total Tested": d.totalTested, Date: new Date(d.date).toLocaleDateString(),
    })));
    XLSX.utils.book_append_sheet(wb, ws2, "MDR Analysis");

    // Sheet 3: Antibiogram
    const abRows: Record<string, any>[] = [];
    antibiogram.organisms.forEach(org => {
      const row: Record<string, any> = { Organism: org };
      antibiogram.antibiotics.forEach(ab => {
        const d = antibiogram.matrix[org][ab];
        row[ab] = d.total > 0 ? `${Math.round((d.r / d.total) * 100)}% R` : "-";
      });
      abRows.push(row);
    });
    const ws3 = XLSX.utils.json_to_sheet(abRows);
    XLSX.utils.book_append_sheet(wb, ws3, "Antibiogram");

    // Sheet 4: Trends
    if (trendData.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, ws4, "Trends");
    }

    XLSX.writeFile(wb, `AST_Advanced_Analysis_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel exported with antibiogram, MDR, and trends");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 15;
    const addText = (text: string, size = 10, bold = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 180);
      if (y + lines.length * (size * 0.5) > 280) { doc.addPage(); y = 20; }
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.45) + 3;
    };

    addText("AST Advanced Analysis Report", 16, true);
    addText(`Generated: ${new Date().toLocaleString()} • Records: ${records.length}`, 9);
    y += 5;

    // Resistance Percentages
    addText("Antibiotic Resistance Percentages", 13, true);
    resistancePercentages.forEach(d => {
      addText(`${d.fullName}: S=${d["Susceptible %"]}% I=${d["Intermediate %"]}% R=${d["Resistant %"]}% (n=${d.total})`);
    });
    y += 5;

    // MDR Summary
    addText("Multidrug Resistance Analysis", 13, true);
    const mdrCount = mdrAnalysis.filter(d => d.classification === "MDR").length;
    const xdrCount = mdrAnalysis.filter(d => d.classification === "XDR").length;
    const pdrCount = mdrAnalysis.filter(d => d.classification === "PDR").length;
    addText(`MDR: ${mdrCount} isolates | XDR: ${xdrCount} isolates | PDR: ${pdrCount} isolates`);
    mdrAnalysis.filter(d => d.classification !== "Non-MDR").forEach(d => {
      addText(`  ${d.strainId} (${d.organism}): ${d.classification} — R to ${d.categoryCount} categories: ${d.categories.join(", ")}`);
    });
    y += 5;

    // Effectiveness ranking
    addText("Antibiotic Effectiveness Ranking (by susceptibility)", 13, true);
    effectivenessRanking.forEach((d, i) => {
      addText(`${i + 1}. ${d.fullName}: ${d["Susceptible %"]}% susceptible`);
    });

    doc.setFontSize(7);
    doc.text("Generated by MicroID — CLSI M100 & EUCAST Standards", margin, 290);
    doc.save(`AST_Analysis_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF report exported");
  };

  const mdrCount = mdrAnalysis.filter(d => d.classification !== "Non-MDR").length;

  if (records.length === 0) return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        No AST records available for analysis. Save some AST data first.
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Advanced AST Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Based on {records.length} records • CLSI M100 & EUCAST interpretation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5"><FileText className="h-3.5 w-3.5" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5"><File className="h-3.5 w-3.5" /> PDF</Button>
        </div>
      </div>

      <Tabs defaultValue="antibiogram" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="antibiogram" className="text-xs">Antibiogram</TabsTrigger>
          <TabsTrigger value="resistance" className="text-xs">Resistance %</TabsTrigger>
          <TabsTrigger value="mdr" className="text-xs">MDR Detection {mdrCount > 0 && <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">{mdrCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
          <TabsTrigger value="effectiveness" className="text-xs">Effectiveness</TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs">Heatmap</TabsTrigger>
          <TabsTrigger value="scatter" className="text-xs">Scatter</TabsTrigger>
        </TabsList>

        {/* ANTIBIOGRAM */}
        <TabsContent value="antibiogram">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cumulative Antibiogram</CardTitle>
              <CardDescription>Resistance rate (%) per organism-antibiotic combination. Based on CLSI M39 guidelines for antibiogram construction.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 font-semibold sticky left-0 bg-card z-10">Organism</th>
                      {antibiogram.antibiotics.map(ab => (
                        <th key={ab} className="text-center py-2 px-1 font-semibold" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", minWidth: 30 }}>
                          {ab.length > 12 ? ab.substring(0, 10) + "…" : ab}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {antibiogram.organisms.map(org => (
                      <tr key={org} className="border-b border-border/50">
                        <td className="py-1.5 pr-3 font-medium italic sticky left-0 bg-card z-10">{org}</td>
                        {antibiogram.antibiotics.map(ab => {
                          const d = antibiogram.matrix[org][ab];
                          if (d.total === 0) return <td key={ab} className="text-center py-1.5 px-1 text-muted-foreground">-</td>;
                          const rPct = Math.round((d.r / d.total) * 100);
                          const sPct = Math.round((d.s / d.total) * 100);
                          return (
                            <td key={ab} className={`text-center py-1.5 px-1 font-mono ${getHeatColor(rPct)}`} title={`S:${sPct}% I:${Math.round((d.i / d.total) * 100)}% R:${rPct}% (n=${d.total})`}>
                              {sPct}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Values = % susceptible. Colors: green (≥90% S), yellow (50-90% S), red (&lt;50% S). Hover for details. Ref: CLSI M39-A4</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESISTANCE PERCENTAGES */}
        <TabsContent value="resistance">
          <Card>
            <CardHeader><CardTitle className="text-base">Resistance Percentages by Antibiotic</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={resistancePercentages} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} label={{ value: "%", position: "insideLeft" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Legend />
                  <Bar dataKey="Susceptible %" fill={COLORS.S} stackId="a" />
                  <Bar dataKey="Intermediate %" fill={COLORS.I} stackId="a" />
                  <Bar dataKey="Resistant %" fill={COLORS.R} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MDR DETECTION */}
        <TabsContent value="mdr">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                { label: "Non-MDR", count: mdrAnalysis.filter(d => d.classification === "Non-MDR").length, color: "bg-success/20 text-success" },
                { label: "MDR", count: mdrAnalysis.filter(d => d.classification === "MDR").length, color: "bg-warning/20 text-warning" },
                { label: "XDR", count: mdrAnalysis.filter(d => d.classification === "XDR").length, color: "bg-destructive/30 text-destructive" },
                { label: "PDR", count: mdrAnalysis.filter(d => d.classification === "PDR").length, color: "bg-destructive/50 text-destructive" },
              ].map(d => (
                <Card key={d.label} className={d.color}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{d.count}</p>
                    <p className="text-sm font-medium">{d.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Multidrug Resistance Classification
                </CardTitle>
                <CardDescription>MDR: resistant to ≥1 agent in ≥3 categories. XDR: ≥5 categories. PDR: all agents resistant. Per Magiorakos et al. (CMI 2012) & CLSI/EUCAST.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mdrAnalysis.map(d => (
                    <div key={d.strainId} className={`p-3 rounded-lg border flex items-center justify-between flex-wrap gap-2 ${
                      d.classification === "PDR" ? "border-destructive bg-destructive/5" :
                      d.classification === "XDR" ? "border-destructive/50 bg-destructive/5" :
                      d.classification === "MDR" ? "border-warning bg-warning/5" : ""
                    }`}>
                      <div>
                        <span className="font-mono text-sm font-medium">{d.strainId}</span>
                        <span className="text-sm italic text-muted-foreground ml-2">{d.organism}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={d.classification !== "Non-MDR" ? "destructive" : "secondary"}>
                          {d.classification}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{d.categoryCount} categories</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TRENDS */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resistance Trends Over Time</CardTitle>
              <CardDescription>Monthly resistance rate tracking per CLSI M39 guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length < 2 ? (
                <p className="text-center text-muted-foreground py-8">Need data from at least 2 different months to show trends.</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} label={{ value: "%", position: "insideLeft" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Resistance Rate" stroke={COLORS.R} strokeWidth={2} dot />
                    <Line type="monotone" dataKey="Susceptibility Rate" stroke={COLORS.S} strokeWidth={2} dot />
                    <Line type="monotone" dataKey="Intermediate Rate" stroke={COLORS.I} strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EFFECTIVENESS RANKING */}
        <TabsContent value="effectiveness">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /> Effectiveness Ranking</CardTitle>
                <CardDescription>Antibiotics ranked by susceptibility rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {effectivenessRanking.map((d, i) => (
                    <div key={d.fullName} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{d.fullName}</span>
                          <span className="font-mono text-success">{d["Susceptible %"]}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                          <div className="h-full bg-success rounded-full transition-all" style={{ width: `${d["Susceptible %"]}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Radar: Resistance Profile</CardTitle></CardHeader>
              <CardContent>
                {radarData.length > 2 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="antibiotic" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Resistance %" dataKey="resistance" stroke={COLORS.R} fill={COLORS.R} fillOpacity={0.3} />
                      <Radar name="Susceptibility %" dataKey="susceptibility" stroke={COLORS.S} fill={COLORS.S} fillOpacity={0.2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Need ≥3 antibiotics for radar chart.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HEATMAP */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resistance Heatmap</CardTitle>
              <CardDescription>Color-coded resistance percentages. Red = high resistance, green = high susceptibility.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 font-semibold sticky left-0 bg-card z-10">Antibiotic</th>
                      <th className="text-center px-3 font-semibold">S %</th>
                      <th className="text-center px-3 font-semibold">I %</th>
                      <th className="text-center px-3 font-semibold">R %</th>
                      <th className="text-center px-3 font-semibold">n</th>
                      <th className="text-left px-3 font-semibold">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resistancePercentages.map(d => (
                      <tr key={d.fullName} className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium sticky left-0 bg-card z-10">{d.fullName}</td>
                        <td className="text-center py-2 px-3 font-mono text-success">{d["Susceptible %"]}</td>
                        <td className="text-center py-2 px-3 font-mono text-warning">{d["Intermediate %"]}</td>
                        <td className={`text-center py-2 px-3 font-mono font-bold ${getHeatColor(d["Resistant %"])}`}>{d["Resistant %"]}</td>
                        <td className="text-center py-2 px-3 text-muted-foreground">{d.total}</td>
                        <td className="py-2 px-3">
                          <div className="h-3 rounded-full overflow-hidden flex bg-muted w-24">
                            <div className="bg-success" style={{ width: `${d["Susceptible %"]}%` }} />
                            <div className="bg-warning" style={{ width: `${d["Intermediate %"]}%` }} />
                            <div className="bg-destructive" style={{ width: `${d["Resistant %"]}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCATTER */}
        <TabsContent value="scatter">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Diameter Scatter Graph</CardTitle>
              <CardDescription>Each point = one antibiotic result. Green = Susceptible, Amber = Intermediate, Red = Resistant.</CardDescription>
            </CardHeader>
            <CardContent>
              {scatterData.points.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No zone diameter data available. Enter zone measurements for scatter plot.</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      domain={[-0.5, scatterData.antibiotics.length - 0.5]}
                      tickFormatter={(val: number) => scatterData.antibiotics[val]?.substring(0, 8) || ""}
                      ticks={scatterData.antibiotics.map((_, i) => i)}
                    />
                    <YAxis type="number" dataKey="zone" tick={{ fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Zone (mm)", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))" } }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border rounded-lg p-2 text-xs shadow-md">
                          <p className="font-medium">{d.antibiotic}</p>
                          <p>Strain: {d.strain}</p>
                          <p>Zone: {d.zone} mm</p>
                          <p style={{ color: d.color }}>Result: {d.result}</p>
                        </div>
                      );
                    }} />
                    <Scatter data={scatterData.points} isAnimationActive={false}>
                      {scatterData.points.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">
            <strong>References:</strong> CLSI M100-Ed34 (2024) Performance Standards for AST • CLSI M39-A4 Analysis and Presentation of Cumulative AST Data • 
            EUCAST Breakpoint Tables v14.0 (2024) • Magiorakos AP et al. "MDR, XDR, PDR bacteria" Clin Microbiol Infect 2012;18:268-281 • 
            WHO Global AMR Surveillance System (GLASS) • CDC Antibiotic Resistance Threats Report
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
