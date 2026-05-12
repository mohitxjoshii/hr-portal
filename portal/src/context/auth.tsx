import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getSession, setSession, getUsers, saveUsers, seed, uid,
  getTheme, setTheme as persistTheme, type User, type Role,
} from "@/lib/storage";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (data: { name: string; email: string; password: string; role: Role }) => Promise<User>;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    seed();
    setUser(getSession());
    const t = getTheme();
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setLoading(false);
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    const u = getUsers().find(
      (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
    );
    if (!u) throw new Error("Invalid email or password");
    setSession(u);
    setUser(u);
    return u;
  };

  const signup: AuthCtx["signup"] = async ({ name, email, password, role }) => {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const newUser: User = { id: uid(), name, email, password, role };
    users.push(newUser);
    saveUsers(users);
    setSession(newUser);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setSession(null);
    setUser(null);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    persistTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout, theme, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
