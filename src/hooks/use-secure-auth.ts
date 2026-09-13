import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useEffect } from "react";

const SESSION_KEY = "railblock_session_token";

interface AuthUser {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  division?: string;
  zone?: string;
}

export function useSecureAuth() {
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useMutation(api.security.validateSession);
  const loginMutation = useMutation(api.security.login);
  const signUpMutation = useMutation(api.security.signUp);
  const logoutMutation = useMutation(api.security.logout);

  // Validate session on mount
  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem(SESSION_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await validateSession({ sessionToken: token });
        if (result) {
          setUser(result as AuthUser);
          setSessionToken(token);
        } else {
          localStorage.removeItem(SESSION_KEY);
          setSessionToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setSessionToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await loginMutation({
        email,
        password,
        ip: undefined,
        userAgent: navigator.userAgent,
      });
      localStorage.setItem(SESSION_KEY, result.sessionToken);
      setSessionToken(result.sessionToken);
      setUser({
        userId: result.userId,
        name: result.name,
        email: result.email,
        role: result.role,
        department: result.department,
        division: result.division,
        zone: result.zone,
      });
      // Store role for RBAC
      if (result.role) {
        sessionStorage.setItem("railblock_role", result.role);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [loginMutation]);

  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
    division?: string;
    zone?: string;
  }) => {
    setIsLoading(true);
    try {
      return await signUpMutation({
        ...data,
        role: data.role as "admin" | "approver" | "planner" | "field" | "viewer" | undefined,
        ip: undefined,
        userAgent: navigator.userAgent,
      });
    } finally {
      setIsLoading(false);
    }
  }, [signUpMutation]);

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await logoutMutation({ sessionToken });
      } catch { /* ignore */ }
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("railblock_role");
    setSessionToken(null);
    setUser(null);
  }, [sessionToken, logoutMutation]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signUp,
    logout,
  };
}
