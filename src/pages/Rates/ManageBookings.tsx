// src/pages/rates/ManageBookings.tsx
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
type Direction = "Export" | "Import";
type Service = "FCL" | "LCL";
type Status = "New" | "Confirmed" | "Cancelled" | "Sailed" | "Delivered";

interface Booking {
  id: string; // BK#
  createdAt: string;
  customer: string;
  direction: Direction;
  service: Service;
  carrier: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  container: "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC" | "LCL";
  pieces?: number;
  weightKg?: number;
  cbm?: number;
  etd: string;
  eta: string;
  status: Status;
  ref?: string; // carrier booking no
  docs?: string[]; // files
}

/* ========== Helpers ========== */
const statusColor = (s: Status) =>
  s === "Delivered" || s === "Sailed" || s === "Confirmed"
    ? "success"
    : s === "Cancelled"
    ? "error"
    : "warning";

const inrDate = (iso: string) => new Date(iso).toLocaleDateString();

/* ========== Seeds ========== */
const SEED: Booking[] = [
  {
    id: "BK-250916-001",
    createdAt: "2025-09-16T08:45:00Z",
    customer: "Acme Textiles Pvt Ltd",
    direction: "Export",
    service: "FCL",
    carrier: "MSC",
    originCode: "INNSA",
    originName: "Nhava Sheva, India",
    destinationCode: "DEHAM",
    destinationName: "Hamburg, Germany",
    container: "20 ft - Standard",
    weightKg: 19000,
    etd: "2025-09-22",
    eta: "2025-10-14",
    status: "Confirmed",
    ref: "MSC1234567",
    docs: ["so.pdf", "vgm.pdf"],
  },
  {
    id: "BK-250916-002",
    createdAt: "2025-09-16T12:00:00Z",
    customer: "Zen Importers",
    direction: "Import",
    service: "LCL",
    carrier: "CMA CGM",
    originCode: "CNSHA",
    originName: "Shanghai, China",
    destinationCode: "INNSA",
    destinationName: "Nhava Sheva, India",
    container: "LCL",
    pieces: 12,
    weightKg: 6500,
    cbm: 28.4,
    etd: "2025-09-24",
    eta: "2025-10-08",
    status: "New",
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
const Label = ({ children }: React.PropsWithChildren) => (
  <label className="text-xs text-gray-500 dark:text-gray-400">{children}</label>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className || ""
    }`}
  />
);
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className || ""
    }`}
  />
);

/* ========== Page ========== */
export default function ManageBookings() {
  const [rows, setRows] = useState<Booking[]>(SEED);
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [service, setService] = useState<"" | Service>("");

  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [openId, rows]
  );

  /* filters */
  const filtered = useMemo(() => {
    let list = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.customer.toLowerCase().includes(s) ||
          r.carrier.toLowerCase().includes(s) ||
          r.originName.toLowerCase().includes(s) ||
          r.destinationName.toLowerCase().includes(s)
      );
    }
    if (status) list = list.filter((r) => r.status === status);
    if (service) list = list.filter((r) => r.service === service);
    return list;
  }, [rows, q, status, service]);

  /* actions */
  const confirm = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Confirmed" } : r))
    );
  const cancel = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r))
    );
  const markSailed = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Sailed" } : r))
    );
  const markDelivered = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Delivered" } : r))
    );
  const setRef = (id: string, ref: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ref } : r)));

  /* drawer helpers */
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
          Freight Booking & Rates ▸ Bookings
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Manage Bookings
        </div>
        <div className="mt-1 text-sm opacity-95">
          Track, confirm/cancel, and update sailing/delivery milestones.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="BK#, Customer, Carrier, Origin/Destination…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status | "")}
            >
              <option value="">All</option>
              {["New", "Confirmed", "Cancelled", "Sailed", "Delivered"].map(
                (x) => (
                  <option key={x}>{x}</option>
                )
              )}
            </Select>
          </div>
          <div>
            <Label>Service</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value as Service | "")}
            >
              <option value="">All</option>
              <option>FCL</option>
              <option>LCL</option>
            </Select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              onClick={() => {
                setQ("");
                setStatus("");
                setService("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* List */}
      <Section title={`Bookings (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {b.id} · {b.direction} {b.service} • {b.carrier}
                    </div>
                    <Badge size="sm" color={statusColor(b.status) as any}>
                      {b.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {b.originCode} – {b.originName} → {b.destinationCode} –{" "}
                    {b.destinationName}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    ETD <b>{b.etd}</b> • ETA <b>{b.eta}</b>
                    {b.ref ? (
                      <>
                        {" "}
                        • Ref: <b>{b.ref}</b>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(b.id)}
                  >
                    View
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={b.status !== "New"}
                    onClick={() => confirm(b.id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    disabled={b.status !== "Confirmed"}
                    onClick={() => markSailed(b.id)}
                  >
                    Mark Sailed
                  </button>
                  <button
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    disabled={b.status !== "Sailed"}
                    onClick={() => markDelivered(b.id)}
                  >
                    Delivered
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={b.status === "Cancelled"}
                    onClick={() => cancel(b.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No bookings match your filters.
            </div>
          )}
        </div>
      </Section>

      {/* Drawer */}
      {/* Drawer */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />

            {/* Drawer panel */}
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="
          fixed right-0 inset-y-0 z-[200001]
          w-full max-w-xl
          bg-white shadow-2xl outline-none dark:bg-gray-900
          flex flex-col
        "
            >
              {/* HEADER */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      id="booking-drawer-title"
                      className="text-base font-semibold"
                    >
                      {open.id} · {open.direction} {open.service} •{" "}
                      {open.carrier}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      {open.originCode} – {open.originName} →{" "}
                      {open.destinationCode} – {open.destinationName}
                    </div>
                  </div>

                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                </div>

                {/* quick chips */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Customer: {open.customer}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    ETD: {open.etd}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    ETA: {open.eta}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ring-1 ring-white/30 ${
                      open.status === "Delivered" ||
                      open.status === "Sailed" ||
                      open.status === "Confirmed"
                        ? "bg-emerald-400/25"
                        : open.status === "Cancelled"
                        ? "bg-rose-400/25"
                        : "bg-amber-400/25"
                    }`}
                  >
                    {open.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Ref: {open.ref || "—"}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
                {/* Route & Details */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Route & Details
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      ETD: <b>{open.etd}</b>
                    </div>
                    <div>
                      ETA: <b>{open.eta}</b>
                    </div>
                    <div>
                      Status: <b>{open.status}</b>
                    </div>
                    <div>
                      Created: <b>{inrDate(open.createdAt)}</b>
                    </div>
                    <div>
                      Container: <b>{open.container}</b>
                    </div>
                    <div>
                      Carrier Ref: <b>{open.ref || "—"}</b>
                    </div>
                    {open.pieces != null && (
                      <div>
                        Pieces: <b>{open.pieces}</b>
                      </div>
                    )}
                    {open.weightKg != null && (
                      <div>
                        Weight: <b>{open.weightKg} kg</b>
                      </div>
                    )}
                    {open.cbm != null && (
                      <div>
                        CBM: <b>{open.cbm}</b>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Documents
                  </div>
                  {open.docs?.length ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                      {open.docs.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No files
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">
                      Upload MBL/HBL
                    </button>
                    <button
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      onClick={() => {
                        const v = prompt(
                          "Enter Carrier Booking Number",
                          open.ref || ""
                        );
                        if (v != null) setRef(open.id, v);
                      }}
                    >
                      Set Booking Ref
                    </button>
                  </div>
                </div>
              </div>

              {/* STICKY FOOTER ACTIONS */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>

                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={open.status !== "New"}
                    onClick={() => confirm(open.id)}
                  >
                    Confirm
                  </button>

                  <button
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    disabled={open.status !== "Confirmed"}
                    onClick={() => markSailed(open.id)}
                  >
                    Mark Sailed
                  </button>

                  <button
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    disabled={open.status !== "Sailed"}
                    onClick={() => markDelivered(open.id)}
                  >
                    Delivered
                  </button>

                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={open.status === "Cancelled"}
                    onClick={() => cancel(open.id)}
                  >
                    Cancel
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
