import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-27283c63/health", (c) => c.json({ status: "ok" }));

// ── Site Content ──────────────────────────────────────────────────────────────
app.get("/make-server-27283c63/content", async (c) => {
  const data = await kv.get("site_content");
  return c.json(data ?? null);
});

app.put("/make-server-27283c63/content", async (c) => {
  const body = await c.req.json();
  await kv.set("site_content", body);
  return c.json({ ok: true });
});

// ── Users ─────────────────────────────────────────────────────────────────────
app.get("/make-server-27283c63/users", async (c) => {
  const data = await kv.get("users");
  return c.json(data ?? []);
});

app.put("/make-server-27283c63/users", async (c) => {
  const body = await c.req.json();
  await kv.set("users", body);
  return c.json({ ok: true });
});

// ── Staff ─────────────────────────────────────────────────────────────────────
app.get("/make-server-27283c63/staff", async (c) => {
  const data = await kv.get("staff");
  return c.json(data ?? []);
});

app.put("/make-server-27283c63/staff", async (c) => {
  const body = await c.req.json();
  await kv.set("staff", body);
  return c.json({ ok: true });
});

// ── Auth hashes (admin passwords) ─────────────────────────────────────────────
app.get("/make-server-27283c63/auth-hashes", async (c) => {
  const data = await kv.get("auth_hashes");
  return c.json(data ?? null);
});

app.put("/make-server-27283c63/auth-hashes", async (c) => {
  const body = await c.req.json();
  await kv.set("auth_hashes", body);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
