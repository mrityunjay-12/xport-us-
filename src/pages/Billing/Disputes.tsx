// src/pages/billing/Disputes.tsx
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

type DisputeStatus = "Open" | "Investigating" | "Resolved" | "Rejected";

interface Dispute {
  id: string;
  invoiceId: string;
  customer: string;
  raisedOn: string;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
}

const statusColor = (s: DisputeStatus) =>
  s === "Resolved" ? "success" : s === "Rejected" ? "error" : "warning";

const SEED: Dispute[] = [
  {
    id: "DSP-1001",
    invoiceId: "INV-2509-002",
    customer: "Zen Importers",
    raisedOn: "2025-09-28",
    reason: "Overcharge on destination fees",
    status: "Open",
  },
  {
    id: "DSP-1002",
    invoiceId: "INV-2509-003",
    customer: "Nimbus Global",
    raisedOn: "2025-09-22",
    reason: "Duplicate billing",
    status: "Investigating",
  },
];

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

export default function Disputes() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [openId, rows]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.invoiceId.toLowerCase().includes(s) ||
        r.customer.toLowerCase().includes(s)
    );
  }, [rows, q]);

  // actions
  const setStatus = (id: string, status: DisputeStatus, resolution?: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, resolution } : r))
    );

  // drawer helpers
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
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Billing & Payments ▸ Disputes
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Handle Disputes
        </div>
        <div className="mt-1 text-sm opacity-95">
          Track, investigate, and resolve invoice disputes.
        </div>
      </div>

      <Section title="Filters">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">
            Search
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white dark:bg-white"
            placeholder="Dispute #, Invoice #, Customer…"
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQ(e.target.value)
            }
          />
        </div>
      </Section>

      <Section title={`Open Items (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {r.id} · {r.invoiceId}
                    </div>
                    <Badge size="sm" color={statusColor(r.status) as any}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    {r.customer} • Raised {r.raisedOn}
                  </div>
                  <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    Reason: {r.reason}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(r.id)}
                  >
                    View
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                    onClick={() => setStatus(r.id, "Investigating")}
                  >
                    Investigate
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() =>
                      setStatus(r.id, "Resolved", "Credit note issued")
                    }
                  >
                    Resolve
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => setStatus(r.id, "Rejected", "Charges valid")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Drawer */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[200000]">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 inset-y-0 z-[200001] w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            >
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      {open.id} · {open.invoiceId}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      {open.customer} • Raised {open.raisedOn}
                    </div>
                  </div>
                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Status: {open.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
                <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Reason
                  </div>
                  <p className="mt-1">{open.reason}</p>
                  {open.resolution && (
                    <>
                      <div className="mt-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        Resolution
                      </div>
                      <p className="mt-1">{open.resolution}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-700"
                    onClick={() => setStatus(open.id, "Investigating")}
                  >
                    Investigate
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() =>
                      setStatus(open.id, "Resolved", "Credit note issued")
                    }
                  >
                    Resolve
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() =>
                      setStatus(open.id, "Rejected", "Charges valid")
                    }
                  >
                    Reject
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
