// src/pages/rates/CompareFreightRates.tsx
import React, { useMemo, useState } from "react";

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

type Row = {
  carrier: string;
  service: "FCL" | "LCL";
  container: string;
  total: number;
  etd: string;
};
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;
const SEED: Row[] = [
  {
    carrier: "MSC",
    service: "FCL",
    container: "20 ft - Standard",
    total: 1519000,
    etd: "2025-09-22",
  },
  {
    carrier: "Maersk",
    service: "FCL",
    container: "20 ft - Standard",
    total: 1490000,
    etd: "2025-09-24",
  },
  {
    carrier: "CMA CGM",
    service: "LCL",
    container: "LCL",
    total: 420000,
    etd: "2025-09-23",
  },
];

export default function CompareFreightRates() {
  const [q, setQ] = useState("");
  const [service, setService] = useState<"" | "FCL" | "LCL">("");

  const filtered = useMemo(() => {
    let list = SEED;
    if (service) list = list.filter((x) => x.service === service);
    if (q.trim())
      list = list.filter((x) =>
        x.carrier.toLowerCase().includes(q.toLowerCase())
      );
    return list;
  }, [q, service]);

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
          Side-by-side carrier options for selected route.
        </div>
      </div>

      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Carrier</Label>
            <Input
              placeholder="Search carrier…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <Label>Service</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value as any)}
            >
              <option value="">All</option>
              <option>FCL</option>
              <option>LCL</option>
            </Select>
          </div>
        </div>
      </Section>

      <Section title={`Results (${filtered.length})`}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {r.carrier} · {r.service}
              </div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                ETD {r.etd} • {r.container}
              </div>
              <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                {inr(r.total)}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">
                  Use for Quote
                </button>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
