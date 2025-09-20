// src/pages/pricing/PriceComparison.tsx
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
  transit: string;
  freeDays: number;
  total: number;
  remarks?: string;
};
const SEED: Row[] = [
  {
    carrier: "MSC",
    service: "FCL",
    transit: "Direct • 22d",
    freeDays: 14,
    total: 1519000,
    remarks: "Earliest sailing",
  },
  {
    carrier: "Maersk",
    service: "FCL",
    transit: "Via SG • 26d",
    freeDays: 10,
    total: 1490000,
  },
  {
    carrier: "CMA CGM",
    service: "FCL",
    transit: "Via AE • 24d",
    freeDays: 12,
    total: 1525000,
    remarks: "Space tight",
  },
];

const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;

export default function PriceComparison() {
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
          Pricing Manager ▸ Price Comparison
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Price Comparison
        </div>
        <div className="mt-1 text-sm opacity-95">
          Compare carriers by price, transit time, and free days.
        </div>
      </div>

      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Search Carrier</Label>
            <Input
              placeholder="MSC, Maersk…"
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-2 pr-4">Carrier</th>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Transit</th>
                <th className="py-2 pr-4">Free Days</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.carrier}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 pr-4">{r.carrier}</td>
                  <td className="py-2 pr-4">{r.service}</td>
                  <td className="py-2 pr-4">{r.transit}</td>
                  <td className="py-2 pr-4">{r.freeDays}</td>
                  <td className="py-2 pr-4 font-semibold">{inr(r.total)}</td>
                  <td className="py-2">{r.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
