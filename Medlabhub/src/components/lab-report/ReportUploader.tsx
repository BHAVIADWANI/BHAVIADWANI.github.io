import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, Loader2, BrainCircuit, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function ReportUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setFile(f);
    setResult("");
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult("");

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const b64 = (reader.result as string).split(",")[1];
          resolve(b64);
        };
        reader.readAsDataURL(file);
      });

      const prompt = `You are an expert clinical laboratory scientist. A user has uploaded a real laboratory report image.

Your task:
1. Extract ALL test parameters, values, units, and reference ranges visible in the report.
2. Present them in a structured markdown table: | Parameter | Value | Unit | Reference Range | Status |
3. Mark status as Normal, Abnormal (High/Low), or Borderline.
4. After the table, provide a detailed clinical interpretation:
   - Explain each abnormal value
   - Identify patterns (e.g., combined abnormalities suggesting a specific condition)
   - List possible causes
   - State clinical significance
5. If any part of the report is unclear or unreadable, explicitly state what could not be read.

Rules:
- ONLY interpret values visible in the image. Do NOT assume or fabricate data.
- Clearly separate extracted data from interpretation.
- End with: "This is an AI-generated interpretation for educational purposes only. Consult a qualified physician."
- Use markdown with headers and bullet points.`;

      const { data, error } = await supabase.functions.invoke("analyze-lab-image", {
        body: {
          image: base64,
          mimeType: file.type,
          prompt,
        },
      });
      if (error) throw error;
      setResult(data?.analysis || data?.text || "Could not process the report.");
    } catch (e: any) {
      if (e.message?.includes("Unable to")) {
        setResult("⚠️ Unable to accurately read this report. Please upload a clearer image with better resolution.");
      } else {
        toast.error("Failed to analyze report: " + (e.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload Laboratory Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <FileImage className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Drop report image here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG • Max 10MB</p>
          </div>

          {preview && (
            <div className="rounded-lg overflow-hidden border max-h-64 flex items-center justify-center bg-muted/30">
              <img src={preview} alt="Report preview" className="max-h-64 object-contain" />
            </div>
          )}

          {file && (
            <div className="flex items-center gap-3">
              <Badge variant="outline">{file.name}</Badge>
              <Button onClick={handleUpload} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                Analyze Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Report Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {result}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
