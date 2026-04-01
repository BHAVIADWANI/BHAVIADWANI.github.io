import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle2, Microscope } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-12 flex-1">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Microscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Install MicroID</h1>
          <p className="text-muted-foreground text-lg">
            Get the full app experience — works offline, launches instantly, and feels native on your device.
          </p>
        </div>

        {isInstalled ? (
          <Card className="max-w-md mx-auto border-success/30">
            <CardContent className="pt-6 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <h2 className="text-xl font-semibold">Already Installed!</h2>
              <p className="text-muted-foreground">MicroID is installed on your device. You can launch it from your home screen.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Direct install (Android / Desktop Chrome) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Desktop / Android
                </CardTitle>
                <CardDescription>Chrome, Edge, or Android browser</CardDescription>
              </CardHeader>
              <CardContent>
                {deferredPrompt ? (
                  <Button onClick={handleInstall} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Install Now
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Look for the <strong>install icon</strong> in your browser's address bar, or open the browser menu and select <strong>"Install app"</strong>.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* iOS instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  iPhone / iPad
                </CardTitle>
                <CardDescription>Safari browser</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Tap the <strong>Share</strong> button (box with arrow)</p>
                <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                <p>3. Tap <strong>"Add"</strong> to confirm</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Install;
