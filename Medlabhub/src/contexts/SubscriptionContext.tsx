import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "free" | "standard" | "premium";
export type SubscriptionStatus = "active" | "expired" | "pending";

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiryDate: string | null;
  loading: boolean;
  isAdmin: boolean;
  canAccess: (feature: FeatureKey) => boolean;
  refreshSubscription: () => Promise<void>;
}

export type FeatureKey =
  | "organism_database"
  | "basic_quiz"
  | "basic_flashcards"
  | "limited_instruments"
  | "limited_protocols"
  | "limited_virtual_lab"
  | "identification"
  | "case_simulator"
  | "virtual_lab"
  | "extended_quiz"
  | "extended_flashcards"
  | "full_instruments"
  | "full_protocols"
  | "ai_tutor"
  | "image_recognition"
  | "records"
  | "ast_analysis"
  | "full_case_simulator"
  | "full_virtual_lab"
  | "dashboard"
  | "lab_calculator"
  | "molecular_docking"
  | "reference_library"
  | "clinical_chemistry"
  | "hematology"
  | "immunology"
  | "blood_bank"
  | "pathology"
  | "compare"
  | "biolab_3d";

const FREE_FEATURES: FeatureKey[] = [
  "organism_database",
  "basic_quiz",
  "basic_flashcards",
  "limited_instruments",
  "limited_protocols",
  "limited_virtual_lab",
];

const STANDARD_FEATURES: FeatureKey[] = [
  ...FREE_FEATURES,
  "identification",
  "extended_quiz",
  "extended_flashcards",
  "full_instruments",
  "full_protocols",
  "lab_calculator",
  "reference_library",
  "clinical_chemistry",
  "hematology",
  "immunology",
  "blood_bank",
  "pathology",
  "compare",
];

const PREMIUM_FEATURES: FeatureKey[] = [
  ...STANDARD_FEATURES,
  "ai_tutor",
  "image_recognition",
  "records",
  "ast_analysis",
  "case_simulator",
  "full_case_simulator",
  "virtual_lab",
  "full_virtual_lab",
  "dashboard",
  "molecular_docking",
  "biolab_3d",
];

const PLAN_FEATURES: Record<SubscriptionPlan, FeatureKey[]> = {
  free: FREE_FEATURES,
  standard: STANDARD_FEATURES,
  premium: PREMIUM_FEATURES,
};

const ADMIN_EMAIL = "maanp4000@gmail.com";

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const isOwner = user?.email === ADMIN_EMAIL;

  const fetchSubscription = async () => {
    if (!user) {
      setPlan("free");
      setStatus("active");
      setExpiryDate(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Owner gets full premium access always
    if (isOwner) {
      setPlan("premium");
      setStatus("active");
      setExpiryDate(null);
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    try {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, status, expiry_date")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sub) {
        const isExpired = new Date(sub.expiry_date) < new Date();
        setPlan(isExpired ? "free" : (sub.plan as SubscriptionPlan));
        setStatus(isExpired ? "expired" : (sub.status as SubscriptionStatus));
        setExpiryDate(sub.expiry_date);
      } else {
        // Create free subscription if none exists
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan: "free",
          status: "active",
          expiry_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
        setPlan("free");
        setStatus("active");
      }

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsAdmin(roles?.some((r: any) => r.role === "admin") || false);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();

    if (user) {
      const channel = supabase
        .channel("subscription-changes")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchSubscription();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user?.id]);

  const canAccess = (feature: FeatureKey): boolean => {
    if (isOwner) return true;
    if (status !== "active") return false;
    return PLAN_FEATURES[plan].includes(feature);
  };

  return (
    <SubscriptionContext.Provider value={{ plan, status, expiryDate, loading, isAdmin: isAdmin || isOwner, canAccess, refreshSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}
