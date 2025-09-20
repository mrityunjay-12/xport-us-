// src/pages/pricing/PriceSelection.tsx
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
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className || ""
    }`}
  />
);

type Option = { id: string; carrier: string; transit: string; price: number };
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;
const OPTIONS: Option[] = [
  { id: "msc", carrier: "MSC", transit: "Direct 22d", price: 1519000 },
  { id: "maersk", carrier: "Maersk", transit: "Via SG 26d", price: 1490000 },
  { id: "cma", carrier: "CMA CGM", transit: "Via AE 24d", price: 1525000 },
];

export default function PriceSelection() {
  const [selected, setSelected] = useState<Option["id"]>("msc");
  const option = useMemo(
    () => OPTIONS.find((o) => o.id === selected)!,
    [selected]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Pricing Manager ▸ Price Selection
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Price Selection
        </div>
        <div className="mt-1 text-sm opacity-95">
          Choose the winning rate to publish for quoting.
        </div>
      </div>

      <Section title="Choose Option">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label>Available Options</Label>
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.carrier} — {o.transit} — {inr(o.price)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Publish for Quotes
            </button>
          </div>
        </div>
      </Section>

      <Section title="Summary">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Carrier: <b>{option.carrier}</b> • Transit: <b>{option.transit}</b> •
          Price: <b>{inr(option.price)}</b>
        </div>
      </Section>
    </div>
  );
}
