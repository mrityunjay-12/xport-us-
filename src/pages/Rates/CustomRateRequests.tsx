import React, { useEffect, useMemo, useRef, useState } from "react";

import Badge from "../../components/ui/badge/Badge";
import { createPortal } from "react-dom";

/* =========================
   Types
   ========================= */
type Direction = "Export" | "Import";
type Service = "FCL" | "LCL" | "Air";
type ContainerSize = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC";
type Status = "New" | "Sales Review" | "Pricing Review" | "Quoted" | "Rejected";

interface CustomRateRequest {
  id: string;
  createdAt: string;
  customer?: string;
  direction: Direction;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  service: Service;
  container: ContainerSize;
  weightKg?: string;
  incoterm?: string;
  validity?: string; // yyyy-mm-dd
  targetRateINR?: number;
  notes?: string;
  attachments?: string[]; // filenames
  status: Status;
  assigneeRole?: "Sales" | "Pricing";
  assigneeName?: string;
  quoteRef?: string; // when converted
}

/* =========================
   Helpers
   ========================= */
const inr = (v?: number) =>
  v == null
    ? "—"
    : `INR ${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(v)}`;

const statusColor = (s: Status) =>
  s === "Quoted" ? "success" : s === "Rejected" ? "error" : "warning";

/* =========================
   Mock data
   ========================= */
const seedRequests: CustomRateRequest[] = [
  {
    id: "CR-240917-001",
    createdAt: "2025-09-16T10:00:00Z",
    customer: "Acme Textiles Pvt Ltd",
    direction: "Export",
    originCode: "INNSA",
    originName: "Nhava Sheva, India",
    destinationCode: "DEHAM",
    destinationName: "Hamburg, Germany",
    service: "FCL",
    container: "20 ft - Standard",
    weightKg: "19,000",
    incoterm: "FOB",
    validity: "2025-10-15",
    targetRateINR: 1500000,
    notes: "Direct service preferred; earliest sailing.",
    attachments: ["so.pdf"],
    status: "New",
  },
  {
    id: "CR-240917-002",
    createdAt: "2025-09-16T12:30:00Z",
    customer: "Zen Importers",
    direction: "Import",
    originCode: "CNSHA",
    originName: "Shanghai, China",
    destinationCode: "INNSA",
    destinationName: "Nhava Sheva, India",
    service: "LCL",
    container: "40 ft - Standard",
    weightKg: "6,500",
    incoterm: "CIF",
    validity: "2025-10-10",
    targetRateINR: 420000,
    notes: "Weekly console ok; need DO included.",
    attachments: [],
    status: "Sales Review",
    assigneeRole: "Sales",
    assigneeName: "Ananya",
  },
  {
    id: "CR-240917-003",
    createdAt: "2025-09-15T16:45:00Z",
    customer: "Nimbus Global",
    direction: "Export",
    originCode: "INMUN",
    originName: "Mundra, India",
    destinationCode: "AEJEA",
    destinationName: "Jebel Ali, UAE",
    service: "FCL",
    container: "40 ft - HC",
    weightKg: "23,000",
    incoterm: "EXW",
    validity: "2025-10-20",
    status: "Pricing Review",
    assigneeRole: "Pricing",
    assigneeName: "Rohit",
  },
];

/* =========================
   Small UI atoms used locally
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
export default function CustomRateRequests() {
  /* ----- form state ----- */
  const [form, setForm] = useState<
    Omit<CustomRateRequest, "id" | "createdAt" | "status">
  >({
    customer: "",
    direction: "Export",
    originCode: "INNSA",
    originName: "Nhava Sheva, India",
    destinationCode: "DEHAM",
    destinationName: "Hamburg, Germany",
    service: "FCL",
    container: "20 ft - Standard",
    weightKg: "",
    incoterm: "FOB",
    validity: "",
    targetRateINR: undefined,
    notes: "",
    attachments: [],
  });

  const [requests, setRequests] = useState<CustomRateRequest[]>(seedRequests);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useMemo(
    () => requests.find((r) => r.id === openId) || null,
    [openId, requests]
  );

  const panelRef = useRef<HTMLDivElement | null>(null);
  const close = () => setOpenId(null);

  // lock background scroll + ESC to close + focus the panel
  useEffect(() => {
    if (!open) return;

    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    // focus the drawer for a11y / keyboard users
    requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  /* ----- form handlers ----- */
  const createRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: CustomRateRequest = {
      id: `CR-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${
        (Math.random() * 1000) | 0
      }`,
      createdAt: new Date().toISOString(),
      status: "New",
      ...form,
    };
    setRequests((prev) => [newReq, ...prev]);
    setForm((f) => ({ ...f, notes: "", targetRateINR: undefined }));
  };

  /* ----- list actions ----- */
  const assign = (id: string, role: "Sales" | "Pricing") => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              assigneeRole: role,
              assigneeName: role === "Sales" ? "Auto-Sales" : "Auto-Pricing",
              status: role === "Sales" ? "Sales Review" : "Pricing Review",
            }
          : r
      )
    );
  };

  const convertToQuote = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Quoted", quoteRef: `QT-${r.id.slice(-3)}` }
          : r
      )
    );
  };

  const reject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Rates ▸ Custom Rate Requests</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Create & Manage Custom Rates
        </div>
        <div className="mt-1 text-sm opacity-95">
          Route requests to <b>Sales</b> / <b>Pricing Manager</b> → generate{" "}
          <b>Quote</b>.
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left: Form */}
        <Section title="New Custom Rate Request">
          <form
            onSubmit={createRequest}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <Label>Customer (optional)</Label>
              <Input
                placeholder="Customer / Account"
                value={form.customer || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Direction</Label>
              <Select
                value={form.direction}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    direction: e.target.value as Direction,
                  }))
                }
              >
                <option>Export</option>
                <option>Import</option>
              </Select>
            </div>

            <div>
              <Label>Service</Label>
              <Select
                value={form.service}
                onChange={(e) =>
                  setForm((f) => ({ ...f, service: e.target.value as Service }))
                }
              >
                <option>FCL</option>
                <option>LCL</option>
                <option>Air</option>
              </Select>
            </div>

            <div>
              <Label>Origin (Port / Airport)</Label>
              <Input
                value={`${form.originCode} - ${form.originName}`}
                onChange={() => {}}
                readOnly
              />
            </div>

            <div>
              <Label>Destination (Port / Airport)</Label>
              <Input
                value={`${form.destinationCode} - ${form.destinationName}`}
                onChange={() => {}}
                readOnly
              />
            </div>

            <div>
              <Label>Container</Label>
              <Select
                value={form.container}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    container: e.target.value as ContainerSize,
                  }))
                }
              >
                <option>20 ft - Standard</option>
                <option>40 ft - Standard</option>
                <option>40 ft - HC</option>
              </Select>
            </div>

            <div>
              <Label>Weight (kgs)</Label>
              <Input
                placeholder="e.g. 19,000"
                value={form.weightKg || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weightKg: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Incoterm</Label>
              <Select
                value={form.incoterm || "FOB"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, incoterm: e.target.value }))
                }
              >
                {["EXW", "FCA", "FOB", "CIF", "CFR", "DAP", "DDP"].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Validity</Label>
              <Input
                type="date"
                value={form.validity || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validity: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Target Rate (INR)</Label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 1,500,000"
                value={form.targetRateINR ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    targetRateINR: e.target.value
                      ? Number(e.target.value.replace(/,/g, ""))
                      : undefined,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Any special instructions (direct service, cut-offs, free days…) "
                value={form.notes || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Attachments</Label>
              <Input type="file" multiple onChange={() => {}} />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Optional: SO/PO/specs—hook upload to your API.
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Submit Request
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    notes: "",
                    targetRateINR: undefined,
                  }))
                }
              >
                Save Draft
              </button>
            </div>
          </form>
        </Section>

        {/* Right: Requests list */}
        <Section title="Requests Queue">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {requests.length} request{requests.length > 1 ? "s" : ""} in queue
            </div>
          </div>

          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {r.id} · {r.direction} {r.service}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {r.originCode} – {r.originName} → {r.destinationCode} –{" "}
                      {r.destinationName}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      Target: <b>{inr(r.targetRateINR)}</b> · Valid till{" "}
                      <b>{r.validity || "—"}</b>
                    </div>
                  </div>

                  <Badge size="sm" color={statusColor(r.status) as any}>
                    {r.status}
                  </Badge>
                </div>

                {r.assigneeRole ? (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Assigned to <b>{r.assigneeRole}</b>{" "}
                    {r.assigneeName ? `(${r.assigneeName})` : ""}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(r.id)}
                  >
                    View
                  </button>
                  <button
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    onClick={() => assign(r.id, "Sales")}
                  >
                    Assign to Sales
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                    onClick={() => assign(r.id, "Pricing")}
                  >
                    Assign to Pricing
                  </button>
                  <button
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                    onClick={() => convertToQuote(r.id)}
                    disabled={r.status === "Quoted" || r.status === "Rejected"}
                  >
                    Convert to Quote
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    onClick={() => reject(r.id)}
                    disabled={r.status === "Rejected"}
                  >
                    Reject
                  </button>
                </div>

                {r.quoteRef && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Quote generated: <b>{r.quoteRef}</b>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]" /* above header/sidebar */
            role="dialog"
            aria-modal="true"
            aria-labelledby="crr-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={close}
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
              <div className="relative">
                <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        id="crr-drawer-title"
                        className="text-base font-semibold"
                      >
                        {open.id} · {open.direction} {open.service}
                      </div>
                      <div className="mt-0.5 text-[12px]/5 opacity-90">
                        {open.originCode} – {open.originName} →{" "}
                        {open.destinationCode} – {open.destinationName}
                      </div>
                    </div>
                  </div>

                  {/* quick chips */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Container: {open.container}
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Weight: {open.weightKg || "—"} kg
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Incoterm: {open.incoterm || "—"}
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Valid till: {open.validity || "—"}
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                      Target: {inr(open.targetRateINR)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ring-1 ring-white/30 ${
                        open.status === "Quoted"
                          ? "bg-emerald-400/25"
                          : open.status === "Rejected"
                          ? "bg-rose-400/25"
                          : "bg-amber-400/25"
                      }`}
                    >
                      {open.status}
                    </span>
                  </div>
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
                      Container: <b>{open.container}</b>
                    </div>
                    <div>
                      Weight: <b>{open.weightKg || "—"} kg</b>
                    </div>
                    <div>
                      Incoterm: <b>{open.incoterm || "—"}</b>
                    </div>
                    <div>
                      Validity: <b>{open.validity || "—"}</b>
                    </div>
                    <div>
                      Target: <b>{inr(open.targetRateINR)}</b>
                    </div>
                    <div>
                      Status: <b>{open.status}</b>
                    </div>
                  </div>
                  {open.notes && (
                    <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                      Notes: {open.notes}
                    </div>
                  )}
                </div>

                {/* Timeline & Actions */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Workflow Timeline
                  </div>
                  <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      • Request created (
                      {new Date(open.createdAt).toLocaleString()})
                    </li>
                    <li>
                      •{" "}
                      {open.assigneeRole
                        ? `Assigned to ${open.assigneeRole}${
                            open.assigneeName ? ` (${open.assigneeName})` : ""
                          }`
                        : "Unassigned"}
                    </li>
                    <li>
                      • Current status: <b>{open.status}</b>
                    </li>
                    {open.quoteRef && (
                      <li>
                        • Quote generated: <b>{open.quoteRef}</b>
                      </li>
                    )}
                  </ol>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      onClick={() => assign(open.id, "Sales")}
                    >
                      Assign to Sales
                    </button>
                    <button
                      className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                      onClick={() => assign(open.id, "Pricing")}
                    >
                      Assign to Pricing
                    </button>
                    <button
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                      onClick={() => convertToQuote(open.id)}
                      disabled={
                        open.status === "Quoted" || open.status === "Rejected"
                      }
                    >
                      Convert to Quote
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                      onClick={() => reject(open.id)}
                      disabled={open.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Attachments */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Attachments
                  </div>
                  {open.attachments?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {open.attachments.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                          <svg
                            className="size-3.5 opacity-70"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M4 3a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0117 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" />
                          </svg>
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No files
                    </div>
                  )}
                </div>
              </div>

              {/* STICKY FOOTER */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={close}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                    onClick={() => convertToQuote(open.id)}
                    disabled={
                      open.status === "Quoted" || open.status === "Rejected"
                    }
                  >
                    Convert to Quote
                  </button>
                  <button
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                    onClick={() => assign(open.id, "Sales")}
                  >
                    Assign to Sales
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-700"
                    onClick={() => assign(open.id, "Pricing")}
                  >
                    Assign to Pricing
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    onClick={() => reject(open.id)}
                    disabled={open.status === "Rejected"}
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
