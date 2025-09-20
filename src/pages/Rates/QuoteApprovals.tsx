import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
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
    status: "Pending Approval",
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
export default function QuoteApprovals() {
  const [quotes, setQuotes] = useState<Quote[]>(seedQuotes);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<"" | Direction>("");
  const [service, setService] = useState<"" | Service>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const open = useMemo(
    () => quotes.find((x) => x.id === openId) || null,
    [openId, quotes]
  );

  const approvalsQueue = useMemo(
    () => quotes.filter((x) => x.status === "Pending Approval"),
    [quotes]
  );

  const filtered = useMemo(() => {
    let list = approvalsQueue;
    if (query.trim()) {
      const s = query.toLowerCase();
      list = list.filter(
        (x) =>
          x.id.toLowerCase().includes(s) ||
          x.customer.toLowerCase().includes(s) ||
          x.originName.toLowerCase().includes(s) ||
          x.destinationName.toLowerCase().includes(s)
      );
    }
    if (direction) list = list.filter((x) => x.direction === direction);
    if (service) list = list.filter((x) => x.service === service);
    return list;
  }, [approvalsQueue, query, direction, service]);

  /* --------- selection ---------- */
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const clearSel = () => setSelected(new Set());
  const allOnPageIds = filtered.map((q) => q.id);
  const allSelectedOnPage =
    allOnPageIds.every((id) => selected.has(id)) && allOnPageIds.length > 0;
  const toggleSelectAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        allOnPageIds.forEach((id) => next.delete(id));
      } else {
        allOnPageIds.forEach((id) => next.add(id));
      }
      return next;
    });

  /* --------- actions ---------- */
  const approveMany = (ids: string[], remarks?: string) =>
    setQuotes((prev) =>
      prev.map((x) =>
        ids.includes(x.id)
          ? { ...x, status: "Approved", approver: "You", remarks }
          : x
      )
    );

  const rejectMany = (ids: string[], remarks: string) =>
    setQuotes((prev) =>
      prev.map((x) =>
        ids.includes(x.id) ? { ...x, status: "Rejected", remarks } : x
      )
    );

  /* --------- drawer helpers ---------- */
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeDrawer = () => setOpenId(null);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  /* --------- approval modal ---------- */
  type ModalKind = null | "approve" | "reject";
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [modalIds, setModalIds] = useState<string[]>([]);
  const [modalRemarks, setModalRemarks] = useState("");

  const openModal = (kind: Exclude<ModalKind, null>, ids: string[]) => {
    setModalKind(kind);
    setModalIds(ids);
    setModalRemarks("");
  };
  const closeModal = () => {
    setModalKind(null);
    setModalIds([]);
    setModalRemarks("");
  };
  const confirmModal = () => {
    if (modalKind === "approve")
      approveMany(modalIds, modalRemarks || undefined);
    if (modalKind === "reject") {
      const r = modalRemarks.trim();
      if (!r) return; // simple guard; could add toast
      rejectMany(modalIds, r);
    }
    closeModal();
    clearSel();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Rates ▸ Quote Approvals</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Quote Approvals
        </div>
        <div className="mt-1 text-sm opacity-95">
          Review quotes awaiting approval. Approve/Reject individually or in
          bulk.
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Quote #, Customer, Origin/Destination…"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
          </div>
          <div>
            <Label>Direction</Label>
            <Select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction | "")}
            >
              <option value="">All</option>
              <option>Export</option>
              <option>Import</option>
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
              <option>Air</option>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              onClick={() => {
                setQuery("");
                setDirection("");
                setService("");
                clearSel();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* Queue + bulk actions */}
      <Section title={`Pending Approvals (${filtered.length})`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Select quotes to take bulk actions.
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={selected.size === 0}
              onClick={() => openModal("approve", Array.from(selected))}
            >
              Approve Selected
            </button>
            <button
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              disabled={selected.size === 0}
              onClick={() => openModal("reject", Array.from(selected))}
            >
              Reject Selected
            </button>
            <button
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50"
              disabled={filtered.length === 0}
              onClick={toggleSelectAll}
            >
              {allSelectedOnPage ? "Unselect All" : "Select All (Page)"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((qte) => {
            const checked = selected.has(qte.id);
            return (
              <div
                key={qte.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Left */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700"
                      checked={checked}
                      onChange={() => toggle(qte.id)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {qte.id} · {qte.direction} {qte.service} •{" "}
                          {qte.container}
                        </div>
                        <Badge size="sm" color={statusColor(qte.status) as any}>
                          {qte.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {qte.originCode} – {qte.originName} →{" "}
                        {qte.destinationCode} – {qte.destinationName}
                      </div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        Customer: <b>{qte.customer}</b> · Valid till{" "}
                        <b>{qte.validity}</b>
                      </div>
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
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        onClick={() => openModal("approve", [qte.id])}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                        onClick={() => openModal("reject", [qte.id])}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No quotes awaiting approval.
            </div>
          )}
        </div>
      </Section>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qa-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={closeDrawer}
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
                      id="qa-drawer-title"
                      className="text-base font-semibold"
                    >
                      {open.id} · {open.direction} {open.service} •{" "}
                      {open.container}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      {open.originCode} – {open.originName} →{" "}
                      {open.destinationCode} – {open.destinationName}
                    </div>
                  </div>

                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={closeDrawer}
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
                    Validity: {open.validity}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Offer: {inr(open.priceINR)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ring-1 ring-white/30 ${
                      open.status === "Approved" ||
                      open.status === "Locked" ||
                      open.status === "Sent"
                        ? "bg-emerald-400/25"
                        : open.status === "Rejected"
                        ? "bg-rose-400/25"
                        : "bg-amber-400/25"
                    }`}
                  >
                    {open.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Created: {new Date(open.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
                {/* Route & Customer */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Route & Customer
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
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

                {/* Offer & Breakup */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
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
                  <ul className="mt-2 divide-y divide-gray-100 text-sm text-gray-700 dark:divide-gray-800 dark:text-gray-300">
                    {open.charges.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span>{c.label}</span>
                        <span className="font-medium">{inr(c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* STICKY FOOTER ACTIONS */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={closeDrawer}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() => openModal("approve", [open.id])}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => openModal("reject", [open.id])}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Approval/Reject modal */}
      {modalKind &&
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {modalKind === "approve" ? "Approve" : "Reject"}{" "}
                  {modalIds.length > 1
                    ? `${modalIds.length} Quotes`
                    : modalIds[0]}
                </div>
                <button
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300">
                {modalKind === "approve" ? (
                  <p>Optionally add remarks for audit trail.</p>
                ) : (
                  <p className="text-rose-600 dark:text-rose-400">
                    Rejection remarks are required.
                  </p>
                )}
              </div>

              <textarea
                rows={4}
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder={
                  modalKind === "approve"
                    ? "Remarks (optional)"
                    : "Reason for rejection (required)"
                }
                value={modalRemarks}
                onChange={(e) => setModalRemarks(e.target.value)}
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    modalKind === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  } ${
                    modalKind === "reject" && !modalRemarks.trim()
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={confirmModal}
                  disabled={modalKind === "reject" && !modalRemarks.trim()}
                >
                  {modalKind === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
