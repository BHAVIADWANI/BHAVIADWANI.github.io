import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Send, Loader2, Sparkles, Trash2, Copy, Check, GraduationCap, FlaskConical, BarChart3, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "learning" | "guidance" | "interpretation" | "diagnostic";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const MODES: { id: Mode; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  { id: "learning", label: "Learning", icon: GraduationCap, desc: "Concept explanations & theory", color: "text-blue-500" },
  { id: "guidance", label: "Lab Guidance", icon: FlaskConical, desc: "Step-by-step protocols", color: "text-emerald-500" },
  { id: "interpretation", label: "Result Interpreter", icon: BarChart3, desc: "Analyze lab results", color: "text-amber-500" },
  { id: "diagnostic", label: "Diagnostic Reasoning", icon: Stethoscope, desc: "Clinical case analysis", color: "text-rose-500" },
];

const MODE_SUGGESTIONS: Record<Mode, string[]> = {
  learning: [
    "Explain the principle and mechanism of Gram staining",
    "Explain the steps and principle of PCR amplification",
    "What are the types of ELISA and how do they work?",
    "Explain CBC parameters and their clinical significance",
    "Describe the complement system activation pathways",
    "Explain ABO blood group system and genetics",
  ],
  guidance: [
    "Guide me through a complete Gram staining protocol",
    "Step-by-step DNA extraction using column-based method",
    "How to perform ABO blood typing and crossmatch?",
    "Guide me through setting up a PCR reaction",
    "Protocol for performing an indirect ELISA",
    "How to prepare and read a peripheral blood smear?",
  ],
  interpretation: [
    "Interpret: Gram-positive cocci in clusters, catalase +, coagulase +",
    "Interpret CBC: WBC 15,000, Hb 8.5, Plt 450,000, MCV 68",
    "Interpret LFT: AST 250, ALT 300, ALP 120, Bilirubin 3.5",
    "Interpret: Zone diameter 14mm for Ciprofloxacin on E. coli",
    "Interpret crossmatch: IS compatible, 37°C incompatible, AHG incompatible",
    "Interpret ABG: pH 7.28, pCO2 55, HCO3 24, pO2 60",
  ],
  diagnostic: [
    "Patient: fever, cough, sputum culture shows mucoid colonies on MacConkey. CBC shows leukocytosis. Diagnose.",
    "20yr male: jaundice, dark urine. LFT: ALT 1200, AST 900, Bilirubin 8. Anti-HAV IgM positive. Analyze.",
    "Newborn: jaundice at 24hrs. Mother O+, Baby A+. DAT positive. What is happening?",
    "Patient with prolonged PT, normal aPTT, low fibrinogen, elevated D-dimer. Interpret and diagnose.",
  ],
};

export function AITutor({ context, fullPage }: { context?: Record<string, unknown>; fullPage?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("learning");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use the AI Lab Assistant.");
        setLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: [...messages, userMsg], context, mode }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to reach AI Lab Assistant");
      if (!assistantSoFar) {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." }]);
      }
    }
    setLoading(false);
  }, [loading, messages, context, mode]);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => setMessages([]);
  const suggestions = MODE_SUGGESTIONS[mode];
  const scrollAreaHeight = fullPage ? "h-[60vh]" : "h-72";
  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <Card className={`border-primary/20 ${fullPage ? "max-w-5xl mx-auto" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          MicroID AI Lab Assistant
          <Badge variant="secondary" className="text-xs ml-auto">
            <currentMode.icon className={`h-3 w-3 mr-1 ${currentMode.color}`} />
            {currentMode.label}
          </Badge>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-7 px-2 text-xs gap-1">
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-all ${
                  mode === m.id
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-muted/30 hover:bg-muted/60"
                }`}
              >
                <Icon className={`h-5 w-5 ${m.color}`} />
                <span className="font-medium">{m.label}</span>
                <span className="text-muted-foreground text-[10px] text-center leading-tight">{m.desc}</span>
              </button>
            );
          })}
        </div>

        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your intelligent laboratory companion. Select a mode above, then ask a question or pick a suggestion below.
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.slice(0, fullPage ? 6 : 3).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left flex items-start gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <ScrollArea className={scrollAreaHeight} ref={scrollRef as any}>
            <div className="space-y-4 pr-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm p-4 rounded-lg relative group ${
                    m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-4"
                  }`}
                >
                  <span className="text-xs font-semibold text-muted-foreground block mb-2">
                    {m.role === "user" ? "You" : "🧬 AI Lab Assistant"}
                  </span>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_img]:my-3 [&_img]:max-h-80 [&_img]:object-contain [&_a]:text-primary [&_a]:underline">
                      <ReactMarkdown
                        components={{
                          img: ({ node, ...props }) => (
                            <figure className="my-3">
                              <img {...props} loading="lazy" className="rounded-lg border border-border max-h-80 object-contain" />
                              {props.alt && <figcaption className="text-xs text-muted-foreground mt-1 italic">{props.alt}</figcaption>}
                            </figure>
                          ),
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80" />
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.role === "assistant" && !loading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(m.content, i)}
                    >
                      {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              ))}
              {loading && !messages.find((m, i) => m.role === "assistant" && i === messages.length - 1) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === "learning" ? "Ask a concept question…" :
              mode === "guidance" ? "Ask about a lab protocol…" :
              mode === "interpretation" ? "Enter lab results to interpret…" :
              "Describe a clinical case…"
            }
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center pt-1">
          AI Lab Assistant provides scientifically referenced answers. Always verify with primary sources.
        </p>
      </CardContent>
    </Card>
  );
}
