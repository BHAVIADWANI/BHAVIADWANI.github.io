import { useState, useEffect, useMemo, useCallback } from "react";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, BarChart3, AlertTriangle, CheckCircle2, MinusCircle, Trash2, BookOpen,
  Save, FolderOpen, Loader2, Eye, Calendar, Hash, FlaskConical, Download, FileSpreadsheet, Ruler, TestTube,
} from "lucide-react";
import { ASTCharts } from "@/components/ast/ASTCharts";
import { CLSIReference } from "@/components/ast/CLSIReference";
import { OrganismAutocomplete } from "@/components/ast/OrganismAutocomplete";
import { ComparativeAnalysis } from "@/components/ast/ComparativeAnalysis";
import { ASTAdvancedAnalytics } from "@/components/ast/ASTAdvancedAnalytics";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getRelevantZoneBreakpoints, interpretZone, type CLSIZoneBreakpoint } from "@/lib/clsiData";
import * as XLSX from "xlsx";

interface ASTEntry {
  id: number;
  antibiotic: string;
  result: "S" | "I" | "R";
  mic?: string;
  zone?: string;
}

interface SavedASTRecord {
  id: string;
  sample_id: string;
  organism: string;
  ast_organism: string | null;
  ast_results: ASTEntry[];
  notes: string | null;
  created_at: string;
  patient_name: string | null;
  referring_physician: string | null;
  sample_type: string;
}

const commonAntibiotics = [
  "Penicillin", "Ampicillin", "Amoxicillin-Clavulanate", "Oxacillin",
  "Ceftriaxone", "Cefotaxime", "Ceftazidime", "Cefepime", "Cefoxitin",
  "Meropenem", "Imipenem", "Ertapenem",
  "Piperacillin-Tazobactam", "Ampicillin-Sulbactam",
  "Gentamicin", "Amikacin", "Tobramycin",
  "Ciprofloxacin", "Levofloxacin", "Moxifloxacin",
  "Vancomycin", "Linezolid", "Daptomycin",
  "Trimethoprim-Sulfamethoxazole", "Clindamycin",
  "Erythromycin", "Azithromycin",
  "Tetracycline", "Doxycycline", "Tigecycline",
  "Rifampin", "Nitrofurantoin", "Fosfomycin", "Colistin",
  "Ceftazidime-Avibactam", "Ceftolozane-Tazobactam", "Cefiderocol",
];

const AST = () => {
  const { user } = useAuth();

  // Mode: zone = disk diffusion (Zone of Inhibition), mic = MIC
  const [mode, setMode] = useState<"zone" | "mic">("zone");
  const [entries, setEntries] = useState<ASTEntry[]>([]);
  const [organism, setOrganism] = useState("");
  const [strainId, setStrainId] = useState("");
  const [sampleType, setSampleType] = useState("Other");
  const [notes, setNotes] = useState("");
  const [referringResearcher, setReferringResearcher] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [saving, setSaving] = useState(false);

  // Saved records state
  const [savedRecords, setSavedRecords] = useState<SavedASTRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [viewRecord, setViewRecord] = useState<SavedASTRecord | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCombinedAnalysis, setShowCombinedAnalysis] = useState(false);

  // Zone breakpoints for the selected organism
  const zoneBreakpoints = useMemo(() => getRelevantZoneBreakpoints(organism), [organism]);
  const zoneBreakpointMap = useMemo(() => {
    const m: Record<string, CLSIZoneBreakpoint> = {};
    zoneBreakpoints.forEach((bp) => { m[bp.antibiotic] = bp; });
    return m;
  }, [zoneBreakpoints]);

  useEffect(() => {
    fetchSavedRecords();
  }, []);

  const fetchSavedRecords = async () => {
    setLoadingRecords(true);
    const { data, error } = await supabase
      .from("identification_records")
      .select("id, sample_id, organism, ast_organism, ast_results, notes, created_at, patient_name, referring_physician, sample_type")
      .not("ast_results", "is", null)
      .order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.error('[AST] Fetch failed:', error?.code);
    } else {
      setSavedRecords(
        (data || [])
          .filter((r: any) => Array.isArray(r.ast_results) && r.ast_results.length > 0)
          .map((r: any) => ({ ...r, ast_results: r.ast_results as ASTEntry[] }))
      );
    }
    setLoadingRecords(false);
  };

  // Auto strain ID: sequential based on existing records for same organism
  const generateStrainId = useCallback(() => {
    if (!organism.trim()) {
      toast.error("Enter organism name first");
      return;
    }
    const prefix = organism.split(" ").map((w) => w[0]?.toUpperCase() || "").join("").substring(0, 4);
    // Find existing strain IDs for this organism with the same prefix pattern
    const existingIds = savedRecords
      .filter((r) => (r.ast_organism || r.organism).toLowerCase() === organism.toLowerCase())
      .map((r) => r.sample_id)
      .filter((id) => id.startsWith(prefix + "-"));
    
    // Extract numbers from existing IDs
    const numbers = existingIds
      .map((id) => {
        const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    
    // Also check the current strainId if it follows the pattern
    const currentMatch = strainId.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (currentMatch) numbers.push(parseInt(currentMatch[1], 10));
    
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    setStrainId(`${prefix}-${String(nextNum).padStart(3, "0")}`);
  }, [organism, savedRecords, strainId]);

  const addEntry = () => {
    const newId = Math.max(...entries.map((e) => e.id), 0) + 1;
    setEntries([...entries, { id: newId, antibiotic: "", result: "S" }]);
  };

  const updateEntry = (id: number, field: keyof ASTEntry, value: string) => {
    setEntries(entries.map((e) => {
      if (e.id !== id) return e;
      const updated = { ...e, [field]: value };
      // Auto-interpret zone diameter when in zone mode
      if (mode === "zone" && field === "zone" && value && !isNaN(Number(value))) {
        const bp = zoneBreakpointMap[updated.antibiotic];
        if (bp) {
          updated.result = interpretZone(Number(value), bp);
        }
      }
      return updated;
    }));
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleSaveAST = async () => {
    if (!organism.trim()) { toast.error("Organism name is required"); return; }
    if (entries.length === 0) { toast.error("Add at least one antibiotic entry"); return; }
    const sid = strainId.trim() || (() => { generateStrainId(); return strainId; })();
    const finalSid = strainId.trim() || `${organism.split(" ").map((w) => w[0]?.toUpperCase() || "").join("").substring(0, 4)}-001`;

    setSaving(true);
    const { error } = await supabase.from("identification_records").insert({
      user_id: user!.id,
      sample_id: finalSid,
      sample_type: sampleType,
      organism: organism.trim(),
      ast_organism: organism.trim(),
      ast_results: entries.map((e) => ({
        antibiotic: e.antibiotic,
        result: e.result,
        mic: e.mic || undefined,
        zone: e.zone || undefined,
      })),
      notes: notes.trim() || null,
      referring_physician: referringResearcher.trim() || null,
      confidence: 0,
    });
    if (error) { toast.error("Failed to save AST record"); if (import.meta.env.DEV) console.error('[AST] Save failed:', error?.code); }
    else { toast.success(`AST record saved as ${finalSid}`); fetchSavedRecords(); }
    setSaving(false);
  };

  const handleDeleteRecord = async (id: string) => {
    const { error } = await supabase.from("identification_records").delete().eq("id", id);
    if (error) { toast.error("Failed to delete record"); }
    else { setSavedRecords((prev) => prev.filter((r) => r.id !== id)); setSelectedIds((prev) => prev.filter((r) => r !== id)); toast.success("AST record deleted"); }
    setDeleteRecordId(null);
  };

  const loadRecord = (record: SavedASTRecord) => {
    setOrganism(record.ast_organism || record.organism);
    setStrainId(record.sample_id);
    setNotes(record.notes || "");
    setReferringResearcher(record.referring_physician || "");
    setEntries(record.ast_results.map((e, i) => ({
      id: i + 1, antibiotic: e.antibiotic || "", result: (e.result as "S" | "I" | "R") || "S", mic: e.mic, zone: e.zone,
    })));
    toast.success("Record loaded into editor");
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  // Comparative analysis: records for the same organism
  const selectedRecords = useMemo(() => savedRecords.filter((r) => selectedIds.includes(r.id)), [savedRecords, selectedIds]);
  const combinedOrganism = useMemo(() => {
    const orgs = [...new Set(selectedRecords.map((r) => r.ast_organism || r.organism))];
    return orgs.join(", ");
  }, [selectedRecords]);

  // Group saved records by organism for browsing
  const recordsByOrganism = useMemo(() => {
    const map: Record<string, SavedASTRecord[]> = {};
    savedRecords.forEach((r) => {
      const key = (r.ast_organism || r.organism).toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [savedRecords]);

  const filteredRecords = savedRecords.filter((r) =>
    r.organism.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sample_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.ast_organism || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.referring_physician || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Excel export
  const handleExportExcel = () => {
    const recordsToExport = selectedIds.length > 0 ? selectedRecords : savedRecords;
    if (recordsToExport.length === 0) { toast.error("No records to export"); return; }

    const rows: Record<string, any>[] = [];
    recordsToExport.forEach((r) => {
      r.ast_results.forEach((e) => {
        rows.push({
          "Organism": r.ast_organism || r.organism,
          "Strain/Isolate ID": r.sample_id,
          "Antibiotic": e.antibiotic,
          "Result": e.result === "S" ? "Susceptible" : e.result === "I" ? "Intermediate" : "Resistant",
          "Result Code": e.result,
          "MIC (µg/mL)": e.mic || "",
          "Zone Diameter (mm)": e.zone || "",
          "Sample Type": r.sample_type,
          "Researcher": r.referring_physician || "",
          "Notes": r.notes || "",
          "Date": new Date(r.created_at).toLocaleDateString(),
        });
      });
    });

    // Summary sheet
    const summaryRows: Record<string, any>[] = recordsToExport.map((r) => {
      const total = r.ast_results.length;
      const s = r.ast_results.filter((e) => e.result === "S").length;
      const i = r.ast_results.filter((e) => e.result === "I").length;
      const rr = r.ast_results.filter((e) => e.result === "R").length;
      return {
        "Organism": r.ast_organism || r.organism,
        "Strain/Isolate ID": r.sample_id,
        "Total Antibiotics": total,
        "Susceptible": s,
        "Intermediate": i,
        "Resistant": rr,
        "Resistance Rate (%)": total > 0 ? Math.round((rr / total) * 100) : 0,
        "Date": new Date(r.created_at).toLocaleDateString(),
      };
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(rows);
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, ws1, "AST Data");
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");
    XLSX.writeFile(wb, `AST_Data_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel file downloaded");
  };

  const stats = {
    total: entries.length,
    susceptible: entries.filter((e) => e.result === "S").length,
    intermediate: entries.filter((e) => e.result === "I").length,
    resistant: entries.filter((e) => e.result === "R").length,
  };

  const recordToDelete = savedRecords.find((r) => r.id === deleteRecordId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <FeatureGate feature="ast_analysis" requiredPlan="premium">
      <main className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Antimicrobial Susceptibility Testing</h1>
          <p className="text-muted-foreground">
            Enter AST results by zone diameter or MIC, save per organism/strain, and analyze resistance patterns
          </p>
        </div>

        <Tabs defaultValue="entry" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="entry" className="gap-2"><BarChart3 className="h-4 w-4" /> Data Entry & Analysis</TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <FolderOpen className="h-4 w-4" /> Saved Records
              {savedRecords.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{savedRecords.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" /> Advanced Analytics</TabsTrigger>
            <TabsTrigger value="clsi" className="gap-2"><BookOpen className="h-4 w-4" /> CLSI Guidelines</TabsTrigger>
          </TabsList>

          {/* Data Entry Tab */}
          <TabsContent value="entry">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle>Organism & AST Data</CardTitle>
                        <CardDescription>Enter organism info and susceptibility results</CardDescription>
                      </div>
                      {/* Zone / MIC Toggle */}
                      <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-1.5">
                          <Ruler className="h-4 w-4 text-primary" />
                          <span className={`text-sm font-medium ${mode === "zone" ? "text-primary" : "text-muted-foreground"}`}>Zone</span>
                        </div>
                        <Switch checked={mode === "mic"} onCheckedChange={(v) => setMode(v ? "mic" : "zone")} />
                        <div className="flex items-center gap-1.5">
                          <TestTube className="h-4 w-4 text-primary" />
                          <span className={`text-sm font-medium ${mode === "mic" ? "text-primary" : "text-muted-foreground"}`}>MIC</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Organism & Strain ID */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Organism *</Label>
                        <OrganismAutocomplete value={organism} onChange={setOrganism} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1"><Hash className="h-3 w-3" /> Strain / Isolate ID</Label>
                        <div className="flex gap-2">
                          <Input value={strainId} onChange={(e) => setStrainId(e.target.value)} placeholder="e.g., SA-001" className="font-mono" />
                          <Button variant="outline" size="sm" onClick={generateStrainId} title="Auto-generate sequential ID" className="shrink-0">Auto</Button>
                        </div>
                        {strainId && <p className="text-xs text-muted-foreground">Next ID follows sequence from saved records</p>}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Sample Type</Label>
                        <Select value={sampleType} onValueChange={setSampleType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Blood culture", "Urine", "Sputum", "Wound swab", "Throat swab", "CSF", "Stool", "BAL", "Tissue biopsy", "Body fluid", "Other"].map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Researcher / Physician</Label>
                        <Input value={referringResearcher} onChange={(e) => setReferringResearcher(e.target.value)} placeholder="Name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief notes" />
                      </div>
                    </div>

                    <Separator />

                    {/* Mode-specific header */}
                    {mode === "zone" && organism && zoneBreakpoints.length > 0 && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium flex items-center gap-2 mb-1">
                          <Ruler className="h-4 w-4 text-primary" />
                          Zone of Inhibition Measurement — CLSI Breakpoints
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enter zone diameters in mm. Results are auto-interpreted per CLSI M100 standards for <span className="italic font-medium">{organism}</span>.
                        </p>
                      </div>
                    )}

                    {mode === "mic" && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium flex items-center gap-2 mb-1">
                          <TestTube className="h-4 w-4 text-primary" />
                          MIC Interpretation
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enter MIC values (µg/mL) and select interpretation. Refer to CLSI M100 breakpoints in the guidelines tab.
                        </p>
                      </div>
                    )}

                    {/* Antibiotics */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Antibiotics Tested</Label>
                        <Button variant="outline" size="sm" onClick={addEntry}><Plus className="h-4 w-4 mr-2" /> Add Antibiotic</Button>
                      </div>

                      {/* Column headers */}
                      {entries.length > 0 && (
                        <div className="flex items-center gap-3 px-3 text-xs text-muted-foreground font-medium">
                          <div className="flex-1">Antibiotic</div>
                          <div className="w-28 text-center">Result</div>
                          {mode === "zone" ? (
                            <div className="w-24 text-center">Zone (mm)</div>
                          ) : (
                            <div className="w-24 text-center">MIC (µg/mL)</div>
                          )}
                          {mode === "zone" && <div className="w-28 text-center text-[10px]">CLSI Ref (S/I/R)</div>}
                          <div className="w-9" />
                        </div>
                      )}

                      <div className="space-y-3">
                        {entries.map((entry) => {
                          const bp = zoneBreakpointMap[entry.antibiotic];
                          const hasZone = entry.zone && !isNaN(Number(entry.zone));
                          const zoneVal = hasZone ? Number(entry.zone) : null;
                          return (
                            <div key={entry.id} className="rounded-lg border bg-card/50 overflow-hidden">
                              <div className="flex items-center gap-3 p-3">
                                <div className="flex-1">
                                  <Select value={entry.antibiotic} onValueChange={(v) => updateEntry(entry.id, "antibiotic", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select antibiotic" /></SelectTrigger>
                                    <SelectContent>
                                      {commonAntibiotics.map((ab) => (
                                        <SelectItem key={ab} value={ab}>{ab}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-28">
                                  <Select value={entry.result} onValueChange={(v) => updateEntry(entry.id, "result", v as "S" | "I" | "R")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="S"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> S</span></SelectItem>
                                      <SelectItem value="I"><span className="flex items-center gap-2"><MinusCircle className="h-4 w-4 text-warning" /> I</span></SelectItem>
                                      <SelectItem value="R"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> R</span></SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {mode === "zone" ? (
                                  <Input
                                    value={entry.zone || ""}
                                    onChange={(e) => updateEntry(entry.id, "zone", e.target.value)}
                                    placeholder="mm"
                                    className="w-24 text-center font-mono"
                                    type="number"
                                    min="0"
                                    max="50"
                                  />
                                ) : (
                                  <Input
                                    value={entry.mic || ""}
                                    onChange={(e) => updateEntry(entry.id, "mic", e.target.value)}
                                    placeholder="µg/mL"
                                    className="w-24 text-center font-mono"
                                  />
                                )}
                                {mode === "zone" && (
                                  <div className="w-28 text-center">
                                    {bp ? (
                                      <span className="text-[10px] font-mono text-muted-foreground">
                                        ≥{bp.susceptible}/{bp.intermediate || "-"}/≤{bp.resistant}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">—</span>
                                    )}
                                  </div>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {/* Inline CLSI reference — shows when zone is entered and breakpoint exists */}
                              {mode === "zone" && bp && hasZone && zoneVal !== null && (
                                <div className={`px-3 py-2 border-t text-xs flex items-center gap-3 flex-wrap ${
                                  entry.result === "S" ? "bg-success/5 border-success/20" : entry.result === "R" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                                }`}>
                                  <span className="font-medium flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    CLSI M100:
                                  </span>
                                  <span className="text-muted-foreground">Disk: <span className="font-mono">{bp.diskContent}</span></span>
                                  <span className="text-muted-foreground">|</span>
                                  <span className="text-success font-mono">S ≥{bp.susceptible}mm</span>
                                  {bp.intermediate && <span className="text-warning font-mono">I {bp.intermediate}mm</span>}
                                  <span className="text-destructive font-mono">R ≤{bp.resistant}mm</span>
                                  <span className="text-muted-foreground">|</span>
                                  <span className="font-medium">
                                    Your zone: <span className="font-mono">{zoneVal}mm</span> →{" "}
                                    <span className={entry.result === "S" ? "text-success" : entry.result === "R" ? "text-destructive" : "text-warning"}>
                                      {entry.result === "S" ? "Susceptible" : entry.result === "R" ? "Resistant" : "Intermediate"}
                                    </span>
                                  </span>
                                  {bp.notes && <span className="text-muted-foreground italic ml-1">({bp.notes})</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button variant="default" className="flex-1" onClick={() => setShowCharts(true)}>
                        <BarChart3 className="h-4 w-4 mr-2" /> Analyze Patterns
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleSaveAST} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save AST Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {showCharts && <ASTCharts entries={entries} organism={organism} />}
              </div>

              {/* Statistics Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Summary Statistics</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Tested</span>
                        <span className="font-bold text-xl">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" /> Susceptible</span>
                        <span className="font-semibold">{stats.susceptible}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-warning"><MinusCircle className="h-4 w-4" /> Intermediate</span>
                        <span className="font-semibold">{stats.intermediate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Resistant</span>
                        <span className="font-semibold">{stats.resistant}</span>
                      </div>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                      {stats.susceptible > 0 && <div className="bg-success transition-all" style={{ width: `${(stats.susceptible / stats.total) * 100}%` }} />}
                      {stats.intermediate > 0 && <div className="bg-warning transition-all" style={{ width: `${(stats.intermediate / stats.total) * 100}%` }} />}
                      {stats.resistant > 0 && <div className="bg-destructive transition-all" style={{ width: `${(stats.resistant / stats.total) * 100}%` }} />}
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Resistance Rate: <span className="font-bold text-destructive">{stats.total > 0 ? Math.round((stats.resistant / stats.total) * 100) : 0}%</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {mode === "zone" && organism && zoneBreakpoints.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">CLSI Zone Breakpoints</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-1 pr-2 font-semibold">Antibiotic</th>
                              <th className="text-center py-1 px-1 font-semibold text-success">S ≥</th>
                              <th className="text-center py-1 px-1 font-semibold text-warning">I</th>
                              <th className="text-center py-1 px-1 font-semibold text-destructive">R ≤</th>
                            </tr>
                          </thead>
                          <tbody>
                            {zoneBreakpoints.map((bp, i) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-1 pr-2 font-medium">{bp.antibiotic}</td>
                                <td className="text-center py-1 px-1 font-mono text-success">{bp.susceptible}</td>
                                <td className="text-center py-1 px-1 font-mono text-warning">{bp.intermediate || "-"}</td>
                                <td className="text-center py-1 px-1 font-mono text-destructive">{bp.resistant}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">Disk content & zone diameter in mm. Ref: CLSI M100</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle className="text-base">Quick Interpretation</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {entries.filter((e) => e.result === "R").length > 0 && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="font-medium text-destructive mb-1">Resistance Detected</p>
                          <p className="text-muted-foreground">{entries.filter((e) => e.result === "R").map((e) => e.antibiotic).filter(Boolean).join(", ")}</p>
                        </div>
                      )}
                      {entries.filter((e) => e.result === "S").length > 0 && (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                          <p className="font-medium text-success mb-1">Susceptible Options</p>
                          <p className="text-muted-foreground">{entries.filter((e) => e.result === "S").map((e) => e.antibiotic).filter(Boolean).join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Saved Records Tab */}
          <TabsContent value="saved">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input placeholder="Search by organism, strain ID, researcher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-3" />
                  </div>
                  <div className="flex gap-2">
                    {selectedIds.length >= 2 && (
                      <Button onClick={() => setShowCombinedAnalysis(true)} className="gap-2">
                        <BarChart3 className="h-4 w-4" /> Compare ({selectedIds.length})
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      {selectedIds.length > 0 ? `Export ${selectedIds.length}` : "Export All"}
                    </Button>
                  </div>
                </div>

                {loadingRecords ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : filteredRecords.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        {savedRecords.length === 0 ? "No saved AST records yet. Go to Data Entry to create one." : "No records match your search."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.map((record) => {
                      const rStats = {
                        s: record.ast_results.filter((e) => e.result === "S").length,
                        i: record.ast_results.filter((e) => e.result === "I").length,
                        r: record.ast_results.filter((e) => e.result === "R").length,
                        total: record.ast_results.length,
                      };
                      return (
                        <Card
                          key={record.id}
                          className={`transition-all hover:shadow-md cursor-pointer ${selectedIds.includes(record.id) ? "ring-2 ring-primary" : ""}`}
                          onClick={() => toggleSelection(record.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg italic">{record.ast_organism || record.organism}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Hash className="h-3 w-3" /><span className="font-mono text-xs">{record.sample_id}</span>
                                </CardDescription>
                              </div>
                              <Badge variant="outline">{rStats.total} tested</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(record.created_at).toLocaleDateString()}
                              {record.referring_physician && <span className="ml-2">· {record.referring_physician}</span>}
                            </div>
                            <div className="h-2 rounded-full overflow-hidden flex bg-muted">
                              {rStats.s > 0 && <div className="bg-success" style={{ width: `${(rStats.s / rStats.total) * 100}%` }} />}
                              {rStats.i > 0 && <div className="bg-warning" style={{ width: `${(rStats.i / rStats.total) * 100}%` }} />}
                              {rStats.r > 0 && <div className="bg-destructive" style={{ width: `${(rStats.r / rStats.total) * 100}%` }} />}
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-success">S: {rStats.s}</span>
                              <span className="text-warning">I: {rStats.i}</span>
                              <span className="text-destructive">R: {rStats.r}</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={(e) => { e.stopPropagation(); setViewRecord(record); }}><Eye className="h-3 w-3" /> View</Button>
                              <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={(e) => { e.stopPropagation(); loadRecord(record); }}><Download className="h-3 w-3" /> Load</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteRecordId(record.id); }}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Combined / Comparative Analysis Dialog */}
                <Dialog open={showCombinedAnalysis} onOpenChange={setShowCombinedAnalysis}>
                  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Comparative Strain Analysis</DialogTitle>
                      <DialogDescription>Comparing {selectedIds.length} strains/isolates</DialogDescription>
                    </DialogHeader>
                    {selectedRecords.length > 0 && (
                      <ComparativeAnalysis records={selectedRecords} organism={combinedOrganism} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ASTAdvancedAnalytics records={savedRecords} />
          </TabsContent>

          <TabsContent value="clsi">
            <CLSIReference organism={organism} />
          </TabsContent>
        </Tabs>
      </main>
      </FeatureGate>
      <Footer />

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="italic">{viewRecord.ast_organism || viewRecord.organism}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Hash className="h-3 w-3" /><span className="font-mono">{viewRecord.sample_id}</span>
                  <span>·</span><span>{new Date(viewRecord.created_at).toLocaleDateString()}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {viewRecord.referring_physician && <p className="text-sm text-muted-foreground">Researcher: {viewRecord.referring_physician}</p>}
                {viewRecord.notes && <p className="text-sm text-muted-foreground">Notes: {viewRecord.notes}</p>}
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">AST Results ({viewRecord.ast_results.length} antibiotics)</h4>
                  {viewRecord.ast_results.map((ast, i) => (
                    <div key={i} className="flex justify-between text-sm items-center">
                      <span>{ast.antibiotic}</span>
                      <div className="flex items-center gap-2">
                        {ast.zone && <span className="text-xs text-muted-foreground">Zone: {ast.zone}mm</span>}
                        {ast.mic && <span className="text-xs text-muted-foreground">MIC: {ast.mic}</span>}
                        <Badge variant={ast.result === "R" ? "destructive" : ast.result === "S" ? "default" : "secondary"} className={ast.result === "S" ? "bg-success text-success-foreground" : ""}>{ast.result}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> Delete AST Record</AlertDialogTitle>
            <AlertDialogDescription>
              Delete AST record for <span className="font-medium italic">{recordToDelete?.ast_organism || recordToDelete?.organism}</span>
              {recordToDelete && <> (ID: <span className="font-mono">{recordToDelete.sample_id}</span>)</>}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteRecordId && handleDeleteRecord(deleteRecordId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AST;
