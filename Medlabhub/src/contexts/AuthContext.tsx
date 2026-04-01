import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NETWORK_ERROR_SIGNATURES = ["Failed to fetch", "NetworkError", "network", "ECONNREFUSED", "ERR_NETWORK"];
const MAX_RETRIES = 3;
const BACKOFF_MS = [400, 900, 1800];

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && NETWORK_ERROR_SIGNATURES.some(s => error.message.includes(s))) return true;
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as any).message);
    return NETWORK_ERROR_SIGNATURES.some(s => msg.includes(s));
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Retry wrapper that handles both thrown exceptions AND
   * resolved-but-errored auth responses containing network signatures.
   */
  async function withAuthRetry<T extends { error: AuthError | null }>(
    operation: () => Promise<T>
  ): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await operation();
        // If the SDK resolved but returned a network-type error, retry
        if (result.error && isNetworkError(result.error) && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, BACKOFF_MS[attempt] ?? 1800));
          continue;
        }
        return result;
      } catch (error) {
        if (isNetworkError(error) && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, BACKOFF_MS[attempt] ?? 1800));
          continue;
        }
        throw error;
      }
    }
    // Should not reach here, but satisfy TS
    return operation();
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const result = await withAuthRetry(() =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName },
        },
      })
    );
    return { error: result.error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const result = await withAuthRetry(() =>
      supabase.auth.signInWithPassword({ email, password })
    );
    return { error: result.error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      // Best-effort sign out; clear local state anyway
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
