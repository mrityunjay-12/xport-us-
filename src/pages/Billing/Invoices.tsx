// src/pages/billing/Invoices.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

type InvoiceStatus = "Draft" | "Open" | "Overdue" | "Paid" | "Void";

interface LineItem {
  desc: string;
  qty: number;
  rate: number;
}
interface Invoice {
  id: string;
  createdAt: string;
  customer: string;
  dueDate: string;
  amountINR: number;
  status: InvoiceStatus;
  items: LineItem[];
  notes?: string;
}

const statusColor = (s: InvoiceStatus) =>
  s === "Paid"
    ? "success"
    : s === "Overdue" || s === "Void"
    ? "error"
    : "warning";

const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;

const SEED: Invoice[] = [
  {
    id: "INV-2509-001",
    createdAt: "2025-09-15T09:10:00Z",
    customer: "Acme Textiles Pvt Ltd",
    dueDate: "2025-10-05",
    amountINR: 519384,
    status: "Open",
    items: [
      { desc: "Ocean Freight FCL 20'", qty: 1, rate: 480000 },
      { desc: "Documentation", qty: 1, rate: 12000 },
      { desc: "Taxes", qty: 1, rate: 27384 },
    ],
  },
  {
    id: "INV-2509-002",
    createdAt: "2025-09-08T12:30:00Z",
    customer: "Zen Importers",
    dueDate: "2025-09-25",
    amountINR: 189000,
    status: "Overdue",
    items: [{ desc: "LCL Console + Dest.", qty: 1, rate: 189000 }],
    notes: "Reminder sent on 2025-09-27",
  },
  {
    id: "INV-2509-003",
    createdAt: "2025-09-01T11:00:00Z",
    customer: "Nimbus Global",
    dueDate: "2025-09-20",
    amountINR: 289000,
    status: "Paid",
    items: [{ desc: "FCL 40HC Export", qty: 1, rate: 289000 }],
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

export default function Invoices() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | InvoiceStatus>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [openId, rows]
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(s) || r.customer.toLowerCase().includes(s)
      );
    }
    if (status) list = list.filter((r) => r.status === status);
    return list;
  }, [rows, q, status]);

  // actions
  const markPaid = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Paid" } : r))
    );
  const voidInvoice = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Void" } : r))
    );
  const sendReminder = (id: string) => alert(`Reminder email queued for ${id}`);

  // drawer helpers (shared style)
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
        <div className="text-xs/5 opacity-90">
          Billing & Payments ▸ Invoices
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Manage Invoices
        </div>
        <div className="mt-1 text-sm opacity-95">
          Create, filter, send reminders, and mark payments.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white "
              placeholder="Invoice # or Customer…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white "
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
            >
              <option value="">All</option>
              {["Draft", "Open", "Overdue", "Paid", "Void"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-blue-700 dark:text-gray-300"
              onClick={() => {
                setQ("");
                setStatus("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* List */}
      <Section title={`Invoices (${filtered.length})`}>
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
                      {r.id} · {r.customer}
                    </div>
                    <Badge size="sm" color={statusColor(r.status) as any}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    Due <b>{r.dueDate}</b> • Amount <b>{inr(r.amountINR)}</b>
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
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={r.status !== "Open" && r.status !== "Overdue"}
                    onClick={() => markPaid(r.id)}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    disabled={r.status !== "Open" && r.status !== "Overdue"}
                    onClick={() => sendReminder(r.id)}
                  >
                    Send Reminder
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={r.status === "Paid" || r.status === "Void"}
                    onClick={() => voidInvoice(r.id)}
                  >
                    Void
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Drawer (styled like Quotes) */}
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
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      {open.id} · {open.customer}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      Created {new Date(open.createdAt).toLocaleString()}
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
                    Due: {open.dueDate}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Amount: {inr(open.amountINR)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ring-1 ring-white/30 ${
                      open.status === "Paid"
                        ? "bg-emerald-400/25"
                        : open.status === "Overdue" || open.status === "Void"
                        ? "bg-rose-400/25"
                        : "bg-amber-400/25"
                    }`}
                  >
                    {open.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Line Items
                  </div>
                  <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-800">
                    {open.items.map((it, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span>
                          {it.desc}{" "}
                          <span className="text-gray-500">× {it.qty}</span>
                        </span>
                        <span className="font-medium">
                          {inr(it.rate * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {open.notes && (
                  <div className="mt-4 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                    Notes: {open.notes}
                  </div>
                )}
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    disabled={
                      open.status !== "Open" && open.status !== "Overdue"
                    }
                    onClick={() => alert("Reminder queued")}
                  >
                    Send Reminder
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={open.status === "Paid"}
                    onClick={() => markPaid(open.id)}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={open.status === "Paid" || open.status === "Void"}
                    onClick={() => voidInvoice(open.id)}
                  >
                    Void
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
