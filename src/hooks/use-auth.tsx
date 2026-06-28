import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      if (api.isAuthenticated()) {
        try {
          const response = await api.getProfile();
          if (response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Failed to get user profile:", error);
        }
      }
      setLoading(false);
    };

    initialize();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.user) {
      setUser(response.user);
    }
    return response;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const response = await api.register(email, password, username);
    if (response.user) {
      setUser(response.user);
    }
    return response;
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  return ctx;
}
