import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle2, XCircle, FlaskConical, GraduationCap, ClipboardCheck, Lightbulb, BookOpen } from "lucide-react";
import { labWorkflows, LabWorkflow, WorkflowDepartment } from "@/lib/labWorkflows";

type Mode = "learning" | "exam";

const departments: WorkflowDepartment[] = [
  "Microbiology", "Molecular Biology", "Clinical Chemistry",
  "Hematology", "Immunology / Serology", "Blood Bank", "Histopathology"
];

export function VirtualLabSimulator() {
  const [mode, setMode] = useState<Mode>("learning");
  const [department, setDepartment] = useState<string>("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<LabWorkflow | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [completed, setCompleted] = useState(false);

  const filtered = useMemo(() =>
    department === "all" ? labWorkflows : labWorkflows.filter(w => w.department === department),
    [department]
  );

  const currentStep = selectedWorkflow?.steps[stepIndex];

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelectedChoice(i);
  };

  const handleSubmit = () => {
    if (selectedChoice === null || !currentStep) return;
    setAnswered(true);
    setTotalAnswered(t => t + 1);
    if (currentStep.choices[selectedChoice].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (!selectedWorkflow) return;
    if (stepIndex < selectedWorkflow.steps.length - 1) {
      setStepIndex(s => s + 1);
      setSelectedChoice(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const reset = () => {
    setSelectedWorkflow(null);
    setStepIndex(0);
    setSelectedChoice(null);
    setAnswered(false);
    setScore(0);
    setTotalAnswered(0);
    setCompleted(false);
  };

  // ── Workflow Selection ──
  if (!selectedWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-2">
            <Button variant={mode === "learning" ? "default" : "outline"} size="sm" onClick={() => setMode("learning")}>
              <GraduationCap className="h-4 w-4 mr-1" /> Learning
            </Button>
            <Button variant={mode === "exam" ? "default" : "outline"} size="sm" onClick={() => setMode("exam")}>
              <ClipboardCheck className="h-4 w-4 mr-1" /> Exam
            </Button>
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(w => (
            <Card key={w.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setSelectedWorkflow(w); setStepIndex(0); setSelectedChoice(null); setAnswered(false); setScore(0); setTotalAnswered(0); setCompleted(false); }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{w.department}</Badge>
                  <Badge variant="outline" className="text-xs">{w.steps.length} steps</Badge>
                </div>
                <CardTitle className="text-base mt-2">{w.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{w.scenario}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>📦 {w.sampleType}</span>
                  {w.patient && <span>🧑 {w.patient.split(",")[0]}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No workflows available for this department yet.</p>}
      </div>
    );
  }

  // ── Completed ──
  if (completed) {
    const pct = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Workflow Complete</CardTitle>
            <CardDescription>{selectedWorkflow.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/30"><p className="text-2xl font-bold">{score}/{totalAnswered}</p><p className="text-xs text-muted-foreground">Correct</p></div>
              <div className="p-4 rounded-lg bg-muted/30"><p className="text-2xl font-bold">{pct}%</p><p className="text-xs text-muted-foreground">Score</p></div>
              <div className="p-4 rounded-lg bg-muted/30"><p className="text-2xl font-bold">{selectedWorkflow.steps.length}</p><p className="text-xs text-muted-foreground">Steps</p></div>
            </div>
            <p className="text-xs text-muted-foreground"><BookOpen className="inline h-3 w-3 mr-1" />Reference: {selectedWorkflow.reference}</p>
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4 mr-1" /> Back to Workflows</Button>
              <Button onClick={() => { setStepIndex(0); setSelectedChoice(null); setAnswered(false); setScore(0); setTotalAnswered(0); setCompleted(false); }}>Retry Workflow</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Active Step ──
  const step = currentStep!;
  const progress = ((stepIndex) / selectedWorkflow.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset}><ChevronLeft className="h-4 w-4 mr-1" /> All Workflows</Button>
          <Badge variant="secondary">{selectedWorkflow.department}</Badge>
          <Badge variant={mode === "exam" ? "destructive" : "default"} className="text-xs">{mode === "exam" ? "Exam" : "Learning"}</Badge>
        </div>
        {mode === "exam" && <span className="text-sm font-medium">Score: {score}/{totalAnswered}</span>}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-1">{selectedWorkflow.title}</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">Step {stepIndex + 1} of {selectedWorkflow.steps.length}</p>
      </div>

      {/* Step progress pills */}
      <div className="flex flex-wrap gap-1">
        {selectedWorkflow.steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${i === stepIndex ? "bg-primary text-primary-foreground" : i < stepIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            {i < stepIndex ? <CheckCircle2 className="h-3 w-3" /> : <span>{s.icon}</span>}
            <span className="hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Scenario context */}
      {stepIndex === 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 text-sm space-y-1">
            <p><strong>Scenario:</strong> {selectedWorkflow.scenario}</p>
            {selectedWorkflow.patient && <p><strong>Patient:</strong> {selectedWorkflow.patient}</p>}
            <p><strong>Sample:</strong> {selectedWorkflow.sampleType}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><span className="text-xl">{step.icon}</span> {step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium text-sm">{step.instruction}</p>

          <div className="space-y-2">
            {step.choices.map((c, i) => {
              let borderClass = "border-border hover:border-primary/50";
              if (answered) {
                if (c.correct) borderClass = "border-green-500 bg-green-500/10";
                else if (i === selectedChoice && !c.correct) borderClass = "border-destructive bg-destructive/10";
                else borderClass = "border-border opacity-60";
              } else if (i === selectedChoice) {
                borderClass = "border-primary bg-primary/10";
              }

              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                  className={`w-full text-left p-3 rounded-lg border-2 text-sm transition-all ${borderClass}`}>
                  <span className="font-medium">{String.fromCharCode(65 + i)}. {c.label}</span>
                  {answered && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {c.correct && <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-500" />}
                      {i === selectedChoice && !c.correct && <XCircle className="inline h-3 w-3 mr-1 text-destructive" />}
                      {c.result}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Learning mode hint */}
          {mode === "learning" && !answered && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Show hint</summary>
              <p className="mt-1 text-muted-foreground italic">{step.explanation.slice(0, 120)}...</p>
            </details>
          )}

          {/* Explanation after answering */}
          {answered && (mode === "learning" || completed) && (
            <div className="p-3 rounded-lg bg-muted/30 text-sm space-y-1">
              <p className="font-medium flex items-center gap-1"><BookOpen className="h-4 w-4" /> Explanation</p>
              <p className="text-muted-foreground text-xs">{step.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {!answered && <Button onClick={handleSubmit} disabled={selectedChoice === null}>Submit Answer</Button>}
            {answered && <Button onClick={handleNext}>{stepIndex < selectedWorkflow.steps.length - 1 ? <>Next Step <ChevronRight className="h-4 w-4 ml-1" /></> : "Complete Workflow"}</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
