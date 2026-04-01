import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, XCircle, RotateCcw, Stethoscope, GraduationCap, ClipboardList,
  BookOpen, FlaskConical, Microscope, Droplets, Shield, Scissors, Dna, ChevronRight,
  Lightbulb, Eye, EyeOff, Trophy, AlertTriangle,
} from "lucide-react";
import { allCases, departments, type LabCase, type Department, type Difficulty, type SimulatorMode } from "@/lib/cases";

const deptIcons: Record<string, React.ReactNode> = {
  "Microbiology": <FlaskConical className="h-4 w-4" />,
  "Hematology": <Droplets className="h-4 w-4" />,
  "Clinical Chemistry": <Microscope className="h-4 w-4" />,
  "Immunology / Serology": <Shield className="h-4 w-4" />,
  "Blood Bank / Immunohematology": <Droplets className="h-4 w-4" />,
  "Histopathology / Cytology": <Scissors className="h-4 w-4" />,
  "Molecular Biology / Genetics": <Dna className="h-4 w-4" />,
};

export function DepartmentCaseSimulator() {
  const [mode, setMode] = useState<SimulatorMode>("learning");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedDiff, setSelectedDiff] = useState<string>("all");
  const [activeCase, setActiveCase] = useState<LabCase | null>(null);
  const [phase, setPhase] = useState<"intro" | "lab" | "question" | "result">("intro");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  // Exam mode scoring
  const [examCases, setExamCases] = useState<LabCase[]>([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examScore, setExamScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  const filteredCases = useMemo(() => {
    return allCases.filter(c =>
      (selectedDept === "all" || c.department === selectedDept) &&
      (selectedDiff === "all" || c.difficulty === selectedDiff)
    );
  }, [selectedDept, selectedDiff]);

  const startCase = (c: LabCase) => {
    setActiveCase(c);
    setPhase("intro");
    setSelectedAnswer("");
    setIsCorrect(null);
    setShowHint(false);
  };

  const submitAnswer = () => {
    if (!activeCase) return;
    const q = activeCase.questions[0];
    const correct = parseInt(selectedAnswer) === q.correctAnswer;
    setIsCorrect(correct);
    setPhase("result");
    if (mode === "exam") {
      if (correct) setExamScore(s => s + 1);
    }
  };

  const startExam = () => {
    const shuffled = [...filteredCases].sort(() => Math.random() - 0.5).slice(0, Math.min(20, filteredCases.length));
    setExamCases(shuffled);
    setExamIndex(0);
    setExamScore(0);
    setExamFinished(false);
    if (shuffled.length > 0) startCase(shuffled[0]);
  };

  const nextExamCase = () => {
    const next = examIndex + 1;
    if (next >= examCases.length) {
      setExamFinished(true);
      setActiveCase(null);
    } else {
      setExamIndex(next);
      startCase(examCases[next]);
    }
  };

  // Back to case list
  const backToList = () => {
    setActiveCase(null);
    setExamCases([]);
    setExamFinished(false);
  };

  // --- EXAM FINISHED ---
  if (mode === "exam" && examFinished) {
    const pct = Math.round((examScore / examCases.length) * 100);
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/30">
          <CardHeader className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Exam Complete</CardTitle>
            <CardDescription>Your performance summary</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-5xl font-bold text-primary">{pct}%</div>
            <p className="text-muted-foreground">{examScore} / {examCases.length} correct</p>
            <Badge variant={pct >= 80 ? "default" : pct >= 60 ? "secondary" : "destructive"} className="text-base px-4 py-1">
              {pct >= 90 ? "Excellent" : pct >= 80 ? "Very Good" : pct >= 70 ? "Good" : pct >= 60 ? "Needs Improvement" : "Study More"}
            </Badge>
            <div className="pt-4">
              <Button onClick={backToList}><RotateCcw className="h-4 w-4 mr-2" /> Back to Cases</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- ACTIVE CASE ---
  if (activeCase) {
    const q = activeCase.questions[0];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold">{activeCase.title}</h3>
          <div className="flex gap-2 items-center">
            <Badge variant="outline">{activeCase.department}</Badge>
            <Badge variant={activeCase.difficulty === "Beginner" ? "secondary" : activeCase.difficulty === "Intermediate" ? "outline" : "destructive"}>
              {activeCase.difficulty}
            </Badge>
            {mode === "exam" && <Badge className="bg-primary/20 text-primary">{examIndex + 1}/{examCases.length}</Badge>}
            <Button variant="ghost" size="sm" onClick={backToList}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Progress */}
        <Progress value={phase === "intro" ? 25 : phase === "lab" ? 50 : phase === "question" ? 75 : 100} className="h-2" />

        {/* Phase: Intro */}
        {phase === "intro" && (
          <Card>
            <CardHeader><CardTitle className="text-base">📋 Patient Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/30"><span className="font-medium">Age:</span> {activeCase.patientAge === 0 ? activeCase.patientGender : `${activeCase.patientAge} years`}</div>
                <div className="p-2 rounded bg-muted/30"><span className="font-medium">Gender:</span> {activeCase.patientGender}</div>
              </div>
              <div className="p-3 rounded bg-muted/20">
                <p className="font-medium mb-1">Clinical Presentation</p>
                <p className="text-muted-foreground">{activeCase.clinicalPresentation}</p>
              </div>
              <div className="p-3 rounded bg-muted/20">
                <p className="font-medium mb-1">History</p>
                <p className="text-muted-foreground">{activeCase.history}</p>
              </div>
              <Badge variant="secondary">Sample: {activeCase.sampleType}</Badge>
              <div className="pt-2"><Button onClick={() => setPhase("lab")} className="w-full">View Laboratory Findings <ChevronRight className="h-4 w-4 ml-1" /></Button></div>
            </CardContent>
          </Card>
        )}

        {/* Phase: Lab Findings */}
        {phase === "lab" && (
          <Card>
            <CardHeader><CardTitle className="text-base">🔬 Laboratory Findings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {activeCase.laboratoryFindings.map((f, i) => (
                <div key={i} className="p-2 rounded bg-muted/20 text-sm flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{f}</span>
                </div>
              ))}
              <div className="pt-2"><Button onClick={() => setPhase("question")} className="w-full">Answer Question <ChevronRight className="h-4 w-4 ml-1" /></Button></div>
            </CardContent>
          </Card>
        )}

        {/* Phase: Question */}
        {phase === "question" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎯 {q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">{String.fromCharCode(65 + i)}. {opt}</Label>
                  </div>
                ))}
              </RadioGroup>

              {mode === "learning" && q.hint && (
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="text-xs">
                    {showHint ? <EyeOff className="h-3 w-3 mr-1" /> : <Lightbulb className="h-3 w-3 mr-1" />}
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>
                  {showHint && (
                    <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                      <Lightbulb className="h-4 w-4 inline mr-1 text-primary" /> {q.hint}
                    </div>
                  )}
                </div>
              )}

              <Button onClick={submitAnswer} disabled={!selectedAnswer} className="w-full">Submit Answer</Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Result */}
        {phase === "result" && (
          <div className="space-y-4">
            <Card className={`border-2 ${isCorrect ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
                  {isCorrect ? "Correct!" : "Incorrect"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Correct Answer:</strong> {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}</p>
                {(mode === "learning" || phase === "result") && (
                  <>
                    <div className="p-3 rounded bg-muted/20">
                      <p className="font-medium mb-1">Explanation</p>
                      <p className="text-muted-foreground">{activeCase.explanation}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" /> <span>{activeCase.reference}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              {mode === "exam" ? (
                <Button onClick={nextExamCase} className="flex-1">
                  {examIndex + 1 >= examCases.length ? "Finish Exam" : "Next Case"} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={backToList} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-1" /> Back to Cases
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- CASE LIST ---
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2 justify-center">
          <Stethoscope className="h-5 w-5 text-primary" /> Department Case Simulator
        </h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Practice diagnostic reasoning across 7 laboratory departments with {allCases.length} validated clinical cases
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {([
          { key: "learning", label: "Learning Mode", icon: <GraduationCap className="h-4 w-4" />, desc: "Hints & explanations" },
          { key: "exam", label: "Exam Mode", icon: <ClipboardList className="h-4 w-4" />, desc: "Timed, scored" },
        ] as const).map(m => (
          <Button
            key={m.key}
            variant={mode === m.key ? "default" : "outline"}
            onClick={() => setMode(m.key)}
            className="gap-2"
          >
            {m.icon} {m.label}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments ({allCases.length})</SelectItem>
            {departments.map(d => (
              <SelectItem key={d} value={d}>{d} ({allCases.filter(c => c.department === d).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDiff} onValueChange={setSelectedDiff}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        {mode === "exam" && (
          <Button onClick={startExam} disabled={filteredCases.length === 0}>
            <ClipboardList className="h-4 w-4 mr-2" /> Start Exam ({Math.min(20, filteredCases.length)} cases)
          </Button>
        )}
      </div>

      {/* Case grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCases.map(c => (
          <Card
            key={c.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => startCase(c)}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {deptIcons[c.department]}
                  <CardTitle className="text-sm leading-tight">{c.title}</CardTitle>
                </div>
                <Badge variant={c.difficulty === "Beginner" ? "secondary" : c.difficulty === "Intermediate" ? "outline" : "destructive"} className="text-[10px] shrink-0">
                  {c.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground line-clamp-2">{c.clinicalPresentation}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]">{c.department}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>No cases found for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
