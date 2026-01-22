"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { cookieUtils } from "@/utils/cookies";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => Promise<string>;
  resetPass: (
    email: string,
    otp_type: string,
    code: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CHECK AUTH ON FIRST LOAD
  // ===============================
  useEffect(() => {
    const storedToken = cookieUtils.getAuthToken();

    if (cookieUtils.hasAuthToken() && storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else {
      setToken(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  // ===============================
  // AUTO REDIRECT IF NOT AUTH
  // ===============================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ===============================
  // WATCH COOKIE CHANGES (LOGOUT)
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      if (!cookieUtils.hasAuthToken() && isAuthenticated) {
        setToken(null);
        setIsAuthenticated(false);
        router.replace("/login");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.status !== "OK001") {
        console.error("Login failed:", json);
        return false;
      }

      const accessToken = json?.data?.token?.token;

      if (!accessToken) {
        console.error("Token not found:", json);
        return false;
      }

      cookieUtils.setAuthToken(accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ===============================
  // GET TOKEN
  // ===============================
  const getToken = async (): Promise<string> => {
    if (token) return token;

    const storedToken = cookieUtils.getAuthToken();
    if (storedToken) {
      setToken(storedToken);
      return storedToken;
    }

    throw new Error("No valid token found");
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    cookieUtils.removeAuthToken();
    setToken(null);
    setIsAuthenticated(false);
    router.replace("/login");
  };

  // ===============================
  // RESET PASSWORD
  // ===============================
  const resetPass = async (
    email: string,
    otp_type: string,
    code: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp_type, code }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.status !== "OK001") {
        console.error("Reset password failed:", json);
        return false;
      }

      const accessToken = json?.data?.token?.token;

      if (!accessToken) {
        console.error("Token not found:", json);
        return false;
      }

      cookieUtils.setAuthToken(accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      return false;
    }
  };

  // ===============================
  // PROVIDER
  // ===============================
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        loading,
        login,
        logout,
        getToken,
        resetPass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===============================
// HOOK
// ===============================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
