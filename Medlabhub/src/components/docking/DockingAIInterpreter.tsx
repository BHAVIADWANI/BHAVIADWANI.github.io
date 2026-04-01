import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Send, Loader2, Atom } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { DockingResult } from "./DockingDashboard";

interface Props {
  result: DockingResult | null;
}

export function DockingAIInterpreter({ result }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const interpretResults = async () => {
    setLoading(true);
    setAnswer("");

    const context = result
      ? `Docking Results:\n- Protein: ${result.proteinName}\n- Ligand: ${result.ligandName}\n- Best Binding Affinity: ${result.bindingEnergy} kcal/mol\n- Total Poses: ${result.poses.length}\n- Exhaustiveness: ${result.exhaustiveness}\n- Grid: center(${result.gridCenter.x},${result.gridCenter.y},${result.gridCenter.z}) size(${result.gridSize.x}×${result.gridSize.y}×${result.gridSize.z})\n- All poses:\n${result.poses.map(p => `  Mode ${p.rank}: ${p.energy} kcal/mol, RMSD lb=${p.rmsd_lb}, ub=${p.rmsd_ub}`).join("\n")}`
      : "No docking results available yet.";

    const prompt = `You are an expert computational chemist and molecular docking specialist. You help researchers interpret AutoDock Vina docking results.

${context}

User question: ${question || "Please interpret these docking results and explain the binding affinity, pose quality, and potential implications for drug design."}

Provide a detailed scientific interpretation covering:
1. Binding affinity assessment (how strong is the predicted interaction?)
2. Pose analysis (what does the RMSD data tell us about pose reliability?)
3. Drug design implications
4. Limitations and next steps

Use validated scientific reasoning. Reference standard interpretive thresholds:
- ≤ -9 kcal/mol: Excellent binding
- -7 to -9 kcal/mol: Good binding  
- -5 to -7 kcal/mol: Moderate binding
- > -5 kcal/mol: Weak binding

End with: "AI interpretation — verify with experimental validation."`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { prompt, mode: "docking-interpreter" },
      });

      if (error) throw error;
      setAnswer(data.response || data.text || "No response received.");
    } catch (err: any) {
      toast.error("AI interpretation failed. Please try again.");
      setAnswer("Failed to generate interpretation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Docking Interpreter
        </CardTitle>
        <CardDescription>
          Get AI-powered interpretation of your docking results. Ask specific questions about binding affinity, pose quality, or drug design implications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
            <p><strong>Loaded Result:</strong> {result.proteinName} + {result.ligandName}</p>
            <p><strong>Best Affinity:</strong> {result.bindingEnergy} kcal/mol | <strong>Poses:</strong> {result.poses.length}</p>
          </div>
        )}

        <Textarea
          placeholder={result
            ? "Ask about the docking results (e.g., 'Is this binding affinity good enough for a drug candidate?') or leave empty for a full interpretation..."
            : "Ask any molecular docking question (e.g., 'How do I interpret a binding energy of -8.1 kcal/mol?')..."
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
        />

        <Button className="w-full gap-2" onClick={interpretResults} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? "Interpreting..." : result ? "Interpret Docking Results" : "Ask AI"}
        </Button>

        {answer && (
          <div className="p-4 rounded-lg border bg-card prose prose-sm dark:prose-invert max-w-none">
            <div className="flex items-center gap-2 mb-3">
              <Atom className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Interpretation</span>
            </div>
            <div className="whitespace-pre-wrap text-sm">{answer}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
