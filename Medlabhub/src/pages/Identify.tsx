import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IdentificationWizard } from "@/components/identify/IdentificationWizard";
import { FeatureGate } from "@/components/subscription/FeatureGate";

const Identify = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Microorganism Identification</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter the observed characteristics and test results. Our AI will analyze the data and suggest potential organism matches.
          </p>
        </div>
        <FeatureGate feature="identification" requiredPlan="standard">
          <IdentificationWizard />
        </FeatureGate>
      </main>
      <Footer />
    </div>
  );
};

export default Identify;
