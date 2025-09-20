import React, { useMemo, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

type ExecStatus = "Planned" | "In Transit" | "At CFS" | "Sailed" | "Delivered";

interface Execution {
  id: string; // job or HBL
  customer: string;
  route: string; // INNSA → DEHAM
  carrier: string;
  etd: string;
  eta: string;
  milestones: { name: ExecStatus; done: boolean; when?: string }[];
}

const statusColor = (s: ExecStatus) =>
  s === "Delivered" || s === "Sailed" ? "success" : "warning";

const seed: Execution[] = [
  {
    id: "JOB-22451",
    customer: "Acme Textiles",
    route: "INNSA → DEHAM",
    carrier: "MSC",
    etd: "2025-09-20",
    eta: "2025-10-12",
    milestones: [
      { name: "Planned", done: true, when: "2025-09-14" },
      { name: "In Transit", done: true, when: "2025-09-16" },
      { name: "At CFS", done: true, when: "2025-09-17" },
      { name: "Sailed", done: false },
      { name: "Delivered", done: false },
    ],
  },
  {
    id: "JOB-22469",
    customer: "Zen Importers",
    route: "CNSHA → INNSA",
    carrier: "CMA CGM",
    etd: "2025-09-22",
    eta: "2025-10-08",
    milestones: [
      { name: "Planned", done: true, when: "2025-09-16" },
      { name: "In Transit", done: false },
      { name: "At CFS", done: false },
      { name: "Sailed", done: false },
      { name: "Delivered", done: false },
    ],
  },
];

/** findLast polyfill-safe helper */
const lastDone = (arr: Execution["milestones"]) => {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i].done) return arr[i];
  return undefined;
};

export default function ShipmentExecution() {
  const [rows, setRows] = useState<Execution[]>(seed);

  const toggle = (jobId: string, idx: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id !== jobId
          ? r
          : {
              ...r,
              milestones: r.milestones.map((m, i) =>
                i === idx
                  ? {
                      ...m,
                      done: !m.done,
                      when: !m.done
                        ? new Date().toISOString().slice(0, 10)
                        : undefined,
                    }
                  : m
              ),
            }
      )
    );

  const markNext = (jobId: string) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== jobId) return r;
        const nextIdx = r.milestones.findIndex((m) => !m.done);
        if (nextIdx === -1) return r;
        const ms = r.milestones.slice();
        ms[nextIdx] = {
          ...ms[nextIdx],
          done: true,
          when: new Date().toISOString().slice(0, 10),
        };
        return { ...r, milestones: ms };
      })
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Operations ▸ Execution</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Handle Shipment Execution
        </div>
        <div className="mt-1 text-sm opacity-95">
          Update milestones (CFS, Gate-in, Sailed, Delivered) and keep customers
          informed.
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <div className="space-y-4">
          {rows.map((r) => {
            const latest = lastDone(r.milestones);
            const currentStage: ExecStatus = latest?.name || "Planned";
            const doneCount = r.milestones.filter((m) => m.done).length;
            const pct = Math.round((doneCount / r.milestones.length) * 100);
            const allDone = doneCount === r.milestones.length;

            return (
              <div
                key={r.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {r.id} · {r.customer}
                      </div>
                      <Badge size="sm" color={statusColor(currentStage) as any}>
                        {currentStage}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {r.route} • Carrier: <b>{r.carrier}</b> • ETD: {r.etd} •
                      ETA: {r.eta}
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-sky-500 transition-all"
                          style={{ width: `${pct}%` }}
                          aria-label={`Progress ${pct}%`}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {doneCount}/{r.milestones.length} milestones completed (
                        {pct}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {r.milestones.map((m, i) => (
                        <button
                          key={m.name}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                            m.done
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-slate-500 hover:bg-slate-600"
                          }`}
                          onClick={() => toggle(r.id, i)}
                          title={m.when ? `Done on ${m.when}` : "Mark done"}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                    <button
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 disabled:opacity-50"
                      onClick={() => markNext(r.id)}
                      disabled={allDone}
                    >
                      Mark Next Step
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!rows.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No active shipments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
