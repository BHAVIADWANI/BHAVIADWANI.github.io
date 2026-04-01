import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, type SubscriptionPlan } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Shield, Zap, Loader2, ArrowLeft, ExternalLink, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: "free" as SubscriptionPlan,
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Shield,
    features: [
      { name: "Organism database viewing", included: true },
      { name: "Basic quizzes", included: true },
      { name: "Basic flashcards", included: true },
      { name: "Limited instrument library", included: true },
      { name: "Limited protocol library", included: true },
      { name: "Limited virtual lab preview", included: true },
      { name: "Lab Calculator", included: false },
      { name: "Reference Library", included: false },
      { name: "Department modules", included: false },
      { name: "Molecular Docking", included: false },
      { name: "AI Tutor", included: false },
      { name: "BioLab 3D Simulations", included: false },
      { name: "Dashboard analytics", included: false },
    ],
  },
  {
    id: "standard" as SubscriptionPlan,
    name: "Standard",
    price: "₹99",
    period: "/month",
    icon: Zap,
    features: [
      { name: "Everything in Free", included: true },
      { name: "Microbial identification", included: true },
      { name: "Full instrument & protocol library", included: true },
      { name: "Extended quizzes & flashcards", included: true },
      { name: "Lab Calculator", included: true },
      { name: "Reference Library", included: true },
      { name: "Clinical Chemistry module", included: true },
      { name: "Hematology module", included: true },
      { name: "Immunology module", included: true },
      { name: "Blood Bank module", included: true },
      { name: "Pathology module", included: true },
      { name: "Organism comparison tool", included: true },
      { name: "AI Tutor", included: false },
      { name: "BioLab 3D / Molecular Docking", included: false },
      { name: "Dashboard analytics", included: false },
    ],
  },
  {
    id: "premium" as SubscriptionPlan,
    name: "Premium",
    price: "₹199",
    period: "/month",
    icon: Crown,
    features: [
      { name: "Everything in Standard", included: true },
      { name: "AI Tutor – full access", included: true },
      { name: "Image Recognition AI", included: true },
      { name: "Records storage system", included: true },
      { name: "AST analysis", included: true },
      { name: "Full case simulator", included: true },
      { name: "BioLab 3D simulations", included: true },
      { name: "Molecular Docking suite", included: true },
      { name: "Full virtual lab simulations", included: true },
      { name: "Dashboard analytics", included: true },
      { name: "Priority support", included: true },
    ],
  },
];

type Step = "plans" | "payment" | "success";

const Subscription = () => {
  const { user } = useAuth();
  const { plan: currentPlan, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (planId === "free") return;
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    setStep("payment");
  };

  const handleVerifyPayment = async () => {
    if (!user || !selectedPlan || !paymentRef.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
        body: { paymentId: paymentRef.trim(), planType: selectedPlan },
      });

      if (error) throw new Error(error.message || "Verification failed");
      if (!data?.verified) throw new Error(data?.error || "Payment verification failed");

      await refreshSubscription();
      setStep("success");
      toast({ title: "Subscription activated!", description: `Your ${selectedPlan} plan is now active.` });
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        {step === "plans" && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Choose Your Plan</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unlock powerful laboratory tools with a subscription that fits your needs.
              </p>
              {user && (
                <Badge variant="outline" className="text-sm">
                  Current Plan: <span className="font-bold capitalize ml-1">{currentPlan}</span>
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map((p) => {
                const isCurrent = p.id === currentPlan;
                const isPopular = p.id === "premium";
                return (
                  <Card key={p.id} className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <p.icon className={`h-10 w-10 mx-auto ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                      <CardTitle className="text-2xl">{p.name}</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">{p.price}</span>
                        <span className="text-muted-foreground">{p.period}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-2 flex-1 mb-6">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            {f.included ? (
                              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                            )}
                            <span className={f.included ? "" : "text-muted-foreground/60"}>{f.name}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isPopular ? "hero" : isCurrent ? "outline" : "default"}
                        className="w-full"
                        disabled={isCurrent || p.id === "free"}
                        onClick={() => handleSelectPlan(p.id)}
                      >
                        {isCurrent ? "Current Plan" : p.id === "free" ? "Free Forever" : `Subscribe – ${p.price}/mo`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {step === "payment" && selectedPlan && (
          <div className="max-w-lg mx-auto space-y-6">
            <Button variant="ghost" onClick={() => setStep("plans")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to plans
            </Button>
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  <span className="capitalize font-semibold">{selectedPlan}</span> Plan –{" "}
                  {selectedPlan === "standard" ? "₹99" : "₹199"}/month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">How to pay:</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Click the button below to open Razorpay payment page</li>
                    <li>Pay <strong>{selectedPlan === "standard" ? "₹99" : "₹199"}</strong> using UPI, Google Pay, PhonePe, Paytm, or Card</li>
                    <li>Copy your <strong>Razorpay Payment ID</strong> or <strong>Transaction ID</strong></li>
                    <li>Come back here and paste it below</li>
                  </ol>
                </div>

                <a
                  href="https://razorpay.me/@microidai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="default" className="w-full gap-2" type="button">
                    <CreditCard className="h-4 w-4" />
                    Pay via Razorpay
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">After payment</span></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentRef">Razorpay Payment ID / Transaction ID</Label>
                  <Input
                    id="paymentRef"
                    placeholder="e.g. pay_XXXXXXXXXXXXXX"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">You'll find this in your Razorpay receipt or UPI app transaction details</p>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleVerifyPayment}
                  disabled={loading || !paymentRef.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Verify Payment & Activate
                </Button>
              </CardContent>
            </Card>
          </div>
        )}


        {step === "success" && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="bg-success/10 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Check className="h-12 w-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Subscription Activated!</h2>
            <p className="text-muted-foreground">
              Your <strong className="capitalize">{selectedPlan}</strong> plan is now active. Enjoy all the features!
            </p>
            <Link to="/">
              <Button variant="hero">Go to Home</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;
