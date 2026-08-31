"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, setAccessToken, tryRefresh, type UserDTO } from "@/lib/api";

type SessionState = {
  user: UserDTO | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDTO>;
  register: (input: { email: string; password: string; fullName: string; phone?: string }) => Promise<UserDTO>;
  logout: () => Promise<void>;
  refreshUser: (user: UserDTO) => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ok = await tryRefresh();
      if (ok) {
        try {
          const me = await api.me();
          setUser(me);
        } catch {
          setAccessToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; fullName: string; phone?: string }) => {
      const res = await api.register(input);
      setAccessToken(res.accessToken);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // best-effort — clear local state regardless
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback((u: UserDTO) => setUser(u), []);

  return (
    <SessionContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export { ApiError };
