import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers, RotateCcw, Check, X, Eye, Shuffle, ArrowLeft } from "lucide-react";
import { organismDatabase, type Organism } from "@/lib/organismData";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentSelector } from "@/components/quiz/DepartmentSelector";
import { getDepartmentFlashcards, departments as deptList, type Department, type DepartmentFlashcard } from "@/lib/departmentQuestions";

interface FlashcardItem {
  id: string;
  department: Department;
  front: string;
  clues: { label: string; value: string }[];
  answer: string;
  explanation: string;
}

interface FlashcardState {
  cards: FlashcardItem[];
  currentIndex: number;
  revealed: boolean;
  stats: { correct: number; incorrect: number };
  missed: string[];
  department: Department;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function organismToFlashcard(org: Organism): FlashcardItem {
  return {
    id: org.id,
    department: "microbiology",
    front: "Can you name this organism?",
    clues: [
      { label: "Gram Stain", value: org.gramStain },
      { label: "Shape", value: org.shape },
      { label: "Arrangement", value: org.arrangement },
      { label: "Oxygen", value: org.oxygen },
      { label: "Catalase", value: org.characteristics.catalase },
      { label: "Oxidase", value: org.characteristics.oxidase },
      ...(org.characteristics.hemolysis ? [{ label: "Hemolysis", value: org.characteristics.hemolysis }] : []),
      ...(org.characteristics.coagulase ? [{ label: "Coagulase", value: org.characteristics.coagulase }] : []),
    ],
    answer: org.name,
    explanation: org.clinicalSignificance?.slice(0, 150) || org.diseases.slice(0, 3).join(", "),
  };
}

const Flashcards = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FlashcardState | null>(null);
  const [deckSize, setDeckSize] = useState(20);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  

  const startDeck = useCallback((department: Department, focusMissed?: string[]) => {
    let cards: FlashcardItem[];

    if (department === "microbiology") {
      let pool: Organism[];
      if (focusMissed && focusMissed.length > 0) {
        const missedSet = new Set(focusMissed);
        const missedOrganisms = organismDatabase.filter((o) => missedSet.has(o.id));
        const others = shuffleArray(organismDatabase.filter((o) => !missedSet.has(o.id)));
        const missedCount = Math.min(Math.ceil(deckSize * 0.6), missedOrganisms.length);
        const otherCount = deckSize - missedCount;
        pool = [...shuffleArray(missedOrganisms).slice(0, missedCount), ...others.slice(0, otherCount)];
      } else {
        pool = shuffleArray(organismDatabase.filter((o) => o.pathogenic)).slice(0, deckSize);
      }
      cards = shuffleArray(pool).map(organismToFlashcard);
    } else {
      const deptCards = getDepartmentFlashcards(department, deckSize);
      cards = deptCards.map((dc) => ({
        id: dc.id,
        department: dc.department,
        front: dc.front,
        clues: dc.clues,
        answer: dc.answer,
        explanation: dc.explanation,
      }));
    }

    setState({
      cards,
      currentIndex: 0,
      revealed: false,
      stats: { correct: 0, incorrect: 0 },
      missed: [],
      department,
    });
  }, [deckSize]);

  const reveal = () => setState((s) => s ? { ...s, revealed: true } : s);

  const answer = (correct: boolean) => {
    setState((s) => {
      if (!s) return s;
      const card = s.cards[s.currentIndex];

      if (s.department === "microbiology") {
        saveFlashcardProgress(card.answer, correct);
      }

      const newMissed = correct ? s.missed : [...s.missed, card.id];
      const nextIndex = s.currentIndex + 1;
      return {
        ...s,
        currentIndex: nextIndex,
        revealed: false,
        stats: {
          correct: s.stats.correct + (correct ? 1 : 0),
          incorrect: s.stats.incorrect + (correct ? 0 : 1),
        },
        missed: newMissed,
      };
    });
  };

  const saveFlashcardProgress = async (organismName: string, correct: boolean) => {

    const { data: existing } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", user!.id)
      .eq("organism_name", organismName)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("flashcard_progress")
        .update({
          correct_count: correct ? existing.correct_count + 1 : existing.correct_count,
          incorrect_count: correct ? existing.incorrect_count : existing.incorrect_count + 1,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("flashcard_progress").insert({
        user_id: user!.id,
        organism_name: organismName,
        correct_count: correct ? 1 : 0,
        incorrect_count: correct ? 0 : 1,
      });
    }
  };

  const handleReset = () => {
    setState(null);
    setSelectedDept(null);
  };

  const isComplete = state && state.currentIndex >= state.cards.length;
  const current = state && !isComplete ? state.cards[state.currentIndex] : null;
  const progress = state ? (state.currentIndex / state.cards.length) * 100 : 0;
  const deptLabel = state ? deptList.find((d) => d.id === state.department)?.label || state.department : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        {!state ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Flashcard Review</h1>
              <p className="text-muted-foreground">
                Test your recall across different laboratory disciplines. Choose a department to begin.
              </p>
            </div>

            <div className="text-left space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Select Department</h2>
              <DepartmentSelector selected={selectedDept} onSelect={setSelectedDept} />
            </div>

            {selectedDept && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {[10, 20, 30].map((n) => (
                    <Button
                      key={n}
                      variant={deckSize === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeckSize(n)}
                    >
                      {n} cards
                    </Button>
                  ))}
                </div>
                <Button onClick={() => startDeck(selectedDept)} variant="hero" size="lg" className="gap-2">
                  <Shuffle className="h-5 w-5" />
                  Start Flashcards
                </Button>
              </div>
            )}
          </div>
        ) : isComplete ? (
          <div className="max-w-md mx-auto text-center space-y-6">
            <Card className="border-2 overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center space-y-4">
                <Layers className="h-12 w-12 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Session Complete!</h2>
                <Badge variant="secondary">{deptLabel}</Badge>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <div className="text-3xl font-bold text-success">{state.stats.correct}</div>
                    <div className="text-sm text-muted-foreground">Got it</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-destructive/10">
                    <div className="text-3xl font-bold text-destructive">{state.stats.incorrect}</div>
                    <div className="text-sm text-muted-foreground">Missed</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">✓ Progress saved</p>
                <div className="flex flex-col gap-3">
                  {state.missed.length > 0 && (
                    <Button onClick={() => startDeck(state.department, state.missed)} variant="hero" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Review Missed ({state.missed.length})
                    </Button>
                  )}
                  <Button onClick={() => startDeck(state.department)} variant="outline" className="gap-2">
                    <Shuffle className="h-4 w-4" />
                    New Random Deck
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Choose Another Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : current ? (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Card {state.currentIndex + 1} of {state.cards.length} • {deptLabel}</span>
              <span className="flex gap-3">
                <span className="text-success">✓ {state.stats.correct}</span>
                <span className="text-destructive">✗ {state.stats.incorrect}</span>
              </span>
            </div>
            <Progress value={progress} className="h-2" />

            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <Badge variant="outline" className="w-fit mb-2">{deptLabel}</Badge>
                <CardTitle className="text-lg">{current.front}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {current.clues.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {current.clues.map((clue, i) => (
                      <div key={i}><span className="text-muted-foreground">{clue.label}:</span> {clue.value}</div>
                    ))}
                  </div>
                )}

                {!state.revealed ? (
                  <Button onClick={reveal} variant="outline" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    Reveal Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <p className="text-xl font-bold text-primary">{current.answer}</p>
                      {current.explanation && (
                        <p className="text-sm text-muted-foreground mt-1">{current.explanation.slice(0, 150)}{current.explanation.length > 150 ? "..." : ""}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => answer(false)} variant="outline" className="gap-2 border-destructive/30 hover:bg-destructive/10">
                        <X className="h-4 w-4 text-destructive" />
                        Didn't Know
                      </Button>
                      <Button onClick={() => answer(true)} variant="outline" className="gap-2 border-success/30 hover:bg-success/10">
                        <Check className="h-4 w-4 text-success" />
                        Got It
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Flashcards;
