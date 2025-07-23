// AuthContext.tsx
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  mode: string;
  id: number;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  checkAuth: () => Promise<void>;
  setAuth: (arg0: string) => void;
  loading: boolean;
}

const API = import.meta.env.VITE_API_BASE_URL;
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState("None");
  const [id, setId] = useState(-1);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/auth/request`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not authenticated");
      setMode(data.mode);
      setId(data.userId);
    } catch (err) {
      setMode("None");
    } finally {
      setLoading(false);
    }
  };

  const setAuth = (mode: string) => {
    setMode(mode);
    checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{ mode, id, setMode, checkAuth, setAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
