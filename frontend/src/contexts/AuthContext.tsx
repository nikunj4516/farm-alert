import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
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
              setLoading(false);
              return;
            }
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
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
        } else if (session) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
