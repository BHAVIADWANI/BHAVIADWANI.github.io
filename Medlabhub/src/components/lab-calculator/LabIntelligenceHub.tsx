import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, BrainCircuit, Loader2, FlaskConical, Dna, Droplets, TestTubes, Activity, Microscope, Clock, Trash2, RotateCcw, GraduationCap, Beaker } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type HistoryEntry = { query: string; timestamp: Date };

const TEMPLATES = [
  { label: "Prepare solution", prompt: "How do I prepare 500 mL of 0.5 M NaCl solution?", icon: FlaskConical },
  { label: "Dilution", prompt: "Dilute 10 mL of 5M HCl to 0.1M. How much water do I need?", icon: TestTubes },
  { label: "PCR mix", prompt: "Calculate PCR master mix for 25 reactions, 50 µL each.", icon: Dna },
  { label: "Media prep", prompt: "How to prepare 1L of LB agar media?", icon: Beaker },
  { label: "CFU count", prompt: "Calculate CFU/mL from 32 colonies, 0.1 mL plated, 10^-5 dilution.", icon: Microscope },
  { label: "Hematology", prompt: "Calculate MCV, MCH, MCHC from Hb 14 g/dL, Hct 42%, RBC 4.7 million.", icon: Droplets },
  { label: "Beer-Lambert", prompt: "Calculate concentration using Beer-Lambert law: A=0.45, ε=6220, l=1 cm.", icon: Activity },
  { label: "DNA conc", prompt: "Calculate DNA concentration from A260=0.35 with 1:50 dilution.", icon: Dna },
];

export function LabIntelligenceHub() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explainMode, setExplainMode] = useState<"student" | "researcher">("student");
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem("lab-calc-history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    localStorage.setItem("lab-calc-history", JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setHistory(prev => [{ query: msg, timestamp: new Date() }, ...prev.filter(h => h.query !== msg)].slice(0, 20));

    try {
      const { data, error } = await supabase.functions.invoke("ai-lab-calculator", {
        body: {
          messages: newMessages,
          explainMode,
        },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.content || "I couldn't process that. Please try again." }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message || "Something went wrong."}` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="space-y-4">
      {/* Explain mode toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Explain as:</span>
        <Button size="sm" variant={explainMode === "student" ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => setExplainMode("student")}>
          <GraduationCap className="h-3 w-3" /> Student
        </Button>
        <Button size="sm" variant={explainMode === "researcher" ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => setExplainMode("researcher")}>
          <BrainCircuit className="h-3 w-3" /> Researcher
        </Button>
      </div>

      {/* Smart templates */}
      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Quick calculations</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEMPLATES.map(t => (
              <Button
                key={t.label}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-start gap-1.5 text-left"
                onClick={() => send(t.prompt)}
              >
                <t.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Lab Intelligence</span>
              <Badge variant="secondary" className="text-[10px]">AI-Powered</Badge>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={clearChat}>
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          <div className="h-[420px] overflow-y-auto border rounded-lg p-3 space-y-3 bg-muted/20">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-16 space-y-3">
                <BrainCircuit className="h-10 w-10 mx-auto opacity-40" />
                <p className="font-medium">Ask any laboratory calculation</p>
                <p className="text-xs max-w-md mx-auto">Type a question like "Prepare 250 mL of 0.5M NaCl" or use a quick template above. I'll auto-detect the calculation type, show the formula, and walk you through step-by-step.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border")}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:text-xs [&_.katex]:text-[0.85em]">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Calculating...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What do you want to calculate? e.g. 'Prepare 500 mL of 1M NaCl'"
              disabled={loading}
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0 h-[44px] w-[44px]">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center">AI uses validated formulas from CLSI, WHO, Tietz, Bailey & Scott. Always verify before lab use.</p>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && messages.length === 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setHistory([])}>Clear</Button>
            </div>
            <div className="space-y-1">
              {history.slice(0, 6).map((h, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/60 transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => send(h.query)}
                >
                  <RotateCcw className="h-3 w-3 shrink-0" />
                  <span className="truncate">{h.query}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
