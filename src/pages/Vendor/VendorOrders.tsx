import { useMemo, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

// --- Types ---
type OrderStatus = "Pending" | "In Progress" | "Completed" | "Canceled";

interface VendorOrder {
  id: string;
  ref: string; // Internal Job Reference
  vendor: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    avatarInitials: string;
  };
  service: {
    type: string; // e.g. Trucking, CFS, CHA
    details: string; // Description of work
  };
  dates: {
    issued: string;
    expectedCompletion: string;
  };
  financials: {
    amountINR: number;
    isPaid: boolean;
    invoiceNo?: string;
  };
  status: OrderStatus;
  timeline: {
    date: string;
    title: string;
    description: string;
  }[];
}

// --- Helpers ---
const inr = (v: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v)}`;

const color = (s: OrderStatus) =>
  s === "Completed"
    ? "success"
    : s === "Canceled"
    ? "error"
    : s === "In Progress"
    ? "warning"
    : "gray";

// --- Seed Data ---
const seed: VendorOrder[] = [
  {
    id: "VO-101",
    ref: "JOB-22451",
    vendor: {
      name: "Mariner Logistics LLP",
      contactPerson: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "accounts@mariner.com",
      avatarInitials: "ML",
    },
    service: {
      type: "Trucking",
      details: "Transport 2x20FT Containers from JNPT to Bhiwandi Warehouse.",
    },
    dates: {
      issued: "2025-09-15",
      expectedCompletion: "2025-09-18",
    },
    financials: {
      amountINR: 45000,
      isPaid: false,
    },
    status: "Pending",
    timeline: [
      {
        date: "2025-09-15 10:00 AM",
        title: "Order Created",
        description: "Work order issued to vendor.",
      },
    ],
  },
  {
    id: "VO-102",
    ref: "JOB-22469",
    vendor: {
      name: "Skyway Warehousing",
      contactPerson: "Amit Verma",
      phone: "+91 99887 76655",
      email: "ops@skyway.in",
      avatarInitials: "SW",
    },
    service: {
      type: "CFS / Warehouse",
      details:
        "Storage and handling for 1 Week (500 Sq Ft). Includes destuffing.",
    },
    dates: {
      issued: "2025-09-16",
      expectedCompletion: "2025-09-23",
    },
    financials: {
      amountINR: 21000,
      isPaid: false,
    },
    status: "In Progress",
    timeline: [
      {
        date: "2025-09-16 02:30 PM",
        title: "Goods Received",
        description: "Cargo arrived at warehouse facility.",
      },
      {
        date: "2025-09-16 09:00 AM",
        title: "Order Accepted",
        description: "Vendor confirmed availability.",
      },
    ],
  },
  {
    id: "VO-103",
    ref: "JOB-22488",
    vendor: {
      name: "Swift Customs Broking",
      contactPerson: "Priya Singh",
      phone: "+91 91234 56780",
      email: "priya@swiftcb.com",
      avatarInitials: "SC",
    },
    service: {
      type: "CHA",
      details: "Customs Clearance for Import Consignment #IM-9981.",
    },
    dates: {
      issued: "2025-09-14",
      expectedCompletion: "2025-09-16",
    },
    financials: {
      amountINR: 18000,
      isPaid: true,
      invoiceNo: "INV-2025-001",
    },
    status: "Completed",
    timeline: [
      {
        date: "2025-09-16 05:00 PM",
        title: "Bill of Entry Filed",
        description: "BoE #882292 generated successfully.",
      },
      {
        date: "2025-09-14 11:15 AM",
        title: "Docs Submitted",
        description: "Checklist approved by client.",
      },
    ],
  },
];

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>(seed);
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");

  // --- Derived State ---
  const filtered = useMemo(() => {
    let res = orders;
    if (statusFilter !== "All") {
      res = res.filter((o) => o.status === statusFilter);
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      res = res.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.vendor.name.toLowerCase().includes(s) ||
          o.ref.toLowerCase().includes(s) ||
          o.service.type.toLowerCase().includes(s)
      );
    }
    return res;
  }, [orders, q, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const totalValue = orders.reduce((acc, o) => acc + o.financials.amountINR, 0);
    const pendingCount = orders.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    ).length;
    return { total, totalValue, pendingCount };
  }, [orders]);

  // --- Handlers ---
  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 p-6 text-white shadow-xl shadow-blue-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-100 opacity-80">
              <span className="uppercase tracking-wider">Vendors</span>
              <span>/</span>
              <span className="uppercase tracking-wider">Orders</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Vendor Orders
            </h1>
            <p className="mt-1 text-sky-100/90 text-sm max-w-xl">
              Manage work orders, track vendor performance, and monitor financial
              commitments in real-time.
            </p>
          </div>
          {/* Top Stats Mini-Cards (Floating on header) */}
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
              <div className="text-xs text-sky-200">Total Value</div>
              <div className="font-mono text-lg font-semibold">
                {inr(stats.totalValue)}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
              <div className="text-xs text-sky-200">Active Orders</div>
              <div className="font-mono text-lg font-semibold">
                {stats.pendingCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="size-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="w-full rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-sky-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Search by ID, Vendor, or Service..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Pending", "In Progress", "Completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
          <div
            key={order.id}
            className={`group overflow-hidden rounded-xl border transition-all ${
              isExpanded
                ? "border-sky-200 bg-sky-50/30 dark:border-sky-900 dark:bg-sky-900/10"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
            }`}
          >
            {/* Main Row */}
            <div className="p-5">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Left: Vendor & ID */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-sm font-bold text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300">
                    {order.vendor.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                        {order.id}
                        </span>
                        <Badge size="sm" color={color(order.status) as any}>
                        {order.status}
                        </Badge>
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {order.vendor.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                       Ref: <span className="font-medium text-gray-700 dark:text-gray-300">{order.ref}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Service Info */}
                <div className="flex-1 md:border-l md:border-r md:border-gray-100 md:px-6 dark:md:border-gray-800">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Service Details
                    </div>
                    <div className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                        {order.service.type}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                        {order.service.details}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            Issued: <span className="text-gray-700 dark:text-gray-300">{order.dates.issued}</span>
                        </span>
                        <span className="h-3 w-px bg-gray-300 dark:bg-gray-700"></span>
                        <span className="flex items-center gap-1">
                            Due: <span className="text-gray-700 dark:text-gray-300">{order.dates.expectedCompletion}</span>
                        </span>
                    </div>
                </div>

                {/* Right: Financials & Actions */}
                <div className="flex flex-col items-end gap-3 md:w-1/4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {inr(order.financials.amountINR)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {order.financials.isPaid ? (
                            <span className="flex items-center justify-end gap-1 text-emerald-600 font-medium">
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Paid
                            </span>
                        ) : (
                             <span className="text-amber-600 font-medium">Payment Pending</span>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => toggleExpand(order.id)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                        {isExpanded ? "Less Info" : "Details"}
                    </button>
                    {order.status === 'Pending' && (
                        <button 
                            onClick={() => handleStatusChange(order.id, "In Progress")}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-700">
                            Approve
                        </button>
                    )}
                     {order.status === 'In Progress' && (
                        <button 
                            onClick={() => handleStatusChange(order.id, "Completed")}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700">
                            Mark Done
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details Section */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* 1. Contact Info */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Vendor Contact
                            </h4>
                             <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700/50">
                                <div className="font-semibold text-gray-900 dark:text-white">{order.vendor.contactPerson}</div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {order.vendor.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {order.vendor.email}
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* 2. Full Task Description */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Work Order Details
                            </h4>
                            <div className="rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700/50">
                                <p className="leading-relaxed">{order.service.details}</p>
                                <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Internal Reference</span>
                                        <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{order.ref}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Activity Timeline */}
                        <div className="space-y-3 md:col-span-2 lg:col-span-1">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Activity Log
                            </h4>
                            <div className="relative space-y-4 border-l border-gray-200 pl-4 dark:border-gray-700">
                                {order.timeline.map((event, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-sky-500 dark:border-gray-900"></div>
                                        <div className="text-xs font-medium text-gray-900 dark:text-white">{event.title}</div>
                                        <div className="text-[10px] text-gray-500">{event.date}</div>
                                        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{event.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions Footer within Expanded */}
                        <div className="flex justify-end pt-2 md:col-span-2 lg:col-span-3">
                             <button className="flex items-center gap-2 text-xs font-medium text-rose-600 hover:text-rose-700" onClick={() => handleStatusChange(order.id, "Canceled")}>
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Cancel Order
                             </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )})}
        
        {!filtered.length && (
           <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-white/[0.02]">
             <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg className="size-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No orders found</h3>
             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
           </div>
        )}
      </div>
    </div>
  );
}
