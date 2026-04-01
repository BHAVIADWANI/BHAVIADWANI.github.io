import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { IdentificationResults } from "./IdentificationResults";
import {
  gramStainVisuals,
  cellShapeVisuals,
  arrangementVisuals,
  oxygenVisuals,
  motilityVisuals,
  colonyColorVisuals,
  hemolysisVisuals,
  biochemicalTestVisuals,
  catalaseVisuals,
  oxidaseVisuals,
} from "@/lib/microbiologyVisuals";

interface FormData {
  gramStain: string;
  cellShape: string;
  arrangement: string;
  motility: string;
  oxygen: string;
  catalase: string;
  oxidase: string;
  biochemicalTests: string[];
  colonyColor: string;
  hemolysis: string;
}

const initialFormData: FormData = {
  gramStain: "",
  cellShape: "",
  arrangement: "",
  motility: "",
  oxygen: "",
  catalase: "",
  oxidase: "",
  biochemicalTests: [],
  colonyColor: "",
  hemolysis: "",
};

const biochemicalTestOptions = [
  "Lactose Fermentation", "Glucose Fermentation", "Sucrose Fermentation",
  "Mannitol Fermentation", "Indole Production", "Methyl Red",
  "Voges-Proskauer", "Citrate Utilization", "Urease",
  "H2S Production", "Nitrate Reduction", "Gelatin Hydrolysis",
  "Starch Hydrolysis", "Coagulase", "DNase",
  "Lipase", "Bile Esculin", "CAMP Test",
  "PYR Test", "Optochin Susceptibility", "Bacitracin Susceptibility",
  "Novobiocin Susceptibility", "Hippurate Hydrolysis", "Quellung Reaction",
];

const steps = [
  { id: 1, title: "Gram Stain & Morphology", icon: "🔬" },
  { id: 2, title: "Oxygen & Enzyme Tests", icon: "🧪" },
  { id: 3, title: "Biochemical Tests", icon: "⚗️" },
  { id: 4, title: "Colony Characteristics", icon: "🧫" },
];

export function IdentificationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBiochemicalTest = (test: string) => {
    const current = formData.biochemicalTests;
    const updated = current.includes(test)
      ? current.filter((t) => t !== test)
      : [...current, test];
    updateField("biochemicalTests", updated);
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const handleNewIdentification = () => {
    setShowResults(false);
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  if (showResults) {
    return <IdentificationResults formData={formData} onBack={handleNewIdentification} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.icon}
              </div>
              <span className="text-[10px] text-muted-foreground hidden md:block max-w-[80px] text-center leading-tight">
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-1 w-12 md:w-24 mx-2 rounded-full transition-all ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>{steps[currentStep - 1].icon}</span>
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Gram Stain & Morphology */}
          {currentStep === 1 && (
            <>
              <div className="space-y-4">
                <Label className="text-base font-medium">🔬 Gram Stain Result</Label>
                <RadioGroup
                  value={formData.gramStain}
                  onValueChange={(v) => updateField("gramStain", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  {["Gram Positive", "Gram Negative", "Variable", "Not Applicable"].map((option) => {
                    const visual = gramStainVisuals[option];
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.gramStain === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <div className={`w-5 h-5 rounded-full ${visual.color} shrink-0`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">🦠 Cell Shape</Label>
                <RadioGroup
                  value={formData.cellShape}
                  onValueChange={(v) => updateField("cellShape", v)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {["Cocci", "Bacilli", "Coccobacilli", "Spirilla", "Vibrio", "Pleomorphic", "Yeast", "Filamentous", "Diplococci"].map((option) => {
                    const visual = cellShapeVisuals[option] || { emoji: "🦠", description: "" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.cellShape === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <span className="text-xl">{visual.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">🔗 Cell Arrangement</Label>
                <RadioGroup
                  value={formData.arrangement}
                  onValueChange={(v) => updateField("arrangement", v)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {["Singles", "Pairs", "Chains", "Clusters", "Tetrads", "Palisades", "Diplococci", "Chinese Letters", "Filamentous"].map((option) => {
                    const visual = arrangementVisuals[option] || { emoji: "🔵", description: "" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.arrangement === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <span className="text-xl">{visual.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Step 2: Oxygen & Enzyme Tests */}
          {currentStep === 2 && (
            <>
              <div className="space-y-4">
                <Label className="text-base font-medium">🌬️ Oxygen Requirement</Label>
                <RadioGroup
                  value={formData.oxygen}
                  onValueChange={(v) => updateField("oxygen", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  {["Obligate Aerobe", "Facultative Anaerobe", "Obligate Anaerobe", "Microaerophilic", "Aerobe", "Obligate Intracellular"].map((option) => {
                    const visual = oxygenVisuals[option] || { emoji: "💨", description: "" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.oxygen === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <span className="text-xl">{visual.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">🏃 Motility</Label>
                <RadioGroup
                  value={formData.motility}
                  onValueChange={(v) => updateField("motility", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  {["Motile", "Non-motile"].map((option) => {
                    const visual = motilityVisuals[option] || { emoji: "❓", description: "" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.motility === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <span className="text-xl">{visual.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">🫧 Catalase Test</Label>
                  <RadioGroup
                    value={formData.catalase}
                    onValueChange={(v) => updateField("catalase", v)}
                    className="space-y-2"
                  >
                    {["Positive", "Negative"].map((option) => {
                      const visual = catalaseVisuals[option] || { emoji: "❓", description: "" };
                      return (
                        <Label
                          key={option}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                            formData.catalase === option ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value={option} />
                          <span className="text-xl">{visual.emoji}</span>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{option}</span>
                            <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">🟣 Oxidase Test</Label>
                  <RadioGroup
                    value={formData.oxidase}
                    onValueChange={(v) => updateField("oxidase", v)}
                    className="space-y-2"
                  >
                    {["Positive", "Negative"].map((option) => {
                      const visual = oxidaseVisuals[option] || { emoji: "❓", description: "" };
                      return (
                        <Label
                          key={option}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                            formData.oxidase === option ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <RadioGroupItem value={option} />
                          <span className="text-xl">{visual.emoji}</span>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{option}</span>
                            <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Biochemical Tests */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">⚗️ Select Positive Biochemical Tests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {biochemicalTestOptions.map((test) => {
                  const visual = biochemicalTestVisuals[test] || { emoji: "🧪" };
                  return (
                    <Label
                      key={test}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                        formData.biochemicalTests.includes(test) ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={formData.biochemicalTests.includes(test)}
                        onCheckedChange={() => toggleBiochemicalTest(test)}
                      />
                      <span className="text-lg">{visual.emoji}</span>
                      <span className="text-sm">{test}</span>
                    </Label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Colony Characteristics */}
          {currentStep === 4 && (
            <>
              <div className="space-y-4">
                <Label className="text-base font-medium">🎨 Colony Pigmentation</Label>
                <RadioGroup
                  value={formData.colonyColor}
                  onValueChange={(v) => updateField("colonyColor", v)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {["White/Cream", "Yellow", "Golden", "Orange", "Pink/Red", "Green", "Blue-green", "Mucoid", "Non-pigmented"].map((option) => {
                    const visual = colonyColorVisuals[option] || { color: "bg-gray-200 border-gray-400", emoji: "⚪" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.colonyColor === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <div className={`w-5 h-5 rounded-full border ${visual.color} shrink-0`} />
                        <span className="font-medium text-sm">{option}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">🩸 Hemolysis on Blood Agar</Label>
                <RadioGroup
                  value={formData.hemolysis}
                  onValueChange={(v) => updateField("hemolysis", v)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {["Alpha (α)", "Beta (β)", "Gamma (γ)", "Double zone", "None / Not applicable"].map((option) => {
                    const visual = hemolysisVisuals[option] || { emoji: "❓", color: "bg-gray-300", description: "" };
                    return (
                      <Label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.hemolysis === option ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option} />
                        <div className={`w-5 h-5 rounded-full ${visual.color} shrink-0`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{option}</span>
                          <span className="text-[11px] text-muted-foreground">{visual.description}</span>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Identify Organism
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
