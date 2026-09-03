import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const TABLE = "kv_store_27283c63";

async function kvGet(key: string): Promise<unknown> {
  const { data } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  await supabase.from(TABLE).upsert({ key, value });
}

// ── Site content ──────────────────────────────────────────────────────────────
export const db = {
  getContent: () => kvGet("site_content"),
  putContent: (data: unknown) => kvSet("site_content", data),
  getAuthHashes: () => kvGet("auth_hashes"),
  putAuthHashes: (data: unknown) => kvSet("auth_hashes", data),
};

// ── User profiles (keyed by Supabase Auth user ID) ────────────────────────────
export interface UserProfile {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  plan: string;
  status: "active" | "inactive" | "pending" | "suspended";
  kyc: "0" | "1" | "2" | "3";
  joinDate: string;
  lastSeen: string;
  balance: number;
  fundsAdded: number;
  fundsWithdrawn: number;
  pnl: number;
  caseStatus: string;
  caseAmount: number;
  caseRef: string;
  procedureStep: number;
  notes: string;
  comments: unknown[];
  assignedAdvisor: string;
}

export const profiles = {
  get: async (userId: string): Promise<UserProfile | null> => {
    const all = (await kvGet("user_profiles")) as Record<string, UserProfile> | null;
    return all?.[userId] ?? null;
  },
  set: async (userId: string, profile: UserProfile): Promise<void> => {
    const all = ((await kvGet("user_profiles")) as Record<string, UserProfile> | null) ?? {};
    all[userId] = { ...profile, lastSeen: new Date().toISOString() };
    await kvSet("user_profiles", all);
  },
  getAll: async (): Promise<Record<string, UserProfile>> => {
    return ((await kvGet("user_profiles")) as Record<string, UserProfile> | null) ?? {};
  },
  update: async (userId: string, patch: Partial<UserProfile>): Promise<void> => {
    const all = ((await kvGet("user_profiles")) as Record<string, UserProfile> | null) ?? {};
    if (all[userId]) {
      all[userId] = { ...all[userId], ...patch, lastSeen: new Date().toISOString() };
      await kvSet("user_profiles", all);
    }
  },
};

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
};
