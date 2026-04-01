import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AITutor } from "@/components/virtual-lab/AITutor";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { BrainCircuit } from "lucide-react";

export default function AITutorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            AI Lab Assistant
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Your unified laboratory intelligence system — tutor, mentor, result interpreter, and diagnostic reasoning assistant across all clinical laboratory departments.
          </p>
        </div>
        <FeatureGate feature="ai_tutor" requiredPlan="premium">
          <AITutor fullPage />
        </FeatureGate>
      </main>
      <Footer />
    </div>
  );
}
