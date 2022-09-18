import { createContext, useContext } from "react";

export type Auth = { authenticated: boolean };
const AuthContext = createContext<Auth>({ authenticated: false });

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (typeof ctx === "undefined") {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
