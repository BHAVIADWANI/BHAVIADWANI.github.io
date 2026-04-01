import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from "lucide-react";
import type { QuizQuestion } from "@/hooks/useQuiz";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  selectedAnswer: string | null;
  isRevealed: boolean;
  onSelect: (answer: string) => void;
  onNext: () => void;
}

const typeLabels: Record<string, string> = {
  "identify-by-traits": "Identify",
  "name-the-disease": "Disease",
  "gram-stain": "Gram Stain",
  biochemical: "Biochemical",
  resistance: "AMR",
  virulence: "Virulence",
  culture: "Culture",
  department: "Knowledge",
};

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  score,
  selectedAnswer,
  isRevealed,
  onSelect,
  onNext,
}: QuizCardProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge variant="outline" className="text-xs">
            {typeLabels[question.type] || question.type}
          </Badge>
        </div>
        <Badge variant="secondary" className="font-mono">
          Score: {score}/{questionNumber - (isRevealed ? 0 : 1)}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold leading-relaxed">{question.prompt}</h2>

          {/* Clues */}
          {question.clues.length > 0 && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Lightbulb className="h-4 w-4" />
                Clues
              </div>
              {question.clues.map((clue, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {clue}
                </div>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="grid gap-3">
            {question.options.map((option) => {
              const isCorrect = option === question.correctAnswer;
              const isSelected = option === selectedAnswer;

              let variant: "default" | "correct" | "incorrect" | "missed" = "default";
              if (isRevealed) {
                if (isCorrect) variant = "correct";
                else if (isSelected && !isCorrect) variant = "incorrect";
              }

              return (
                <button
                  key={option}
                  onClick={() => !isRevealed && onSelect(option)}
                  disabled={isRevealed}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all text-sm font-medium",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "disabled:cursor-default disabled:hover:bg-transparent disabled:hover:border-border",
                    variant === "default" && "border-border bg-card",
                    variant === "correct" && "border-success bg-success/10 text-success",
                    variant === "incorrect" && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="italic">{option}</span>
                    {isRevealed && isCorrect && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                    {isRevealed && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isRevealed && (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-lg border text-sm",
                  selectedAnswer === question.correctAnswer
                    ? "bg-success/10 border-success/30"
                    : "bg-destructive/10 border-destructive/30"
                )}
              >
                <p className="font-semibold mb-1">
                  {selectedAnswer === question.correctAnswer ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>

              <Button onClick={onNext} className="w-full gap-2" variant="hero">
                {questionNumber === totalQuestions ? "See Results" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
