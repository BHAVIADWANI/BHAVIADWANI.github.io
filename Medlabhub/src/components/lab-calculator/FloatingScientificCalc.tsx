import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, X } from "lucide-react";
import { cn } from "@/lib/utils";

const BUTTONS = [
  ["C", "(", ")", "⌫"],
  ["sin", "cos", "tan", "÷"],
  ["ln", "log", "√", "×"],
  ["π", "e", "^", "-"],
  ["7", "8", "9", "+"],
  ["4", "5", "6", "EE"],
  ["1", "2", "3", "."],
  ["0", "±", "=", ""],
];

export function FloatingScientificCalc() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const handlePress = (btn: string) => {
    if (btn === "C") { setDisplay("0"); setExpression(""); return; }
    if (btn === "⌫") { setDisplay(d => d.length > 1 ? d.slice(0, -1) : "0"); return; }
    if (btn === "±") { setDisplay(d => d.startsWith("-") ? d.slice(1) : "-" + d); return; }
    if (btn === "=") {
      try {
        const expr = expression
          .replace(/×/g, "*").replace(/÷/g, "/")
          .replace(/π/g, `${Math.PI}`).replace(/e(?![x])/g, `${Math.E}`)
          .replace(/sin\(/g, "Math.sin(").replace(/cos\(/g, "Math.cos(").replace(/tan\(/g, "Math.tan(")
          .replace(/ln\(/g, "Math.log(").replace(/log\(/g, "Math.log10(")
          .replace(/√\(/g, "Math.sqrt(").replace(/\^/g, "**");
        const r = Function('"use strict";return (' + expr + ')')();
        setDisplay(typeof r === "number" ? (Number.isInteger(r) ? r.toString() : r.toPrecision(10).replace(/\.?0+$/, "")) : "Error");
        setExpression(r.toString());
      } catch { setDisplay("Error"); }
      return;
    }
    if (["sin", "cos", "tan", "ln", "log", "√"].includes(btn)) {
      setExpression(e => e + btn + "(");
      setDisplay(d => (d === "0" ? btn + "(" : d + btn + "("));
      return;
    }
    if (btn === "EE") {
      setExpression(e => e + "e");
      setDisplay(d => d + "e");
      return;
    }
    const mapped = btn === "×" ? "×" : btn === "÷" ? "÷" : btn;
    if (display === "0" && ![".", "(", ")", "+", "-", "×", "÷", "^"].includes(btn)) {
      setDisplay(mapped);
      setExpression(btn);
    } else {
      setDisplay(d => d + mapped);
      setExpression(e => e + btn);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Scientific Calculator"
      >
        {open ? <X className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-72 bg-card border rounded-xl shadow-2xl p-3 space-y-2 animate-in slide-in-from-bottom-4">
          <p className="text-xs font-semibold text-center">Scientific Calculator</p>
          <div className="bg-muted rounded-lg p-2 text-right">
            <p className="text-[10px] text-muted-foreground font-mono truncate">{expression || " "}</p>
            <p className="text-lg font-mono font-bold truncate">{display}</p>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {BUTTONS.flat().filter(Boolean).map(btn => (
              <Button
                key={btn}
                variant={btn === "=" ? "default" : ["C", "⌫"].includes(btn) ? "destructive" : ["+", "-", "×", "÷", "^", "EE"].includes(btn) ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-xs font-mono"
                onClick={() => handlePress(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
