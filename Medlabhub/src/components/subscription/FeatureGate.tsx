import { useSubscription, type FeatureKey } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: "standard" | "premium";
}

export function FeatureGate({ feature, children, fallback, requiredPlan }: FeatureGateProps) {
  const { canAccess, plan } = useSubscription();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Sign In Required</h3>
        <p className="text-muted-foreground max-w-md">
          Please sign in to access this feature.
        </p>
        <Link to="/auth">
          <Button variant="hero">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  const planLabel = requiredPlan === "standard" ? "Standard" : "Premium";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
      <div className="relative">
        <Crown className="h-12 w-12 text-warning" />
        <Lock className="h-5 w-5 text-muted-foreground absolute -bottom-1 -right-1" />
      </div>
      <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
      <p className="text-muted-foreground max-w-md">
        This feature requires the <strong>{planLabel}</strong> plan or higher. Upgrade your subscription to unlock it.
      </p>
      <Link to="/subscription">
        <Button variant="hero" className="gap-2">
          <Crown className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </Link>
    </div>
  );
}
