// src/pages/operations/ShipmentTrackingMilestones.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

/* ========= Types ========= */
type ExecStatus =
  | "Planned"
  | "Pickup Scheduled"
  | "At CFS"
  | "Gate-in"
  | "Sailed"
  | "Arrived"
  | "Delivered";

interface Milestone {
  name: ExecStatus;
  done: boolean;
  when?: string; // yyyy-mm-dd
}
interface TrackRow {
  id: string; // JOB/HBL #
  customer: string;
  route: string; // INNSA → DEHAM
  carrier: string;
  etd: string;
  eta: string;
  milestones: Milestone[];
}

const statusColor = (s: ExecStatus) =>
  s === "Delivered" || s === "Arrived" || s === "Sailed"
    ? "success"
    : "warning";

/* ========= Seed ========= */
const seed: TrackRow[] = [
  {
    id: "JOB-240921-001",
    customer: "Acme Textiles",
    route: "INNSA → DEHAM",
    carrier: "MSC",
    etd: "2025-09-22",
    eta: "2025-10-13",
    milestones: [
      { name: "Planned", done: true, when: "2025-09-15" },
      { name: "Pickup Scheduled", done: true, when: "2025-09-16" },
      { name: "At CFS", done: true, when: "2025-09-17" },
      { name: "Gate-in", done: true, when: "2025-09-18" },
      { name: "Sailed", done: false },
      { name: "Arrived", done: false },
      { name: "Delivered", done: false },
    ],
  },
  {
    id: "JOB-240921-014",
    customer: "Zen Importers",
    route: "CNSHA → INNSA",
    carrier: "CMA CGM",
    etd: "2025-09-24",
    eta: "2025-10-08",
    milestones: [
      { name: "Planned", done: true, when: "2025-09-18" },
      { name: "Pickup Scheduled", done: false },
      { name: "At CFS", done: false },
      { name: "Gate-in", done: false },
      { name: "Sailed", done: false },
      { name: "Arrived", done: false },
      { name: "Delivered", done: false },
    ],
  },
];

/* ========= Local atoms ========= */
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
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
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

/* ========= Page ========= */
export default function ShipmentTrackingMilestones() {
  const [rows, setRows] = useState<TrackRow[]>(seed);

  // filters
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.customer.toLowerCase().includes(s) ||
        r.route.toLowerCase().includes(s) ||
        r.carrier.toLowerCase().includes(s)
    );
  }, [rows, q]);

  // drawer (details + manual set)
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => rows.find((r) => r.id === openId) || null,
    [openId, rows]
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const close = () => setOpenId(null);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  // toggle a milestone (quick manual mark)
  const toggle = (id: string, idx: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              milestones: r.milestones.map((m, i) =>
                i === idx
                  ? {
                      ...m,
                      done: !m.done,
                      when: !m.done
                        ? new Date().toISOString().slice(0, 10)
                        : undefined,
                    }
                  : m
              ),
            }
      )
    );

  // manual set via dropdown + date
  const [manualStatus, setManualStatus] = useState<ExecStatus>("Planned");
  const [manualDate, setManualDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const applyManual = () => {
    if (!open) return;
    const idx = open.milestones.findIndex((m) => m.name === manualStatus);
    if (idx < 0) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id !== open.id
          ? r
          : {
              ...r,
              milestones: r.milestones.map((m, i) =>
                i === idx ? { ...m, done: true, when: manualDate } : m
              ),
            }
      )
    );
  };

  // avoid .at(-1) for older TS targets
  const latest = (r: TrackRow): ExecStatus => {
    const done = r.milestones.filter((m) => m.done);
    return done.length ? done[done.length - 1].name : "Planned";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Shipment Tracking & Milestones
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Track Shipments & Milestones
        </div>
        <div className="mt-1 text-sm opacity-95">
          Update milestones manually and keep customers informed in real time.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Job #, Customer, Carrier, Route…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
            />
          </div>
        </div>
      </Section>

      {/* List */}
      <Section title={`Active Shipments (${filtered.length})`}>
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {r.id} · {r.customer}
                    </div>
                    <Badge size="sm" color={statusColor(latest(r)) as any}>
                      {latest(r)}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {r.route} • Carrier: <b>{r.carrier}</b> • ETD: {r.etd} •
                    ETA: {r.eta}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {r.milestones.map((m, i) => (
                    <button
                      key={m.name}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                        m.done
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-slate-500 hover:bg-slate-600"
                      }`}
                      onClick={() => toggle(r.id, i)}
                      title={m.when ? `Done on ${m.when}` : "Mark done"}
                    >
                      {m.name}
                    </button>
                  ))}
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => {
                      setOpenId(r.id);
                      setManualStatus(latest(r));
                      setManualDate(new Date().toISOString().slice(0, 10));
                    }}
                  >
                    View / Set Status
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No shipments found.
            </div>
          )}
        </div>
      </Section>

      {/* Drawer: details + manual status */}
      {/* Drawer: details + manual status */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={close}
            />

            {/* Panel */}
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking inside
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
                      id="track-drawer-title"
                      className="text-base font-semibold"
                    >
                      {open.id} · {open.customer}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      {open.route} • Carrier: <b>{open.carrier}</b>
                    </div>
                  </div>

                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={close}
                  >
                    Close
                  </button>
                </div>

                {/* chips */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    ETD: {open.etd}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    ETA: {open.eta}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ring-1 ring-white/30 ${((): string => {
                      const cur = (open.milestones
                        .filter((m) => m.done)
                        .slice(-1)[0]?.name || "Planned") as ExecStatus;
                      return cur === "Delivered" ||
                        cur === "Arrived" ||
                        cur === "Sailed"
                        ? "bg-emerald-400/25"
                        : "bg-amber-400/25";
                    })()}`}
                  >
                    Current:{" "}
                    {open.milestones.filter((m) => m.done).slice(-1)[0]?.name ||
                      "Planned"}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
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
                      Current:{" "}
                      <b>
                        {open.milestones.filter((m) => m.done).slice(-1)[0]
                          ?.name || "Planned"}
                      </b>
                    </div>
                    <div>
                      Status Color:{" "}
                      <b>
                        {(() => {
                          const cur = (open.milestones
                            .filter((m) => m.done)
                            .slice(-1)[0]?.name || "Planned") as ExecStatus;
                          return cur === "Delivered" ||
                            cur === "Arrived" ||
                            cur === "Sailed"
                            ? "success"
                            : "warning";
                        })()}
                      </b>
                    </div>
                  </div>
                </div>

                {/* Milestones timeline */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Milestones
                  </div>
                  <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {open.milestones.map((m) => (
                      <li key={m.name}>
                        • <b>{m.name}</b> —{" "}
                        {m.done ? `Done on ${m.when}` : "Pending"}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* STICKY FOOTER (Manual change) */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label>Set Status</Label>
                      <Select
                        value={manualStatus}
                        onChange={(e) =>
                          setManualStatus(e.target.value as ExecStatus)
                        }
                      >
                        {open.milestones.map((m) => (
                          <option key={m.name}>{m.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      onClick={applyManual}
                    >
                      Apply Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
