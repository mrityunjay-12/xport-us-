// src/pages/pricing/PricingManager.tsx
import React, { useMemo, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

/* Types */
type Source = "Upload" | "API" | "Manual";
type Service = "FCL" | "LCL" | "Air";
interface Offer {
  id: string;
  carrier: string;
  service: Service;
  origin: string;
  destination: string;
  transitDays: number;
  base: number;
  surcharges: number;
  total: number;
  validity: string;
  source: Source;
  notes?: string;
}

/* Utils */
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    v
  )}`;
const sourceColor = (s: Source) =>
  s === "Upload" ? "warning" : s === "API" ? "info" : "success";

/* Seed */
const SEED: Offer[] = [
  {
    id: "OF-1001",
    carrier: "MSC",
    service: "FCL",
    origin: "INNSA",
    destination: "DEHAM",
    transitDays: 24,
    base: 1300000,
    surcharges: 189000,
    total: 1489000,
    validity: "2025-10-12",
    source: "Upload",
    notes: "Direct svc; Wed cut-off",
  },
  {
    id: "OF-1002",
    carrier: "CMA CGM",
    service: "FCL",
    origin: "INNSA",
    destination: "DEHAM",
    transitDays: 27,
    base: 1225000,
    surcharges: 210000,
    total: 1435000,
    validity: "2025-10-10",
    source: "API",
  },
];

/* Local atoms */
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

/* Page */
export default function PricingManager() {
  const [offers, setOffers] = useState<Offer[]>(SEED);
  const [loadingAPI, setLoadingAPI] = useState(false);
  const [service, setService] = useState<"" | Service>("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = offers;
    if (service) list = list.filter((o) => o.service === service);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.carrier.toLowerCase().includes(s) ||
          o.origin.toLowerCase().includes(s) ||
          o.destination.toLowerCase().includes(s) ||
          o.id.toLowerCase().includes(s)
      );
    }
    return [...list].sort((a, b) => a.total - b.total);
  }, [offers, service, q]);
  const best = filtered[0];

  const mockUpload = (file?: File) =>
    setOffers((prev) => [
      {
        id: `OF-${Math.floor(Math.random() * 9000 + 1000)}`,
        carrier: "Hapag-Lloyd",
        service: "FCL",
        origin: "INNSA",
        destination: "DEHAM",
        transitDays: 25,
        base: 1250000,
        surcharges: 185000,
        total: 1435000,
        validity: "2025-10-15",
        source: "Upload",
        notes: file ? `From ${file.name}` : "Uploaded",
      },
      ...prev,
    ]);

  const fetchAPI = async () => {
    setLoadingAPI(true);
    setTimeout(() => {
      setOffers((prev) => [
        {
          id: "OF-API-7781",
          carrier: "ONE",
          service: "FCL",
          origin: "INNSA",
          destination: "DEHAM",
          transitDays: 26,
          base: 1210000,
          surcharges: 198000,
          total: 1408000,
          validity: "2025-10-18",
          source: "API",
          notes: "Pulled via carrier API",
        },
        {
          id: "OF-API-7789",
          carrier: "Maersk",
          service: "FCL",
          origin: "INNSA",
          destination: "DEHAM",
          transitDays: 23,
          base: 1340000,
          surcharges: 175000,
          total: 1515000,
          validity: "2025-10-20",
          source: "API",
        },
        ...prev,
      ]);
      setLoadingAPI(false);
    }, 900);
  };

  const addManual = () =>
    setOffers((prev) => [
      {
        id: `OF-MNL-${(Math.random() * 1000) | 0}`,
        carrier: "Custom Line",
        service: "FCL",
        origin: "INNSA",
        destination: "DEHAM",
        transitDays: 28,
        base: 1180000,
        surcharges: 210000,
        total: 1390000,
        validity: "2025-10-09",
        source: "Manual",
        notes: "Manually keyed",
      },
      ...prev,
    ]);

  const createQuoteFromSelection = () => {
    const sel = offers.find((o) => o.id === selectedId);
    if (!sel) return;
    alert(
      `Quote created from ${sel.carrier} @ ${inr(sel.total)} (valid till ${
        sel.validity
      }).`
    );
  };

  const totals = filtered.map((o) => o.total);
  const metrics = {
    offers: filtered.length,
    best: best?.total ?? 0,
    median: totals.length
      ? [...totals].sort((a, b) => a - b)[Math.floor(totals.length / 2)]
      : 0,
    avg: totals.length
      ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Pricing ▸ Manager</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Pricing Manager
        </div>
        <div className="mt-1 text-sm opacity-95">
          Upload carrier rates, fetch via APIs, compare, then select to create
          quotes.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Section title="Price Uploading">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Upload Rate File (CSV/XLSX)</Label>
                <Input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => mockUpload(e.target.files?.[0])}
                />
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Simulated ingest; wire to your backend parser.
                </p>
              </div>
              <div className="flex items-end gap-2">
                <button
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  onClick={() => mockUpload()}
                >
                  Add Sample Upload
                </button>
                <button
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  onClick={addManual}
                >
                  Add Manual Row
                </button>
              </div>
            </div>
          </Section>

          <Section title="API Price Fetching">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                onClick={fetchAPI}
                disabled={loadingAPI}
              >
                {loadingAPI ? "Fetching…" : "Fetch Rates via API"}
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Pulls live offers from integrated carriers/NVOs.
              </div>
            </div>
          </Section>
        </div>

        <Section title="Dashboard & Reports (Quick Stats)">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Offers", String(metrics.offers)],
              ["Best Total", inr(metrics.best)],
              ["Median", inr(metrics.median)],
              ["Average", inr(metrics.avg)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {k}
                </div>
                <div className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Price Comparison">
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Carrier, OF#, Origin/Destination…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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
                setService("");
                setQ("");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((o) => {
            const isBest = best && o.id === best.id;
            const checked = o.id === selectedId;
            return (
              <div
                key={o.id}
                className={`rounded-xl border p-4 dark:border-gray-800 ${
                  isBest
                    ? "border-emerald-300/70 dark:border-emerald-700/70"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="offer"
                      className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                      checked={checked}
                      onChange={() => setSelectedId(o.id)}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {o.id} · {o.carrier} · {o.service}
                        </div>
                        <Badge size="sm" color={sourceColor(o.source) as any}>
                          {o.source}
                        </Badge>
                        {isBest && (
                          <Badge size="sm" color="success">
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {o.origin} → {o.destination} • Transit {o.transitDays}{" "}
                        days • Valid till <b>{o.validity}</b>
                      </div>
                      {o.notes && (
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          Notes: {o.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-end gap-4 text-right sm:grid-cols-4">
                    <div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Base
                      </div>
                      <div className="text-sm font-medium dark:text-white">
                        {inr(o.base)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 dark:text-white">
                        Surcharges
                      </div>
                      <div className="text-sm font-medium dark:text-blue-700">
                        {inr(o.surcharges)}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Total
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {inr(o.total)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!filtered.length && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No offers match your filters.
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {selectedId
              ? `Selected: ${selectedId}`
              : "Choose an offer to continue"}
          </div>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={!selectedId}
            onClick={createQuoteFromSelection}
          >
            Create Quote from Selection
          </button>
        </div>
      </Section>
    </div>
  );
}
