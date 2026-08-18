import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { setLoading(false); return; }
    api.me()
      .then(r => setAdmin(r.admin))
      .catch(() => localStorage.removeItem("admin_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.login({ email, password });
    localStorage.setItem("admin_token", r.token);
    setAdmin(r.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
  }, []);

  return (
    <Ctx.Provider value={{ admin, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
