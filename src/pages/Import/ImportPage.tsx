import React, { useMemo, useState } from "react";

/* ---------- Primitives (same style as your app) ---------- */
const Card = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number | React.ReactNode;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
      {value}
    </div>
    {sub ? (
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>
    ) : null}
  </div>
);

const Label = ({ children }: React.PropsWithChildren) => (
  <label className="text-xs text-gray-500 dark:text-gray-400">{children}</label>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};
const Input = (p: InputProps) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className ?? ""
    }`}
  />
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};
const Select = (p: SelectProps) => (
  <select
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className ?? ""
    }`}
  />
);

/* ---------- Types & demo data ---------- */
const MODE_OPTIONS = ["FCL", "LCL", "Air"] as const;
type Mode = (typeof MODE_OPTIONS)[number];
const CARRIER_OPTIONS = [
  "MSC",
  "Maersk",
  "CMA CGM",
  "ONE",
  "EK",
  "QR",
] as const;
type Carrier = (typeof CARRIER_OPTIONS)[number];
const IMPORT_STATUS = [
  "draft",
  "arrived",
  "customs",
  "delivered",
  "invoiced",
] as const;
type ImportStatus = (typeof IMPORT_STATUS)[number];

type ImportShipment = {
  id: string;
  reference: string;
  mode: Mode;
  carrier: Carrier;
  origin: string;
  destination: string;
  vessel?: string;
  voyage?: string;
  etd?: string;
  eta?: string;
  createdAt: string;
  status: ImportStatus;
  incoterm: "EXW" | "FCA" | "FOB" | "CIF" | "DAP" | "DDP";
  containers?: number;
  volumeCbm?: number;
};

const IMPORTS: ImportShipment[] = [
  {
    id: "IMP-91011",
    reference: "PO-SHA-2201",
    mode: "FCL",
    carrier: "Maersk",
    origin: "CNSHA",
    destination: "INNSA",
    vessel: "MAERSK HANOI",
    voyage: "MH202",
    etd: "2025-10-02",
    eta: "2025-10-21",
    createdAt: "2025-09-25",
    status: "arrived",
    incoterm: "CIF",
    containers: 2,
  },
  {
    id: "IMP-91012",
    reference: "PO-SIN-118",
    mode: "FCL",
    carrier: "CMA CGM",
    origin: "SGSIN",
    destination: "INNSA",
    vessel: "CMA CGM MEDEA",
    voyage: "0ME4EU2",
    etd: "2025-10-10",
    eta: "2025-10-28",
    createdAt: "2025-10-01",
    status: "customs",
    incoterm: "FOB",
    containers: 1,
  },
  {
    id: "IMP-91013",
    reference: "PO-DOH-77",
    mode: "Air",
    carrier: "QR",
    origin: "DOH",
    destination: "INDEL",
    etd: "2025-10-14",
    eta: "2025-10-15",
    createdAt: "2025-10-13",
    status: "delivered",
    incoterm: "DAP",
  },
  {
    id: "IMP-91014",
    reference: "PO-EU-008",
    mode: "LCL",
    carrier: "ONE",
    origin: "DEHAM",
    destination: "INNSA",
    etd: "2025-09-20",
    eta: "2025-10-18",
    createdAt: "2025-09-12",
    status: "invoiced",
    incoterm: "DDP",
    volumeCbm: 8.5,
  },
];

const StatusPill = ({ s }: { s: ImportStatus }) => {
  const map: Record<ImportStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200",
    arrived:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    customs:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    delivered:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    invoiced:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s]}`}
    >
      {s[0].toUpperCase() + s.slice(1)}
    </span>
  );
};

const PIPE = ["draft", "arrived", "customs", "delivered", "invoiced"] as const;
function Pipeline({
  counts,
  active,
  onClick,
}: {
  counts: Partial<Record<ImportStatus, number>>;
  active: ImportStatus | "all";
  onClick: (s: ImportStatus | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {["all", ...PIPE].map((s) => (
        <button
          key={s}
          onClick={() => onClick(s as any)}
          className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
            active === s
              ? "border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-white/10 dark:text-sky-300"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          }`}
        >
          {String(s).replace(/^./, (c) => c.toUpperCase())}
          {s !== "all" ? (
            <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {counts[s as ImportStatus] ?? 0}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default function ImportPage() {
  const [mode, setMode] = useState<Mode | "all">("all");
  const [carrier, setCarrier] = useState<Carrier | "all">("all");
  const [status, setStatus] = useState<ImportStatus | "all">("all");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return IMPORTS.filter((s) => {
      if (mode !== "all" && s.mode !== mode) return false;
      if (carrier !== "all" && s.carrier !== carrier) return false;
      if (status !== "all" && s.status !== status) return false;
      if (origin && s.origin !== origin.toUpperCase()) return false;
      if (destination && s.destination !== destination.toUpperCase())
        return false;
      if (from && new Date(s.createdAt) < from) return false;
      if (to && new Date(s.createdAt) > to) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${s.id} ${s.reference} ${s.origin} ${s.destination} ${
          s.carrier
        } ${s.mode} ${s.vessel ?? ""} ${s.voyage ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mode, carrier, status, origin, destination, dateFrom, dateTo, search]);

  const counts = useMemo(
    () =>
      filtered.reduce(
        (acc: Partial<Record<ImportStatus, number>>, s) => (
          (acc[s.status] = (acc[s.status] ?? 0) + 1), acc
        ),
        {}
      ),
    [filtered]
  );

  const kpi = useMemo(() => {
    const now = new Date();
    const etaSoon = filtered.filter(
      (s) =>
        s.eta &&
        new Date(s.eta!) >= now &&
        new Date(s.eta!) <= new Date(now.getTime() + 7 * 24 * 3600 * 1000)
    ).length;
    const delivered = filtered.filter((s) => s.status === "delivered").length;
    const customs = filtered.filter((s) => s.status === "customs").length;
    const arrived = filtered.filter((s) => s.status === "arrived").length;
    return { etaSoon, delivered, customs, arrived };
  }, [filtered]);

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">User ▸ Import</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Import</div>
        <div className="mt-1 text-sm opacity-95">
          Track inbound shipments, customs, and delivery milestones.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="ETA ≤ 7d" value={kpi.etaSoon} sub="Arriving soon" />
        <Card title="Arrived" value={kpi.arrived} sub="At POD" />
        <Card title="Customs" value={kpi.customs} sub="Pending clearance" />
        <Card
          title="Delivered"
          value={kpi.delivered}
          sub="Completed deliveries"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { k: "overview", t: "Overview" },
            { k: "milestones", t: "Milestones" },
            { k: "bookings", t: "Bookings" },
            { k: "documents", t: "Documents" },
            { k: "invoices", t: "Invoices" },
          ].map((tab) => (
            <button
              key={tab.k}
              className="rounded-xl border border-gray-300 px-3 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            >
              {tab.t}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Create Import PO
            </button>
            <button className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700">
              New Inbound Booking
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <Label>Mode</Label>
            <Select
              value={mode}
              onChange={(e) => setMode(e.currentTarget.value as Mode | "all")}
            >
              {["all", ...MODE_OPTIONS].map((opt) => (
                <option key={opt} value={opt as any}>
                  {String(opt)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Carrier</Label>
            <Select
              value={carrier}
              onChange={(e) =>
                setCarrier(e.currentTarget.value as Carrier | "all")
              }
            >
              {["all", ...CARRIER_OPTIONS].map((opt) => (
                <option key={opt} value={opt as any}>
                  {String(opt)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.currentTarget.value as ImportStatus | "all")
              }
            >
              {["all", ...IMPORT_STATUS].map((opt) => (
                <option key={opt} value={opt as any}>
                  {String(opt).replace(/^./, (c) => c.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Origin</Label>
            <Input
              placeholder="e.g., CNSHA"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div>
            <Label>Destination</Label>
            <Input
              placeholder="e.g., INNSA"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div>
            <Label>Date From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by booking, reference, vessel, voyage…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("all");
                setCarrier("all");
                setStatus("all");
                setOrigin("");
                setDestination("");
                setDateFrom("");
                setDateTo("");
                setSearch("");
              }}
              className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Save View
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Pipeline
        </div>
        <div className="mt-3">
          <Pipeline
            counts={counts}
            active={status}
            onClick={setStatus as any}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Inbound Shipments ({filtered.length})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <button className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Export CSV
            </button>
            <button className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Bulk Actions
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.04]">
              <tr>
                {[
                  "Booking ID",
                  "Customer Ref",
                  "Mode",
                  "Carrier",
                  "Route",
                  "Vessel/Voyage",
                  "ETD",
                  "ETA",
                  "Status",
                  "Incoterm",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={
                      idx % 2
                        ? "bg-white dark:bg-transparent"
                        : "bg-gray-50/70 dark:bg-white/[0.02]"
                    }
                  >
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.id}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.reference}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.mode}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.carrier}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.origin} → {s.destination}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.vessel ? `${s.vessel} / ${s.voyage ?? "—"}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.etd ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.eta ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      <StatusPill s={s.status} />
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {s.incoterm}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-gray-500 dark:text-gray-400"
                    colSpan={10}
                  >
                    No results match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} shipments
        </div>
      </div>
    </div>
  );
}
