import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportTemplate, getValueStatus } from "@/lib/labReportTemplates";
import { ArrowLeft, BrainCircuit, GraduationCap, Save, FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  template: ReportTemplate;
  onBack: () => void;
  initialValues?: Record<string, string>;
}

export function ReportEditor({ template, onBack, initialValues }: Props) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string>>(initialValues || {});
  const [notes, setNotes] = useState("");
  const [learningMode, setLearningMode] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [patientName, setPatientName] = useState("");

  const filledParams = useMemo(() => {
    return template.parameters.filter(p => values[p.name]?.trim());
  }, [values, template.parameters]);

  const handleInterpret = async () => {
    if (filledParams.length === 0) {
      toast.error("Enter at least one value to interpret");
      return;
    }
    setAiLoading(true);
    setAiResult("");

    const reportData = filledParams.map(p => {
      const status = getValueStatus(values[p.name], p.refLow, p.refHigh);
      return `${p.name}: ${values[p.name]} ${p.unit} (Ref: ${p.refRange}) [${status}]`;
    }).join("\n");

    const prompt = `You are a clinical laboratory scientist. Interpret this ${template.name} report.
${learningMode ? "LEARNING MODE: Explain each parameter, why it may be abnormal, and its clinical significance in detail." : "Provide a concise clinical interpretation."}

Report values:
${reportData}

Rules:
- Only interpret values provided. Do not assume missing values.
- Do not hallucinate conditions not supported by the data.
- Identify patterns (e.g., Low Hb + Low MCV = possible iron deficiency anemia).
- Use markdown formatting with headers and bullet points.
- End with a disclaimer: "This is an AI-generated interpretation for educational purposes only. Consult a qualified physician."`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      setAiResult(data?.text || data?.response || "No interpretation generated.");
    } catch (e: any) {
      toast.error("AI interpretation failed: " + (e.message || "Unknown error"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("Generating PDF...");
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(template.name, 14, 20);
      if (patientName) {
        doc.setFontSize(10);
        doc.text(`Patient: ${patientName}`, 14, 28);
      }
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, patientName ? 34 : 28);

      let y = patientName ? 44 : 38;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Parameter", 14, y);
      doc.text("Value", 90, y);
      doc.text("Unit", 120, y);
      doc.text("Ref Range", 145, y);
      doc.text("Status", 185, y);
      y += 6;
      doc.setFont("helvetica", "normal");

      template.parameters.forEach(p => {
        const val = values[p.name] || "-";
        const status = val !== "-" ? getValueStatus(val, p.refLow, p.refHigh) : "";
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(p.name, 14, y);
        doc.text(val, 90, y);
        doc.text(p.unit, 120, y);
        doc.text(p.refRange, 145, y);
        doc.text(status, 185, y);
        y += 5;
      });

      if (notes) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 14, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(notes, 180);
        doc.text(lines, 14, y);
      }

      doc.save(`${template.shortName}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF exported!");
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(template.parameters.map(p => p.category || "General"));
    return Array.from(cats);
  }, [template]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-xl font-bold">{template.name}</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch id="learn" checked={learningMode} onCheckedChange={setLearningMode} />
            <Label htmlFor="learn" className="text-xs flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> Learning Mode
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Patient Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Patient Name" value={patientName} onChange={e => setPatientName(e.target.value)} />
          <Input placeholder="Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </CardContent>
      </Card>

      {categories.map(cat => {
        const params = template.parameters.filter(p => (p.category || "General") === cat);
        return (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{cat}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Parameter</TableHead>
                    <TableHead className="w-[120px]">Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Reference Range</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {params.map(p => {
                    const val = values[p.name] || "";
                    const status = val ? getValueStatus(val, p.refLow, p.refHigh) : null;
                    return (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium text-xs">{p.name}</TableCell>
                        <TableCell>
                          <Input
                            className="h-8 text-xs w-24"
                            value={val}
                            onChange={e => setValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                            placeholder="Enter"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.unit}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.refRange}</TableCell>
                        <TableCell>
                          {status && (
                            <Badge
                              variant={status === "normal" ? "default" : status === "borderline" ? "secondary" : "destructive"}
                              className={`text-[10px] ${status === "normal" ? "bg-green-600 hover:bg-green-700" : status === "borderline" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}`}
                            >
                              {status === "text" ? "—" : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Add clinical notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleInterpret} disabled={aiLoading} className="gap-2">
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          {learningMode ? "Explain Report" : "AI Interpret"}
        </Button>
      </div>

      {aiResult && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              AI {learningMode ? "Explanation" : "Interpretation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {aiResult}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
