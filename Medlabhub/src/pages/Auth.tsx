import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Loader2, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NETWORK_HINTS = ["Failed to fetch", "NetworkError", "network", "ERR_NETWORK"];

function isNetworkMessage(msg: string) {
  return NETWORK_HINTS.some(h => msg.includes(h));
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-submit connectivity guard
    if (!navigator.onLine) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          const desc = isNetworkMessage(error.message)
            ? "Can't reach the authentication service right now. Please retry."
            : error.message;
          toast({ title: "Sign up failed", description: desc, variant: "destructive" });
        } else {
          toast({ title: "Account created!", description: "You are now signed in." });
          navigate("/");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          const desc = isNetworkMessage(error.message)
            ? "Can't reach the authentication service right now. Please retry."
            : error.message;
          toast({ title: "Sign in failed", description: desc, variant: "destructive" });
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? "";
      const desc = isNetworkMessage(msg)
        ? "Can't reach the authentication service right now. Please retry."
        : "An unexpected error occurred. Please try again.";
      toast({ title: "Connection error", description: desc, variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16 flex items-center justify-center">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
              <FlaskConical className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Sign up to access all MicroID features" : "Sign in to your MicroID account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
