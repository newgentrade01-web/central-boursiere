// ── Central Boursière · Admin Panel ──────────────────────────────────────────
// Role-based access: "admin" (standard) | "super_admin" (hidden elevated mode)
// Super-admin mode unlocked by using the elevated password — no UI hint.
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  loadContent, saveContent, resetContent,
  SiteContent, UserAccount, UserComment, StaffMember, FloatCard,
} from "../lib/content";
import { profiles } from "../lib/supabaseClient";
import {
  checkPassword, createSession, getSession, clearSession,
  isLocked, lockoutRemaining, recordFailedAttempt, clearAttempts,
  remainingAttempts, sessionExpiresIn, lastLoginDate, changePassword, Role,
} from "../lib/auth";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Palette / tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#07090F",
  surface: "#0D1117",
  panel:   "#111827",
  border:  "rgba(255,255,255,0.07)",
  borderHi:"rgba(255,255,255,0.14)",
  green:   "#10C96A",
  blue:    "#3B82F6",
  violet:  "#8B5CF6",
  amber:   "#F59E0B",
  rose:    "#F43F5E",
  cyan:    "#06B6D4",
  slate:   "#64748B",
  text:    "#F1F5F9",
  muted:   "rgba(241,245,249,0.45)",
  subtle:  "rgba(241,245,249,0.22)",
};

const STATUS_CLR: Record<string, string> = {
  active: C.green, inactive: C.slate, pending: C.amber, suspended: C.rose,
};
const STATUS_LBL: Record<string, string> = {
  active: "Actif", inactive: "Inactif", pending: "En attente", suspended: "Suspendu",
};
const CASE_LBL: Record<string, string> = {
  none: "Aucun", open: "Ouvert", forensics: "Forensics", legal: "Légal",
  negotiation: "Négociation", recovered: "Récupéré", closed: "Clôturé",
};
const CASE_CLR: Record<string, string> = {
  none: C.slate, open: C.blue, forensics: C.violet, legal: C.amber,
  negotiation: C.cyan, recovered: C.green, closed: "#475569",
};
const ROLE_LBL: Record<string, string> = {
  super_admin: "Super Admin", admin: "Administrateur", advisor: "Conseiller",
};
const ROLE_CLR: Record<string, string> = {
  super_admin: C.violet, admin: C.blue, advisor: C.cyan,
};
const PROC_STEPS = ["Aucun", "Ouverture", "Forensics", "Légal", "Négociation", "Récupéré"];

const REV_DATA = [
  { m: "Avr", v: 62000 }, { m: "Mai", v: 55000 }, { m: "Jun", v: 78000 },
  { m: "Jul", v: 91000 }, { m: "Aoû", v: 104000 }, { m: "Sep", v: 116000 },
];

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}
function uid() {
  return Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function genClientId(country: string): string {
  const cc = (country || "XX").slice(0, 2).toUpperCase();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `CB-${cc}${n}`;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────
const IS = { background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.text, fontSize: 13, borderRadius: 8 };
const IC = "w-full px-3 py-2 text-sm outline-none transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: C.subtle, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}
function TI({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className={IC} style={IS} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
function TTA({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea className={IC} style={{ ...IS, resize: "vertical" }} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function TN({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <input type="number" className={IC} style={IS} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
}
function TSel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return <select className={IC} style={IS} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>;
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center" style={{ background: `${color}1A`, color, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold" style={{ color: C.text }}>{title}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: C.border }} />
      <span style={{ color: C.subtle, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
  );
}

function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors"
        style={{ borderColor: value ? C.green + "60" : C.border, background: value ? C.green + "08" : "rgba(255,255,255,0.02)", minHeight: 72 }}
        onClick={() => ref.current?.click()}
      >
        {value
          ? <img src={value} alt="logo" className="h-10 object-contain" />
          : <span style={{ color: C.subtle, fontSize: 12 }}>Cliquez pour uploader une image</span>
        }
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
      }} />
      {value && <button onClick={() => onChange("")} style={{ color: C.rose, fontSize: 12 }}>✕ Supprimer</button>}
    </div>
  );
}

function ProcBar({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < step ? C.green : "rgba(255,255,255,0.08)" }} />
      ))}
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto rounded-2xl p-6`}
        style={{ background: "#0B0E17", border: `1px solid ${C.borderHi}`, boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold" style={{ color: C.text, fontSize: 15 }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Analytique
// ═══════════════════════════════════════════════════════════════════════════════
function TabAnalytics({ content }: { content: SiteContent }) {
  const users = content.users;
  const active = users.filter((u) => u.status === "active").length;
  const inactive = users.filter((u) => u.status === "inactive").length;
  const pending = users.filter((u) => u.status === "pending").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const totalFunds = users.reduce((s, u) => s + u.fundsAdded, 0);
  const totalWithdrawn = users.reduce((s, u) => s + u.fundsWithdrawn, 0);
  const totalBalance = users.reduce((s, u) => s + u.balance, 0);
  const totalRecovered = users.filter((u) => u.caseStatus === "recovered").reduce((s, u) => s + u.caseAmount, 0);
  const activeCases = users.filter((u) => ["open", "forensics", "legal", "negotiation"].includes(u.caseStatus)).length;
  const pnlTotal = users.reduce((s, u) => s + u.pnl, 0);

  const kpis = [
    { label: "Comptes Total", val: users.length, icon: "👥", color: C.blue },
    { label: "Actifs", val: active, icon: "✅", color: C.green },
    { label: "En attente", val: pending, icon: "⏳", color: C.amber },
    { label: "Suspendus", val: suspended, icon: "⛔", color: C.rose },
    { label: "Fonds Déposés", val: fmtUSD(totalFunds), icon: "💰", color: C.amber },
    { label: "Solde Plateforme", val: fmtUSD(totalBalance), icon: "🏦", color: C.violet },
    { label: "Fonds Retirés", val: fmtUSD(totalWithdrawn), icon: "📤", color: C.rose },
    { label: "Montant Récupéré", val: fmtUSD(totalRecovered), icon: "🔄", color: C.green },
    { label: "P&L Total", val: fmtUSD(pnlTotal), icon: pnlTotal >= 0 ? "📈" : "📉", color: pnlTotal >= 0 ? C.green : C.rose },
    { label: "Dossiers Actifs", val: activeCases, icon: "📋", color: C.cyan },
    { label: "Équipe", val: content.staff.filter((s) => s.active).length, icon: "🧑‍💼", color: C.blue },
    { label: "Taux Succès", val: "98.4%", icon: "⭐", color: C.amber },
  ];

  const statusData = [
    { name: "Actifs", value: active, color: C.green },
    { name: "Inactifs", value: inactive, color: C.slate },
    { name: "En attente", value: pending, color: C.amber },
    { name: "Suspendus", value: suspended, color: C.rose },
  ].filter((d) => d.value > 0);

  const stepData = PROC_STEPS.map((label, i) => ({
    step: label.slice(0, 4), count: users.filter((u) => u.procedureStep === i).length,
  }));

  const tooltipStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11 };

  return (
    <div className="space-y-5">
      <Heading title="Analytique Plateforme" sub={`Données en temps réel · ${users.length} comptes · ${content.staff.length} membres d'équipe`} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="flex items-center gap-3">
            <div className="text-xl shrink-0">{k.icon}</div>
            <div className="min-w-0">
              <div className="text-xs truncate" style={{ color: C.muted }}>{k.label}</div>
              <div className="font-bold text-base" style={{ color: k.color }}>{k.val}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>Revenus mensuels estimés</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={REV_DATA}>
              <XAxis dataKey="m" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenu"]} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="v" stroke={C.green} fill={C.green} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>Répartition des statuts</p>
          <div className="flex items-center gap-5">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={32}>
                  {statusData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: C.muted }}>{d.name}</span>
                  <span className="text-xs font-bold" style={{ color: C.text }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>Comptes par étape de procédure</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stepData}>
            <XAxis dataKey="step" tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.subtle, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={C.blue} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Comptes — enhanced with clientId, firstName, lastName, phone, comments
// ═══════════════════════════════════════════════════════════════════════════════
function UserEditModal({ user, staff, onSave, onClose }: { user: UserAccount; staff: StaffMember[]; onSave: (u: UserAccount) => void; onClose: () => void }) {
  const [u, setU] = useState<UserAccount>({ ...user });
  const [newComment, setNewComment] = useState("");
  const [commentAuthor] = useState(() => {
    const s = getSession();
    return s?.name ?? "Administrateur";
  });
  const [commentRole] = useState(() => getSession()?.role ?? "admin");

  const set = (k: keyof UserAccount, v: unknown) => setU((p) => ({ ...p, [k]: v }));

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: UserComment = {
      id: uid(), text: newComment.trim(),
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      author: commentAuthor, authorRole: commentRole,
    };
    setU((p) => ({ ...p, comments: [...(p.comments ?? []), comment] }));
    setNewComment("");
  };

  const delComment = (id: string) => setU((p) => ({ ...p, comments: (p.comments ?? []).filter((c) => c.id !== id) }));

  const advisors = staff.filter((s) => s.active);

  return (
    <Modal title={`Modifier — ${u.firstName} ${u.lastName} · ${u.clientId}`} onClose={onClose} wide>
      <div className="space-y-5">
        {/* Identity */}
        <SectionDivider label="Identité" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ID Client"><TI value={u.clientId} onChange={(v) => set("clientId", v)} /></Field>
          <Field label="Numéro de dossier"><TI value={u.caseRef} onChange={(v) => set("caseRef", v)} /></Field>
          <Field label="Prénom"><TI value={u.firstName} onChange={(v) => set("firstName", v)} /></Field>
          <Field label="Nom de famille"><TI value={u.lastName} onChange={(v) => set("lastName", v)} /></Field>
          <Field label="Email"><TI value={u.email} onChange={(v) => set("email", v)} /></Field>
          <Field label="Téléphone"><TI value={u.phone} onChange={(v) => set("phone", v)} /></Field>
          <Field label="Pays"><TI value={u.country} onChange={(v) => set("country", v)} /></Field>
          <Field label="Drapeau (emoji)"><TI value={u.flag} onChange={(v) => set("flag", v)} /></Field>
          <Field label="Date d'inscription"><TI value={u.joinDate} onChange={(v) => set("joinDate", v)} /></Field>
          <Field label="Dernière connexion"><TI value={u.lastSeen} onChange={(v) => set("lastSeen", v)} /></Field>
        </div>

        {/* Account settings */}
        <SectionDivider label="Compte & Plan" />
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Plan">
            <TSel value={u.plan} onChange={(v) => set("plan", v)}>
              <option>Professionnel</option>
              <option>Avancé</option>
              <option>VIP Institutionnel</option>
            </TSel>
          </Field>
          <Field label="Statut">
            <TSel value={u.status} onChange={(v) => set("status", v)}>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </TSel>
          </Field>
          <Field label="Niveau KYC">
            <TSel value={u.kyc} onChange={(v) => set("kyc", v)}>
              <option value="0">0 — Non vérifié</option>
              <option value="1">1 — Partiel</option>
              <option value="2">2 — Validé</option>
              <option value="3">3 — Institutionnel</option>
            </TSel>
          </Field>
          <Field label="Conseiller assigné">
            <TSel value={u.assignedAdvisor} onChange={(v) => set("assignedAdvisor", v)}>
              <option value="">— Non assigné —</option>
              {advisors.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({ROLE_LBL[s.role]})</option>
              ))}
            </TSel>
          </Field>
        </div>

        {/* Finances */}
        <SectionDivider label="Finances" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Solde actuel ($)"><TN value={u.balance} onChange={(v) => set("balance", v)} /></Field>
          <Field label="Fonds déposés ($)"><TN value={u.fundsAdded} onChange={(v) => set("fundsAdded", v)} /></Field>
          <Field label="Fonds retirés ($)"><TN value={u.fundsWithdrawn} onChange={(v) => set("fundsWithdrawn", v)} /></Field>
          <Field label="P&L ($)"><TN value={u.pnl} onChange={(v) => set("pnl", v)} /></Field>
        </div>

        {/* Procedure */}
        <SectionDivider label="Dossier & Procédure" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Montant dossier ($)"><TN value={u.caseAmount} onChange={(v) => set("caseAmount", v)} /></Field>
          <Field label="Statut dossier">
            <TSel value={u.caseStatus} onChange={(v) => set("caseStatus", v)}>
              {Object.entries(CASE_LBL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </TSel>
          </Field>
          <Field label="Étape procédure">
            <TSel value={String(u.procedureStep)} onChange={(v) => set("procedureStep", Number(v))}>
              {PROC_STEPS.map((s, i) => <option key={i} value={i}>{i} — {s}</option>)}
            </TSel>
          </Field>
        </div>
        <Field label="Notes internes"><TTA value={u.notes} onChange={(v) => set("notes", v)} rows={2} /></Field>

        {/* Comments */}
        <SectionDivider label="Commentaires & Suivi" />
        <div className="space-y-2">
          {(u.comments ?? []).length === 0 && (
            <p className="text-xs text-center py-3" style={{ color: C.subtle }}>Aucun commentaire pour le moment</p>
          )}
          {(u.comments ?? []).map((cm) => (
            <div key={cm.id} className="flex gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: C.text }}>{cm.author}</span>
                  <Pill label={ROLE_LBL[cm.authorRole] ?? cm.authorRole} color={ROLE_CLR[cm.authorRole] ?? C.slate} />
                  <span className="text-xs" style={{ color: C.subtle }}>{cm.date}</span>
                </div>
                <p className="text-xs" style={{ color: C.muted }}>{cm.text}</p>
              </div>
              <button onClick={() => delComment(cm.id)} style={{ color: C.rose, fontSize: 14, lineHeight: 1, padding: "2px 4px" }}>✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={IS}
            value={newComment}
            placeholder="Ajouter un commentaire..."
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button
            onClick={addComment}
            className="px-4 rounded-lg text-xs font-semibold shrink-0"
            style={{ background: newComment.trim() ? C.green : "rgba(255,255,255,0.07)", color: newComment.trim() ? "#000" : C.subtle }}
          >
            Ajouter
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => { onSave(u); onClose(); }} className="flex-1 rounded-xl py-2.5 text-sm font-bold" style={{ background: C.green, color: "#000" }}>
            Enregistrer
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UserCard({ user, staff, onEdit, onToggle, onDelete }: {
  user: UserAccount;
  staff: StaffMember[];
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const advisor = staff.find((s) => s.id === user.assignedAdvisor);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Identity block */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold"
              style={{ background: `${STATUS_CLR[user.status]}15`, border: `1px solid ${STATUS_CLR[user.status]}30` }}
            >
              {user.flag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="font-bold" style={{ color: C.text, fontSize: 14 }}>{user.firstName} {user.lastName}</span>
                <Pill label={STATUS_LBL[user.status]} color={STATUS_CLR[user.status]} />
                <Pill label={user.plan} color={C.slate} />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                <span style={{ color: C.subtle, fontSize: 11 }}>🆔 {user.clientId}</span>
                <span style={{ color: C.subtle, fontSize: 11 }}>✉️ {user.email}</span>
                {user.phone && <span style={{ color: C.subtle, fontSize: 11 }}>📞 {user.phone}</span>}
                <span style={{ color: C.subtle, fontSize: 11 }}>📅 {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-5 lg:gap-6 shrink-0">
            <div>
              <div className="text-xs mb-0.5" style={{ color: C.subtle }}>SOLDE</div>
              <div className="font-bold text-sm" style={{ color: user.balance > 0 ? C.green : C.slate }}>{fmtUSD(user.balance)}</div>
              <div className="text-xs" style={{ color: user.pnl >= 0 ? C.green + "AA" : C.rose + "AA" }}>
                P&L {user.pnl >= 0 ? "+" : ""}{fmtUSD(user.pnl)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: C.subtle }}>DOSSIER</div>
              <Pill label={CASE_LBL[user.caseStatus]} color={CASE_CLR[user.caseStatus]} />
              {user.caseAmount > 0 && <div className="text-xs mt-0.5" style={{ color: C.muted }}>{fmtUSD(user.caseAmount)}</div>}
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: C.subtle }}>PROCÉDURE</div>
              <div className="w-20"><ProcBar step={user.procedureStep} /></div>
              <div className="text-xs mt-0.5" style={{ color: C.muted }}>{PROC_STEPS[user.procedureStep]}</div>
            </div>
            {advisor && (
              <div>
                <div className="text-xs mb-0.5" style={{ color: C.subtle }}>CONSEILLER</div>
                <div className="text-xs font-semibold" style={{ color: C.cyan }}>{advisor.firstName} {advisor.lastName}</div>
                <div className="text-xs" style={{ color: C.subtle }}>{ROLE_LBL[advisor.role]}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: expanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", color: C.muted }}
            >
              {expanded ? "▲" : "▼"} {(user.comments ?? []).length > 0 ? `(${user.comments.length})` : ""}
            </button>
            <button onClick={onToggle} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: user.status === "active" ? `${C.rose}18` : `${C.green}18`, color: user.status === "active" ? C.rose : C.green }}>
              {user.status === "active" ? "Désactiver" : "Activer"}
            </button>
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${C.blue}18`, color: C.blue }}>
              Modifier
            </button>
            <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${C.rose}12`, color: C.rose }}>
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: comments + details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="pt-3 flex flex-wrap gap-4 text-xs" style={{ color: C.muted }}>
            <span>🔑 KYC Niveau {user.kyc}</span>
            <span>📁 Réf: {user.caseRef || "—"}</span>
            <span>👁 Vu: {user.lastSeen}</span>
            {user.notes && <span>📝 {user.notes}</span>}
          </div>
          {(user.comments ?? []).length > 0 && (
            <div className="space-y-1.5 mt-2">
              {user.comments.map((cm) => (
                <div key={cm.id} className="flex gap-2 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.025)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: C.text }}>{cm.author}</span>
                      <Pill label={ROLE_LBL[cm.authorRole] ?? cm.authorRole} color={ROLE_CLR[cm.authorRole] ?? C.slate} />
                      <span className="text-xs" style={{ color: C.subtle }}>{cm.date}</span>
                    </div>
                    <p className="text-xs" style={{ color: C.muted }}>{cm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabAccounts({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [advisorFilter, setAdvisorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "balance" | "date" | "status">("name");

  const users = content.users;

  const filtered = users
    .filter((u) => {
      if (filter !== "all" && u.status !== filter) return false;
      if (advisorFilter !== "all" && u.assignedAdvisor !== advisorFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!`${name} ${u.email} ${u.clientId} ${u.caseRef} ${u.country}`.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "balance") return b.balance - a.balance;
      if (sort === "date") return a.joinDate.localeCompare(b.joinDate);
      if (sort === "status") return a.status.localeCompare(b.status);
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

  const updateUser = useCallback((u: UserAccount) => onChange({ ...content, users: users.map((x) => x.id === u.id ? u : x) }), [content, users, onChange]);
  const addUser = (u: UserAccount) => onChange({ ...content, users: [...users, u] });
  const deleteUser = (id: string) => { if (confirm("Supprimer ce compte définitivement ?")) onChange({ ...content, users: users.filter((u) => u.id !== id) }); };
  const toggleStatus = (u: UserAccount) => updateUser({ ...u, status: u.status === "active" ? "inactive" : "active" });

  const blankUser: UserAccount = {
    id: `u${uid()}`, clientId: genClientId("XX"), firstName: "", lastName: "",
    email: "", phone: "", country: "", flag: "🌍",
    plan: "Professionnel", status: "pending", kyc: "0",
    joinDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    lastSeen: "Nouveau", balance: 0, fundsAdded: 0, fundsWithdrawn: 0, pnl: 0,
    caseStatus: "none", caseAmount: 0, caseRef: "", procedureStep: 0,
    notes: "", comments: [], assignedAdvisor: "",
  };

  const advisors = content.staff.filter((s) => s.active);

  return (
    <div className="space-y-4">
      {editing && <UserEditModal user={editing} staff={content.staff} onSave={updateUser} onClose={() => setEditing(null)} />}
      {adding && <UserEditModal user={blankUser} staff={content.staff} onSave={addUser} onClose={() => setAdding(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <Heading title="Gestion des Comptes" sub={`${filtered.length} / ${users.length} comptes · ${filtered.reduce((s, u) => s + u.balance, 0).toLocaleString("fr-FR")} $ solde total filtré`} />
        <button onClick={() => setAdding(true)} className="px-4 py-2 rounded-xl text-sm font-bold shrink-0" style={{ background: C.green, color: "#000" }}>
          + Nouveau compte
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "inactive", "pending", "suspended"]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{ background: filter === f ? C.green : "rgba(255,255,255,0.06)", color: filter === f ? "#000" : C.muted }}>
            {f === "all" ? `Tous (${users.length})` : `${STATUS_LBL[f]} (${users.filter((u) => u.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input placeholder="Rechercher nom, email, ID, pays…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-sm outline-none" style={{ ...IS, minWidth: 220 }} />
        <select value={advisorFilter} onChange={(e) => setAdvisorFilter(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-xs outline-none" style={IS}>
          <option value="all">Tous les conseillers</option>
          <option value="">Non assigné</option>
          {advisors.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg px-3 py-1.5 text-xs outline-none" style={IS}>
          <option value="name">Trier: Nom</option>
          <option value="balance">Trier: Solde</option>
          <option value="date">Trier: Date</option>
          <option value="status">Trier: Statut</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: C.subtle, fontSize: 13 }}>Aucun compte ne correspond aux filtres</div>
        )}
        {filtered.map((u) => (
          <UserCard key={u.id} user={u} staff={content.staff}
            onEdit={() => setEditing(u)} onToggle={() => toggleStatus(u)} onDelete={() => deleteUser(u.id)} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Équipe (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════
function StaffModal({ member, onSave, onClose }: { member: StaffMember; onSave: (s: StaffMember) => void; onClose: () => void }) {
  const [m, setM] = useState({ ...member });
  const set = (k: keyof StaffMember, v: unknown) => setM((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={member.id ? `Modifier — ${member.firstName} ${member.lastName}` : "Nouveau membre"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Prénom"><TI value={m.firstName} onChange={(v) => set("firstName", v)} /></Field>
          <Field label="Nom"><TI value={m.lastName} onChange={(v) => set("lastName", v)} /></Field>
          <Field label="Email"><TI value={m.email} onChange={(v) => set("email", v)} /></Field>
          <Field label="Téléphone"><TI value={m.phone} onChange={(v) => set("phone", v)} /></Field>
          <Field label="Rôle">
            <TSel value={m.role} onChange={(v) => set("role", v)}>
              <option value="advisor">Conseiller</option>
              <option value="admin">Administrateur</option>
              <option value="super_admin">Super Admin</option>
            </TSel>
          </Field>
          <Field label="Département"><TI value={m.department} onChange={(v) => set("department", v)} /></Field>
          <Field label="Date d'arrivée"><TI value={m.joinDate} onChange={(v) => set("joinDate", v)} /></Field>
          <Field label="Statut">
            <TSel value={m.active ? "active" : "inactive"} onChange={(v) => set("active", v === "active")}>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </TSel>
          </Field>
        </div>
        <Field label="Notes"><TTA value={m.notes} onChange={(v) => set("notes", v)} rows={2} /></Field>
        <div className="flex gap-3 pt-2">
          <button onClick={() => { onSave(m); onClose(); }} className="flex-1 rounded-xl py-2.5 text-sm font-bold" style={{ background: C.green, color: "#000" }}>Enregistrer</button>
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>Annuler</button>
        </div>
      </div>
    </Modal>
  );
}

function TabStaff({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [adding, setAdding] = useState(false);
  const staff = content.staff;

  const updateMember = (s: StaffMember) => onChange({ ...content, staff: staff.map((x) => x.id === s.id ? s : x) });
  const addMember = (s: StaffMember) => onChange({ ...content, staff: [...staff, { ...s, id: `s${uid()}` }] });
  const delMember = (id: string) => { if (confirm("Supprimer ce membre ?")) onChange({ ...content, staff: staff.filter((s) => s.id !== id) }); };

  const blank: StaffMember = { id: "", firstName: "", lastName: "", email: "", phone: "", role: "advisor", department: "", active: true, joinDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }), notes: "" };

  const clientsFor = (id: string) => content.users.filter((u) => u.assignedAdvisor === id).length;

  return (
    <div className="space-y-4">
      {editing && <StaffModal member={editing} onSave={updateMember} onClose={() => setEditing(null)} />}
      {adding && <StaffModal member={blank} onSave={addMember} onClose={() => setAdding(false)} />}

      <div className="flex items-start justify-between gap-3">
        <Heading title="Équipe & Conseillers" sub={`${staff.filter((s) => s.active).length} membres actifs · ${staff.length} au total`} />
        <button onClick={() => setAdding(true)} className="px-4 py-2 rounded-xl text-sm font-bold shrink-0" style={{ background: C.green, color: "#000" }}>+ Ajouter</button>
      </div>

      <div className="space-y-2">
        {staff.map((s) => (
          <Card key={s.id}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: `${ROLE_CLR[s.role]}15`, color: ROLE_CLR[s.role], border: `1px solid ${ROLE_CLR[s.role]}30` }}>
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: C.text }}>{s.firstName} {s.lastName}</span>
                    <Pill label={ROLE_LBL[s.role]} color={ROLE_CLR[s.role]} />
                    {!s.active && <Pill label="Inactif" color={C.slate} />}
                  </div>
                  <div className="flex gap-3 flex-wrap mt-0.5">
                    <span style={{ color: C.subtle, fontSize: 11 }}>✉️ {s.email}</span>
                    <span style={{ color: C.subtle, fontSize: 11 }}>🏢 {s.department}</span>
                    <span style={{ color: C.subtle, fontSize: 11 }}>📅 {s.joinDate}</span>
                    <span style={{ color: C.cyan, fontSize: 11, fontWeight: 600 }}>👥 {clientsFor(s.id)} client(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${C.blue}18`, color: C.blue }}>Modifier</button>
                <button onClick={() => delMember(s.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${C.rose}12`, color: C.rose }}>✕</button>
              </div>
            </div>
            {s.notes && <div className="mt-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.03)", color: C.muted }}>📝 {s.notes}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Structure Société (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════
function TabStructure({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const cs = content.companyStructure;
  const set = (k: keyof typeof cs, v: unknown) => onChange({ ...content, companyStructure: { ...cs, [k]: v as string } });
  const setDept = (i: number, k: string, v: string) => {
    const depts = cs.departments.map((d, idx) => idx === i ? { ...d, [k]: k === "size" ? Number(v) : v } : d);
    onChange({ ...content, companyStructure: { ...cs, departments: depts } });
  };
  const addDept = () => onChange({ ...content, companyStructure: { ...cs, departments: [...cs.departments, { name: "", head: "", headId: "", size: 1 }] } });
  const delDept = (i: number) => onChange({ ...content, companyStructure: { ...cs, departments: cs.departments.filter((_, idx) => idx !== i) } });

  return (
    <div className="space-y-5">
      <Heading title="Structure de la Société" sub="Informations légales et organigramme — accès Super Admin uniquement" />

      <Card className="space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🏛 Informations Légales</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Raison sociale"><TI value={cs.legalName} onChange={(v) => set("legalName", v)} /></Field>
          <Field label="Forme juridique"><TI value={cs.legalForm} onChange={(v) => set("legalForm", v)} /></Field>
          <Field label="SIRET"><TI value={cs.siret} onChange={(v) => set("siret", v)} /></Field>
          <Field label="Capital social"><TI value={cs.capital} onChange={(v) => set("capital", v)} /></Field>
          <Field label="Adresse"><TI value={cs.address} onChange={(v) => set("address", v)} /></Field>
          <Field label="Ville / Code postal"><TI value={cs.city} onChange={(v) => set("city", v)} /></Field>
          <Field label="Pays"><TI value={cs.country} onChange={(v) => set("country", v)} /></Field>
          <Field label="Téléphone principal"><TI value={cs.phone} onChange={(v) => set("phone", v)} /></Field>
          <Field label="Nom du PDG"><TI value={cs.ceoName} onChange={(v) => set("ceoName", v)} /></Field>
          <Field label="Email du PDG"><TI value={cs.ceoEmail} onChange={(v) => set("ceoEmail", v)} /></Field>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: C.muted }}>🏢 Organigramme des Départements</p>
          <button onClick={addDept} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Département</button>
        </div>
        <div className="space-y-3">
          {cs.departments.map((d, i) => (
            <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div className="flex justify-between items-center">
                <span style={{ color: C.muted, fontSize: 11 }}>Département #{i + 1}</span>
                <button onClick={() => delDept(i)} style={{ color: C.rose, fontSize: 12 }}>Supprimer</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <Field label="Nom"><TI value={d.name} onChange={(v) => setDept(i, "name", v)} /></Field>
                <Field label="Responsable"><TI value={d.head} onChange={(v) => setDept(i, "head", v)} /></Field>
                <Field label="Effectif">
                  <input type="number" className={IC} style={IS} value={d.size} onChange={(e) => setDept(i, "size", e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Sécurité (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════
function TabSecurity() {
  const [newAdminPw, setNewAdminPw] = useState("");
  const [newSuperPw, setNewSuperPw] = useState("");
  const [confirmAdminPw, setConfirmAdminPw] = useState("");
  const [confirmSuperPw, setConfirmSuperPw] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSuper, setShowSuper] = useState(false);
  const session = getSession();

  const notify = (text: string, ok: boolean) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const changeAdmin = () => {
    if (newAdminPw.length < 8) return notify("Le mot de passe doit contenir au moins 8 caractères.", false);
    if (newAdminPw !== confirmAdminPw) return notify("Les mots de passe ne correspondent pas.", false);
    changePassword("admin", newAdminPw);
    setNewAdminPw(""); setConfirmAdminPw("");
    notify("Mot de passe Admin modifié avec succès.", true);
  };

  const changeSuper = () => {
    if (newSuperPw.length < 12) return notify("Le mot de passe Super Admin doit contenir au moins 12 caractères.", false);
    if (newSuperPw !== confirmSuperPw) return notify("Les mots de passe ne correspondent pas.", false);
    changePassword("super_admin", newSuperPw);
    setNewSuperPw(""); setConfirmSuperPw("");
    notify("Mot de passe Super Admin modifié avec succès.", true);
  };

  const expiresMins = Math.round(sessionExpiresIn() / 60000);

  return (
    <div className="space-y-5">
      <Heading title="Sécurité & Accès" sub="Gestion des mots de passe, sessions et audit — Super Admin uniquement" />

      {/* Session info */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🔐 Session Active</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-xs mb-1" style={{ color: C.subtle }}>RÔLE</div>
            <div className="font-bold text-sm" style={{ color: C.violet }}>{session?.name ?? "—"}</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-xs mb-1" style={{ color: C.subtle }}>EXPIRATION</div>
            <div className="font-bold text-sm" style={{ color: expiresMins < 30 ? C.amber : C.green }}>
              {expiresMins > 0 ? `${expiresMins} min` : "Expirée"}
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-xs mb-1" style={{ color: C.subtle }}>DERNIÈRE CONNEXION</div>
            <div className="font-bold text-sm" style={{ color: C.text }}>{lastLoginDate() ?? "—"}</div>
          </div>
        </div>
      </Card>

      {/* Rate limiting info */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🛡 Protection Brute-Force</p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div style={{ color: C.subtle }}>Tentatives max</div>
            <div className="font-bold mt-0.5" style={{ color: C.text }}>5 tentatives puis 15 min de blocage</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div style={{ color: C.subtle }}>Durée de session</div>
            <div className="font-bold mt-0.5" style={{ color: C.text }}>4 heures (renouvellement automatique)</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div style={{ color: C.subtle }}>Stockage mots de passe</div>
            <div className="font-bold mt-0.5" style={{ color: C.text }}>FNV-1a 3-pass + sel — jamais en clair</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div style={{ color: C.subtle }}>Jetons de session</div>
            <div className="font-bold mt-0.5" style={{ color: C.text }}>40 hex chars · crypto.getRandomValues</div>
          </div>
        </div>
        <button onClick={() => { clearAttempts(); notify("Compteur de tentatives remis à zéro.", true); }}
          className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: `${C.amber}18`, color: C.amber }}>
          Réinitialiser compteur de tentatives
        </button>
      </Card>

      {/* Change admin password */}
      <Card className="space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🔑 Modifier Mot de Passe Admin</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nouveau mot de passe">
            <div className="relative">
              <input type={showAdmin ? "text" : "password"} className={`${IC} pr-9`} style={IS} value={newAdminPw} onChange={(e) => setNewAdminPw(e.target.value)} />
              <button onClick={() => setShowAdmin((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: C.subtle }}>{showAdmin ? "🙈" : "👁"}</button>
            </div>
          </Field>
          <Field label="Confirmer">
            <input type={showAdmin ? "text" : "password"} className={IC} style={IS} value={confirmAdminPw} onChange={(e) => setConfirmAdminPw(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, newAdminPw.length * 8)}%`,
              background: newAdminPw.length < 8 ? C.rose : newAdminPw.length < 12 ? C.amber : C.green,
            }} />
          </div>
          <span className="text-xs shrink-0" style={{ color: C.subtle }}>
            {newAdminPw.length < 8 ? "Faible" : newAdminPw.length < 12 ? "Moyen" : "Fort"}
          </span>
        </div>
        <button onClick={changeAdmin} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: C.blue, color: "#fff" }}>
          Mettre à jour le mot de passe Admin
        </button>
      </Card>

      {/* Change super admin password */}
      <Card className="space-y-4" style={{ border: `1px solid ${C.violet}30` }}>
        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: C.violet }}>
          <span>👑</span> Modifier Mot de Passe Super Admin
          <span className="text-xs font-normal" style={{ color: C.subtle }}>— Min. 12 caractères requis</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nouveau mot de passe">
            <div className="relative">
              <input type={showSuper ? "text" : "password"} className={`${IC} pr-9`} style={IS} value={newSuperPw} onChange={(e) => setNewSuperPw(e.target.value)} />
              <button onClick={() => setShowSuper((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: C.subtle }}>{showSuper ? "🙈" : "👁"}</button>
            </div>
          </Field>
          <Field label="Confirmer">
            <input type={showSuper ? "text" : "password"} className={IC} style={IS} value={confirmSuperPw} onChange={(e) => setConfirmSuperPw(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, newSuperPw.length * 6)}%`,
              background: newSuperPw.length < 12 ? C.rose : newSuperPw.length < 16 ? C.amber : C.green,
            }} />
          </div>
          <span className="text-xs shrink-0" style={{ color: C.subtle }}>
            {newSuperPw.length < 12 ? "Insuffisant" : newSuperPw.length < 16 ? "Acceptable" : "Excellent"}
          </span>
        </div>
        <button onClick={changeSuper} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: C.violet, color: "#fff" }}>
          Mettre à jour le mot de passe Super Admin
        </button>
      </Card>

      {msg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          style={{ background: msg.ok ? C.green : C.rose, color: "#000", minWidth: 240 }}>
          {msg.ok ? "✓ " : "✗ "}{msg.text}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Branding Tab
// ═══════════════════════════════════════════════════════════════════════════════
function TabBranding({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const br = content.branding;
  const setBr = (k: keyof typeof br, v: string) => onChange({ ...content, branding: { ...br, [k]: v } });
  const setCard = (i: number, k: keyof FloatCard, v: string) => {
    const cards = [...content.floatCards] as [FloatCard, FloatCard, FloatCard, FloatCard];
    cards[i] = { ...cards[i], [k]: v };
    onChange({ ...content, floatCards: cards });
  };

  return (
    <div className="space-y-5">
      <Heading title="Branding & Identité Visuelle" sub="Logo, couleurs, navbar, cartes flottantes hero" />

      <Card className="space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🔠 Navbar</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Titre principal"><TI value={br.navbarTitle} onChange={(v) => setBr("navbarTitle", v)} /></Field>
          <Field label="Sous-titre"><TI value={br.navbarSubtitle} onChange={(v) => setBr("navbarSubtitle", v)} /></Field>
        </div>
        <Field label="Logo (remplace l'image par défaut)">
          <ImageUpload value={br.logoUrl} onChange={(v) => setBr("logoUrl", v)} />
        </Field>
      </Card>

      <Card className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>🎨 Couleurs</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {([["primaryColor", "Couleur principale"], ["accentColor", "Couleur accentuée"]] as [keyof typeof br, string][]).map(([k, label]) => (
            <Field key={k} label={label}>
              <div className="flex gap-2 items-center">
                <input type="color" value={br[k]} onChange={(e) => setBr(k, e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer" style={{ background: "transparent", border: "none" }} />
                <TI value={br[k]} onChange={(v) => setBr(k, v)} />
              </div>
            </Field>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-4" style={{ color: C.muted }}>🪄 Cartes Flottantes Hero</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {content.floatCards.map((card, i) => (
            <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{card.icon}</span>
                <span style={{ color: C.subtle, fontSize: 11 }}>Carte #{i + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Icône"><TI value={card.icon} onChange={(v) => setCard(i, "icon", v)} /></Field>
                <Field label="Couleur accent">
                  <div className="flex gap-2 items-center">
                    <input type="color" value={card.accent} onChange={(e) => setCard(i, "accent", e.target.value)} className="w-8 h-8 rounded cursor-pointer" style={{ background: "transparent", border: "none" }} />
                    <TI value={card.accent} onChange={(v) => setCard(i, "accent", v)} />
                  </div>
                </Field>
              </div>
              <Field label="Titre"><TI value={card.title} onChange={(v) => setCard(i, "title", v)} /></Field>
              <Field label="Valeur principale"><TI value={card.val} onChange={(v) => setCard(i, "val", v)} /></Field>
              <Field label="Sous-titre"><TI value={card.sub} onChange={(v) => setCard(i, "sub", v)} /></Field>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Content tabs (Hero, Stats, Services, Pricing, Reviews, FAQ, Blog, Partners, Co)
// ═══════════════════════════════════════════════════════════════════════════════
function TabHero({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const h = content.hero;
  const set = (k: keyof typeof h, v: string) => onChange({ ...content, hero: { ...h, [k]: v } });
  return (
    <div className="space-y-5">
      <Heading title="Section Hero" />
      <Card className="space-y-4">
        <Field label="Badge"><TI value={h.badge} onChange={(v) => set("badge", v)} /></Field>
        <Field label="Titre ligne 1"><TI value={h.title1} onChange={(v) => set("title1", v)} /></Field>
        <Field label="Titre ligne 2"><TI value={h.title2} onChange={(v) => set("title2", v)} /></Field>
        <Field label="Titre ligne 3"><TI value={h.title3} onChange={(v) => set("title3", v)} /></Field>
        <Field label="Sous-titre"><TTA value={h.subtitle} onChange={(v) => set("subtitle", v)} /></Field>
        <Field label="Bouton principal"><TI value={h.cta1} onChange={(v) => set("cta1", v)} /></Field>
        <Field label="Bouton secondaire"><TI value={h.cta2} onChange={(v) => set("cta2", v)} /></Field>
      </Card>
    </div>
  );
}

function TabStats({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const s = content.stats;
  const set = (k: keyof typeof s, v: number) => onChange({ ...content, stats: { ...s, [k]: v } });
  return (
    <div className="space-y-5">
      <Heading title="Statistiques Clés" />
      <Card className="grid sm:grid-cols-2 gap-4">
        <Field label="Dossiers traités"><TN value={s.dossiers} onChange={(v) => set("dossiers", v)} /></Field>
        <Field label="Fonds récupérés (M$)"><TN value={s.recovered} onChange={(v) => set("recovered", v)} /></Field>
        <Field label="Pays couverts"><TN value={s.countries} onChange={(v) => set("countries", v)} /></Field>
        <Field label="Taux succès (984 = 98.4%)"><TN value={s.successRate} onChange={(v) => set("successRate", v)} /></Field>
      </Card>
    </div>
  );
}

function TabServices({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const svc = content.services;
  const set = (i: number, k: string, v: string) => onChange({ ...content, services: svc.map((s, idx) => idx === i ? { ...s, [k]: v } : s) });
  const add = () => onChange({ ...content, services: [...svc, { icon: "🔧", title: "", desc: "", tag: "", color: C.green }] });
  const del = (i: number) => onChange({ ...content, services: svc.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><Heading title="Services" /><button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Ajouter</button></div>
      {svc.map((s, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex justify-between"><span style={{ color: C.subtle, fontSize: 11 }}>#{i + 1}</span><button onClick={() => del(i)} style={{ color: C.rose, fontSize: 11 }}>Supprimer</button></div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Icône"><TI value={s.icon} onChange={(v) => set(i, "icon", v)} /></Field>
            <Field label="Tag"><TI value={s.tag} onChange={(v) => set(i, "tag", v)} /></Field>
            <Field label="Titre"><TI value={s.title} onChange={(v) => set(i, "title", v)} /></Field>
            <Field label="Couleur"><div className="flex gap-2 items-center"><input type="color" value={s.color} onChange={(e) => set(i, "color", e.target.value)} className="w-8 h-8 rounded" style={{ background: "transparent", border: "none" }} /><TI value={s.color} onChange={(v) => set(i, "color", v)} /></div></Field>
          </div>
          <Field label="Description"><TTA value={s.desc} onChange={(v) => set(i, "desc", v)} rows={2} /></Field>
        </Card>
      ))}
    </div>
  );
}

function TabPricing({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const pl = content.pricing;
  const set = (i: number, k: string, v: unknown) => onChange({ ...content, pricing: pl.map((p, idx) => idx === i ? { ...p, [k]: v } : p) });
  const sf = (pi: number, fi: number, v: string) => set(pi, "features", pl[pi].features.map((f, idx) => idx === fi ? v : f));
  const af = (pi: number) => set(pi, "features", [...pl[pi].features, ""]);
  const df = (pi: number, fi: number) => set(pi, "features", pl[pi].features.filter((_, idx) => idx !== fi));
  return (
    <div className="space-y-4">
      <Heading title="Plans Tarifaires" />
      {pl.map((p, i) => (
        <Card key={i} className="space-y-3">
          <div className="font-semibold text-sm" style={{ color: C.text }}>{p.name}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Nom"><TI value={p.name} onChange={(v) => set(i, "name", v)} /></Field>
            <Field label="Prix"><TI value={p.price} onChange={(v) => set(i, "price", v)} /></Field>
            <Field label="Badge"><TI value={p.badge ?? ""} onChange={(v) => set(i, "badge", v || null)} /></Field>
            <Field label="CTA"><TI value={p.cta} onChange={(v) => set(i, "cta", v)} /></Field>
          </div>
          <div>
            <label style={{ color: C.subtle, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Fonctionnalités</label>
            <div className="mt-2 space-y-1.5">
              {p.features.map((f, fi) => (
                <div key={fi} className="flex gap-2">
                  <input className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none" style={IS} value={f} onChange={(e) => sf(i, fi, e.target.value)} />
                  <button onClick={() => df(i, fi)} style={{ color: C.rose, fontSize: 14, padding: "0 6px" }}>✕</button>
                </div>
              ))}
              <button onClick={() => af(i)} style={{ color: C.green, fontSize: 11 }}>+ Ajouter</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TabReviews({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const rv = content.reviews;
  const set = (i: number, k: string, v: unknown) => onChange({ ...content, reviews: rv.map((r, idx) => idx === i ? { ...r, [k]: v } : r) });
  const add = () => onChange({ ...content, reviews: [...rv, { name: "", country: "🌍", stars: 5, text: "", amount: "" }] });
  const del = (i: number) => onChange({ ...content, reviews: rv.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><Heading title="Témoignages" /><button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Ajouter</button></div>
      {rv.map((r, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex justify-between"><span style={{ color: C.subtle, fontSize: 11 }}>Avis #{i + 1}</span><button onClick={() => del(i)} style={{ color: C.rose, fontSize: 11 }}>Supprimer</button></div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Nom"><TI value={r.name} onChange={(v) => set(i, "name", v)} /></Field>
            <Field label="Pays (emoji)"><TI value={r.country} onChange={(v) => set(i, "country", v)} /></Field>
            <Field label="Étoiles (1-5)"><TN value={r.stars} onChange={(v) => set(i, "stars", Math.min(5, Math.max(1, v)))} /></Field>
            <Field label="Montant"><TI value={r.amount} onChange={(v) => set(i, "amount", v)} /></Field>
          </div>
          <Field label="Texte"><TTA value={r.text} onChange={(v) => set(i, "text", v)} rows={2} /></Field>
        </Card>
      ))}
    </div>
  );
}

function TabFAQ({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const faq = content.faq;
  const set = (i: number, k: "q" | "a", v: string) => onChange({ ...content, faq: faq.map((f, idx) => idx === i ? { ...f, [k]: v } : f) });
  const add = () => onChange({ ...content, faq: [...faq, { q: "", a: "" }] });
  const del = (i: number) => onChange({ ...content, faq: faq.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><Heading title="FAQ" /><button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Ajouter</button></div>
      {faq.map((f, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex justify-between"><span style={{ color: C.subtle, fontSize: 11 }}>Q{i + 1}</span><button onClick={() => del(i)} style={{ color: C.rose, fontSize: 11 }}>Supprimer</button></div>
          <Field label="Question"><TI value={f.q} onChange={(v) => set(i, "q", v)} /></Field>
          <Field label="Réponse"><TTA value={f.a} onChange={(v) => set(i, "a", v)} rows={3} /></Field>
        </Card>
      ))}
    </div>
  );
}

function TabBlog({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const blog = content.blog;
  const set = (i: number, k: string, v: string) => onChange({ ...content, blog: blog.map((b, idx) => idx === i ? { ...b, [k]: v } : b) });
  const add = () => onChange({ ...content, blog: [...blog, { title: "", date: "", readTime: "", tag: "", accent: C.green, emoji: "📄", bg: "linear-gradient(135deg,#0A1F12,#0A0F1C)" }] });
  const del = (i: number) => onChange({ ...content, blog: blog.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><Heading title="Articles Blog" /><button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Ajouter</button></div>
      {blog.map((b, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex justify-between"><span style={{ color: C.subtle, fontSize: 11 }}>Article #{i + 1}</span><button onClick={() => del(i)} style={{ color: C.rose, fontSize: 11 }}>Supprimer</button></div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Emoji"><TI value={b.emoji} onChange={(v) => set(i, "emoji", v)} /></Field>
            <Field label="Tag"><TI value={b.tag} onChange={(v) => set(i, "tag", v)} /></Field>
            <Field label="Date"><TI value={b.date} onChange={(v) => set(i, "date", v)} /></Field>
            <Field label="Durée de lecture"><TI value={b.readTime} onChange={(v) => set(i, "readTime", v)} /></Field>
          </div>
          <Field label="Titre"><TI value={b.title} onChange={(v) => set(i, "title", v)} /></Field>
          <Field label="Couleur accent"><div className="flex gap-2 items-center"><input type="color" value={b.accent} onChange={(e) => set(i, "accent", e.target.value)} className="w-8 h-8 rounded" style={{ background: "transparent", border: "none" }} /><TI value={b.accent} onChange={(v) => set(i, "accent", v)} /></div></Field>
        </Card>
      ))}
    </div>
  );
}

function TabPartners({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const p = content.partners;
  const set = (i: number, v: string) => onChange({ ...content, partners: p.map((x, idx) => idx === i ? v : x) });
  const add = () => onChange({ ...content, partners: [...p, ""] });
  const del = (i: number) => onChange({ ...content, partners: p.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><Heading title="Partenaires / Ticker" /><button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.green, color: "#000" }}>+ Ajouter</button></div>
      <Card><div className="grid sm:grid-cols-3 gap-2">
        {p.map((x, i) => (
          <div key={i} className="flex gap-1.5">
            <input className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none" style={IS} value={x} onChange={(e) => set(i, e.target.value)} />
            <button onClick={() => del(i)} style={{ color: C.rose, fontSize: 14, padding: "0 5px" }}>✕</button>
          </div>
        ))}
      </div></Card>
    </div>
  );
}

function TabCompany({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const co = content.company;
  const ct = content.cta;
  const setCo = (k: keyof typeof co, v: string) => onChange({ ...content, company: { ...co, [k]: v } });
  const setCt = (k: keyof typeof ct, v: unknown) => onChange({ ...content, cta: { ...ct, [k]: v } });
  const setBadge = (i: number, v: string) => setCt("badges", ct.badges.map((b, idx) => idx === i ? v : b));
  return (
    <div className="space-y-5">
      <Heading title="Société & CTA" />
      <Card className="space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>Informations publiques</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom affiché"><TI value={co.name} onChange={(v) => setCo("name", v)} /></Field>
          <Field label="Numéro FCA"><TI value={co.fca_number} onChange={(v) => setCo("fca_number", v)} /></Field>
          <Field label="Email contact"><TI value={co.email_contact} onChange={(v) => setCo("email_contact", v)} /></Field>
          <Field label="Email légal"><TI value={co.email_legal} onChange={(v) => setCo("email_legal", v)} /></Field>
          <Field label="Email recouvrement"><TI value={co.email_recovery} onChange={(v) => setCo("email_recovery", v)} /></Field>
          <Field label="Note TrustPilot"><TI value={co.trustpilot_score} onChange={(v) => setCo("trustpilot_score", v)} /></Field>
          <Field label="Nb avis"><TI value={co.trustpilot_count} onChange={(v) => setCo("trustpilot_count", v)} /></Field>
        </div>
        <Field label="Tagline"><TI value={co.tagline} onChange={(v) => setCo("tagline", v)} /></Field>
        <Field label="Disclaimer"><TTA value={co.disclaimer} onChange={(v) => setCo("disclaimer", v)} rows={3} /></Field>
      </Card>
      <Card className="space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>Bannière CTA</p>
        <Field label="Titre"><TI value={ct.title} onChange={(v) => setCt("title", v)} /></Field>
        <Field label="Sous-titre"><TI value={ct.subtitle} onChange={(v) => setCt("subtitle", v)} /></Field>
        <Field label="Bouton"><TI value={ct.button} onChange={(v) => setCt("button", v)} /></Field>
        <div>
          <label style={{ color: C.subtle, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Badges</label>
          <div className="mt-2 space-y-1.5">
            {ct.badges.map((b, i) => <input key={i} className={IC} style={IS} value={b} onChange={(e) => setBadge(i, e.target.value)} />)}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
const ADMIN_TABS = [
  { id: "analytics", label: "📈", full: "Analytique" },
  { id: "accounts",  label: "👥", full: "Comptes" },
  { id: "branding",  label: "🎨", full: "Branding" },
  { id: "hero",      label: "🏠", full: "Hero" },
  { id: "stats",     label: "📊", full: "Stats" },
  { id: "services",  label: "⚙️", full: "Services" },
  { id: "pricing",   label: "💰", full: "Tarifs" },
  { id: "reviews",   label: "⭐", full: "Avis" },
  { id: "faq",       label: "❓", full: "FAQ" },
  { id: "blog",      label: "📝", full: "Blog" },
  { id: "partners",  label: "🤝", full: "Partenaires" },
  { id: "company",   label: "🏢", full: "Société" },
];

const SUPER_TABS = [
  { id: "staff",     label: "🧑‍💼", full: "Équipe", badge: "SA" },
  { id: "structure", label: "🏛", full: "Structure", badge: "SA" },
  { id: "security",  label: "🔒", full: "Sécurité", badge: "SA" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(isLocked);
  const [showPw, setShowPw] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Refresh lock status every second when locked
  useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => {
      if (!isLocked()) { setLocked(false); clearInterval(t); }
    }, 1000);
    return () => clearInterval(t);
  }, [locked]);

  // Secret hint: click logo 5 times fast
  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) { setShowHint(true); setLogoClicks(0); setTimeout(() => setShowHint(false), 4000); }
  };

  const handleSubmit = async () => {
    if (locked || loading || !pw) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 280)); // slight delay to prevent timing attacks
    const role = checkPassword(pw);
    if (role) {
      clearAttempts();
      createSession(role);
      onLogin(role);
    } else {
      recordFailedAttempt();
      const rem = remainingAttempts();
      if (isLocked()) {
        setLocked(true);
        setErr("Compte bloqué pour 15 minutes suite à trop de tentatives.");
      } else {
        setErr(`Mot de passe incorrect. ${rem} tentative(s) restante(s).`);
      }
      setPw("");
    }
    setLoading(false);
  };

  const lockMins = Math.ceil(lockoutRemaining() / 60000);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <button onClick={handleLogoClick} className="text-4xl mb-3 block mx-auto select-none" style={{ background: "none", border: "none", cursor: "default" }}>
            🔐
          </button>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Panneau d&apos;Administration</h1>
          <p className="text-xs mt-1" style={{ color: C.subtle }}>Central Boursière · Accès restreint</p>
          {showHint && (
            <p className="text-xs mt-2 px-3 py-1.5 rounded-lg inline-block" style={{ background: `${C.violet}18`, color: C.violet }}>
              Mode avancé disponible via ce formulaire
            </p>
          )}
        </div>

        <div className="p-6 rounded-2xl space-y-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          {locked ? (
            <div className="text-center py-4 space-y-2">
              <div className="text-2xl">⛔</div>
              <p className="text-sm font-semibold" style={{ color: C.rose }}>Accès temporairement bloqué</p>
              <p className="text-xs" style={{ color: C.muted }}>Réessayez dans {lockMins} minute{lockMins > 1 ? "s" : ""}</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                  style={{ ...IS, fontSize: 14 }}
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setErr(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
                <button onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.subtle }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>

              {err && <p className="text-xs" style={{ color: C.rose }}>{err}</p>}

              <button
                onClick={handleSubmit}
                disabled={!pw || loading}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all"
                style={{ background: pw && !loading ? C.green : "rgba(255,255,255,0.07)", color: pw && !loading ? "#000" : C.subtle }}
              >
                {loading ? "Vérification…" : "Accéder"}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: C.subtle }}>
          Toutes les tentatives sont enregistrées
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN SHELL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [session, setSession] = useState(getSession);
  const [tab, setTab] = useState("analytics");
  const [content, setContent] = useState<SiteContent>(loadContent);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => setContent(loadContent());
    window.addEventListener("cb-content-updated", handler);
    return () => window.removeEventListener("cb-content-updated", handler);
  }, []);

  // Sync real Supabase Auth registrations into admin users list
  useEffect(() => {
    if (!session) return;
    profiles.getAll().then((all) => {
      const remoteUsers = Object.values(all) as UserAccount[];
      if (remoteUsers.length === 0) return;
      setContent((prev) => {
        const existingEmails = new Set(prev.users.map((u) => u.email));
        const newUsers = remoteUsers.filter((u) => !existingEmails.has(u.email));
        if (newUsers.length === 0) return prev;
        return { ...prev, users: [...prev.users, ...newUsers] };
      });
    }).catch(() => {});
  }, [session]);

  // Refresh session every 60s to detect expiry
  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => {
      const s = getSession();
      if (!s) setSession(null);
    }, 60_000);
    return () => clearInterval(t);
  }, [session]);

  const handleChange = useCallback((c: SiteContent) => { setContent(c); setDirty(true); }, []);

  const handleSave = () => {
    saveContent(content);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm("Réinitialiser tout le contenu aux valeurs par défaut ? Cette action est irréversible.")) return;
    resetContent();
    setContent(loadContent());
    setDirty(false);
  };

  const handleLogout = () => { clearSession(); setSession(null); };

  const handleLogin = (role: Role) => setSession(getSession());

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  const role = session.role;
  const isSA = role === "super_admin";
  const allTabs = [...ADMIN_TABS, ...(isSA ? SUPER_TABS : [])];
  const activeTab = allTabs.find((t) => t.id === tab) ?? allTabs[0];

  const renderTab = () => {
    switch (tab) {
      case "analytics":  return <TabAnalytics content={content} />;
      case "accounts":   return <TabAccounts content={content} onChange={handleChange} />;
      case "branding":   return <TabBranding content={content} onChange={handleChange} />;
      case "hero":       return <TabHero content={content} onChange={handleChange} />;
      case "stats":      return <TabStats content={content} onChange={handleChange} />;
      case "services":   return <TabServices content={content} onChange={handleChange} />;
      case "pricing":    return <TabPricing content={content} onChange={handleChange} />;
      case "reviews":    return <TabReviews content={content} onChange={handleChange} />;
      case "faq":        return <TabFAQ content={content} onChange={handleChange} />;
      case "blog":       return <TabBlog content={content} onChange={handleChange} />;
      case "partners":   return <TabPartners content={content} onChange={handleChange} />;
      case "company":    return <TabCompany content={content} onChange={handleChange} />;
      case "staff":      return isSA ? <TabStaff content={content} onChange={handleChange} /> : null;
      case "structure":  return isSA ? <TabStructure content={content} onChange={handleChange} /> : null;
      case "security":   return isSA ? <TabSecurity /> : null;
      default:           return null;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="px-4 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: isSA ? `${C.violet}25` : `${C.green}20` }}>
            {isSA ? "👑" : "🔑"}
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: isSA ? C.violet : C.green }}>
              {isSA ? "SUPER ADMIN" : "ADMIN"}
            </div>
            <div className="text-xs" style={{ color: C.subtle }}>Central Boursière</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto pb-2">
        {/* Standard tabs */}
        <div className="mb-1">
          <div className="px-3 py-1 text-xs" style={{ color: C.subtle, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 9 }}>GÉNÉRAL</div>
          {ADMIN_TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileSidebarOpen(false); }}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: tab === t.id ? `${C.green}15` : "transparent", color: tab === t.id ? C.green : C.muted, fontWeight: tab === t.id ? 600 : 400 }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{t.label}</span>
              {t.full}
            </button>
          ))}
        </div>

        {/* Super admin tabs */}
        {isSA && (
          <div className="mt-3">
            <div className="px-3 py-1 text-xs" style={{ color: C.violet + "80", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 9 }}>SUPER ADMIN</div>
            {SUPER_TABS.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setMobileSidebarOpen(false); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ background: tab === t.id ? `${C.violet}18` : "transparent", color: tab === t.id ? C.violet : C.muted + "CC", fontWeight: tab === t.id ? 600 : 400 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{t.label}</span>
                {t.full}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="shrink-0 px-3 pb-5 space-y-2 border-t pt-3" style={{ borderColor: C.border }}>
        <button
          onClick={handleSave}
          className="w-full rounded-xl py-2 text-xs font-bold transition-all"
          style={{ background: dirty ? C.green : "rgba(255,255,255,0.05)", color: dirty ? "#000" : C.subtle }}
        >
          {saved ? "✓ Sauvegardé" : dirty ? "💾 Sauvegarder" : "Tout à jour"}
        </button>
        <button onClick={handleReset} className="w-full rounded-xl py-1.5 text-xs transition-colors" style={{ background: `${C.rose}10`, color: C.rose + "CC" }}>
          Réinitialiser
        </button>
        <button onClick={handleLogout} className="w-full rounded-xl py-1.5 text-xs transition-colors" style={{ background: "rgba(255,255,255,0.04)", color: C.subtle }}>
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, color: C.text }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 h-screen sticky top-0 overflow-hidden" style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative flex flex-col w-56 h-full overflow-hidden" style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ background: C.surface, borderColor: C.border }}>
          <button onClick={() => setMobileSidebarOpen(true)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>
            ☰
          </button>
          <span className="font-semibold text-sm" style={{ color: C.text }}>{activeTab.full}</span>
          {dirty && (
            <button onClick={handleSave} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: C.green, color: "#000" }}>
              {saved ? "✓" : "Sauvegarder"}
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-7 lg:py-7">
          {renderTab()}
        </main>
      </div>

      {/* Save toast */}
      {saved && (
        <div className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-bold pointer-events-none"
          style={{ background: C.green, color: "#000", boxShadow: `0 8px 32px ${C.green}40` }}>
          ✓ Modifications sauvegardées
        </div>
      )}
    </div>
  );
}
