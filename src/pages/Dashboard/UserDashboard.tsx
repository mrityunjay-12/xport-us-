import React, { useMemo, useState } from "react";

/* ---------- Small UI primitives ---------- */
const Card = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
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

/* ---------- Typed option sets (no any) ---------- */
const SERVICE_OPTIONS = ["all", "export", "import"] as const;
type ServiceFilter = (typeof SERVICE_OPTIONS)[number];

const MODE_OPTIONS = ["all", "FCL", "LCL", "Air"] as const;
type ModeFilter = (typeof MODE_OPTIONS)[number];

const CARRIER_OPTIONS = ["all", "MSC", "Maersk", "CMA CGM", "ONE"] as const;
type CarrierFilter = (typeof CARRIER_OPTIONS)[number];

const STATUS_OPTIONS = [
  "all",
  "pending",
  "processing",
  "approved",
  "invoiced",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function isOneOf<T extends readonly string[]>(
  v: string,
  list: T
): v is T[number] {
  return (list as readonly string[]).includes(v);
}

/* ---------- Demo data ---------- */
type Task = {
  id: string;
  type: "export" | "import";
  mode: "FCL" | "LCL" | "Air";
  carrier: "MSC" | "Maersk" | "CMA CGM" | "ONE";
  status: "pending" | "processing" | "approved" | "invoiced";
  origin: string;
  destination: string;
  createdAt: string; // YYYY-MM-DD
  title: string;
};

const DEMO_TASKS: Task[] = [
  {
    id: "T-1001",
    type: "export",
    mode: "FCL",
    carrier: "MSC",
    status: "approved",
    origin: "INNSA",
    destination: "DEHAM",
    createdAt: "2025-10-05",
    title: "Publish MSC FAK India→EU",
  },
  {
    id: "T-1002",
    type: "import",
    mode: "LCL",
    carrier: "Maersk",
    status: "processing",
    origin: "CNSHA",
    destination: "INNSA",
    createdAt: "2025-10-07",
    title: "Pull Maersk spot CNSHA→INNSA",
  },
  {
    id: "T-1003",
    type: "export",
    mode: "Air",
    carrier: "CMA CGM",
    status: "pending",
    origin: "INDEL",
    destination: "AEJEA",
    createdAt: "2025-10-08",
    title: "Air quote request DEL→JEA",
  },
  {
    id: "T-1004",
    type: "export",
    mode: "FCL",
    carrier: "ONE",
    status: "invoiced",
    origin: "INMUM",
    destination: "NLRTM",
    createdAt: "2025-09-29",
    title: "ONE IN→EU service billing",
  },
  {
    id: "T-1005",
    type: "import",
    mode: "FCL",
    carrier: "CMA CGM",
    status: "approved",
    origin: "SGSIN",
    destination: "INNSA",
    createdAt: "2025-10-09",
    title: "Do request: SGSIN→INNSA FCL",
  },
];

/* ---------- Sidebar ---------- */
const Sidebar = () => (
  <aside className="w-full sm:w-60 shrink-0">
    <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Customer Hub
      </div>
      <nav className="mt-2 grid gap-1 text-sm">
        {[
          { icon: "⏱️", label: "Highlights" },
          { icon: "📦", label: "Quote & Book" },
          { icon: "🚢", label: "Export" },
          { icon: "📥", label: "Import" },
          { icon: "💳", label: "Finance" },
          { icon: "⚙️", label: "Settings" },
        ].map((i) => (
          <button
            key={i.label}
            type="button"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <span className="text-base">{i.icon}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </nav>
    </div>
  </aside>
);

/* ---------- Main Page ---------- */
export default function UserDashboard() {
  const [service, setService] = useState<ServiceFilter>("all");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [carrier, setCarrier] = useState<CarrierFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return DEMO_TASKS.filter((t) => {
      if (service !== "all" && t.type !== service) return false;
      if (mode !== "all" && t.mode !== mode) return false;
      if (carrier !== "all" && t.carrier !== carrier) return false;
      if (status !== "all" && t.status !== status) return false;

      if (from && new Date(t.createdAt) < from) return false;
      if (to && new Date(t.createdAt) > to) return false;

      if (search) {
        const q = search.toLowerCase();
        const hay =
          `${t.id} ${t.title} ${t.origin} ${t.destination} ${t.carrier} ${t.mode} ${t.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [service, mode, carrier, status, dateFrom, dateTo, search]);

  const kpi = useMemo(() => {
    const approvedOrInvoiced = filtered.filter(
      (t) => t.status === "approved" || t.status === "invoiced"
    ).length;
    const success =
      filtered.length === 0
        ? 0
        : Math.round((100 * approvedOrInvoiced) / filtered.length);
    const pulls = filtered.filter((t) => /pull|spot|api/i.test(t.title)).length;
    return {
      published: approvedOrInvoiced,
      avgTransitExportFCL: 24.6,
      success,
      pulls,
    };
  }, [filtered]);

  return (
    <div className="grid gap-6 ">
      {/* <Sidebar /> */}

      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
          <div className="text-xs leading-5 opacity-90">User ▸ Dashboard</div>
          <div className="mt-1 text-lg font-semibold sm:text-xl">
            Customer Dashboard
          </div>
          <div className="mt-1 text-sm opacity-95">
            Highlights, filters, tracking and recent activity tailored for the
            user.
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <Label>Service</Label>
              <Select
                value={service}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  if (isOneOf(v, SERVICE_OPTIONS)) setService(v);
                }}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt[0].toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Mode</Label>
              <Select
                value={mode}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  if (isOneOf(v, MODE_OPTIONS)) setMode(v);
                }}
              >
                {MODE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Carrier</Label>
              <Select
                value={carrier}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  if (isOneOf(v, CARRIER_OPTIONS)) setCarrier(v);
                }}
              >
                {CARRIER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  if (isOneOf(v, STATUS_OPTIONS)) setStatus(v);
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt[0].toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </Select>
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
                placeholder="Search by task ID, route, carrier…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setService("all");
                  setMode("all");
                  setCarrier("all");
                  setStatus("all");
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Published / Invoiced"
            value={kpi.published}
            sub="Filtered items"
          />
          <Card
            title="Avg. Transit (Export FCL)"
            value={`${kpi.avgTransitExportFCL} d`}
            sub="Placeholder"
          />
          <Card
            title="Upload/Process Success"
            value={`${kpi.success}%`}
            sub="Approved or invoiced"
          />
          <Card
            title="API Pulls (matching)"
            value={kpi.pulls}
            sub="Detected by title"
          />
        </div>
        {/* Tracking Search */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Tracking
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Input placeholder="Search by booking or container reference" />
            <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              Search
            </button>
          </div>
        </div>
        {/* Highlights */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="SpotOn"
            value={filtered.filter((t) => /spot/i.test(t.title)).length}
            sub="Available"
          />
          <Card
            title="Export tasks"
            value={filtered.filter((t) => t.type === "export").length}
            sub="Available"
          />
          <Card
            title="Do request"
            value={filtered.filter((t) => /request/i.test(t.title)).length}
            sub="Available"
          />
          <Card
            title="Invoices"
            value={filtered.filter((t) => t.status === "invoiced").length}
            sub="Available"
          />
        </div>
        {/* Tasks Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Tasks ({filtered.length})
          </div>
          <div className="mt-3 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.04]">
                <tr>
                  {[
                    "ID",
                    "Service",
                    "Mode",
                    "Carrier",
                    "Route",
                    "Status",
                    "Date",
                    "Title",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={
                        idx % 2
                          ? "bg-white dark:bg-transparent"
                          : "bg-gray-50/70 dark:bg-white/[0.02]"
                      }
                    >
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.id}
                      </td>
                      <td className="px-3 py-2 capitalize text-gray-800 dark:text-gray-100">
                        {t.type}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.mode}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.carrier}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.origin} → {t.destination}
                      </td>
                      <td className="px-3 py-2 capitalize text-gray-800 dark:text-gray-100">
                        {t.status}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.createdAt}
                      </td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {t.title}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-3 py-6 text-gray-500 dark:text-gray-400"
                      colSpan={8}
                    >
                      No results match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Showing {filtered.length} items</span>
            <button className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Export CSV
            </button>
          </div>
        </div>
        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Recent Activity
          </div>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {DEMO_TASKS.slice(0, 3).map((t) => (
              <li key={t.id}>• {t.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
