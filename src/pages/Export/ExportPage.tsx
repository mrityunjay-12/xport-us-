import React, { useMemo, useState } from "react";

/* ---------- Small UI primitives (same style as your provided file) ---------- */
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

/* ---------- Typed option sets ---------- */
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
const STATUS = [
  "draft",
  "quoted",
  "booked",
  "sailed",
  "arrived",
  "invoiced",
] as const;
type Status = (typeof STATUS)[number];

/* ---------- Demo data ---------- */
type Shipment = {
  id: string; // booking or internal id
  reference: string; // customer ref
  mode: Mode;
  carrier: Carrier;
  origin: string; // UN/Locode
  destination: string; // UN/Locode
  vessel?: string;
  voyage?: string;
  etd?: string; // YYYY-MM-DD
  eta?: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  status: Status;
  incoterm: "EXW" | "FCA" | "FOB" | "CIF" | "DAP" | "DDP";
  containers?: number; // for FCL
  volumeCbm?: number; // for LCL
};

const SHIPMENTS: Shipment[] = [
  {
    id: "BKG-81021",
    reference: "PO-DEL-001",
    mode: "FCL",
    carrier: "CMA CGM",
    origin: "INNSA",
    destination: "DEHAM",
    vessel: "CMA CGM TOSCA",
    voyage: "0TX3ZW1MA",
    etd: "2025-10-19",
    eta: "2025-11-13",
    createdAt: "2025-10-10",
    status: "booked",
    incoterm: "FOB",
    containers: 2,
  },
  {
    id: "BKG-81022",
    reference: "PO-MUM-033",
    mode: "LCL",
    carrier: "Maersk",
    origin: "INMUM",
    destination: "DEHAM",
    etd: "2025-10-21",
    eta: "2025-11-18",
    createdAt: "2025-10-11",
    status: "quoted",
    incoterm: "EXW",
    volumeCbm: 12.5,
  },
  {
    id: "BKG-81023",
    reference: "PO-DEL-AIR-07",
    mode: "Air",
    carrier: "EK",
    origin: "INDEL",
    destination: "AEJEA",
    etd: "2025-10-16",
    eta: "2025-10-19",
    createdAt: "2025-10-12",
    status: "draft",
    incoterm: "FCA",
  },
  {
    id: "BKG-81024",
    reference: "PO-NOA-991",
    mode: "FCL",
    carrier: "MSC",
    origin: "INNSA",
    destination: "NLRTM",
    vessel: "MSC AURORA",
    voyage: "UA123",
    etd: "2025-10-05",
    eta: "2025-10-30",
    createdAt: "2025-09-28",
    status: "sailed",
    incoterm: "FOB",
    containers: 1,
  },
  {
    id: "BKG-81025",
    reference: "PO-CN-225",
    mode: "FCL",
    carrier: "ONE",
    origin: "CNSHA",
    destination: "INNSA",
    vessel: "ONE HUMBER",
    voyage: "HB002",
    etd: "2025-09-15",
    eta: "2025-10-12",
    createdAt: "2025-09-05",
    status: "arrived",
    incoterm: "CIF",
    containers: 3,
  },
];

/* ---------- Helpers ---------- */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- Status pill ---------- */
const StatusPill = ({ s }: { s: Status }) => {
  const map: Record<Status, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200",
    quoted: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
    booked: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    sailed:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
    arrived:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    invoiced:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s]}`}
    >
      {capitalize(s)}
    </span>
  );
};

/* ---------- Pipeline ---------- */
const PIPE = [
  "draft",
  "quoted",
  "booked",
  "sailed",
  "arrived",
  "invoiced",
] as const;
function Pipeline({
  counts,
  active,
  onClick,
}: {
  counts: Partial<Record<Status, number>>;
  active: Status | "all";
  onClick: (s: Status | "all") => void;
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
          {capitalize(String(s))}
          {s !== "all" ? (
            <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {counts[s as Status] ?? 0}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function ExportPage() {
  // Filters
  const [mode, setMode] = useState<Mode | "all">("all");
  const [carrier, setCarrier] = useState<Carrier | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return SHIPMENTS.filter((s) => {
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

  const counts = useMemo(() => {
    return filtered.reduce((acc: Partial<Record<Status, number>>, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [filtered]);

  const kpi = useMemo(() => {
    const now = new Date();
    const sailingSoon = filtered.filter(
      (s) =>
        s.etd &&
        new Date(s.etd!) >= now &&
        new Date(s.etd!) <= new Date(now.getTime() + 7 * 24 * 3600 * 1000)
    ).length;
    const arrived = filtered.filter((s) => s.status === "arrived").length;
    const booked = filtered.filter((s) => s.status === "booked").length;
    const inTransit = filtered.filter((s) => s.status === "sailed").length;
    return { sailingSoon, arrived, booked, inTransit };
  }, [filtered]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">User ▸ Export</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Export</div>
        <div className="mt-1 text-sm opacity-95">
          Plan, quote, book and track your export shipments.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Booked"
          value={kpi.booked}
          sub="Confirmed export bookings"
        />
        <Card
          title="Sailing ≤ 7d"
          value={kpi.sailingSoon}
          sub="Upcoming ETDs"
        />
        <Card title="In Transit" value={kpi.inTransit} sub="Currently sailed" />
        <Card title="Arrived" value={kpi.arrived} sub="Delivered at POD" />
      </div>

      {/* Tabs (local only) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { k: "overview", t: "Overview" },
            { k: "schedules", t: "Schedules" },
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
              Create Export Quote
            </button>
            <button className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700">
              Create Booking
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
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
                setStatus(e.currentTarget.value as Status | "all")
              }
            >
              {["all", ...STATUS].map((opt) => (
                <option key={opt} value={opt as any}>
                  {String(opt).replace(/^./, (c) => c.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Origin</Label>
            <Input
              placeholder="e.g., INNSA"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div>
            <Label>Destination</Label>
            <Input
              placeholder="e.g., DEHAM"
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

      {/* Pipeline quick filter */}
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

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Shipments ({filtered.length})
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

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Quick Actions
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
            New Export Booking
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Request Quote
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Upload SI / Docs
          </button>
        </div>
      </div>
    </div>
  );
}
