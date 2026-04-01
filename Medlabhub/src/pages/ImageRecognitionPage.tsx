import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ImageRecognition } from "@/components/image-recognition/ImageRecognition";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { ScanEye } from "lucide-react";

export default function ImageRecognitionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScanEye className="h-8 w-8 text-primary" />
            AI Image Recognition
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload laboratory images — Gram stains, colony plates, blood smears, histopathology slides, gel electrophoresis, ELISA results, and more — for AI-powered analysis with scientific interpretation and confidence scoring.
          </p>
        </div>
        <FeatureGate feature="image_recognition" requiredPlan="premium">
          <ImageRecognition />
        </FeatureGate>
      </main>
      <Footer />
    </div>
  );
}
