import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthStateChange,
} from "../lib/supabase.auth";
import type { User } from "@supabase/supabase-js";

interface SupabaseAuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initialize();

    const {
      data: { subscription },
    } = onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx)
    throw new Error(
      "useSupabaseAuth must be used within SupabaseAuthProvider"
    );
  return ctx;
}
