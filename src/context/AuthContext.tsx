import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ data: any | null, error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

export const ADMIN_EMAILS = [
  "asraffmohamed33@gmail.com",
  "roshanrapido@gmail.com",
  "kickoffnutrition244@gmail.com"
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("INITIAL SESSION:", session);
      if (session?.user) {
        const isAdmin = !!session.user.email && ADMIN_EMAILS.includes(session.user.email);
        console.log("ADMIN DETECTION:", isAdmin);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          isAdmin,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`[AUTH] Event: ${_event}, User: ${session?.user?.email || 'none'}`);
      
      if (session?.user) {
        const isAdmin = !!session.user.email && ADMIN_EMAILS.includes(session.user.email);
        console.log(`[AUTH] Admin Detection: ${isAdmin}`);
        
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          isAdmin,
        });

        // Handle redirects on SIGN_IN
        // Only redirect if NOT already on an admin path to prevent infinite reload loops
        if (_event === 'SIGNED_IN') {
           const isAlreadyOnAdmin = window.location.pathname.startsWith('/admin');
           if (isAdmin && !isAlreadyOnAdmin) {
              console.log("[AUTH] Redirecting to Admin Dashboard...");
              window.location.href = '/admin';
           } else if (isAdmin && isAlreadyOnAdmin) {
              console.log("[AUTH] Already on admin path, skipping redirect.");
           }
        }
      } else {
        setUser(null);
        if (_event === 'SIGNED_OUT' && window.location.pathname !== '/') {
           console.log("[AUTH] Signed out, redirecting to home...");
           window.location.href = '/';
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    console.log("GOOGLE LOGIN START");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: "select_account" }
      }
    });
    return { error };
  };

  const logout = async () => {
    console.log("LOGOUT START");
    await supabase.auth.signOut();
  };

  const login = async (email: string, pass: string) => {
    console.log("LOGIN START:", email);
    return await supabase.auth.signInWithPassword({ email, password: pass });
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    console.log("SIGNUP START:", email);
    return await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name, name: name }
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signUp, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
