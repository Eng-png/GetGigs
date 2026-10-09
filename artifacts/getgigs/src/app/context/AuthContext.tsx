import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppRole, UserProfile } from "../lib/authTypes";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  role: Exclude<AppRole, "admin">;
};

type AuthResult = { needsEmailConfirmation?: boolean };

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeProfile(value: Record<string, unknown>): UserProfile {
  return {
    id: String(value.id || ""),
    role: (value.role as AppRole) || "artist",
    email: String(value.email || ""),
    display_name: String(value.display_name || ""),
    profile_photo_url: String(value.profile_photo_url || ""),
    city: String(value.city || ""),
    state: String(value.state || ""),
    country: String(value.country || ""),
    account_status: value.account_status === "suspended" ? "suspended" : "active",
    created_at: String(value.created_at || ""),
    updated_at: String(value.updated_at || ""),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) throw error;
    const next = normalizeProfile(data as Record<string, unknown>);
    if (next.account_status === "suspended") {
      await supabase.auth.signOut();
      setProfile(null);
      throw new Error("This account is currently suspended. Contact GetGigs support for help.");
    }
    setProfile(next);
  }, []);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) {
        setLoading(false);
        return;
      }
      setSession(data.session);
      try {
        await loadProfile(data.session?.user.id);
      } catch {
        setSession(null);
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(() => {
        void loadProfile(nextSession?.user.id).catch(() => { setSession(null); setProfile(null); }).finally(() => setLoading(false));
      }, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    profile,
    signUp: async ({ email, password, displayName, role }) => {
      if (!supabase) throw new Error("Supabase has not been configured for this site yet.");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, requested_role: role } },
      });
      if (error) throw error;
      if (data.session) await loadProfile(data.user?.id);
      return { needsEmailConfirmation: Boolean(data.user && !data.session) };
    },
    signIn: async (email, password) => {
      if (!supabase) throw new Error("Supabase has not been configured for this site yet.");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadProfile(data.user.id);
    },
    sendPasswordReset: async (email) => {
      if (!supabase) throw new Error("Supabase has not been configured for this site yet.");
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    updatePassword: async (password) => {
      if (!supabase) throw new Error("Supabase has not been configured for this site yet.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    signOut: async () => {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setSession(null);
      setProfile(null);
    },
    refreshProfile: async () => loadProfile(session?.user.id),
  }), [loading, session, profile, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
