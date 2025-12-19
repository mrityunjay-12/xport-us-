// src/pages/operations/ExceptionResolutionCenter.tsx
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

/* ========= Types ========= */
type Priority = "Low" | "Medium" | "High";
type ExceptionType =
  | "Customs Hold"
  | "Documentation"
  | "Carrier Delay"
  | "Invoice Verification"
  | "Vessel Rollover"
  | "Data Mismatch";

type ExceptionStatus =
  | "Open"
  | "In Progress"
  | "Waiting External"
  | "Resolved"
  | "Escalated";

type RootCause =
  | "Missing Document"
  | "Customs Query"
  | "Carrier Delay"
  | "Incorrect Data"
  | "Customer Pending"
  | "Other";

interface ExceptionRow {
  exceptionId: string; // EX-1024
  shipmentId: string; // SH-9032
  route: string; // CNSHA → USLAX
  mode: "Air" | "Ocean";
  type: ExceptionType;
  priority: Priority;
  owner: string; // Unassigned / name
  slaText: string; // "2h overdue", "4h left"
  slaState: "ok" | "due" | "overdue"; // for color hint
  status: ExceptionStatus;
  createdAt: string; // yyyy-mm-dd
  lastUpdatedAt: string; // yyyy-mm-dd
  notes?: string;
  attachments?: { name: string; url?: string }[];
  activity: { at: string; by: string; text: string }[];
}

/* ========= Helpers ========= */
const badgeColorForPriority = (p: Priority) => {
  if (p === "High") return "critical";
  if (p === "Medium") return "warning";
  return "neutral";
};

const badgeColorForStatus = (s: ExceptionStatus) => {
  if (s === "Resolved") return "success";
  if (s === "Escalated") return "critical";
  if (s === "Open") return "warning";
  if (s === "Waiting External") return "warning";
  return "neutral"; // In Progress
};

const slaTextClass = (slaState: ExceptionRow["slaState"]) => {
  if (slaState === "overdue") return "text-rose-600 dark:text-rose-400";
  if (slaState === "due") return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
};

/* ========= Seed ========= */
const seed: ExceptionRow[] = [
  {
    exceptionId: "EX-1024",
    shipmentId: "SH-9032",
    route: "INBLR → DEHAM",
    mode: "Air",
    type: "Customs Hold",
    priority: "High",
    owner: "Unassigned",
    slaText: "2h overdue",
    slaState: "overdue",
    status: "Open",
    createdAt: "2025-12-14",
    lastUpdatedAt: "2025-12-16",
    notes: "Awaiting customs clearance; missing broker response.",
    attachments: [{ name: "Customs Query.pdf" }],
    activity: [
      { at: "2025-12-14", by: "System", text: "Exception created: Customs Hold" },
      { at: "2025-12-16", by: "Ops Bot", text: "SLA breached; marked High priority" },
    ],
  },
  {
    exceptionId: "EX-1019",
    shipmentId: "SH-9001",
    route: "CNSHA → USLAX",
    mode: "Ocean",
    type: "Carrier Delay",
    priority: "Medium",
    owner: "Priya",
    slaText: "4h left",
    slaState: "due",
    status: "In Progress",
    createdAt: "2025-12-15",
    lastUpdatedAt: "2025-12-16",
    notes: "Carrier indicated vessel schedule shift. Updating ETA.",
    attachments: [{ name: "Carrier Email.msg" }],
    activity: [
      { at: "2025-12-15", by: "Priya", text: "Assigned to self; contacted carrier" },
      { at: "2025-12-16", by: "Priya", text: "Received carrier update; pending ETA confirmation" },
    ],
  },
  {
    exceptionId: "EX-1012",
    shipmentId: "SH-8840",
    route: "VNHCM → USNYC",
    mode: "Ocean",
    type: "Documentation",
    priority: "Low",
    owner: "Rohan",
    slaText: "On track",
    slaState: "ok",
    status: "Waiting External",
    createdAt: "2025-12-13",
    lastUpdatedAt: "2025-12-15",
    notes: "Waiting for customer to send signed BL copy.",
    attachments: [{ name: "BL Draft.pdf" }],
    activity: [
      { at: "2025-12-13", by: "System", text: "Exception created: Documentation" },
      { at: "2025-12-15", by: "Rohan", text: "Requested signed copy from customer" },
    ],
  },
  {
    exceptionId: "EX-1007",
    shipmentId: "SH-9100",
    route: "SGSIN → JPTYO",
    mode: "Air",
    type: "Invoice Verification",
    priority: "High",
    owner: "Aditi",
    slaText: "Due today",
    slaState: "due",
    status: "Open",
    createdAt: "2025-12-16",
    lastUpdatedAt: "2025-12-16",
    notes: "Commercial invoice verification required for release.",
    attachments: [{ name: "Invoice #4402.pdf" }],
    activity: [{ at: "2025-12-16", by: "System", text: "Exception created: Invoice Verification" }],
  },
];

/* ========= Local atoms (same style language) ========= */
const Section = ({
  title,
  right,
  children,
}: React.PropsWithChildren<{ title: string; right?: React.ReactNode }>) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="text-base font-semibold text-gray-800 dark:text-white/90">{title}</div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
    {children}
  </div>
);

const Label = ({ children }: React.PropsWithChildren) => (
  <label className="text-xs text-gray-500 dark:text-gray-400">{children}</label>
);

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className || ""
    }`}
  />
);

const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className || ""
    }`}
  />
);

function StatCard({
  title,
  value,
  sub,
  chip,
  chipTone,
}: {
  title: string;
  value: string;
  sub?: string;
  chip: string;
  chipTone: "success" | "warning" | "critical" | "neutral";
}) {
  const chipClasses =
    chipTone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-500/20"
      : chipTone === "critical"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-500/20"
      : chipTone === "warning"
      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-500/20"
      : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</div>
          {sub ? (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>
          ) : null}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chipClasses}`}>{chip}</span>
      </div>
    </div>
  );
}

/* ========= Page ========= */
export default function ExceptionResolutionCenter() {
  const [rows, setRows] = useState<ExceptionRow[]>(seed);

  // Filters
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatus] = useState<ExceptionStatus | "All">("All");
  const [owner, setOwner] = useState<string>("All");

  const owners = useMemo(() => {
    const set = new Set(rows.map((r) => r.owner));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !s ||
        r.exceptionId.toLowerCase().includes(s) ||
        r.shipmentId.toLowerCase().includes(s) ||
        r.route.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.owner.toLowerCase().includes(s);

      const matchesPriority = priority === "All" ? true : r.priority === priority;
      const matchesStatus = status === "All" ? true : r.status === status;
      const matchesOwner = owner === "All" ? true : r.owner === owner;

      return matchesSearch && matchesPriority && matchesStatus && matchesOwner;
    });
  }, [rows, q, priority, status, owner]);

  // KPIs
  const kpis = useMemo(() => {
    const open = rows.filter((r) => r.status !== "Resolved").length;
    const high = rows.filter((r) => r.priority === "High" && r.status !== "Resolved").length;
    const resolvedToday = rows.filter((r) => r.status === "Resolved" && r.lastUpdatedAt === today()).length;

    // Lightweight placeholder metric; replace with real time calc later
    const avg = rows.length ? Math.max(2.1, Math.min(9.8, rows.length * 1.55)).toFixed(1) : "0.0";

    return { open, high, avg, resolvedToday };
  }, [rows]);

  // Drawer
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => rows.find((r) => r.exceptionId === openId) || null, [rows, openId]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const close = () => setOpenId(null);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  // Drawer state (actions)
  const [assignTo, setAssignTo] = useState<string>("Me");
  const [drawerStatus, setDrawerStatus] = useState<ExceptionStatus>("In Progress");
  const [rootCause, setRootCause] = useState<RootCause>("Missing Document");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  const resetDrawerControls = () => {
    setAssignTo("Me");
    setDrawerStatus("In Progress");
    setRootCause("Missing Document");
    setResolutionNotes("");
  };

  const setOwnerTo = (exceptionId: string, newOwner: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.exceptionId !== exceptionId
          ? r
          : {
              ...r,
              owner: newOwner,
              lastUpdatedAt: today(),
              activity: [
                ...r.activity,
                { at: today(), by: "You", text: `Assigned owner: ${newOwner}` },
              ],
            }
      )
    );
  };

  const applyUpdate = () => {
    if (!open) return;

    const ownerValue = assignTo === "Me" ? "You" : assignTo;

    setRows((prev) =>
      prev.map((r) => {
        if (r.exceptionId !== open.exceptionId) return r;

        const updates: string[] = [];
        if (r.owner !== ownerValue) updates.push(`Owner → ${ownerValue}`);
        if (r.status !== drawerStatus) updates.push(`Status → ${drawerStatus}`);
        if (resolutionNotes.trim()) updates.push(`Notes added`);

        return {
          ...r,
          owner: ownerValue,
          status: drawerStatus,
          lastUpdatedAt: today(),
          notes: resolutionNotes.trim() ? resolutionNotes.trim() : r.notes,
          activity: [
            ...r.activity,
            {
              at: today(),
              by: "You",
              text: `Updated: ${updates.length ? updates.join(" • ") : "No changes"}. Root cause: ${rootCause}.`,
            },
          ],
        };
      })
    );

    close();
  };

  // Quick resolve
  const quickResolve = (exceptionId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.exceptionId !== exceptionId
          ? r
          : {
              ...r,
              status: "Resolved",
              lastUpdatedAt: today(),
              slaState: "ok",
              slaText: "Resolved",
              activity: [...r.activity, { at: today(), by: "You", text: "Marked Resolved" }],
            }
      )
    );
  };

  // Action Queue (right panel)
  const myQueue = useMemo(() => {
    // simple queue logic: high + open first, then open
    const list = rows
      .filter((r) => r.status !== "Resolved")
      .sort((a, b) => {
        const pRank = (x: Priority) => (x === "High" ? 0 : x === "Medium" ? 1 : 2);
        const sRank = (x: ExceptionStatus) => (x === "Open" ? 0 : x === "In Progress" ? 1 : 2);
        return pRank(a.priority) - pRank(b.priority) || sRank(a.status) - sRank(b.status);
      });
    return list.slice(0, 4);
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header (same language) */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Operations › Exceptions</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Exception Resolution Center</div>
        <div className="mt-1 text-sm opacity-95">
          Review shipment exceptions, assign ownership, and resolve issues efficiently.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Open Exceptions"
          value={`${kpis.open}`}
          sub="Needs attention"
          chip="WARNING"
          chipTone="warning"
        />
        <StatCard
          title="High Priority"
          value={`${kpis.high}`}
          sub="SLA risk"
          chip="CRITICAL"
          chipTone="critical"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${kpis.avg} hrs`}
          sub="Ops efficiency"
          chip="NEUTRAL"
          chipTone="neutral"
        />
        <StatCard
          title="Resolved Today"
          value={`${kpis.resolvedToday}`}
          sub={`Date: ${today()}`}
          chip="SUCCESS"
          chipTone="success"
        />
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Exception ID, Shipment ID, Route, Type, Owner…"
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
            />
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting External">Waiting External</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </Select>
          </div>

          <div>
            <Label>Owner</Label>
            <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-2 pt-1">
            <button
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              onClick={() => {
                setQ("");
                setPriority("All");
                setStatus("All");
                setOwner("All");
              }}
            >
              Reset Filters
            </button>

            <button
              className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
              onClick={() => {
                // Add a quick dummy exception (replace with modal/create flow later)
                const id = `EX-${Math.floor(1000 + Math.random() * 9000)}`;
                setRows((p) => [
                  {
                    exceptionId: id,
                    shipmentId: `SH-${Math.floor(8000 + Math.random() * 1500)}`,
                    route: "INNSA → DEHAM",
                    mode: "Ocean",
                    type: "Data Mismatch",
                    priority: "Low",
                    owner: "Unassigned",
                    slaText: "On track",
                    slaState: "ok",
                    status: "Open",
                    createdAt: today(),
                    lastUpdatedAt: today(),
                    notes: "Auto-generated sample exception.",
                    attachments: [],
                    activity: [{ at: today(), by: "You", text: "Exception created" }],
                  },
                  ...p,
                ]);
              }}
            >
              + New Exception
            </button>
          </div>
        </div>
      </Section>

      {/* Main: Worklist + Action Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Worklist */}
        <div className="lg:col-span-2">
          <Section
            title={`Exception Worklist (${filtered.length})`}
            right={
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={() => setStatus("Open")}
                >
                  Open
                </button>
                <button
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={() => setStatus("Resolved")}
                >
                  Resolved
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="py-3 pr-4">Exception</th>
                    <th className="py-3 pr-4">Shipment</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Priority</th>
                    <th className="py-3 pr-4">Owner</th>
                    <th className="py-3 pr-4">SLA</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="text-gray-800 dark:text-gray-200">
                  {filtered.map((r) => (
                    <tr key={r.exceptionId} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-3 pr-4">
                        <div className="font-semibold">{r.exceptionId}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          Created: {r.createdAt}
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.shipmentId}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {r.route} • {r.mode}
                        </div>
                      </td>

                      <td className="py-3 pr-4">{r.type}</td>

                      <td className="py-3 pr-4">
                        <Badge size="sm" color={badgeColorForPriority(r.priority) as any}>
                          {r.priority}
                        </Badge>
                      </td>

                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{r.owner}</span>
                          {r.owner === "Unassigned" ? (
                            <button
                              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              onClick={() => setOwnerTo(r.exceptionId, "You")}
                            >
                              Assign to me
                            </button>
                          ) : null}
                        </div>
                      </td>

                      <td className={`py-3 pr-4 font-semibold ${slaTextClass(r.slaState)}`}>
                        {r.slaText}
                      </td>

                      <td className="py-3 pr-4">
                        <Badge size="sm" color={badgeColorForStatus(r.status) as any}>
                          {r.status}
                        </Badge>
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {r.status !== "Resolved" ? (
                            <button
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              onClick={() => quickResolve(r.exceptionId)}
                            >
                              Resolve
                            </button>
                          ) : null}

                          <button
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                            onClick={() => {
                              setOpenId(r.exceptionId);
                              resetDrawerControls();
                              // initialize drawer values
                              setDrawerStatus(r.status === "Resolved" ? "Resolved" : "In Progress");
                              setResolutionNotes(r.notes || "");
                            }}
                          >
                            View / Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!filtered.length ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No exceptions found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Right panel: Action Queue */}
        <div className="lg:col-span-1">
          <Section title="My Action Queue">
            <div className="space-y-3">
              {myQueue.map((x) => (
                <div
                  key={x.exceptionId}
                  className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {x.type}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {x.exceptionId} • {x.shipmentId}
                      </div>
                    </div>

                    <Badge size="sm" color={badgeColorForPriority(x.priority) as any}>
                      {x.priority}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className={`text-xs font-semibold ${slaTextClass(x.slaState)}`}>{x.slaText}</div>
                    <button
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      onClick={() => {
                        setOpenId(x.exceptionId);
                        resetDrawerControls();
                        setDrawerStatus(x.status === "Resolved" ? "Resolved" : "In Progress");
                        setResolutionNotes(x.notes || "");
                      }}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}

              {!myQueue.length ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Nothing in your queue.
                </div>
              ) : null}
            </div>
          </Section>
        </div>
      </div>

      {/* Drawer */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[200000]" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={close} />

            {/* Panel */}
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
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 pb-4 pt-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      {open.exceptionId} • {open.type}
                    </div>
                    <div className="mt-0.5 text-[12px]/5 opacity-90">
                      Shipment: <b>{open.shipmentId}</b> • {open.route} • {open.mode}
                    </div>
                  </div>

                  <button
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20"
                    onClick={close}
                  >
                    Close
                  </button>
                </div>

                {/* chips */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Priority: {open.priority}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Status: {open.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    Owner: {open.owner}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30">
                    SLA: {open.slaText}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 space-y-4">
                {/* Summary */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Exception Summary
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      Created: <b>{open.createdAt}</b>
                    </div>
                    <div>
                      Updated: <b>{open.lastUpdatedAt}</b>
                    </div>
                    <div>
                      Priority:{" "}
                      <b className="inline-flex items-center gap-2">
                        {open.priority}
                        <Badge size="sm" color={badgeColorForPriority(open.priority) as any}>
                          {open.priority}
                        </Badge>
                      </b>
                    </div>
                    <div>
                      Status:{" "}
                      <b className="inline-flex items-center gap-2">
                        {open.status}
                        <Badge size="sm" color={badgeColorForStatus(open.status) as any}>
                          {open.status}
                        </Badge>
                      </b>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Notes</div>
                    <div className="mt-1">{open.notes || "—"}</div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Attachments</div>
                  <div className="mt-2 space-y-2">
                    {(open.attachments || []).length ? (
                      open.attachments!.map((a, idx) => (
                        <div
                          key={`${a.name}-${idx}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
                        >
                          <span className="text-gray-800 dark:text-gray-200">{a.name}</span>
                          <button className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">No attachments.</div>
                    )}
                  </div>
                </div>

                {/* Activity */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">Activity</div>
                  <ol className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {open.activity.map((a, i) => (
                      <li key={`${a.at}-${i}`} className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-800">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {a.at} • {a.by}
                        </div>
                        <div className="mt-0.5">{a.text}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Sticky Footer (Update controls) */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label>Assign To</Label>
                      <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                        <option>Me</option>
                        <option>Priya</option>
                        <option>Rohan</option>
                        <option>Aditi</option>
                        <option>Unassigned</option>
                      </Select>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select value={drawerStatus} onChange={(e) => setDrawerStatus(e.target.value as ExceptionStatus)}>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Waiting External</option>
                        <option>Escalated</option>
                        <option>Resolved</option>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Root Cause</Label>
                      <Select value={rootCause} onChange={(e) => setRootCause(e.target.value as RootCause)}>
                        <option>Missing Document</option>
                        <option>Customs Query</option>
                        <option>Carrier Delay</option>
                        <option>Incorrect Data</option>
                        <option>Customer Pending</option>
                        <option>Other</option>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Resolution Notes</Label>
                      <Input
                        placeholder="Add update / resolution note..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      onClick={() => {
                        if (open) quickResolve(open.exceptionId);
                        close();
                      }}
                    >
                      Resolve
                    </button>
                    <button
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      onClick={applyUpdate}
                    >
                      Apply Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/* ========= Utils ========= */
function today() {
  return new Date().toISOString().slice(0, 10);
}
