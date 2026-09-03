import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const BASE = `https://${projectId}.supabase.co/functions/v1/server/make-server-27283c63`;

async function api<T>(path: string, method = "GET", body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export const db = {
  getContent: () => api<object>("/content"),
  putContent: (data: object) => api<{ ok: boolean }>("/content", "PUT", data),
  getUsers: () => api<unknown[]>("/users"),
  putUsers: (data: unknown[]) => api<{ ok: boolean }>("/users", "PUT", data),
  getStaff: () => api<unknown[]>("/staff"),
  putStaff: (data: unknown[]) => api<{ ok: boolean }>("/staff", "PUT", data),
  getAuthHashes: () => api<object>("/auth-hashes"),
  putAuthHashes: (data: object) => api<{ ok: boolean }>("/auth-hashes", "PUT", data),
};
