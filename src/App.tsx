import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { PublicBlog } from "./components/PublicBlog";
import { PublicForm } from "./components/PublicForm";
import { ResetPassword } from "./components/auth/ResetPassword";
import { Profile } from "./components/auth/Profile";
import {
  publicAnonKey,
  projectId,
} from "./utils/supabase/info";

// Initialize Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
};

export type AppContextType = {
  user: User | null;
  session: any;
  supabase: typeof supabase;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<boolean>;
};

export const AppContext = React.createContext<AppContextType>({
  user: null,
  session: null,
  supabase,
  login: async () => false,
  logout: async () => {},
  signup: async () => false,
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "admin" | "blog" | "form" | "reset-password" | "profile"
  >("admin");
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
        } else {
          setSession(session);
          setUser((session?.user as User) || null);
        }

        // Set up refresh timer if session exists
        if (session) {
          const expiresAt = new Date((session.expires_at || 0) * 1000);
          const timeUntilExpiry = expiresAt.getTime() - Date.now();
          
          // Refresh 5 minutes before expiry
          const refreshTimeout = setTimeout(async () => {
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Session refresh error:", refreshError);
              await supabase.auth.signOut();
            } else if (newSession) {
              setSession(newSession);
              setUser((newSession?.user as User) || null);
            }
          }, timeUntilExpiry - 5 * 60 * 1000);

          return () => clearTimeout(refreshTimeout);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser((session?.user as User) || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        toast.error("Login failed: " + error.message);
        return false;
      }

      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login error occurred");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout error occurred");
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          "Signup failed: " + (result.error || "Unknown error"),
        );
        return false;
      }

      toast.success(
        "Account created successfully! Please log in.",
      );
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup error occurred");
      return false;
    }
  };

  const contextValue: AppContextType = {
    user,
    session,
    supabase,
    login,
    logout,
    signup,
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith("blog/")) {
        setCurrentView("blog");
        setSelectedSlug(hash.replace("blog/", ""));
      } else if (hash.startsWith("forms/")) {
        setCurrentView("form");
        setSelectedSlug(hash.replace("forms/", ""));
      } else if (hash === "reset-password") {
        setCurrentView("reset-password");
      } else if (hash === "profile") {
        setCurrentView("profile");
      } else {
        setCurrentView("admin");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () =>
      window.removeEventListener(
        "hashchange",
        handleHashChange,
      );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {currentView === "blog" ? (
          <PublicBlog slug={selectedSlug} />
        ) : currentView === "form" ? (
          <PublicForm slug={selectedSlug} />
        ) : currentView === "reset-password" ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <ResetPassword />
          </div>
        ) : currentView === "profile" && user ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Profile />
          </div>
        ) : user ? (
          <AdminDashboard />
        ) : (
          <Login />
        )}
        <Toaster position="top-right" />
      </div>
    </AppContext.Provider>
  );
}