import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Microscope, FlaskConical, Shield, Dna } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { DepartmentSelector } from "@/components/quiz/DepartmentSelector";
import type { Department } from "@/lib/departmentQuestions";

const Quiz = () => {
  const { state, startQuiz, selectAnswer, nextQuestion, resetQuiz } = useQuiz();
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const handleStart = () => {
    if (selectedDept) {
      startQuiz(selectedDept);
    }
  };

  const handleRestart = () => {
    resetQuiz();
    setSelectedDept(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        {!state ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BrainCircuit className="h-7 w-7" />
                </div>
              </div>
              <h1 className="text-3xl font-bold">Laboratory Quiz</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Test your knowledge with 15 randomised questions. Choose a department to get started.
              </p>
            </div>

            <div className="text-left space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Select Department</h2>
              <DepartmentSelector selected={selectedDept} onSelect={setSelectedDept} />
            </div>

            {selectedDept && (
              <div className="space-y-3">
                <Badge variant="secondary" className="text-sm">15 questions • ~5 minutes</Badge>
                <div>
                  <Button onClick={handleStart} variant="hero" size="lg" className="gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    Start Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : state.isComplete ? (
          <QuizResults
            score={state.score}
            total={state.questions.length}
            department={state.department}
            onRestart={() => startQuiz(state.department)}
            onChangeDepartment={handleRestart}
          />
        ) : (
          <QuizCard
            question={state.questions[state.currentIndex]}
            questionNumber={state.currentIndex + 1}
            totalQuestions={state.questions.length}
            score={state.score}
            selectedAnswer={state.selectedAnswer}
            isRevealed={state.isRevealed}
            onSelect={selectAnswer}
            onNext={nextQuestion}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;
