import React, { useMemo, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

type OrderStatus = "Pending" | "In Progress" | "Completed" | "Canceled";
interface VendorOrder {
  id: string;
  vendorName: string;
  service: string; // Trucking / CFS / CHA / etc.
  ref: string; // your internal ref / job#
  date: string;
  amountINR: number;
  status: OrderStatus;
}

const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;
const color = (s: OrderStatus) =>
  s === "Completed" ? "success" : s === "Canceled" ? "error" : "warning";

const seed: VendorOrder[] = [
  {
    id: "VO-101",
    vendorName: "Mariner Logistics LLP",
    service: "Trucking",
    ref: "JOB-22451",
    date: "2025-09-15",
    amountINR: 45000,
    status: "Pending",
  },
  {
    id: "VO-102",
    vendorName: "Skyway Warehousing",
    service: "CFS / Warehouse",
    ref: "JOB-22469",
    date: "2025-09-16",
    amountINR: 21000,
    status: "In Progress",
  },
  {
    id: "VO-103",
    vendorName: "Swift Customs Broking",
    service: "CHA",
    ref: "JOB-22488",
    date: "2025-09-16",
    amountINR: 18000,
    status: "Completed",
  },
];

export default function VendorOrders() {
  const [orders, setOrders] = useState(seed);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return orders;
    const s = q.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.vendorName.toLowerCase().includes(s) ||
        o.ref.toLowerCase().includes(s) ||
        o.service.toLowerCase().includes(s)
    );
  }, [orders, q]);

  const setStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Vendors ▸ Orders</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Manage Vendor Orders
        </div>
        <div className="mt-1 text-sm opacity-95">
          Track work orders issued to vendors and update their status.
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <label className="text-xs text-gray-500 dark:text-gray-400">
          Search
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          placeholder="Order ID, Vendor, Ref, Service…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {o.id} · {o.vendorName}
                    </div>
                    <Badge size="sm" color={color(o.status) as any}>
                      {o.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Service: <b>{o.service}</b> • Ref: <b>{o.ref}</b> • Date:{" "}
                    {o.date}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                      Amount
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {inr(o.amountINR)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                      onClick={() => setStatus(o.id, "In Progress")}
                    >
                      Mark In Progress
                    </button>
                    <button
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      onClick={() => setStatus(o.id, "Completed")}
                    >
                      Complete
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                      onClick={() => setStatus(o.id, "Canceled")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
