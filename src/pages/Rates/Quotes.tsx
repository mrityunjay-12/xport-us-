import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

/* =========================
   Types
   ========================= */
type Direction = "Export" | "Import";
type Service = "FCL" | "LCL" | "Air";
type ContainerSize = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC";
type QuoteStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Locked"
  | "Sent";

interface ChargeRow {
  label: string;
  amount: number;
}

interface Quote {
  id: string; // Quote#
  createdAt: string;
  customer: string;
  direction: Direction;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  service: Service;
  container: ContainerSize;
  priceINR: number;
  validity: string; // yyyy-mm-dd
  status: QuoteStatus;
  approver?: string;
  remarks?: string;
  charges: ChargeRow[];
  lockedAt?: string | null;
}

/* =========================
   Helpers
   ========================= */
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;

const statusColor = (s: QuoteStatus) =>
  s === "Approved" || s === "Locked" || s === "Sent"
    ? "success"
    : s === "Rejected"
    ? "error"
    : "warning";

/* =========================
   Mock data
   ========================= */
const seedQuotes: Quote[] = [
  {
    id: "QT-240917-001",
    createdAt: "2025-09-16T10:00:00Z",
    customer: "Acme Textiles Pvt Ltd",
    direction: "Export",
    originCode: "INNSA",
    originName: "Nhava Sheva, India",
    destinationCode: "DEHAM",
    destinationName: "Hamburg, Germany",
    service: "FCL",
    container: "20 ft - Standard",
    priceINR: 1519384,
    validity: "2025-10-15",
    status: "Pending Approval",
    charges: [
      { label: "Base Freight", amount: 1300000 },
      { label: "Bunker & Surcharges", amount: 120000 },
      { label: "Documentation", amount: 30000 },
      { label: "Taxes", amount: 69000 },
    ],
  },
  {
    id: "QT-240917-002",
    createdAt: "2025-09-16T12:10:00Z",
    customer: "Zen Importers",
    direction: "Import",
    originCode: "CNSHA",
    originName: "Shanghai, China",
    destinationCode: "INNSA",
    destinationName: "Nhava Sheva, India",
    service: "LCL",
    container: "40 ft - Standard",
    priceINR: 419384,
    validity: "2025-10-10",
    status: "Approved",
    approver: "Ananya",
    charges: [
      { label: "Ocean + Console", amount: 360000 },
      { label: "Destination", amount: 30000 },
      { label: "Documentation", amount: 9000 },
      { label: "Taxes", amount: 20384 },
    ],
  },
  {
    id: "QT-240916-003",
    createdAt: "2025-09-15T09:15:00Z",
    customer: "Nimbus Global",
    direction: "Export",
    originCode: "INMUN",
    originName: "Mundra, India",
    destinationCode: "AEJEA",
    destinationName: "Jebel Ali, UAE",
    service: "FCL",
    container: "40 ft - HC",
    priceINR: 289000,
    validity: "2025-10-20",
    status: "Draft",
    charges: [
      { label: "Base Freight", amount: 250000 },
      { label: "Documentation", amount: 12000 },
      { label: "Taxes", amount: 27000 },
    ],
  },
];

/* =========================
   Small UI atoms
   ========================= */
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

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      props.className || ""
    }`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      props.className || ""
    }`}
  />
);

/* =========================
   Page
   ========================= */
export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>(seedQuotes);
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | QuoteStatus>("");

  const open = useMemo(
    () => quotes.find((x) => x.id === openId) || null,
    [openId, quotes]
  );

  /* --------- actions ---------- */
  const approve = (id: string) =>
    setQuotes((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "Approved", approver: "You" } : x
      )
    );
  const reject = (id: string) =>
    setQuotes((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Rejected" } : x))
    );
  const lock = (id: string) =>
    setQuotes((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, status: "Locked", lockedAt: new Date().toISOString() }
          : x
      )
    );
  const unlock = (id: string) =>
    setQuotes((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "Approved", lockedAt: null } : x
      )
    );
  const send = (id: string) =>
    setQuotes((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Sent" } : x))
    );

  /* --------- filters ---------- */
  const filtered = useMemo(() => {
    let list = quotes;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (x) =>
          x.id.toLowerCase().includes(s) ||
          x.customer.toLowerCase().includes(s) ||
          x.originName.toLowerCase().includes(s) ||
          x.destinationName.toLowerCase().includes(s)
      );
    }
    if (status) list = list.filter((x) => x.status === status);
    return list;
  }, [quotes, q, status]);

  /* --------- drawer helpers ---------- */
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Rates ▸ Quotes</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Quotes</div>
        <div className="mt-1 text-sm opacity-95">
          Approve/Reject, **Lock** to freeze price, and **Send** to customer.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Quote #, Customer, Origin/Destination…"
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
              onChange={(e) => setStatus(e.target.value as QuoteStatus | "")}
            >
              <option value="">All</option>
              {[
                "Draft",
                "Pending Approval",
                "Approved",
                "Rejected",
                "Locked",
                "Sent",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
      <Section title={`Quotes (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((qte) => (
            <div
              key={qte.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {qte.id} · {qte.direction} {qte.service} • {qte.container}
                    </div>
                    <Badge size="sm" color={statusColor(qte.status) as any}>
                      {qte.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {qte.originCode} – {qte.originName} → {qte.destinationCode}{" "}
                    – {qte.destinationName}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Customer: <b>{qte.customer}</b> · Valid till{" "}
                    <b>{qte.validity}</b>
                    {qte.approver ? (
                      <>
                        {" "}
                        · Approver: <b>{qte.approver}</b>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                      Offer Price
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {inr(qte.priceINR)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      onClick={() => setOpenId(qte.id)}
                    >
                      View
                    </button>

                    {qte.status === "Pending Approval" ||
                    qte.status === "Draft" ? (
                      <>
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          onClick={() => approve(qte.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          onClick={() => reject(qte.id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : null}

                    {(qte.status === "Approved" || qte.status === "Sent") && (
                      <button
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        onClick={() => lock(qte.id)}
                      >
                        Lock Quote
                      </button>
                    )}

                    {qte.status === "Locked" && (
                      <button
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                        onClick={() => unlock(qte.id)}
                      >
                        Unlock
                      </button>
                    )}

                    {qte.status !== "Rejected" && (
                      <button
                        className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
                        onClick={() => send(qte.id)}
                      >
                        Send to Customer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No quotes match your filters.
            </div>
          )}
        </div>
      </Section>

      {/* Drawer */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Quote ${open.id}`}
              tabIndex={-1}
              className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {open.id} · {open.direction} {open.service} • {open.container}
                </div>
                <button
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={() => setOpenId(null)}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {/* Route & Customer */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Route & Customer
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {open.originCode} – {open.originName} →{" "}
                    {open.destinationCode} – {open.destinationName}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      Customer: <b>{open.customer}</b>
                    </div>
                    <div>
                      Validity: <b>{open.validity}</b>
                    </div>
                    <div>
                      Status: <b>{open.status}</b>
                    </div>
                    <div>
                      Created:{" "}
                      <b>{new Date(open.createdAt).toLocaleString()}</b>
                    </div>
                  </div>
                </div>

                {/* Price & Breakup */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Offer Price
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {inr(open.priceINR)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Price Breakup
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {open.charges.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between"
                      >
                        <span>{c.label}</span>
                        <span>{inr(c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(open.status === "Pending Approval" ||
                      open.status === "Draft") && (
                      <>
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          onClick={() => approve(open.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          onClick={() => reject(open.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(open.status === "Approved" || open.status === "Sent") && (
                      <button
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        onClick={() => lock(open.id)}
                      >
                        Lock Quote
                      </button>
                    )}
                    {open.status === "Locked" && (
                      <button
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                        onClick={() => unlock(open.id)}
                      >
                        Unlock
                      </button>
                    )}
                    {open.status !== "Rejected" && (
                      <button
                        className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
                        onClick={() => send(open.id)}
                      >
                        Send to Customer
                      </button>
                    )}
                  </div>
                  {open.lockedAt && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Locked at:{" "}
                      <b>{new Date(open.lockedAt).toLocaleString()}</b>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
