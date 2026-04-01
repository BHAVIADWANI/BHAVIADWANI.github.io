import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, LineChart, Line, ScatterChart, Scatter, ZAxis,
} from "recharts";
import {
  BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, Search,
  Download, Filter, RefreshCw, Microscope, FlaskConical, Droplets, Dna,
  ShieldAlert, Network,
} from "lucide-react";
import { organismDatabase } from "@/lib/organismData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--destructive))", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6", "#e11d48",
  "#a855f7", "#0ea5e9", "#22c55e",
];

interface LabRecord {
  id: string;
  organism: string;
  sample_type: string;
  gram_stain: string | null;
  created_at: string;
  confidence: number;
  ast_results: any[];
  resistance_profile: any[];
  morphology: string | null;
  oxygen_requirement: string | null;
}

type DepartmentFilter = "all" | "microbiology" | "molecular" | "chemistry" | "hematology" | "immunology" | "bloodbank" | "pathology";

function useOrganismStats(organismFilter: string, departmentFilter: DepartmentFilter) {
  return useMemo(() => {
    let filtered = organismDatabase;
    if (organismFilter) {
      filtered = filtered.filter(o =>
        o.name.toLowerCase().includes(organismFilter.toLowerCase()) ||
        o.genus.toLowerCase().includes(organismFilter.toLowerCase())
      );
    }

    const gramDist = filtered.reduce((acc, org) => {
      const key = org.gramStain || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const shapeDist = filtered.reduce((acc, org) => {
      acc[org.shape] = (acc[org.shape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oxygenDist = filtered.reduce((acc, org) => {
      acc[org.oxygen] = (acc[org.oxygen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pathogenicity = [
      { name: "Pathogenic", value: filtered.filter(o => o.pathogenic).length },
      { name: "Commensal/Non-pathogenic", value: filtered.filter(o => !o.pathogenic).length },
    ];

    const sampleTypes = filtered.reduce((acc, org) => {
      const habitat = org.habitat || "Unknown";
      const mappings: Record<string, string[]> = {
        "Skin": ["Wound", "Skin swab"], "Respiratory tract": ["Sputum", "BAL"],
        "GI tract": ["Stool", "Rectal swab"], "Urogenital tract": ["Urine", "Genital swab"],
        "Blood": ["Blood culture"], "Oral cavity": ["Throat swab"],
        "Nasopharynx": ["Nasopharyngeal swab"], "Soil": ["Environmental"], "Water": ["Environmental"],
      };
      const matched = Object.entries(mappings).find(([key]) => habitat.toLowerCase().includes(key.toLowerCase()));
      const types = matched ? matched[1] : [habitat.split(",")[0].trim()];
      for (const st of types) acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resistanceCategories = filtered.reduce((acc, org) => {
      const total = org.resistance.intrinsic.length + org.resistance.acquired.length;
      if (total === 0) acc["Susceptible"] = (acc["Susceptible"] || 0) + 1;
      else if (total <= 2) acc["1-2 Resistances"] = (acc["1-2 Resistances"] || 0) + 1;
      else if (total <= 4) acc["3-4 Resistances"] = (acc["3-4 Resistances"] || 0) + 1;
      else acc["≥5 (MDR potential)"] = (acc["≥5 (MDR potential)"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const antibioticResistance: Record<string, number> = {};
    filtered.forEach(org => {
      [...org.resistance.intrinsic, ...org.resistance.acquired].forEach(r => {
        const key = r.length > 25 ? r.substring(0, 25) + "…" : r;
        antibioticResistance[key] = (antibioticResistance[key] || 0) + 1;
      });
    });

    // Heatmap data: top organisms × top antibiotics
    const topOrganisms = filtered.slice(0, 12);
    const allAntibiotics = new Set<string>();
    topOrganisms.forEach(org => {
      [...org.resistance.intrinsic, ...org.resistance.acquired].forEach(r => {
        const k = r.length > 20 ? r.substring(0, 20) : r;
        allAntibiotics.add(k);
      });
    });
    const topAntibiotics = Array.from(allAntibiotics).slice(0, 10);
    const heatmapData = topOrganisms.map(org => {
      const row: Record<string, any> = { organism: org.name.split(" ").slice(0, 2).join(" ") };
      const resistSet = new Set([...org.resistance.intrinsic, ...org.resistance.acquired].map(r => r.length > 20 ? r.substring(0, 20) : r));
      topAntibiotics.forEach(ab => {
        row[ab] = resistSet.has(ab) ? 1 : 0;
      });
      return row;
    });

    // Radar data for morphological characteristics
    const radarData = [
      { subject: "Catalase +", value: filtered.filter(o => o.characteristics.catalase === "Positive").length },
      { subject: "Oxidase +", value: filtered.filter(o => o.characteristics.oxidase === "Positive").length },
      { subject: "Motile", value: filtered.filter(o => o.characteristics.motility === "Motile").length },
      { subject: "Spore-forming", value: filtered.filter(o => o.characteristics.sporeForming).length },
      { subject: "Capsulated", value: filtered.filter(o => o.characteristics.capsule).length },
      { subject: "Lactose +", value: filtered.filter(o => o.characteristics.lactoseFermenter).length },
    ];

    // Network/relationship scatter
    const networkData = filtered.slice(0, 30).map((org, i) => ({
      x: org.resistance.intrinsic.length + org.resistance.acquired.length,
      y: org.diseases.length,
      z: org.pathogenic ? 80 : 30,
      name: org.name.split(" ").slice(0, 2).join(" "),
    }));

    return {
      gramDist, shapeDist, oxygenDist, pathogenicity, sampleTypes,
      resistanceCategories, antibioticResistance, heatmapData,
      topAntibiotics, radarData, networkData, total: filtered.length,
    };
  }, [organismFilter, departmentFilter]);
}

export function DataVisualizationDashboard() {
  const [activeTab, setActiveTab] = useState("distribution");
  const [organismFilter, setOrganismFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("all");
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const stats = useOrganismStats(organismFilter, departmentFilter);

  // Fetch user lab records for real-time data
  useEffect(() => {
    const fetchRecords = async () => {
      setLoadingRecords(true);
      const { data } = await supabase
        .from("identification_records")
        .select("id, organism, sample_type, gram_stain, created_at, confidence, ast_results, resistance_profile, morphology, oxygen_requirement")
        .order("created_at", { ascending: false })
        .limit(500);
      if (data) setLabRecords(data.map((r: any) => ({
        ...r,
        ast_results: Array.isArray(r.ast_results) ? r.ast_results : [],
        resistance_profile: Array.isArray(r.resistance_profile) ? r.resistance_profile : [],
      })));
      setLoadingRecords(false);
    };
    fetchRecords();

    // Real-time subscription
    const channel = supabase
      .channel("dashboard-records")
      .on("postgres_changes", { event: "*", schema: "public", table: "identification_records" }, () => {
        fetchRecords();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Lab records time trend
  const timeTrend = useMemo(() => {
    const byMonth: Record<string, number> = {};
    labRecords.forEach(r => {
      const month = new Date(r.created_at).toLocaleDateString("en", { year: "2-digit", month: "short" });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    return Object.entries(byMonth).map(([name, count]) => ({ name, count })).slice(-12);
  }, [labRecords]);

  // Lab records sample type distribution
  const labSampleDist = useMemo(() => {
    const dist: Record<string, number> = {};
    labRecords.forEach(r => { dist[r.sample_type] = (dist[r.sample_type] || 0) + 1; });
    return Object.entries(dist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [labRecords]);

  // Lab records organism frequency
  const labOrganismFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    labRecords.forEach(r => { freq[r.organism] = (freq[r.organism] || 0) + 1; });
    return Object.entries(freq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15);
  }, [labRecords]);

  const gramData = Object.entries(stats.gramDist).map(([name, value]) => ({ name, value }));
  const shapeData = Object.entries(stats.shapeDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const oxygenData = Object.entries(stats.oxygenDist).map(([name, value]) => ({ name, value }));
  const sampleData = Object.entries(stats.sampleTypes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 12);
  const resistData = Object.entries(stats.resistanceCategories).map(([name, value]) => ({ name, value }));
  const antibioticData = Object.entries(stats.antibioticResistance).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Search Organism</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by organism name…"
                  value={organismFilter}
                  onChange={e => setOrganismFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              <Select value={departmentFilter} onValueChange={v => setDepartmentFilter(v as DepartmentFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                  <SelectItem value="molecular">Molecular Biology</SelectItem>
                  <SelectItem value="chemistry">Clinical Chemistry</SelectItem>
                  <SelectItem value="hematology">Hematology</SelectItem>
                  <SelectItem value="immunology">Immunology</SelectItem>
                  <SelectItem value="bloodbank">Blood Bank</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="h-9 px-3 flex items-center gap-1">
              <Microscope className="h-3.5 w-3.5" />
              {stats.total} organisms
            </Badge>
            <Badge variant="outline" className="h-9 px-3 flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5" />
              {labRecords.length} lab records
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="distribution" className="gap-1.5 text-xs"><PieChartIcon className="h-3.5 w-3.5" /> Distribution</TabsTrigger>
          <TabsTrigger value="resistance" className="gap-1.5 text-xs"><ShieldAlert className="h-3.5 w-3.5" /> Resistance</TabsTrigger>
          <TabsTrigger value="clinical" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Clinical</TabsTrigger>
          <TabsTrigger value="epidemiology" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Epidemiology</TabsTrigger>
          <TabsTrigger value="biochemical" className="gap-1.5 text-xs"><Dna className="h-3.5 w-3.5" /> Biochemical</TabsTrigger>
          <TabsTrigger value="network" className="gap-1.5 text-xs"><Network className="h-3.5 w-3.5" /> Relationships</TabsTrigger>
        </TabsList>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gram Stain Classification</CardTitle>
                <CardDescription>Distribution of {stats.total} organisms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={gramData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {gramData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cell Morphology</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={shapeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Oxygen Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={oxygenData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.split(" ")[0]} (${(percent * 100).toFixed(0)}%)`}>
                      {oxygenData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pathogenicity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats.pathogenicity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      <Cell fill="hsl(var(--destructive))" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resistance Tab */}
        <TabsContent value="resistance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resistance Profile Distribution</CardTitle>
                <CardDescription>Number of resistance mechanisms per organism</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={resistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                      {resistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Antibiotic Resistances</CardTitle>
                <CardDescription>Most common resistance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={antibioticData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resistance Heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Antimicrobial Resistance Heatmap
              </CardTitle>
              <CardDescription>Organism × Antibiotic resistance matrix (filled = resistant)</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-medium text-muted-foreground sticky left-0 bg-card">Organism</th>
                      {stats.topAntibiotics.map(ab => (
                        <th key={ab} className="p-1 font-medium text-muted-foreground text-center" style={{ writingMode: "vertical-lr", minHeight: 80 }}>
                          {ab}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.heatmapData.map((row, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="p-2 font-medium italic text-sm sticky left-0 bg-card">{row.organism}</td>
                        {stats.topAntibiotics.map(ab => (
                          <td key={ab} className="p-1 text-center">
                            <div
                              className={`w-6 h-6 rounded mx-auto ${row[ab] ? "bg-destructive/80" : "bg-muted/40"}`}
                              title={`${row.organism} — ${ab}: ${row[ab] ? "Resistant" : "Susceptible"}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/80" /> Resistant</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted/40" /> Susceptible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Organisms by Clinical Sample Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lab Records by Sample Type</CardTitle>
                <CardDescription>From your saved identification records</CardDescription>
              </CardHeader>
              <CardContent>
                {labSampleDist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No lab records yet. Save identifications to see data here.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={labSampleDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                        {labSampleDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Epidemiology Tab */}
        <TabsContent value="epidemiology" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Record Submission Trends
                </CardTitle>
                <CardDescription>Your lab records over time</CardDescription>
              </CardHeader>
              <CardContent>
                {timeTrend.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No records yet. Add identification records to track trends.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={timeTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Most Identified Organisms</CardTitle>
                <CardDescription>Top organisms from your lab records</CardDescription>
              </CardHeader>
              <CardContent>
                {labOrganismFreq.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No records available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={labOrganismFreq} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Biochemical Profiles Tab */}
        <TabsContent value="biochemical" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Biochemical Test Profile</CardTitle>
                <CardDescription>Distribution of key biochemical characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar name="Positive count" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Biochemical Comparison</CardTitle>
                <CardDescription>Key test results across organism database</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.radarData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network/Relationships Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Organism Relationship Map
              </CardTitle>
              <CardDescription>
                X: resistance count • Y: disease associations • Size: pathogenicity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" dataKey="x" name="Resistances" tick={{ fontSize: 10 }} label={{ value: "Resistance Count", position: "bottom", fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="Diseases" tick={{ fontSize: 10 }} label={{ value: "Disease Count", angle: -90, position: "left", fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[40, 400]} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-lg">
                          <p className="font-medium italic">{d.name}</p>
                          <p>Resistances: {d.x}</p>
                          <p>Diseases: {d.y}</p>
                          <p>{d.z > 50 ? "Pathogenic" : "Non-pathogenic"}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={stats.networkData} fill="hsl(var(--primary))" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Sources */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Data Sources:</strong> Organism data curated from Bergey's Manual, Murray's Medical Microbiology, Koneman's Color Atlas, Bailey & Scott's. Resistance data aligned with{" "}
            <a href="https://clsi.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">CLSI M100</a> and{" "}
            <a href="https://www.eucast.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">EUCAST</a> breakpoints. Taxonomy verified via{" "}
            <a href="https://www.ncbi.nlm.nih.gov/taxonomy" target="_blank" rel="noopener noreferrer" className="text-primary underline">NCBI Taxonomy</a> and{" "}
            <a href="https://www.arb-silva.de" target="_blank" rel="noopener noreferrer" className="text-primary underline">SILVA 16S rRNA</a>. Lab records update in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
