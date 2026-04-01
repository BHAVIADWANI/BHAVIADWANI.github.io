import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface RecordData {
  id: string;
  sample_id: string;
  sample_type: string;
  organism: string;
  confidence: number;
  gram_stain: string | null;
  morphology: string | null;
  arrangement: string | null;
  oxygen_requirement: string | null;
  created_at: string;
  patient_name: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  notes: string | null;
  lab_id: string | null;
  sample_source: string | null;
  clinical_significance: string | null;
  referring_physician: string | null;
  tests: any[];
  associated_diseases: any[];
  recommended_treatment: any[];
  resistance_profile: any[];
  ast_results: any[];
  ast_organism: string | null;
}

function toFlatRow(r: RecordData) {
  return {
    "Sample ID": r.sample_id,
    "Lab ID": r.lab_id || "",
    "Date": new Date(r.created_at).toLocaleDateString(),
    "Sample Type": r.sample_type,
    "Sample Source": r.sample_source || "",
    "Organism": r.organism,
    "Confidence (%)": r.confidence,
    "Gram Stain": r.gram_stain || "",
    "Morphology": r.morphology || "",
    "Arrangement": r.arrangement || "",
    "Oxygen": r.oxygen_requirement || "",
    "Patient Name": r.patient_name || "",
    "Patient Age": r.patient_age || "",
    "Patient Gender": r.patient_gender || "",
    "Physician": r.referring_physician || "",
    "Clinical Significance": r.clinical_significance || "",
    "Tests": Array.isArray(r.tests) ? r.tests.join("; ") : "",
    "Diseases": Array.isArray(r.associated_diseases) ? r.associated_diseases.join("; ") : "",
    "Treatment": Array.isArray(r.recommended_treatment) ? r.recommended_treatment.join("; ") : "",
    "Resistance": Array.isArray(r.resistance_profile) ? r.resistance_profile.join("; ") : "",
    "AST Results": Array.isArray(r.ast_results) ? r.ast_results.map((a: any) => `${a.antibiotic}:${a.result}`).join("; ") : "",
    "Notes": r.notes || "",
  };
}

function exportCSV(records: RecordData[]) {
  if (!records.length) { toast.error("No records to export"); return; }
  const rows = records.map(toFlatRow);
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => `"${String((row as any)[h]).replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `MicroID_Records_${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast.success(`Exported ${records.length} records as CSV`);
}

function exportExcel(records: RecordData[]) {
  if (!records.length) { toast.error("No records to export"); return; }
  const rows = records.map(toFlatRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lab Records");

  // AST sheet if data exists
  const astRows = records.flatMap(r =>
    (Array.isArray(r.ast_results) ? r.ast_results : []).map((a: any) => ({
      "Sample ID": r.sample_id, "Organism": r.organism, "AST Organism": r.ast_organism || r.organism,
      "Antibiotic": a.antibiotic, "Result": a.result, "MIC": a.mic || "", "Zone": a.zone || "",
    }))
  );
  if (astRows.length) {
    const ws2 = XLSX.utils.json_to_sheet(astRows);
    XLSX.utils.book_append_sheet(wb, ws2, "AST Results");
  }

  XLSX.writeFile(wb, `MicroID_Records_${new Date().toISOString().split("T")[0]}.xlsx`);
  toast.success(`Exported ${records.length} records as Excel`);
}

function exportPDF(records: RecordData[]) {
  if (!records.length) { toast.error("No records to export"); return; }
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

  addText("MicroID Laboratory Records Report", 16, true);
  addText(`Generated: ${new Date().toLocaleString()} • Total Records: ${records.length}`, 9);
  y += 5;

  records.forEach((r, idx) => {
    if (y > 250) { doc.addPage(); y = 20; }
    addText(`Record ${idx + 1}: ${r.organism}`, 12, true);
    addText(`Sample: ${r.sample_id} (${r.sample_type}) • Date: ${new Date(r.created_at).toLocaleDateString()}`);
    addText(`Confidence: ${r.confidence}% • Gram: ${r.gram_stain || "N/A"}`);
    if (r.patient_name) addText(`Patient: ${r.patient_name}${r.patient_age ? `, ${r.patient_age}y` : ""}`);
    if (r.clinical_significance) addText(`Clinical: ${r.clinical_significance}`);
    if (r.ast_results?.length) {
      addText(`AST: ${r.ast_results.map((a: any) => `${a.antibiotic}=${a.result}`).join(", ")}`);
    }
    y += 4;
  });

  doc.setFontSize(7);
  doc.text("Generated by MicroID Clinical Laboratory Intelligence System", margin, 290);
  doc.save(`MicroID_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success(`Exported ${records.length} records as PDF`);
}

export function RecordExport({ records }: { records: RecordData[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export ({records.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(records)} className="gap-2">
          <FileText className="h-4 w-4" /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportExcel(records)} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPDF(records)} className="gap-2">
          <File className="h-4 w-4" /> Export PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
