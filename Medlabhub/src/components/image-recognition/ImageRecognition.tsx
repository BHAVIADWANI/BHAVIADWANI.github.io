import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Camera, Microscope, FlaskConical, Loader2, AlertCircle,
  CheckCircle2, BookOpen, Target, Activity, Beaker, RefreshCw, ImageIcon,
  Dna, Droplets, TestTube2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageQuality {
  overall: string;
  resolution: string;
  focus: string;
  staining: string;
  artifacts: string;
}

interface DifferentialItem {
  organism?: string;
  alternative?: string;
  reasoning?: string;
}

interface AnalysisResult {
  imageQuality?: ImageQuality;
  imageType: string;
  detectedStructures: string[];
  possibleIdentification: string;
  differentialDiagnosis: (string | DifferentialItem)[];
  confidence: number;
  morphologicalFeatures: {
    primary: string;
    secondary: string[];
    staining: string;
  };
  interpretation: string;
  clinicalSignificance: string;
  recommendations: string[];
  references: string[];
}

const imageCategories = [
  { value: "gram-stain", label: "Gram Stain Microscopy", icon: Microscope },
  { value: "colony-morphology", label: "Colony Morphology", icon: FlaskConical },
  { value: "blood-smear", label: "Blood Smear", icon: Droplets },
  { value: "histopathology", label: "Histopathology Slide", icon: TestTube2 },
  { value: "gel-electrophoresis", label: "Gel Electrophoresis", icon: Dna },
  { value: "elisa", label: "ELISA / Immunoassay", icon: Beaker },
  { value: "urine-sediment", label: "Urine Sediment", icon: Droplets },
  { value: "afb-stain", label: "AFB / Acid-Fast Stain", icon: Microscope },
  { value: "fungal-prep", label: "Fungal Preparation", icon: FlaskConical },
  { value: "other", label: "Other Laboratory Image", icon: ImageIcon },
];

export function ImageRecognition() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("other");
  const [context, setContext] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast.error("Please upload an image first");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const selectedCat = imageCategories.find(c => c.value === category);
      const contextMsg = [
        selectedCat ? `Image type: ${selectedCat.label}.` : "",
        context.trim() ? context.trim() : "",
      ].filter(Boolean).join(" ");

      const { data, error: fnError } = await supabase.functions.invoke("analyze-lab-image", {
        body: {
          imageBase64,
          imageType: "jpeg",
          additionalContext: contextMsg || undefined,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Analysis failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.analysis) {
        setResult(data.analysis);
        toast.success("Image analysis complete!");
      } else {
        throw new Error("No analysis returned");
      }
    } catch (err: any) {
      const msg = err?.message || "Analysis failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setContext("");
    setCategory("other");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const getConfidenceColor = (c: number) => {
    if (c >= 80) return "text-green-600 dark:text-green-400";
    if (c >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (c >= 30) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getQualityColor = (q: string) => {
    if (q === "Good") return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
    if (q === "Adequate") return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    if (q === "Poor") return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
    return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" /> Upload Laboratory Image
            </CardTitle>
            <CardDescription>
              Upload a microscopy, culture plate, blood smear, histopathology slide, gel electrophoresis, or any laboratory image for AI analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!imagePreview ? (
              <div className="w-full h-56 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 h-auto py-4 px-6"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Gallery</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 h-auto py-4 px-6"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Camera</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP — Max 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Uploaded lab image"
                  className="w-full h-56 object-contain rounded-lg border bg-muted/20"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Replace
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Image Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <c.icon className="h-3.5 w-3.5" /> {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Additional Context (optional)</label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Sputum sample from 55-year-old smoker with fever, stained with Gram stain..."
                  className="text-sm"
                  rows={2}
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={!imageBase64 || analyzing}
                className="flex-1"
              >
                {analyzing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Microscope className="h-4 w-4 mr-2" /> Analyze Image</>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card className={!result ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" /> Analysis Results
            </CardTitle>
            <CardDescription>
              {result ? "AI-powered analysis of your laboratory image" : "Upload and analyze an image to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No analysis yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{result.imageType}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                <Progress value={result.confidence} className="h-2" />

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Most Likely Identification</p>
                  <p className="font-semibold text-sm">{result.possibleIdentification}</p>
                </div>

                {result.detectedStructures.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Detected Structures</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.detectedStructures.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.differentialDiagnosis.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Differential Diagnosis</p>
                    <ul className="space-y-2">
                      {result.differentialDiagnosis.map((d, i) => {
                        const label = typeof d === "string" ? d : (d.organism || d.alternative || "Unknown");
                        const reasoning = typeof d === "string" ? null : d.reasoning;
                        return (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-muted-foreground mt-0.5">•</span>
                            <div>
                              <span className="font-medium">{label}</span>
                              {reasoning && <p className="text-muted-foreground mt-0.5">{reasoning}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Quality Assessment */}
          {result.imageQuality && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Image Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getQualityColor(result.imageQuality.overall)}`}>
                  {result.imageQuality.overall}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Resolution", value: result.imageQuality.resolution },
                    { label: "Focus", value: result.imageQuality.focus },
                    { label: "Staining", value: result.imageQuality.staining },
                    { label: "Artifacts", value: result.imageQuality.artifacts },
                  ].map((item) => (
                    <div key={item.label} className="p-2 rounded bg-muted/30">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Morphological Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Microscope className="h-4 w-4" /> Morphological Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2.5 rounded bg-muted/30">
                <p className="text-xs text-muted-foreground">Primary Observation</p>
                <p className="text-sm font-medium">{result.morphologicalFeatures.primary}</p>
              </div>
              {result.morphologicalFeatures.staining && result.morphologicalFeatures.staining !== "N/A" && (
                <div className="p-2.5 rounded bg-muted/30">
                  <p className="text-xs text-muted-foreground">Staining Characteristics</p>
                  <p className="text-sm">{result.morphologicalFeatures.staining}</p>
                </div>
              )}
              {result.morphologicalFeatures.secondary.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Additional Features</p>
                  <ul className="space-y-1">
                    {result.morphologicalFeatures.secondary.map((f, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interpretation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" /> Scientific Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{result.interpretation}</p>
              {result.clinicalSignificance && (
                <div className="p-2.5 rounded bg-muted/30 border-l-2 border-primary">
                  <p className="text-xs text-muted-foreground mb-0.5">Clinical Significance</p>
                  <p className="text-sm">{result.clinicalSignificance}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {result.references.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.references.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="font-medium text-foreground">[{i + 1}]</span> {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
        ⚠️ AI-powered image analysis is for educational and research purposes only. Results should not replace professional laboratory diagnosis.
        Always verify findings with standard laboratory procedures and consult qualified professionals.
      </div>
    </div>
  );
}
