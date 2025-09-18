import React, { useMemo, useState } from "react";

/** ----------------------------
 *  Types
 *  ---------------------------*/
type Direction = "Export" | "Import";
type Service = "FCL" | "LCL" | "Air";
type ContainerSize = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC";

interface SearchFilters {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  direction: Direction;
  service: Service;
  container: ContainerSize;
  weightKg: string;
}

interface RateResult {
  id: string;
  tag: Service; // FCL/LCL/Air label on the left
  fromCode: string;
  fromName: string;
  fromDate: string;
  toCode: string;
  toName: string;
  toDate: string;
  priceINR: number;
  bullets: string[];
}

/** ----------------------------
 *  Mock data
 *  ---------------------------*/
const initialFilters: SearchFilters = {
  originCode: "INNSA",
  originName: "Nhava Sheva, India",
  destinationCode: "DEHAM",
  destinationName: "Hamburg, Germany",
  direction: "Export",
  service: "FCL",
  container: "20 ft - Standard",
  weightKg: "19,000",
};

const mockResults: RateResult[] = [
  {
    id: "r1",
    tag: "FCL",
    fromCode: "INNSA1",
    fromName: "Nhava Sheva, India",
    fromDate: "06 Mar 2025",
    toCode: "DEHAM",
    toName: "Jebel Ali, UAE",
    toDate: "12 Apr 2025",
    priceINR: 1519384,
    bullets: [
      "20ft Standard Container",
      "Destination Detention: 7 Days",
      "No Hidden Charges",
      "Dedicated Account Manager",
    ],
  },
  {
    id: "r2",
    tag: "FCL",
    fromCode: "INNSA1",
    fromName: "Nhava Sheva, India",
    fromDate: "05 Mar 2025",
    toCode: "DEHAM",
    toName: "Jebel Ali, UAE",
    toDate: "12 Apr 2025",
    priceINR: 1719384,
    bullets: [
      "20ft Standard Container",
      "Destination Detention: 7 Days",
      "No Hidden Charges",
      "Dedicated Account Manager",
    ],
  },
  {
    id: "r3",
    tag: "FCL",
    fromCode: "INNSA1",
    fromName: "Nhava Sheva, India",
    fromDate: "08 Mar 2025",
    toCode: "DEHAM",
    toName: "Jebel Ali, UAE",
    toDate: "10 Apr 2025",
    priceINR: 2219384,
    bullets: [
      "20ft Standard Container",
      "Destination Detention: 7 Days",
      "No Hidden Charges",
      "Dedicated Account Manager",
    ],
  },
];

/** ----------------------------
 *  Helpers
 *  ---------------------------*/
const inr = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(v)}`;

/** ----------------------------
 *  UI Pieces
 *  ---------------------------*/
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center rounded-md bg-indigo-950 text-white px-3 text-sm font-semibold dark:bg-indigo-900/70">
      {children}
    </span>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <span className="h-2.5 w-2.5 rounded-full border border-gray-400" />
      {text}
    </li>
  );
}

function Breakup({ price }: { price: number }) {
  // minimal static breakup; wire to real charges later
  const rows = [
    ["Base Freight", price * 0.86],
    ["Bunker / Surcharges", price * 0.08],
    ["Documentation", price * 0.02],
    ["Taxes", price * 0.04],
  ];
  return (
    <div className="mt-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
      <div className="mb-2 font-medium text-gray-800 dark:text-white/90">
        Price Breakup
      </div>
      <ul className="space-y-1">
        {rows.map(([label, amt]) => (
          <li
            key={label as string}
            className="flex items-center justify-between text-gray-600 dark:text-gray-300"
          >
            <span>{label as string}</span>
            <span>{inr(amt as number)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** ----------------------------
 *  Page
 *  ---------------------------*/
export default function SearchRates() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<RateResult[]>(mockResults);
  const [openBreakup, setOpenBreakup] = useState<string | null>(null);

  const summary = useMemo(
    () =>
      `${filters.originCode} - ${filters.originName}  →  ${filters.destinationCode} - ${filters.destinationName}`,
    [filters]
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with API call; right now we just reset mock
    setResults(mockResults);
    setOpenBreakup(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form
        onSubmit={onSearch}
        className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Origin
            </label>
            <input
              className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={`${filters.originCode} - ${filters.originName}`}
              onChange={() => {}}
              readOnly
            />
            <p className="mt-1 text-[11px] text-brand-600 dark:text-yellow-400">
              Mumbai, India
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Destination
            </label>
            <input
              className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={`${filters.destinationCode} - ${filters.destinationName}`}
              onChange={() => {}}
              readOnly
            />
            <p className="mt-1 text-[11px] text-brand-600  dark:text-yellow-400">
              Germany
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Service
            </label>
            <select
              className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-900 dark:bg-gray-400"
              value={filters.service}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  service: e.target.value as Service,
                }))
              }
            >
              <option value="FCL">FCL (Standard)</option>
              <option value="LCL">LCL</option>
              <option value="Air">Air</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Container
            </label>
            <select
              className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-900 dark:bg-gray-400"
              value={filters.container}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  container: e.target.value as ContainerSize,
                }))
              }
            >
              <option>20 ft - Standard</option>
              <option>40 ft - Standard</option>
              <option>40 ft - HC</option>
            </select>
          </div>

          <div className="flex items-end gap-2 mb-5">
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Weight (kgs)"
              value={filters.weightKg}
              onChange={(e) =>
                setFilters((f) => ({ ...f, weightKg: e.target.value }))
              }
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Search Rates
            </button>
          </div>
        </div>
      </form>

      {/* Breadcrumb + Summary Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Search Rates ▸ Results</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">{summary}</div>
        <div className="mt-1 text-sm opacity-95">
          {filters.container} • {filters.service} Shipment
        </div>
      </div>

      {/* Body: Results + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Results list */}
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {results.length} Rate{results.length > 1 ? "s" : ""} Found
          </div>

          {results.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                {/* Left: route + bullets */}
                <div>
                  {/* top row: tag + route timeline */}
                  <div className="flex items-center gap-3">
                    <Tag>{r.tag}</Tag>

                    <div className="flex w-full items-center gap-3">
                      {/* origin */}
                      <div className="min-w-[160px]">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {r.fromCode}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {r.fromName}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {r.fromDate}
                        </div>
                      </div>

                      {/* line */}
                      <div className="relative mx-2 hidden h-1 flex-1 rounded bg-gray-200 dark:bg-gray-700 md:block">
                        <span className="absolute -top-1.5 left-0 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow dark:border-gray-900" />
                        <span className="absolute -top-1.5 right-0 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow dark:border-gray-900" />
                      </div>

                      {/* destination */}
                      <div className="min-w-[160px] text-right">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {r.toCode}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {r.toName}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {r.toDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* bullets */}
                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {r.bullets.map((b) => (
                      <Bullet key={b} text={b} />
                    ))}
                  </ul>
                </div>

                {/* Right: price + actions */}
                <div className="flex flex-col items-start justify-between gap-3 md:items-end">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                      Offer Price
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {inr(r.priceINR)}
                    </div>
                  </div>

                  <div className="flex w-full items-center gap-3 md:justify-end">
                    <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                      Book At Quote
                    </button>
                    <button
                      onClick={() =>
                        setOpenBreakup((prev) => (prev === r.id ? null : r.id))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      View Breakup ▾
                    </button>
                  </div>
                </div>
              </div>

              {openBreakup === r.id ? <Breakup price={r.priceINR} /> : null}
            </div>
          ))}
        </div>

        {/* Sidebar: Additional Services */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
          <div className="text-base font-semibold text-gray-800 dark:text-white/90">
            Additional Services
          </div>

          <div className="mt-4 space-y-2">
            {[
              "FCL FREIGHT",
              "ORIGIN FREIGHT LOCAL",
              "ORIGIN TRANSPORTATION",
              "ORIGIN CUSTOM CLEARANCE",
              "ORIGIN CFS CLEARANCE",
            ].map((title) => (
              <details
                key={title}
                className="group rounded-lg border border-gray-200 p-3 open:bg-gray-50 dark:border-gray-800 dark:open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-800 dark:text-white/90">
                  {title}
                  <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 group-open:rotate-45 dark:border-gray-700 dark:text-gray-300">
                    +
                  </span>
                </summary>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Add-on details / line items can appear here (rates, pickup,
                  delivery, docs). Hook to API when ready.
                </div>
              </details>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
