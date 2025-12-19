import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

/* ---------- UI Components ---------- */
const Card = ({
  title,
  value,
  sub,
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  trend?: { val: number; up: boolean };
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="flex items-start justify-between">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      {trend && (
        <Badge
          color={trend.up ? "success" : "error"}
          size="sm"
        >
          {trend.up ? "↑" : "↓"} {trend.val}%
        </Badge>
      )}
    </div>
    <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
      {value}
    </div>
    {sub ? (
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>
    ) : null}
  </div>
);

/* ---------- Demo Data ---------- */
type Lead = {
  id: string;
  contact: string;
  company: string;
  value: number;
  status: "New" | "Negotiating" | "Closed Won" | "Closed Lost";
  probability: number;
  lastContact: string;
};

const DEMO_LEADS: Lead[] = [
  {
    id: "L-101",
    contact: "Alice Smith",
    company: "Global Trade Co",
    value: 50000,
    status: "Negotiating",
    probability: 60,
    lastContact: "2 hrs ago",
  },
  {
    id: "L-102",
    contact: "Bob Johnson",
    company: "FastMove Logistics",
    value: 12000,
    status: "New",
    probability: 20,
    lastContact: "1 day ago",
  },
  {
    id: "L-103",
    contact: "Charlie Lee",
    company: "Oceanic Exports",
    value: 85000,
    status: "Closed Won",
    probability: 100,
    lastContact: "3 days ago",
  },
  {
    id: "L-104",
    contact: "Diana Prince",
    company: "Themyscira Imports",
    value: 34000,
    status: "Closed Lost",
    probability: 0,
    lastContact: "5 days ago",
  },
  {
    id: "L-105",
    contact: "Evan Wright",
    company: " Wright Shipping",
    value: 22000,
    status: "Negotiating",
    probability: 75,
    lastContact: "Just now",
  },
];

export default function SalesDashboard() {
  const [q, setQ] = useState("");

  const filteredLeads = useMemo(() => {
    if (!q) return DEMO_LEADS;
    const lower = q.toLowerCase();
    return DEMO_LEADS.filter(
      (l) =>
        l.company.toLowerCase().includes(lower) ||
        l.contact.toLowerCase().includes(lower)
    );
  }, [q]);

  const kpis = {
    revenue: "$124,500",
    deals: 15,
    pipeline: "$450k",
    conversion: 24,
  };

  return (
    <div className="grid gap-6">
      <PageMeta
        title="Xport Us - Sales Dashboard"
        description="Sales performance, pipeline tracking, and lead management."
      />

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">Sales ▸ Dashboard</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Sales Overview
        </div>
        <div className="mt-1 text-sm opacity-95">
          Track your performance, manage leads, and close more deals.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Total Revenue"
          value={kpis.revenue}
          sub="Current Month"
          trend={{ val: 12, up: true }}
        />
        <Card
          title="Deals Closed"
          value={kpis.deals}
          sub="Won opportunities"
          trend={{ val: 5, up: true }}
        />
        <Card
          title="Pipeline Value"
          value={kpis.pipeline}
          sub="Expected revenue"
          trend={{ val: 2, up: false }}
        />
        <Card
          title="Conversion Rate"
          value={`${kpis.conversion}%`}
          sub="Leads to Deals"
          trend={{ val: 4, up: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Leads Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Recent Opportunities
            </h3>
            <input
              type="text"
              placeholder="Search leads..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:w-64"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Prob.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-200">
                      {lead.company}
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                      {lead.contact}
                    </td>
                    <td className="px-3 py-3 text-gray-800 dark:text-gray-200">
                      ${lead.value.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        color={
                          lead.status === "Closed Won"
                            ? "success"
                            : lead.status === "Closed Lost"
                            ? "error"
                            : lead.status === "Negotiating"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                      {lead.probability}%
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No matching leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {DEMO_LEADS.slice(0, 4).map((lead, idx) => (
              <div key={lead.id} className="relative flex gap-3">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    idx % 2 === 0
                      ? "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400"
                  }`}
                >
                  <span className="text-xs font-bold">
                    {lead.contact.charAt(0)}
                  </span>
                </div>
                {idx !== 3 && (
                  <div className="absolute left-4 top-8 h-full w-px bg-gray-200 dark:bg-gray-800" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Interact with {lead.contact}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Updated status to <b className="lowercase">{lead.status}</b>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {lead.lastContact}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-violet-500 hover:text-violet-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-500 dark:hover:text-violet-400">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
