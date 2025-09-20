// src/pages/rates/FreightRateCompare.tsx
import React, { useMemo, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

type Mode = "Sea" | "Air";
type Service = "FCL" | "LCL" | "Air";
interface RateRow {
  id: string;
  carrier: string;
  mode: Mode;
  service: Service;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  total: number;
  validity: string;
  remarks?: string;
}
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
    <div className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
      {title}
    </div>
    {children}
  </div>
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-gray-500 dark:text-gray-400">{children}</label>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
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

const SEED: RateRow[] = [
  {
    id: "FX-1001",
    carrier: "MSC",
    mode: "Sea",
    service: "FCL",
    origin: "INNSA",
    destination: "DEHAM",
    etd: "2025-09-22",
    eta: "2025-10-14",
    total: 1489000,
    validity: "2025-10-12",
    remarks: "Direct",
  },
  {
    id: "FX-1002",
    carrier: "CMA CGM",
    mode: "Sea",
    service: "FCL",
    origin: "INNSA",
    destination: "DEHAM",
    etd: "2025-09-24",
    eta: "2025-10-16",
    total: 1435000,
    validity: "2025-10-10",
  },
  {
    id: "FX-1003",
    carrier: "EK",
    mode: "Air",
    service: "Air",
    origin: "BOM",
    destination: "HAM",
    etd: "2025-09-20",
    eta: "2025-09-21",
    total: 298000,
    validity: "2025-09-25",
    remarks: "+FSC",
  },
];

export default function FreightRateCompare() {
  const [rows] = useState(SEED);
  const [mode, setMode] = useState<"" | Mode>("");
  const [service, setService] = useState<"" | Service>("");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = rows;
    if (mode) list = list.filter((r) => r.mode === mode);
    if (service) list = list.filter((r) => r.service === service);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.carrier.toLowerCase().includes(s) ||
          r.origin.toLowerCase().includes(s) ||
          r.destination.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s)
      );
    }
    return [...list].sort((a, b) => a.total - b.total);
  }, [rows, mode, service, q]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Freight Booking & Rates ▸ Compare
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Compare Freight Rates
        </div>
        <div className="mt-1 text-sm opacity-95">
          Search and compare offers across carriers and modes.
        </div>
      </div>

      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Carrier, FX#, Origin/Destination…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <Label>Mode</Label>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode | "")}
            >
              <option value="">All</option>
              <option>Sea</option>
              <option>Air</option>
            </Select>
          </div>
          <div>
            <Label>Service</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value as Service | "")}
            >
              <option value="">All</option>
              <option>FCL</option>
              <option>LCL</option>
              <option>Air</option>
            </Select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              onClick={() => {
                setQ("");
                setMode("");
                setService("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      <Section title={`Results (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {r.id} · {r.carrier} · {r.mode}
                    </div>
                    <Badge
                      size="sm"
                      color={r.mode === "Sea" ? "info" : "warning"}
                    >
                      {r.service}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {r.origin} → {r.destination} • ETD {r.etd} • ETA {r.eta}
                  </div>
                  {r.remarks && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      Notes: {r.remarks}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                    Total
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {inr(r.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Valid till <b>{r.validity}</b>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                  Select
                </button>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  Details
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No results.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
