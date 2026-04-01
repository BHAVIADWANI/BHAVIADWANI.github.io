import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Home, Trophy, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { departments, type Department } from "@/lib/departmentQuestions";

interface QuizResultsProps {
  score: number;
  total: number;
  department: Department;
  onRestart: () => void;
  onChangeDepartment: () => void;
}

export function QuizResults({ score, total, department, onRestart, onChangeDepartment }: QuizResultsProps) {
  const { user } = useAuth();
  const percentage = Math.round((score / total) * 100);
  const savedRef = useRef(false);

  const deptLabel = departments.find((d) => d.id === department)?.label || department;

  let grade: { label: string; color: string; message: string };
  if (percentage >= 90) {
    grade = { label: "Expert", color: "text-success", message: `Outstanding! You have mastery-level knowledge of ${deptLabel}.` };
  } else if (percentage >= 70) {
    grade = { label: "Proficient", color: "text-primary", message: `Great work! You have a strong grasp of ${deptLabel}.` };
  } else if (percentage >= 50) {
    grade = { label: "Developing", color: "text-warning", message: `Good effort! Review ${deptLabel} materials to strengthen your knowledge.` };
  } else {
    grade = { label: "Needs Review", color: "text-destructive", message: `Keep studying! Focus on the core ${deptLabel} concepts.` };
  }

  useEffect(() => {
    if (!savedRef.current && user) {
      savedRef.current = true;
      supabase.from("quiz_history").insert({
        user_id: user.id,
        score,
        total_questions: total,
        percentage,
        grade: grade.label,
        quiz_type: department,
      }).then();
    }
  }, [score, total, percentage, grade.label, department, user]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="border-2 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center space-y-4">
          <Trophy className="h-12 w-12 mx-auto text-accent" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <Badge variant="secondary">{deptLabel}</Badge>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold font-mono">
              <span className={grade.color}>{percentage}%</span>
            </div>
            <p className="text-muted-foreground">
              {score} out of {total} correct
            </p>
            <Badge variant="secondary" className="text-sm">
              {grade.label}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="text-lg font-bold">{total - score}</div>
              <div className="text-xs text-muted-foreground">Missed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-lg font-bold">{percentage}%</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">{grade.message}</p>

          <p className="text-center text-xs text-muted-foreground">✓ Result saved</p>

          <div className="flex flex-col gap-3">
            <Button onClick={onRestart} variant="hero" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake {deptLabel} Quiz
            </Button>
            <Button onClick={onChangeDepartment} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Choose Another Department
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full gap-2">
                <Home className="h-4 w-4" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
