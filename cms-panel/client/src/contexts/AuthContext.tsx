import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type ResellerData, getStoredReseller, setStoredReseller, setToken, clearToken, getResellerMe } from "@/lib/api";

interface AuthContextType {
  reseller: ResellerData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loginSuccess: (token: string, reseller: ResellerData) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [reseller, setReseller] = useState<ResellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredReseller();
    if (stored) {
      setReseller(stored);
      getResellerMe()
        .then((fresh) => {
          setReseller(fresh);
          setStoredReseller(fresh);
        })
        .catch(() => {
          clearToken();
          setReseller(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginSuccess = (token: string, resellerData: ResellerData) => {
    setToken(token);
    setStoredReseller(resellerData);
    setReseller(resellerData);
  };

  const logout = () => {
    clearToken();
    setReseller(null);
  };

  const refreshProfile = async () => {
    try {
      const fresh = await getResellerMe();
      setReseller(fresh);
      setStoredReseller(fresh);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      reseller,
      isLoading,
      isAuthenticated: !!reseller,
      isSuperAdmin: reseller?.role === "super_admin",
      loginSuccess,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
