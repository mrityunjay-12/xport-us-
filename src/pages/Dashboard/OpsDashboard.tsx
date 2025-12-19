import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

/* ---------- UI Primitives ---------- */
const StatCard = ({
  title,
  value,
  sub,
  status,
}: {
  title: string;
  value: string | number;
  sub?: string;
  status?: "critical" | "warning" | "success" | "neutral";
}) => {
  const statusColors = {
    critical: "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    warning: "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400",
    neutral: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  const colorClass = status ? statusColors[status] : statusColors.neutral;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {value}
        </div>
        {status && (
          <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
            {status.toUpperCase()}
          </div>
        )}
      </div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
};

/* ---------- Demo Data ---------- */
type Shipment = {
  id: string;
  route: string;
  mode: "Air" | "Ocean" | "Truck";
  eta: string;
  status: "On Time" | "Delayed" | "Customs Hold" | "Arrived";
};

const EXCEPTION_SHIPMENTS: Shipment[] = [
  { id: "SH-9001", route: "CNSHA → USLAX", mode: "Ocean", eta: "2d overdue", status: "Delayed" },
  { id: "SH-9032", route: "INBLR → DEHAM", mode: "Air", eta: "4h left", status: "Customs Hold" },
  { id: "SH-8840", route: "VNHCM → USNYC", mode: "Ocean", eta: "On Schedule", status: "On Time" },
  { id: "SH-9100", route: "SGSIN → JPTYO", mode: "Air", eta: "Arrived", status: "Arrived" },
];

type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
};

const PENDING_TASKS: Task[] = [
  { id: "TK-1", title: "Verify Comm. Invoice #4402", priority: "High", due: "Today" },
  { id: "TK-2", title: "Approve HBL draft for SHE", priority: "Medium", due: "Tomorrow" },
  { id: "TK-3", title: "Update ETA for delayed vessel", priority: "High", due: "Today" },
];

export default function OpsDashboard() {
  const [filter, setFilter] = useState("all");

  const filteredShipments = useMemo(() => {
    if (filter === "all") return EXCEPTION_SHIPMENTS;
    return EXCEPTION_SHIPMENTS.filter((s) => s.status.toLowerCase().includes(filter));
  }, [filter]);

  return (
    <div className="grid gap-6">
      <PageMeta
        title="Xport Us - Operations Dashboard"
        description="Operational oversight, shipment tracking, and exception management."
      />

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">Operations ▸ Dashboard</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Operations Control Center
        </div>
        <div className="mt-1 text-sm opacity-95">
          Monitor active shipments, resolve exceptions, and manage logistics tasks.
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Shipments" value="142" sub="+8 this week" status="neutral" />
        <StatCard title="Critical Exceptions" value="3" sub="Requires immediate action" status="critical" />
        <StatCard title="Customs Holds" value="5" sub="Pending clearance" status="warning" />
        <StatCard title="On-Time Perf." value="94%" sub="Last 30 days" status="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Exception List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Shipment Watchlist
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs rounded-full ${filter === 'all' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500'}`}>All</button>
              <button onClick={() => setFilter('delayed')} className={`px-3 py-1 text-xs rounded-full ${filter === 'delayed' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'text-gray-500'}`}>Delayed</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">ETA/Remark</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-medium text-gray-800 dark:text-white">{s.id}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{s.route}</td>
                    <td className="px-3 py-3">{s.mode}</td>
                    <td className="px-3 py-3">
                       <Badge
                        color={s.status === 'Delayed' ? 'error' : s.status === 'Customs Hold' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{s.eta}</td>
                    <td className="px-3 py-3">
                      <button className="text-brand-500 hover:text-brand-600 text-xs font-semibold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Pending Actions
            </h3>
            <ul className="space-y-3">
              {PENDING_TASKS.map((task) => (
                <li key={task.id} className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
                   <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{task.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {task.priority}
                      </span>
                   </div>
                   <div className="text-xs text-gray-500 flex justify-between">
                      <span>ID: {task.id}</span>
                      <span>Due: {task.due}</span>
                   </div>
                   <button className="mt-1 w-full text-center text-xs font-medium text-brand-500 hover:underline">Complete Task</button>
                </li>
              ))}
            </ul>
             <button className="mt-4 w-full rounded-lg bg-gray-800 py-2 text-xs font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
              Go to Task Manager
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
             <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Global Operations Map
            </h3>
            <div className="aspect-video w-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                [ Interactive Map Placeholder ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
