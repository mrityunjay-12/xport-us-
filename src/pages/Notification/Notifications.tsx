// src/pages/notifications/Notifications.tsx
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

/* ========== Types ========== */
type AlertType =
  | "System"
  | "Task"
  | "Shipment"
  | "Billing"
  | "Rates"
  | "Documents";
type Severity = "Info" | "Warning" | "Critical";
type AStatus = "Unread" | "Read" | "Snoozed" | "Resolved";

interface AlertRow {
  id: string;
  createdAt: string;
  title: string;
  message: string;
  type: AlertType;
  severity: Severity;
  status: AStatus;
  relatedId?: string; // e.g., JOB-.., QT-.., INV-..
  relatedPath?: string; // e.g., /operations/shipments/.., /rates/quotes/..
}

/* ========== Helpers ========== */
const sevColor = (s: Severity) =>
  s === "Critical" ? "error" : s === "Warning" ? "warning" : "info";

const statusColor = (s: AStatus) =>
  s === "Resolved" ? "success" : s === "Unread" ? "warning" : "info";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

/* ========== Seed ========== */
const SEED: AlertRow[] = [
  {
    id: "ALR-0001",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    title: "Shipment Sailed",
    message: "JOB-240921-001 has sailed from INNSA.",
    type: "Shipment",
    severity: "Info",
    status: "Unread",
    relatedId: "JOB-240921-001",
    relatedPath: "/operations/shipments",
  },
  {
    id: "ALR-0002",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    title: "Quote Approval Needed",
    message: "QT-240917-001 is pending approval.",
    type: "Rates",
    severity: "Warning",
    status: "Unread",
    relatedId: "QT-240917-001",
    relatedPath: "/rates/quotes",
  },
  {
    id: "ALR-0003",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: "Invoice Overdue",
    message: "INV-2025-0098 is overdue by 3 days.",
    type: "Billing",
    severity: "Critical",
    status: "Read",
    relatedId: "INV-2025-0098",
    relatedPath: "/billing/invoices",
  },
  {
    id: "ALR-0004",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    title: "Document Missing",
    message: "MBL is not uploaded for BK-250916-001.",
    type: "Documents",
    severity: "Warning",
    status: "Snoozed",
    relatedId: "BK-250916-001",
    relatedPath: "/rates/bookings",
  },
];

/* ========== Local atoms ========== */
const Section = ({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
    <div className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
      {title}
    </div>
    {children}
  </div>
);

/* ========== Page ========== */
export default function Notifications() {
  const [rows, setRows] = useState<AlertRow[]>(SEED);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | AlertType>("");
  const [severity, setSeverity] = useState<"" | Severity>("");
  const [status, setStatus] = useState<"" | AStatus>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* Filters */
  const filtered = useMemo(() => {
    let list = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.title.toLowerCase().includes(s) ||
          r.message.toLowerCase().includes(s) ||
          r.relatedId?.toLowerCase().includes(s)
      );
    }
    if (type) list = list.filter((r) => r.type === type);
    if (severity) list = list.filter((r) => r.severity === severity);
    if (status) list = list.filter((r) => r.status === status);
    return list;
  }, [rows, q, type, severity, status]);

  /* Selection */
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const clearSel = () => setSelected(new Set());
  const pageIds = filtered.map((r) => r.id);
  const allOnPage =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });

  /* Actions */
  const mark = (ids: string[], s: AStatus) =>
    setRows((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: s } : r))
    );
  const remove = (ids: string[]) =>
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));

  /* Drawer */
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [rows, openId]
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Notifications</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          All Alerts & Actions
        </div>
        <div className="mt-1 text-sm opacity-95">
          Search, filter, and take action on alerts across the system.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Title, message, #ref…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Type
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              value={type}
              onChange={(e) => setType(e.target.value as AlertType | "")}
            >
              <option value="">All</option>
              {[
                "System",
                "Task",
                "Shipment",
                "Billing",
                "Rates",
                "Documents",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Severity
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity | "")}
            >
              <option value="">All</option>
              {["Info", "Warning", "Critical"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              value={status}
              onChange={(e) => setStatus(e.target.value as AStatus | "")}
            >
              <option value="">All</option>
              {["Unread", "Read", "Snoozed", "Resolved"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={!selected.size}
            onClick={() => {
              mark(Array.from(selected), "Read");
              clearSel();
            }}
          >
            Mark Read
          </button>
          <button
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            disabled={!selected.size}
            onClick={() => {
              mark(Array.from(selected), "Snoozed");
              clearSel();
            }}
          >
            Snooze
          </button>
          <button
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            disabled={!selected.size}
            onClick={() => {
              mark(Array.from(selected), "Resolved");
              clearSel();
            }}
          >
            Resolve
          </button>
          <button
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            disabled={!filtered.length}
            onClick={() => {
              const pageAll = pageIds.filter((id) => !selected.has(id));
              pageAll.length ? toggleAll() : clearSel();
            }}
          >
            {allOnPage ? "Unselect All" : "Select All (Page)"}
          </button>
          <button
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            disabled={!selected.size}
            onClick={() => {
              if (confirm(`Delete ${selected.size} alert(s)?`)) {
                remove(Array.from(selected));
                clearSel();
              }
            }}
          >
            Delete
          </button>
        </div>
      </Section>

      {/* List */}
      <Section title={`Alerts (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((a) => {
            const checked = selected.has(a.id);
            return (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Left */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700"
                      checked={checked}
                      onChange={() => toggle(a.id)}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {a.title}
                        </div>
                        <Badge size="sm" color={sevColor(a.severity) as any}>
                          {a.severity}
                        </Badge>
                        <Badge size="sm" color={statusColor(a.status) as any}>
                          {a.status}
                        </Badge>
                        <span className="text-[11px] text-gray-500">
                          • {timeAgo(a.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {a.message}
                        {a.relatedId && (
                          <>
                            {" "}
                            • Ref: <b>{a.relatedId}</b>
                          </>
                        )}
                        <>
                          {" "}
                          • Type: <b>{a.type}</b>
                        </>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      onClick={() => setOpenId(a.id)}
                    >
                      View
                    </button>
                    <button
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      onClick={() => mark([a.id], "Read")}
                    >
                      Mark Read
                    </button>
                    <button
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                      onClick={() => mark([a.id], "Snoozed")}
                    >
                      Snooze
                    </button>
                    <button
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
                      onClick={() => mark([a.id], "Resolved")}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No alerts match your filters.
            </div>
          )}
        </div>
      </Section>

      {/* Drawer: details */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />
            {/* Panel */}
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 inset-y-0 z-[200001] w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      id="alert-drawer-title"
                      className="text-base font-semibold"
                    >
                      {open.title}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      {open.type} • {open.severity} • {timeAgo(open.createdAt)}
                    </div>
                  </div>
                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                </div>

                {/* Chips */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Status: {open.status}
                  </span>
                  {open.relatedId && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Ref: {open.relatedId}
                    </span>
                  )}
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Created: {new Date(open.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
                <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                  {open.message}
                </div>

                {open.relatedId && (
                  <div className="mt-4 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                    Related: <b>{open.relatedId}</b>
                    {open.relatedPath && (
                      <span className="ml-2 text-sky-600 underline hover:opacity-80">
                        {/* swap to <Link> when wired to router */}
                        Go to module: {open.relatedPath}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() => mark([open.id], "Read")}
                  >
                    Mark Read
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700"
                    onClick={() => mark([open.id], "Snoozed")}
                  >
                    Snooze
                  </button>
                  <button
                    className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700"
                    onClick={() => mark([open.id], "Resolved")}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
