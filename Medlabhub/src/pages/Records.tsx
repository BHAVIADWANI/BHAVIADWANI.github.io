import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, Calendar, Trash2, Eye, GitCompare, Filter, FlaskConical,
  Stethoscope, Pill, AlertTriangle, Microscope, Plus, User, FileText, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RecordExport } from "@/components/records/RecordExport";
interface IdentificationRecord {
  id: string;
  sample_id: string;
  sample_type: string;
  sample_source: string | null;
  patient_name: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  patient_contact: string | null;
  patient_address: string | null;
  medical_history: string | null;
  referring_physician: string | null;
  organism: string;
  confidence: number;
  gram_stain: string | null;
  morphology: string | null;
  arrangement: string | null;
  oxygen_requirement: string | null;
  tests: string[];
  notes: string | null;
  lab_id: string | null;
  clinical_significance: string | null;
  associated_diseases: string[];
  recommended_treatment: string[];
  resistance_profile: string[];
  ast_results: Array<{ antibiotic: string; result: string; mic?: string }>;
  ast_organism: string | null;
  created_at: string;
}

const sampleTypes = [
  "Blood culture", "Urine", "Sputum", "Wound swab", "Throat swab",
  "CSF", "Stool", "BAL", "Tissue biopsy", "Body fluid", "Other",
];

const Records = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<IdentificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [viewRecord, setViewRecord] = useState<IdentificationRecord | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New record form state
  const [formData, setFormData] = useState({
    sample_id: "",
    sample_type: "Other",
    sample_source: "",
    patient_name: "",
    patient_age: "",
    patient_gender: "",
    patient_contact: "",
    patient_address: "",
    medical_history: "",
    referring_physician: "",
    organism: "",
    confidence: "0",
    gram_stain: "",
    morphology: "",
    arrangement: "",
    oxygen_requirement: "",
    notes: "",
    lab_id: "",
    clinical_significance: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("identification_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load records");
      if (import.meta.env.DEV) console.error('[Records] Fetch failed:', error?.code);
    } else {
      setRecords(
        (data || []).map((r: any) => ({
          ...r,
          tests: Array.isArray(r.tests) ? r.tests : [],
          associated_diseases: Array.isArray(r.associated_diseases) ? r.associated_diseases : [],
          recommended_treatment: Array.isArray(r.recommended_treatment) ? r.recommended_treatment : [],
          resistance_profile: Array.isArray(r.resistance_profile) ? r.resistance_profile : [],
          ast_results: Array.isArray(r.ast_results) ? r.ast_results : [],
        }))
      );
    }
    setLoading(false);
  };

  const handleSaveRecord = async () => {
    if (!formData.sample_id.trim() || !formData.organism.trim()) {
      toast.error("Sample ID and Organism are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("identification_records").insert({
      user_id: user!.id,
      sample_id: formData.sample_id.trim().substring(0, 100),
      sample_type: formData.sample_type,
      sample_source: formData.sample_source.trim().substring(0, 200) || null,
      patient_name: formData.patient_name.trim().substring(0, 100) || null,
      patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
      patient_gender: formData.patient_gender || null,
      patient_contact: formData.patient_contact.trim().substring(0, 200) || null,
      patient_address: formData.patient_address.trim().substring(0, 500) || null,
      medical_history: formData.medical_history.trim().substring(0, 2000) || null,
      referring_physician: formData.referring_physician.trim().substring(0, 100) || null,
      organism: formData.organism.trim().substring(0, 200),
      confidence: parseFloat(formData.confidence) || 0,
      gram_stain: formData.gram_stain || null,
      morphology: formData.morphology || null,
      arrangement: formData.arrangement || null,
      oxygen_requirement: formData.oxygen_requirement || null,
      notes: formData.notes.trim().substring(0, 2000) || null,
      lab_id: formData.lab_id.trim().substring(0, 50) || null,
      clinical_significance: formData.clinical_significance.trim().substring(0, 2000) || null,
    });

    if (error) {
      toast.error("Failed to save record");
      if (import.meta.env.DEV) console.error('[Records] Save failed:', error?.code);
    } else {
      toast.success("Record saved successfully");
      setShowAddForm(false);
      setFormData({
        sample_id: "", sample_type: "Other", sample_source: "",
        patient_name: "", patient_age: "", patient_gender: "",
        patient_contact: "", patient_address: "", medical_history: "",
        referring_physician: "", organism: "", confidence: "0",
        gram_stain: "", morphology: "", arrangement: "",
        oxygen_requirement: "", notes: "", lab_id: "", clinical_significance: "",
      });
      fetchRecords();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("identification_records").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete record");
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setSelectedRecords((prev) => prev.filter((r) => r !== id));
      toast.success("Record deleted successfully");
    }
    setDeleteRecordId(null);
  };

  const filteredRecords = records.filter((record) =>
    record.organism.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.sample_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.sample_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (record.patient_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const recordToDelete = records.find((r) => r.id === deleteRecordId);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <FeatureGate feature="records" requiredPlan="premium">
      <main className="container py-8 flex-1">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Saved Records</h1>
            <p className="text-muted-foreground">
              View, compare, and manage your identification records
            </p>
          </div>
          <div className="flex gap-2">
            <RecordExport records={filteredRecords as any} />
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Record
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by organism, sample, patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            {selectedRecords.length >= 2 && (
              <Button variant="default" className="gap-2">
                <GitCompare className="h-4 w-4" />
                Compare ({selectedRecords.length})
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <Card
                key={record.id}
                className={`transition-all hover:shadow-md cursor-pointer ${
                  selectedRecords.includes(record.id) ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => toggleRecordSelection(record.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg italic">{record.organism}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={record.confidence >= 90 ? "default" : "secondary"}
                      className={record.confidence >= 90 ? "bg-success text-success-foreground" : ""}
                    >
                      {record.confidence}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {record.gram_stain && <Badge variant="outline">{record.gram_stain}</Badge>}
                    <Badge variant="outline">{record.sample_type}</Badge>
                    <Badge variant="outline" className="text-xs font-mono">{record.sample_id}</Badge>
                  </div>

                  {record.patient_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> {record.patient_name}
                      {record.patient_age && `, ${record.patient_age}y`}
                      {record.patient_gender && `, ${record.patient_gender}`}
                    </p>
                  )}

                  {record.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{record.notes}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={(e) => { e.stopPropagation(); setViewRecord(record); }}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteRecordId(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {records.length === 0
                ? "No records yet. Click 'New Record' to add one."
                : "No records found matching your search."}
            </p>
          </div>
        )}
      </main>
      </FeatureGate>
      <Footer />

      {/* Add Record Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              New Identification Record
            </DialogTitle>
            <DialogDescription>Fill in sample, patient, and identification details</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Sample Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" /> Sample Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Sample ID *</Label>
                  <Input value={formData.sample_id} onChange={(e) => setFormData({ ...formData, sample_id: e.target.value })} placeholder="e.g., LAB-2026-001" />
                </div>
                <div className="space-y-1">
                  <Label>Sample Type</Label>
                  <Select value={formData.sample_type} onValueChange={(v) => setFormData({ ...formData, sample_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Sample Source</Label>
                  <Input value={formData.sample_source} onChange={(e) => setFormData({ ...formData, sample_source: e.target.value })} placeholder="e.g., Right arm wound" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Patient Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Patient Information
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input type="number" value={formData.patient_age} onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select value={formData.patient_gender} onValueChange={(v) => setFormData({ ...formData, patient_gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Contact</Label>
                  <Input value={formData.patient_contact} onChange={(e) => setFormData({ ...formData, patient_contact: e.target.value })} placeholder="Phone or email" />
                </div>
                <div className="space-y-1">
                  <Label>Referring Physician / Researcher</Label>
                  <Input value={formData.referring_physician} onChange={(e) => setFormData({ ...formData, referring_physician: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input value={formData.patient_address} onChange={(e) => setFormData({ ...formData, patient_address: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Medical History</Label>
                <Textarea value={formData.medical_history} onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })} placeholder="Conditions, allergies, medications..." rows={3} />
              </div>
            </div>

            <Separator />

            {/* Identification Results */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Microscope className="h-4 w-4 text-primary" /> Identification Results
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Organism *</Label>
                  <Input className="italic" value={formData.organism} onChange={(e) => setFormData({ ...formData, organism: e.target.value })} placeholder="e.g., Staphylococcus aureus" />
                </div>
                <div className="space-y-1">
                  <Label>Confidence (%)</Label>
                  <Input type="number" min="0" max="100" value={formData.confidence} onChange={(e) => setFormData({ ...formData, confidence: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Gram Stain</Label>
                  <Select value={formData.gram_stain} onValueChange={(v) => setFormData({ ...formData, gram_stain: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gram Positive">Gram Positive</SelectItem>
                      <SelectItem value="Gram Negative">Gram Negative</SelectItem>
                      <SelectItem value="Variable">Variable</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Lab ID</Label>
                  <Input value={formData.lab_id} onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
              </div>
            </div>

            <Button onClick={handleSaveRecord} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Save Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="italic text-xl flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-primary" />
                  {viewRecord.organism}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(viewRecord.created_at).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{viewRecord.sample_type}</span>
                  <span>·</span>
                  <span className="font-mono text-xs">{viewRecord.sample_id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {viewRecord.gram_stain && <Badge variant="outline">{viewRecord.gram_stain}</Badge>}
                  <Badge
                    variant={viewRecord.confidence >= 90 ? "default" : "secondary"}
                    className={viewRecord.confidence >= 90 ? "bg-success text-success-foreground" : ""}
                  >
                    {viewRecord.confidence}% confidence
                  </Badge>
                </div>

                {/* Patient Info */}
                {viewRecord.patient_name && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary" />
                        Patient Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Name:</span> {viewRecord.patient_name}</div>
                        {viewRecord.patient_age && <div><span className="text-muted-foreground">Age:</span> {viewRecord.patient_age}</div>}
                        {viewRecord.patient_gender && <div><span className="text-muted-foreground">Gender:</span> {viewRecord.patient_gender}</div>}
                        {viewRecord.referring_physician && (
                          <div className="col-span-2"><span className="text-muted-foreground">Physician/Researcher:</span> {viewRecord.referring_physician}</div>
                        )}
                      </div>
                      {viewRecord.medical_history && (
                        <p className="text-sm text-muted-foreground mt-2">{viewRecord.medical_history}</p>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Sample Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    Sample Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Sample ID:</span> {viewRecord.sample_id}</div>
                    <div><span className="text-muted-foreground">Type:</span> {viewRecord.sample_type}</div>
                    {viewRecord.sample_source && (
                      <div className="col-span-2"><span className="text-muted-foreground">Source:</span> {viewRecord.sample_source}</div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Morphology */}
                {(viewRecord.morphology || viewRecord.arrangement) && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <Microscope className="h-4 w-4 text-primary" />
                        Morphology
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {viewRecord.morphology && <div><span className="text-muted-foreground">Shape:</span> {viewRecord.morphology}</div>}
                        {viewRecord.arrangement && <div><span className="text-muted-foreground">Arrangement:</span> {viewRecord.arrangement}</div>}
                        {viewRecord.oxygen_requirement && (
                          <div className="col-span-2"><span className="text-muted-foreground">O₂:</span> {viewRecord.oxygen_requirement}</div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Tests */}
                {viewRecord.tests.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        Biochemical Tests
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewRecord.tests.map((test: string, i: number) => (
                          <Badge key={i} variant="secondary">{test}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Clinical */}
                {viewRecord.clinical_significance && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        Clinical Significance
                      </h4>
                      <p className="text-sm text-muted-foreground">{viewRecord.clinical_significance}</p>
                      {viewRecord.associated_diseases.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {viewRecord.associated_diseases.map((d: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Resistance */}
                {viewRecord.resistance_profile.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Resistance Profile
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewRecord.resistance_profile.map((r: string, i: number) => (
                          <Badge key={i} variant={r.includes(" R") ? "destructive" : "default"}
                            className={r.includes(" S") ? "bg-success text-success-foreground" : ""}
                          >{r}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* AST Results */}
                {viewRecord.ast_results.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <Pill className="h-4 w-4 text-primary" />
                        AST Results {viewRecord.ast_organism && `(${viewRecord.ast_organism})`}
                      </h4>
                      <div className="space-y-1">
                        {viewRecord.ast_results.map((ast: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{ast.antibiotic}</span>
                            <Badge variant={ast.result === "R" ? "destructive" : ast.result === "S" ? "default" : "secondary"}
                              className={ast.result === "S" ? "bg-success text-success-foreground" : ""}
                            >
                              {ast.result} {ast.mic && `(MIC: ${ast.mic})`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Treatment */}
                {viewRecord.recommended_treatment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-primary" />
                      Recommended Treatment
                    </h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
                      {viewRecord.recommended_treatment.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {viewRecord.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Notes
                      </h4>
                      <p className="text-sm text-muted-foreground">{viewRecord.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for{" "}
              <span className="font-medium italic">{recordToDelete?.organism}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteRecordId && handleDelete(deleteRecordId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Records;
