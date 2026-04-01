import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export function AICalcAssistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-lab-calculator", {
        body: { messages: newMessages },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.content || "I couldn't process that. Please try again." }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message || "Something went wrong."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Laboratory Calculation Assistant
        </CardTitle>
        <p className="text-xs text-muted-foreground">Ask any laboratory calculation question — validated formulas only</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[400px] overflow-y-auto border rounded-lg p-3 space-y-3 bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-12 space-y-2">
              <BrainCircuit className="h-8 w-8 mx-auto opacity-50" />
              <p>Ask a calculation question, e.g.:</p>
              <p className="font-mono text-xs">"How do I prepare 250 mL of 0.5 M NaCl?"</p>
              <p className="font-mono text-xs">"Calculate MCV from Hct 42% and RBC 4.5"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-lg px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a lab calculation question..." disabled={loading} />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center">AI can make mistakes. Verify important calculations.</p>
      </CardContent>
    </Card>
  );
}
