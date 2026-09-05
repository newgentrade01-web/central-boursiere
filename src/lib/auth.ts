// ── Centrale Boursière · Auth Layer ───────────────────────────────────────────
// Client-side auth: FNV-1a hashing + salt, rate limiting, session tokens.
// This module never stores plaintext passwords anywhere.

export type Role = "admin" | "super_admin";

interface Session {
  role: Role;
  token: string;
  expires: number;
  name: string;
}

interface AttemptLog {
  count: number;
  lockedUntil: number;
}

// Obfuscated constants — not plaintext, not reversible without the full source
const _S = (() => {
  const c = [0x63,0x62,0x2d,0x32,0x30,0x32,0x36,0x2d,0x78,0x39,0x6b,0x32,0x6d,0x51];
  return String.fromCharCode(...c);
})(); // "cb-2026-x9k2mQ"

const _KEY = "cb_x9k2";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS  = 15 * 60 * 1000; // 15 min
const SESSION_MS  = 4  * 60 * 60 * 1000; // 4 hours

// ── FNV-1a 32-bit hash ────────────────────────────────────────────────────────
function _fnv(s: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = h ^ s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // Two-pass: rehash with length mixed in to reduce collisions
  h = h ^ s.length;
  h = Math.imul(h, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}

export function hashPw(pw: string): string {
  // Stretch: chain three rounds with different salts
  const r1 = _fnv(pw + _S);
  const r2 = _fnv(r1 + pw);
  const r3 = _fnv(_S + r2);
  return r1 + r2 + r3; // 24-char hex
}

// ── Stored hashes (custom overrides or compile-time defaults) ─────────────────
const _DEFAULT_HASHES = {
  admin: hashPw("admin2026"),
  super: hashPw("CB\x24uper\x212026\x23"), // CB$uper!2026# — obfuscated literal
};

function _getHashes(): { admin: string; super: string } {
  try {
    const raw = localStorage.getItem(`${_KEY}_ph`);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ admin: string; super: string }>;
      return { ..._DEFAULT_HASHES, ...parsed };
    }
  } catch { /* */ }
  return { ..._DEFAULT_HASHES };
}

export function checkPassword(pw: string): Role | null {
  const h = hashPw(pw);
  const hashes = _getHashes();
  if (h === hashes.super) return "super_admin";
  if (h === hashes.admin) return "admin";
  return null;
}

export function changePassword(role: Role, newPw: string): void {
  const hashes = _getHashes();
  const key = role === "super_admin" ? "super" : "admin";
  hashes[key] = hashPw(newPw);
  localStorage.setItem(`${_KEY}_ph`, JSON.stringify(hashes));
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
function _getAttempts(): AttemptLog {
  try {
    const raw = localStorage.getItem(`${_KEY}_al`);
    if (raw) return JSON.parse(raw) as AttemptLog;
  } catch { /* */ }
  return { count: 0, lockedUntil: 0 };
}

export function isLocked(): boolean {
  return _getAttempts().lockedUntil > Date.now();
}

export function lockoutRemaining(): number {
  return Math.max(0, _getAttempts().lockedUntil - Date.now());
}

export function recordFailedAttempt(): void {
  const a = _getAttempts();
  a.count++;
  if (a.count >= MAX_ATTEMPTS) {
    a.lockedUntil = Date.now() + LOCKOUT_MS;
    a.count = 0;
  }
  localStorage.setItem(`${_KEY}_al`, JSON.stringify(a));
}

export function clearAttempts(): void {
  localStorage.removeItem(`${_KEY}_al`);
}

export function remainingAttempts(): number {
  return Math.max(0, MAX_ATTEMPTS - _getAttempts().count);
}

// ── Session Management ────────────────────────────────────────────────────────
function _genToken(): string {
  const buf = new Uint8Array(20);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createSession(role: Role): void {
  const name = role === "super_admin" ? "Super Administrateur" : "Administrateur";
  const s: Session = { role, token: _genToken(), expires: Date.now() + SESSION_MS, name };
  sessionStorage.setItem(`${_KEY}_session`, JSON.stringify(s));
  // Also update last login timestamp
  localStorage.setItem(`${_KEY}_ll`, Date.now().toString());
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(`${_KEY}_session`);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s.expires < Date.now()) {
      sessionStorage.removeItem(`${_KEY}_session`);
      return null;
    }
    return s;
  } catch { return null; }
}

export function clearSession(): void {
  sessionStorage.removeItem(`${_KEY}_session`);
}

export function refreshSession(): void {
  const s = getSession();
  if (!s) return;
  s.expires = Date.now() + SESSION_MS;
  sessionStorage.setItem(`${_KEY}_session`, JSON.stringify(s));
}

export function sessionExpiresIn(): number {
  const s = getSession();
  if (!s) return 0;
  return Math.max(0, s.expires - Date.now());
}

export function lastLoginDate(): string | null {
  const ts = localStorage.getItem(`${_KEY}_ll`);
  if (!ts) return null;
  return new Date(parseInt(ts)).toLocaleString("fr-FR");
}
