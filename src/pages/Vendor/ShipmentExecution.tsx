import { useState } from "react";
import Badge from "../../components/ui/badge/Badge";

// --- Types ---
type MilestoneStatus = "Completed" | "In Progress" | "Pending" | "Delayed";

interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  date?: string;
  description: string;
  location?: string;
}

interface Shipment {
  id: string;
  hbl: string;
  customer: string;
  origin: { code: string; name: string };
  destination: { code: string; name: string };
  carrier: { name: string; vessel: string; voyage: string };
  dates: { etd: string; eta: string };
  goods: string; // Brief description of cargo
  containerNo: string;
  status: "On Schedule" | "Delayed" | "Arrived";
  milestones: Milestone[];
}

// --- Helpers ---
const statusColor = (s: MilestoneStatus) =>
  s === "Completed"
    ? "success"
    : s === "Delayed"
    ? "error"
    : s === "In Progress"
    ? "warning"
    : "gray";

const shipmentStatusColor = (s: Shipment["status"]) =>
  s === "Arrived" ? "success" : s === "Delayed" ? "error" : "info";

// --- Seed Data ---
const seed: Shipment[] = [
  {
    id: "JOB-22451",
    hbl: "HBL-998877",
    customer: "Acme Textiles Ltd.",
    origin: { code: "INNSA", name: "Nhava Sheva, India" },
    destination: { code: "DEHAM", name: "Hamburg, Germany" },
    carrier: { name: "MSC", vessel: "MSC OSCAR", voyage: "VOY-224A" },
    dates: { etd: "2025-09-20", eta: "2025-10-12" },
    goods: "2x40HC Containers - Cotton Fabrics",
    containerNo: "MSCU1234567",
    status: "On Schedule",
    milestones: [
      {
        id: "M1",
        name: "Shipment Planned",
        status: "Completed",
        date: "2025-09-14 10:00",
        description: "Booking confirmed with carrier.",
      },
      {
        id: "M2",
        name: "Gate In",
        status: "Completed",
        date: "2025-09-18 14:30",
        description: "Containers received at terminal.",
        location: "JNPT Terminal 2",
      },
      {
        id: "M3",
        name: "Vessel Departure (Sailed)",
        status: "In Progress",
        date: "2025-09-20",
        description: "Vessel has left the port of origin.",
      },
      {
        id: "M4",
        name: "Arrival at Transshipment",
        status: "Pending",
        description: "Expected arrival at Mundra for connection.",
      },
      {
        id: "M5",
        name: "Destination Arrival",
        status: "Pending",
        description: "Expected arrival at Hamburg port.",
      },
    ],
  },
  {
    id: "JOB-22469",
    hbl: "HBL-776655",
    customer: "Zen Importers Inc.",
    origin: { code: "CNSHA", name: "Shanghai, China" },
    destination: { code: "INNSA", name: "Nhava Sheva, India" },
    carrier: { name: "CMA CGM", vessel: "CMA MARCO POLO", voyage: "VOY-998B" },
    dates: { etd: "2025-09-22", eta: "2025-10-09" },
    goods: "1x20GP - Electronic Components",
    containerNo: "CMAU9876543",
    status: "Delayed",
    milestones: [
      {
        id: "M1",
        name: "Booking Confirmed",
        status: "Completed",
        date: "2025-09-16 09:00",
        description: "Space secured on vessel.",
      },
      {
        id: "M2",
        name: "Customs Clearance",
        status: "Delayed",
        date: "2025-09-21 17:00",
        description: "Held for physical inspection.",
        location: "Shanghai Customs",
      },
      {
        id: "M3",
        name: "Vessel Departure",
        status: "Pending",
        description: "Revised ETD pending due to customs hold.",
      },
    ],
  },
];

export default function ShipmentExecution() {
  const [shipments, setShipments] = useState<Shipment[]>(seed);
  const [expandedId, setExpandedId] = useState<string | null>(seed[0].id); // Open first by default

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const updateMilestone = (
    shipmentId: string,
    milestoneId: string,
    newStatus: MilestoneStatus
  ) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;
        return {
          ...s,
          milestones: s.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  status: newStatus,
                  date:
                    newStatus === "Completed"
                      ? new Date().toISOString().slice(0, 16).replace("T", " ")
                      : m.date,
                }
              : m
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 p-6 text-white shadow-xl shadow-blue-900/10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-100 opacity-80">
            <span className="uppercase tracking-wider">Operations</span>
            <span>/</span>
            <span className="uppercase tracking-wider">Execution</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Shipment Execution</h1>
          <p className="max-w-xl text-sm text-sky-100/90">
            Monitor active shipments, update milestone progress, and ensure timely
            delivery for customers.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {shipments.map((shipment) => {
          const isExpanded = expandedId === shipment.id;
          const completedCount = shipment.milestones.filter(
            (m) => m.status === "Completed"
          ).length;
          const progress = Math.round(
            (completedCount / shipment.milestones.length) * 100
          );

          return (
            <div
              key={shipment.id}
              className={`rounded-2xl border bg-white transition-all overflow-hidden ${
                isExpanded
                  ? "border-sky-200 shadow-lg ring-1 ring-sky-100 dark:border-sky-900 dark:bg-gray-800 dark:ring-sky-900/30"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
              }`}
            >
              {/* Summary Row (Always Visible) */}
              <div
                className="cursor-pointer p-6"
                onClick={() => toggleExpand(shipment.id)}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  {/* Left: Identity & Route */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        {shipment.id}
                      </span>
                      <Badge size="sm" color={shipmentStatusColor(shipment.status) as any}>
                        {shipment.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        HBL: <span className="font-medium text-gray-700 dark:text-gray-300">{shipment.hbl}</span>
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                        <span>{shipment.origin.code}</span>
                        <svg className="size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        <span>{shipment.destination.code}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                        {shipment.customer}
                    </div>
                  </div>

                  {/* Middle: Carrier Info */}
                  <div className="lg:border-l lg:border-r lg:border-gray-100 lg:px-8 dark:lg:border-gray-700">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div>
                              <div className="text-xs text-gray-400">Carrier</div>
                              <div className="font-medium text-gray-900 dark:text-white">{shipment.carrier.name}</div>
                          </div>
                            <div>
                              <div className="text-xs text-gray-400">Vessel / Voyage</div>
                              <div className="font-medium text-gray-900 dark:text-white">{shipment.carrier.vessel}</div>
                              <div className="text-xs text-gray-500">{shipment.carrier.voyage}</div>
                          </div>
                           <div>
                              <div className="text-xs text-gray-400">Container</div>
                              <div className="font-mono font-medium text-gray-800 dark:text-gray-200">{shipment.containerNo}</div>
                          </div>
                           <div>
                              <div className="text-xs text-gray-400">Cargo</div>
                              <div className="text-gray-800 dark:text-gray-200 truncate max-w-[120px]" title={shipment.goods}>{shipment.goods}</div>
                          </div>
                      </div>
                  </div>

                  {/* Right: Progress & Action */}
                  <div className="flex min-w-[200px] flex-col justify-between gap-3">
                      <div>
                          <div className="mb-1 flex justify-between text-xs">
                              <span className="font-medium text-gray-600 dark:text-gray-300">Milestone Progress</span>
                              <span className="font-bold text-sky-600 dark:text-sky-400">{progress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                              <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                          </div>
                            <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <span>{shipment.dates.etd}</span>
                                <span>{shipment.dates.eta}</span>
                            </div>
                      </div>
                      
                      <div className="text-right">
                         <span className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
                             {isExpanded ? 'Hide Details' : 'View Milestones'}
                         </span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Detailed View (Animated Expansion) */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Vertical Stepper */}
                        <div className="lg:col-span-2">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Shipment Timeline</h3>
                            <div className="relative space-y-8 pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 h-[calc(100%-24px)] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                
                                {shipment.milestones.map((m) => (
                                    <div key={m.id} className="relative flex gap-4">
                                        {/* Status Dot */}
                                        <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 bg-white transition-colors dark:bg-gray-800 ${
                                            m.status === 'Completed' ? 'border-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:text-emerald-400' :
                                            m.status === 'Delayed' ? 'border-rose-50 text-rose-600 dark:border-rose-900/30 dark:text-rose-400' :
                                            m.status === 'In Progress' ? 'border-sky-50 text-sky-600 dark:border-sky-900/30 dark:text-sky-400' :
                                            'border-gray-50 text-gray-300 dark:border-gray-800 dark:text-gray-600'
                                        }`}>
                                            {m.status === 'Completed' ? (
                                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                 <div className={`size-3 rounded-full ${
                                                    m.status === 'Delayed' ? 'bg-rose-500' :
                                                    m.status === 'In Progress' ? 'bg-sky-500' :
                                                    'bg-gray-300 dark:bg-gray-600'
                                                 }`}></div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className={`text-sm font-bold ${
                                                        m.status === 'Completed' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                                    }`}>{m.name}</h4>
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{m.description}</p>
                                                    {m.location && (
                                                         <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            {m.location}
                                                         </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <Badge size="sm" color={statusColor(m.status) as any}>{m.status}</Badge>
                                                    {m.date && (
                                                        <div className="mt-2 text-xs font-medium text-gray-500">{m.date}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                {m.status !== 'Completed' && (
                                                     <button 
                                                        onClick={() => updateMilestone(shipment.id, m.id, "Completed")}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                                 {m.status !== 'Delayed' && m.status !== 'Completed' && (
                                                     <button 
                                                        onClick={() => updateMilestone(shipment.id, m.id, "Delayed")}
                                                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    >
                                                        Report Delay
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Map Placeholder */}
                        <div>
                             <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Live Tracking</h3>
                             <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700">
                                {/* Placeholder Map Graphic */}
                                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-30"></div>
                                
                                {/* Overlay Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                     <div className="rounded-full bg-white/20 p-4 backdrop-blur-md">
                                        <svg className="size-8 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                     </div>
                                     <h4 className="mt-4 font-bold text-gray-800 dark:text-white">Live Map View</h4>
                                     <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                        Real-time vessel tracking is currently simulating. Connect GPS API to see live position.
                                     </p>
                                     <button className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-sky-500">
                                        Open Fullscreen Map
                                     </button>
                                </div>

                                {/* Animated Dots for Effect */}
                                <span className="absolute left-1/3 top-1/2 flex size-3">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                                  <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                                </span>
                             </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
