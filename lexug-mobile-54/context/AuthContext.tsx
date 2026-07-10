import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, AuthUser } from "@/services/api";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getToken().then((token) => {
      // The token alone doesn't carry the user's profile; a full session
      // restore (fetching /api/auth/me or similar) is a natural next step.
      // For now, presence of a token just means "not logged out."
      setIsLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const result = await authService.login(email, password);
        setUser({ uid: result.uid, email: result.email, displayName: result.displayName });
      },
      signup: async (email, password, displayName) => {
        await authService.signup(email, password, displayName);
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
