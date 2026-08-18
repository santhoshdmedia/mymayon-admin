import { Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = "md", className = "" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return <Loader2 className={`${s} animate-spin text-navy-500 ${className}`} />;
}

// ── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", size = "md", loading, className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-2.5 text-sm" };
  const vars = {
    primary:   "bg-navy-800 text-white hover:bg-navy-700 focus:ring-navy-600",
    gold:      "bg-gold-500 text-navy-900 hover:bg-gold-400 focus:ring-gold-400",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:     "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
  };
  return (
    <button {...props} disabled={loading || props.disabled}
      className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
      <input {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition placeholder:text-gray-400 ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"} ${className}`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
      <textarea {...props} rows={props.rows || 3}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 transition placeholder:text-gray-400 resize-none ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"} ${className}`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options = [], error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
      <select {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 transition bg-white ${error ? "border-red-400" : "border-gray-300"} ${className}`}>
        {options.map(o =>
          typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  new:       "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  converted: "bg-green-50 text-green-700 border-green-200",
  closed:    "bg-gray-100 text-gray-600 border-gray-200",
  Spiritual: "bg-rose-50 text-rose-700 border-rose-200",
  Heritage:  "bg-amber-50 text-amber-700 border-amber-200",
  Nature:    "bg-green-50 text-green-700 border-green-200",
  Northern:  "bg-blue-50 text-blue-700 border-blue-200",
  Southern:  "bg-purple-50 text-purple-700 border-purple-200",
  Western:   "bg-orange-50 text-orange-700 border-orange-200",
  Central:   "bg-teal-50 text-teal-700 border-teal-200",
  Delta:     "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function Badge({ label }) {
  const cls = BADGE_COLORS[label] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium max-w-xs animate-[slideIn_0.2s_ease-out] ${
      type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
    }`}>
      {type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = "max-w-xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-navy-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm ───────────────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-bold text-navy-800">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = "navy", delta }) {
  const colors = {
    navy:  { bg: "bg-navy-50",  icon: "text-navy-600",  border: "border-navy-100" },
    gold:  { bg: "bg-gold-50",  icon: "text-gold-600",  border: "border-gold-100" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
    blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  border: "border-blue-100" },
    rose:  { bg: "bg-rose-50",  icon: "text-rose-600",  border: "border-rose-100" },
  };
  const c = colors[color] || colors.navy;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-navy-800">{value ?? "—"}</p>
          {delta !== undefined && (
            <p className={`text-xs mt-1 font-medium ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
              {delta >= 0 ? "+" : ""}{delta} this week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </Card>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
      <h3 className="font-semibold text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <p className="text-xs text-gray-500">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</p>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${n === page ? "bg-navy-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
