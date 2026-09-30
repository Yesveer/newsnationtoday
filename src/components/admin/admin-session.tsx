"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { refreshSession } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { Permission } from "@/lib/admin/permissions";
import type { AdminUser, UserRole } from "@/types/admin";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthValue {
  status: SessionStatus;
  user: AdminUser | null;
  permissions: Permission[];
  signIn: (email: string, password: string) => Promise<AdminUser>;
  signOut: () => Promise<void>;
  /** Re-reads the signed-in user — call it after editing your own profile. */
  reload: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

/**
 * Real session, backed by the Go API.
 *
 * On mount it spends the httpOnly refresh cookie for a fresh access token, so
 * a page reload keeps you signed in without ever putting a token in
 * localStorage where a script could read it.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Reads the session without touching React state, so both the boot effect and
  // `reload` can share it.
  const fetchSession = useCallback(async (): Promise<api.Session | null> => {
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    try {
      return await api.me();
    } catch {
      return null;
    }
  }, []);

  const apply = useCallback((session: api.Session | null) => {
    setUser(session?.user ?? null);
    setPermissions(session?.permissions ?? []);
    setStatus(session ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const session = await fetchSession();
      // Ignore a late answer if the provider unmounted in the meantime.
      if (active) apply(session);
    })();
    return () => {
      active = false;
    };
  }, [fetchSession, apply]);

  const reload = useCallback(async () => {
    apply(await fetchSession());
  }, [fetchSession, apply]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    setUser(session.user);
    setPermissions(session.permissions);
    setStatus("authenticated");
    return session.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setPermissions([]);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({ status, user, permissions, signIn, signOut, reload }),
    [status, user, permissions, signIn, signOut, reload],
  );

  return <AdminAuthContext value={value}>{children}</AdminAuthContext>;
}

/** Full auth state, including "not signed in". For the guard and login screen. */
export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}

/**
 * The signed-in session. Everything inside the portal shell renders only after
 * the guard has authenticated, so `user` is never null here.
 */
export function useAdminSession(): {
  user: AdminUser;
  role: UserRole;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
} {
  const { user, permissions } = useAdminAuth();

  // Permissions come from the API, so the UI can never show more than the
  // server will actually allow. Memoised because effects depend on it — an
  // unstable `can` would re-run every fetch on every render.
  const can = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  if (!user) {
    throw new Error("useAdminSession was used outside the authenticated portal");
  }

  return { user, role: user.role, permissions, can };
}
