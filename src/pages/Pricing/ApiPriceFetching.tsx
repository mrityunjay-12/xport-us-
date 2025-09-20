// src/pages/pricing/ApiPriceFetching.tsx
import React, { useState } from "react";

const Section = ({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
    <div className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
      {title}
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

export default function ApiPriceFetching() {
  const [service, setService] = useState<"FCL" | "LCL" | "Air">("FCL");
  const [origin, setOrigin] = useState("INNSA - Nhava Sheva, India");
  const [dest, setDest] = useState("DEHAM - Hamburg, Germany");
  const [carrier, setCarrier] = useState("MSC");
  const [logs, setLogs] = useState<string[]>([]);

  const fetchPrices = () => {
    setLogs((l) => [
      `→ Calling API /v1/rates?service=${service}&origin=INNSA&dest=DEHAM&carrier=${carrier}`,
      "✓ 3 routes received (direct/TS via SG/TS via AE)",
      "✓ Normalized currency and surcharges",
      "✓ Stored into cache for 24h",
      ...l,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Pricing Manager ▸ API Price Fetching
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          API Price Fetching
        </div>
        <div className="mt-1 text-sm opacity-95">
          Pull spot/contract rates from partner/carrier APIs.
        </div>
      </div>

      <Section title="Query">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Service</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value as any)}
            >
              <option>FCL</option>
              <option>LCL</option>
              <option>Air</option>
            </Select>
          </div>
          <div>
            <Label>Carrier</Label>
            <Select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            >
              <option>MSC</option>
              <option>Maersk</option>
              <option>CMA CGM</option>
              <option>ONE</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Origin</Label>
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Destination</Label>
            <Input value={dest} onChange={(e) => setDest(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              onClick={fetchPrices}
            >
              Fetch Now
            </button>
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Schedule (cron)
            </button>
          </div>
        </div>
      </Section>

      <Section title="Activity Log">
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {logs.length ? (
            logs.map((x, i) => <li key={i}>{x}</li>)
          ) : (
            <li>No calls yet.</li>
          )}
        </ol>
      </Section>
    </div>
  );
}
