/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/native";
import { clearBrowserPushSubscription } from "@/lib/push";
import { deletePushSubscriptionByEndpoint } from "@/lib/pushSubscriptions";

interface Profile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  experience_level: string | null;
  adult_verified_at: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  age_gate_blocked_at: string | null;
  age_gate_block_reason: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  requiresAgeVerification: boolean;
  isAgeGateBlocked: boolean;
  signUp: (email: string, password: string, name: string, birthDate: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  verifyAdultAccess: (birthDate: string) => Promise<{ allowed: boolean; error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
      return data;
    }

    setProfile(null);
    return null;
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setLoading(true);
        setTimeout(() => {
          void fetchProfile(nextSession.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    void supabase.auth.getSession().then(async ({ data: { session: nextSession } }) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, birthDate: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          name,
          birth_date: birthDate,
          adult_declaration: true,
          terms_accepted: true,
          privacy_accepted: true,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error as Error | null };
    }

    if (data.user) {
      const nextProfile = await fetchProfile(data.user.id);

      if (nextProfile?.age_gate_blocked_at) {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);

        return {
          error: new Error("Conta bloqueada porque o WEMOVELT e exclusivo para maiores de 18 anos."),
        };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    const currentUserId = user?.id ?? null;

    if (currentUserId) {
      try {
        const endpoint = await clearBrowserPushSubscription();

        if (endpoint) {
          await deletePushSubscriptionByEndpoint(endpoint, currentUserId);
        }
      } catch (error) {
        console.warn("Falha ao limpar push antes do logout:", error);
      }
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    return { error: error as Error | null };
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("Usuario nao autenticado") };
    }

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }

    return { error: error as Error | null };
  };

  const verifyAdultAccess = async (birthDate: string) => {
    const { data, error } = await supabase.rpc("verify_adult_profile", {
      p_accept_privacy: true,
      p_accept_terms: true,
      p_birth_date: birthDate,
    });

    if (error) {
      return { allowed: false, error: error as Error };
    }

    const result = data as { allowed?: boolean; message?: string } | null;
    await refreshProfile();

    if (result?.allowed) {
      return { allowed: true, error: null };
    }

    return {
      allowed: false,
      error: new Error(result?.message ?? "Nao foi possivel confirmar sua idade."),
    };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAgeGateBlocked = Boolean(profile?.age_gate_blocked_at);
  const requiresAgeVerification = Boolean(user && profile && !profile.adult_verified_at && !isAgeGateBlocked);
  const needsOnboarding = Boolean(profile && profile.adult_verified_at && !profile.goal && !profile.experience_level);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        needsOnboarding,
        requiresAgeVerification,
        isAgeGateBlocked,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        verifyAdultAccess,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
