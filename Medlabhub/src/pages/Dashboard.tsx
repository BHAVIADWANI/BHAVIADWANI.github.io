import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, TrendingUp, Calendar, BrainCircuit, Layers, BarChart3, PieChart, FlaskConical, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { DataVisualizationDashboard } from "@/components/dashboard/DataVisualizationDashboard";

interface QuizRecord {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  grade: string;
  created_at: string;
}

interface FlashcardStat {
  organism_name: string;
  correct_count: number;
  incorrect_count: number;
  last_reviewed: string;
}

const Dashboard = () => {
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);
  const [flashcardStats, setFlashcardStats] = useState<FlashcardStat[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      const [quizRes, flashRes] = await Promise.all([
        supabase
          .from("quiz_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("flashcard_progress")
          .select("*")
          .order("last_reviewed", { ascending: false }),
      ]);

      if (quizRes.data) setQuizHistory(quizRes.data);
      if (flashRes.data) setFlashcardStats(flashRes.data);
      setLoadingData(false);
    };

    fetchData();
  }, []);

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length)
    : 0;

  const bestScore = quizHistory.length > 0
    ? Math.max(...quizHistory.map((q) => q.percentage))
    : 0;

  const totalFlashcards = flashcardStats.reduce((s, f) => s + f.correct_count + f.incorrect_count, 0);
  const flashcardAccuracy = totalFlashcards > 0
    ? Math.round((flashcardStats.reduce((s, f) => s + f.correct_count, 0) / totalFlashcards) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress, visualize data, and explore analytics.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> My Progress</TabsTrigger>
            <TabsTrigger value="visualizations" className="gap-1.5 text-xs"><PieChart className="h-3.5 w-3.5" /> Data Visualizations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Quizzes Taken", value: quizHistory.length, icon: BrainCircuit, color: "text-primary" },
                { label: "Average Score", value: `${avgScore}%`, icon: Target, color: "text-primary" },
                { label: "Best Score", value: `${bestScore}%`, icon: Trophy, color: "text-primary" },
                { label: "Flashcard Accuracy", value: `${flashcardAccuracy}%`, icon: Layers, color: "text-primary" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quiz History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Quiz History</CardTitle>
                      <CardDescription>Your recent quiz results</CardDescription>
                    </div>
                    <Link to="/quiz"><Button variant="outline" size="sm">Take Quiz</Button></Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {quizHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BrainCircuit className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No quiz history yet.</p>
                      <Link to="/quiz"><Button variant="hero" size="sm" className="mt-3">Start Your First Quiz</Button></Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizHistory.slice(0, 8).map((quiz) => (
                        <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{quiz.grade}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(quiz.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Progress value={quiz.percentage} className="h-1.5" />
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-lg">{quiz.percentage}%</div>
                            <div className="text-xs text-muted-foreground">{quiz.score}/{quiz.total_questions}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Flashcard Progress */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Flashcard Progress</CardTitle>
                      <CardDescription>Organisms you've reviewed</CardDescription>
                    </div>
                    <Link to="/flashcards"><Button variant="outline" size="sm">Study</Button></Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {flashcardStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No flashcard sessions yet.</p>
                      <Link to="/flashcards"><Button variant="hero" size="sm" className="mt-3">Start Flashcards</Button></Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {flashcardStats.slice(0, 8).map((fc) => {
                        const total = fc.correct_count + fc.incorrect_count;
                        const pct = total > 0 ? Math.round((fc.correct_count / total) * 100) : 0;
                        return (
                          <div key={fc.organism_name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium italic text-sm truncate">{fc.organism_name}</p>
                              <Progress value={pct} className="h-1.5 mt-1" />
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold">{pct}%</div>
                              <div className="text-xs text-muted-foreground">{fc.correct_count}✓ {fc.incorrect_count}✗</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Identify Organism", href: "/identify", icon: Target },
                  { label: "Browse Database", href: "/database", icon: BarChart3 },
                  { label: "Take a Quiz", href: "/quiz", icon: BrainCircuit },
                  { label: "Study Flashcards", href: "/flashcards", icon: Layers },
                ].map((action) => (
                  <Link key={action.href} to={action.href}>
                    <Button variant="outline" className="w-full gap-2 h-auto py-4 justify-start">
                      <action.icon className="h-5 w-5 text-primary" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizations">
            <DataVisualizationDashboard />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
