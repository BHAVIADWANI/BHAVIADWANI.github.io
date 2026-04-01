import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalculatorCardProps {
  title: string;
  formula: string;
  reference?: string;
  children: React.ReactNode;
  result?: React.ReactNode;
  steps?: string[];
}

export function CalculatorCard({ title, formula, reference, children, result, steps }: CalculatorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block w-fit">{formula}</CardDescription>
        {reference && <Badge variant="outline" className="w-fit text-[10px]">{reference}</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">{children}</div>
        {steps && steps.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Step-by-step:</p>
            {steps.map((s, i) => <p key={i} className="text-xs font-mono">{i + 1}. {s}</p>)}
          </div>
        )}
        {result && (
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <p className="text-sm font-semibold">Result: {result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
