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

export const db = {
  getContent: () => kvGet("site_content"),
  putContent: (data: unknown) => kvSet("site_content", data),
  getUsers: () => kvGet("users"),
  putUsers: (data: unknown) => kvSet("users", data),
  getStaff: () => kvGet("staff"),
  putStaff: (data: unknown) => kvSet("staff", data),
  getAuthHashes: () => kvGet("auth_hashes"),
  putAuthHashes: (data: unknown) => kvSet("auth_hashes", data),
};
