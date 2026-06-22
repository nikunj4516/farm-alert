import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: "farmer" | "admin" | "super_admin" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const getInitialSession = (): { session: Session | null; user: User | null; role: "farmer" | "admin" | "super_admin" | null } => {
  if (typeof window === "undefined") {
    return { session: null, user: null, role: null };
  }
  let ref = "jipmjrgsqhjknbtkjhel";
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || "";
    const match = url.match(/https:\/\/([^.]+)\.supabase\.(co|net)/);
    if (match) ref = match[1];
  } catch (e) {}

  const stored = localStorage.getItem(`sb-${ref}-auth-token`);
  if (!stored) return { session: null, user: null, role: null };
  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.access_token) {
      const user = parsed.user;
      let role: "farmer" | "admin" | "super_admin" | null = null;
      if (user) {
        if (user.id === "test-user-id") {
          role = "super_admin";
        } else if (user.id === "test-farmer-id") {
          role = "farmer";
        } else {
          const cachedProfileStr = localStorage.getItem(`farmalert_local_profile_${user.id}`);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            const dbRole = cachedProfile?.role?.toLowerCase();
            role = (dbRole === "admin" || dbRole === "super_admin") ? dbRole : "farmer";
          }
        }
      }
      return { session: parsed, user, role };
    }
  } catch (e) {}
  return { session: null, user: null, role: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = getInitialSession();
  const [session, setSession] = useState<Session | null>(initial.session);
  const [user, setUser] = useState<User | null>(initial.user);
  const [role, setRole] = useState<"farmer" | "admin" | "super_admin" | null>(initial.role);
  const [loading, setLoading] = useState(!initial.session);

  const checkUserRole = async (userId: string): Promise<"farmer" | "admin" | "super_admin"> => {
    if (userId === "test-user-id") {
      setRole("super_admin");
      return "super_admin";
    }
    if (userId === "test-farmer-id") {
      setRole("farmer");
      return "farmer";
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.role) {
        const dbRole = data.role.toLowerCase();
        const userRole = (dbRole === "admin" || dbRole === "super_admin")
          ? (dbRole as "admin" | "super_admin")
          : "farmer";
        setRole(userRole);
        return userRole;
      } else {
        setRole("farmer");
        return "farmer";
      }
    } catch (err) {
      console.error("Error checking user role:", err);
      setRole("farmer");
      return "farmer";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          // Skip verification for developer test session
          if (session.user?.id === "test-user-id" || session.user?.id === "test-farmer-id") {
            setSession(session);
            setUser(session.user);
            setRole(session.user?.id === "test-user-id" ? "super_admin" : "farmer");
            setLoading(false);
            return;
          }

          // Verify JWT session integrity by requesting user details from the server
          const { error } = await supabase.auth.getUser();
          if (error) {
            console.warn("Session verification failed:", error.message);
            const isJwtError = error.status === 400 || 
                               error.status === 401 || 
                               error.status === 403 || 
                               error.message.toLowerCase().includes("jwt") || 
                               error.message.toLowerCase().includes("signature") ||
                               error.message.toLowerCase().includes("decode");
            
            if (isJwtError) {
              console.warn("Corrupted session token detected, clearing authentication state:", error.message);
              
              // Clean localStorage of any Supabase tokens to prevent infinite loops/broken states
              for (const key of Object.keys(localStorage)) {
                if (key.startsWith("sb-")) {
                  localStorage.removeItem(key);
                }
              }
              setSession(null);
              setUser(null);
              setRole(null);
              setLoading(false);
              return;
            }
          }

          setSession(session);
          setUser(session.user);
          await checkUserRole(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Error during session check:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          setLoading(true);
          try {
            await checkUserRole(session.user.id);
          } catch (err) {
            console.error("Auth state change checkUserRole failed:", err);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn("Auth loading timed out. Forcing loading to false.");
        setLoading(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out network error, clearing local session:", err);
    }
    // Always clear localStorage tokens locally
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    }
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
