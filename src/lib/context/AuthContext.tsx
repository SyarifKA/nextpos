"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { cookieUtils } from "@/utils/cookies";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  username: string | null;
  role: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; retryAfter?: number }>;
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
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Guard to prevent duplicate redirects (React 19 strict mode re-runs effects)
  const redirectingRef = useRef(false);

  const safeRedirectToLogin = () => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    try {
      router.replace("/login");
    } catch (err) {
      console.warn("Redirect failed", err);
    }
  };


  // ===============================
  // CHECK AUTH ON FIRST LOAD
  // ===============================
  useEffect(() => {
    const storedToken = cookieUtils.getAuthToken();

    if (cookieUtils.hasAuthToken() && storedToken) {
      setToken(storedToken);
      setUsername(cookieUtils.getUsername() ?? null);
      setRole(cookieUtils.getRole() ?? null);
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
      safeRedirectToLogin();
    } else if (isAuthenticated) {
      // reset guard when re-authenticated
      redirectingRef.current = false;
    }
  }, [loading, isAuthenticated]);

  // ===============================
  // WATCH COOKIE CHANGES (LOGOUT)
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      if (!cookieUtils.hasAuthToken() && isAuthenticated) {
        setToken(null);
        setIsAuthenticated(false);
        safeRedirectToLogin();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
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
        // Parse Retry-After header (seconds) if present (sent on 429)
        let retryAfter: number | undefined;
        const retryHeader = res.headers.get("Retry-After");
        if (retryHeader) {
          const parsed = parseInt(retryHeader, 10);
          if (!isNaN(parsed) && parsed > 0) retryAfter = parsed;
        }

        console.error("Login failed:", json);
        return {
          success: false,
          message:
            json?.statusMessage || "Login gagal. Periksa email dan password.",
          retryAfter,
        };
      }

      const token = json?.data?.token?.token
      const { username, role } = json.data;

      if (!token) {
        console.error("Token not found:", json);
        return { success: false, message: "Token tidak ditemukan" };
      }

      cookieUtils.setAuthToken(token);
      cookieUtils.setUsername(username);
      cookieUtils.setRole(role);
      setToken(token);
      setUsername(username);
      setRole(role);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Tidak dapat terhubung ke server",
      };
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
    cookieUtils.removeUserMeta();

    setToken(null);
    setUsername(null);
    setRole(null);
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
        username,
        role,
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
