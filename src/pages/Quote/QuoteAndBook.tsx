import React, { useMemo, useState } from "react";

/* ---------- Small UI primitives (as provided) ---------- */
const Card = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number | React.ReactNode;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
      {value}
    </div>
    {sub ? (
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>
    ) : null}
  </div>
);

const Label = ({ children }: React.PropsWithChildren) => (
  <label className="text-xs text-gray-500 dark:text-gray-400">{children}</label>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};
const Input = (p: InputProps) => (
  <input
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className ?? ""
    }`}
  />
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};
const Select = (p: SelectProps) => (
  <select
    {...p}
    className={`mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
      p.className ?? ""
    }`}
  />
);

/* ---------- Typed option sets ---------- */
const SERVICE_OPTIONS = ["export", "import"] as const;
type Service = (typeof SERVICE_OPTIONS)[number];

const MODE_OPTIONS = ["FCL", "LCL", "Air"] as const;
type Mode = (typeof MODE_OPTIONS)[number];

const CARRIER_OPTIONS = [
  "MSC",
  "Maersk",
  "CMA CGM",
  "ONE",
  "EK",
  "QR",
] as const;
type Carrier = (typeof CARRIER_OPTIONS)[number];

const INCOTERMS = ["EXW", "FCA", "FOB", "CIF", "DAP", "DDP"] as const;
type Incoterm = (typeof INCOTERMS)[number];

/* ---------- Demo offers ---------- */
type Offer = {
  id: string;
  carrier: Carrier;
  mode: Mode;
  service: Service;
  origin: string; // UN/Locode
  destination: string; // UN/Locode
  transitDays: number;
  priceUSD: number; // all-in demo, or $/kg for Air
  validTill: string; // YYYY-MM-DD
  notes?: string;
};

const OFFERS: Offer[] = [
  {
    id: "OF-9001",
    carrier: "MSC",
    mode: "FCL",
    service: "export",
    origin: "INNSA",
    destination: "NLRTM",
    transitDays: 23,
    priceUSD: 1450,
    validTill: "2025-10-31",
  },
  {
    id: "OF-9002",
    carrier: "Maersk",
    mode: "FCL",
    service: "import",
    origin: "CNSHA",
    destination: "INNSA",
    transitDays: 15,
    priceUSD: 980,
    validTill: "2025-10-28",
  },
  {
    id: "OF-9003",
    carrier: "CMA CGM",
    mode: "LCL",
    service: "export",
    origin: "INMUM",
    destination: "DEHAM",
    transitDays: 28,
    priceUSD: 120,
    validTill: "2025-10-27",
    notes: "$/cbm demo",
  },
  {
    id: "OF-9004",
    carrier: "ONE",
    mode: "FCL",
    service: "export",
    origin: "INNSA",
    destination: "DEHAM",
    transitDays: 25,
    priceUSD: 1520,
    validTill: "2025-10-30",
  },
  {
    id: "OF-9005",
    carrier: "EK",
    mode: "Air",
    service: "export",
    origin: "INDEL",
    destination: "AEJEA",
    transitDays: 3,
    priceUSD: 3.4,
    validTill: "2025-10-20",
    notes: "$/kg",
  },
  {
    id: "OF-9006",
    carrier: "QR",
    mode: "Air",
    service: "import",
    origin: "DOH",
    destination: "INDEL",
    transitDays: 2,
    priceUSD: 2.9,
    validTill: "2025-10-22",
    notes: "$/kg",
  },
];

/* ---------- Helpers ---------- */
function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    n
  );
}

/* ---------- Row component ---------- */
function RateRow({
  offer,
  onBook,
}: {
  offer: Offer;
  onBook: (o: Offer) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] sm:grid-cols-[1fr_auto_auto_auto]">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-800 dark:text-white/90">
            {offer.carrier}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200">
            {offer.mode}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200">
            {offer.service.toUpperCase()}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {offer.origin} → {offer.destination} · {offer.transitDays} d · Valid
          till {offer.validTill}
        </div>
        {offer.notes ? (
          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {offer.notes}
          </div>
        ) : null}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 sm:justify-self-end">
        Transit
      </div>
      <div className="text-base font-semibold text-gray-800 dark:text-white/90 sm:justify-self-end">
        {offer.transitDays} d
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-self-end">
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">All-in</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {offer.mode === "Air"
              ? `${offer.priceUSD.toFixed(2)} $/kg`
              : money(offer.priceUSD)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
          >
            Hold
          </button>
          <button
            type="button"
            onClick={() => onBook(offer)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN: Quote & Book using the provided style ---------- */
export default function QuoteAndBook() {
  // Form state
  const [service, setService] = useState<Service>("export");
  const [mode, setMode] = useState<Mode>("FCL");
  const [incoterm, setIncoterm] = useState<Incoterm>("FOB");
  const [origin, setOrigin] = useState<string>("INNSA");
  const [destination, setDestination] = useState<string>("DEHAM");
  const [readyDate, setReadyDate] = useState<string>("");
  const [commodity, setCommodity] = useState<string>("");

  // Cargo
  const [qty20, setQty20] = useState<number>(1);
  const [qty40, setQty40] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<string>("12000");
  const [volume, setVolume] = useState<string>("25");

  // Add-ons
  const [haz, setHaz] = useState<boolean>(false);
  const [insurance, setInsurance] = useState<boolean>(false);
  const [customs, setCustoms] = useState<boolean>(true);
  const [pickup, setPickup] = useState<boolean>(false);
  const [delivery, setDelivery] = useState<boolean>(false);

  // Selected offer
  const [selected, setSelected] = useState<Offer | null>(null);

  const offers = useMemo(() => {
    return OFFERS.filter(
      (o) =>
        o.mode === mode &&
        o.service === service &&
        (!origin || o.origin === origin) &&
        (!destination || o.destination === destination)
    );
  }, [mode, service, origin, destination]);

  const cheapest = useMemo(
    () =>
      offers.length
        ? offers.reduce((a, b) => (a.priceUSD < b.priceUSD ? a : b))
        : null,
    [offers]
  );
  const fastest = useMemo(
    () =>
      offers.length
        ? offers.reduce((a, b) => (a.transitDays < b.transitDays ? a : b))
        : null,
    [offers]
  );

  const estAllIn = useMemo(() => {
    if (!selected) return 0;
    let base =
      selected.mode === "Air"
        ? Number(volume) * selected.priceUSD
        : selected.priceUSD;
    if (haz) base += selected.mode === "Air" ? 50 : 150;
    if (insurance) base += Math.max(25, base * 0.006);
    if (customs) base += 65;
    if (pickup) base += 80;
    if (delivery) base += 90;
    return Math.round(base);
  }, [selected, haz, insurance, customs, pickup, delivery, volume]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">
          Customer Hub ▸ Quote & Book
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Quote & Book
        </div>
        <div className="mt-1 text-sm opacity-95">
          Create a shipment quote and instantly book the best-matching offer.
        </div>
      </div>

      {/* KPI snapshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Cheapest"
          value={cheapest ? money(cheapest.priceUSD) : "—"}
          sub={
            cheapest
              ? `${cheapest.carrier} · ${cheapest.transitDays} d`
              : "No offers"
          }
        />
        <Card
          title="Fastest"
          value={fastest ? `${fastest.transitDays} d` : "—"}
          sub={
            fastest
              ? `${fastest.carrier} · ${money(fastest.priceUSD)}`
              : "No offers"
          }
        />
        <Card
          title="Selected"
          value={selected ? selected.carrier : "None"}
          sub={
            selected
              ? `${selected.origin} → ${selected.destination}`
              : "Choose an offer"
          }
        />
        <Card
          title="Est. All-in"
          value={selected ? money(estAllIn) : "—"}
          sub={selected ? `Incl. add‑ons` : "Select an offer"}
        />
      </div>

      {/* Quote form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Quote Details
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label>Service</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.currentTarget.value as Service)}
            >
              {SERVICE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o[0].toUpperCase() + o.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Mode</Label>
            <Select
              value={mode}
              onChange={(e) => setMode(e.currentTarget.value as Mode)}
            >
              {MODE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Incoterm</Label>
            <Select
              value={incoterm}
              onChange={(e) => setIncoterm(e.currentTarget.value as Incoterm)}
            >
              {INCOTERMS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ready Date</Label>
            <Input
              type="date"
              value={readyDate}
              onChange={(e) => setReadyDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 xl:col-span-2 grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <div>
              <Label>Origin (UN/Locode)</Label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                placeholder="e.g., INNSA"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setOrigin(destination);
                setDestination(origin);
              }}
              className="mb-0.5 inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              aria-label="Swap origin and destination"
            >
              ↔
            </button>
            <div>
              <Label>Destination (UN/Locode)</Label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="e.g., DEHAM"
              />
            </div>
          </div>

          <div className="md:col-span-2 xl:col-span-1">
            <Label>Commodity</Label>
            <Input
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="e.g., Textiles"
            />
          </div>
        </div>

        {/* Cargo */}
        <div className="mt-6 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Cargo
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            {mode === "FCL" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>20' GP</Label>
                    <Input
                      type="number"
                      min={0}
                      value={qty20}
                      onChange={(e) => setQty20(Number(e.target.value || 0))}
                    />
                  </div>
                  <div>
                    <Label>40' HC</Label>
                    <Input
                      type="number"
                      min={0}
                      value={qty40}
                      onChange={(e) => setQty40(Number(e.target.value || 0))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Gross Weight (kg)</Label>
                  <Input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input placeholder="e.g., Stackable, palletized" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Gross Weight (kg)</Label>
                  <Input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Volume (cbm)</Label>
                  <Input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input placeholder="e.g., Dimensions, stackable" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={haz}
              onChange={(e) => setHaz(e.target.checked)}
            />
            <Label>Haz cargo</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
            />
            <Label>Insurance</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={customs}
              onChange={(e) => setCustoms(e.target.checked)}
            />
            <Label>Customs</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pickup}
              onChange={(e) => setPickup(e.target.checked)}
            />
            <Label>Pickup</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
            />
            <Label>Last‑mile</Label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            onClick={() => {
              setService("export");
              setMode("FCL");
              setIncoterm("FOB");
              setOrigin("INNSA");
              setDestination("DEHAM");
              setReadyDate("");
              setCommodity("");
              setQty20(1);
              setQty40(0);
              setGrossWeight("12000");
              setVolume("25");
              setHaz(false);
              setInsurance(false);
              setCustoms(true);
              setPickup(false);
              setDelivery(false);
              setSelected(null);
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Get Rates
          </button>
        </div>
      </div>

      {/* Offers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Available Offers ({offers.length})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Sort by:</span>
            <button className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Price
            </button>
            <button className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Transit
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          {offers.length ? (
            offers.map((o) => (
              <div
                key={o.id}
                className={
                  selected?.id === o.id ? "ring-2 ring-sky-500 rounded-xl" : ""
                }
              >
                <RateRow offer={o} onBook={(offer) => setSelected(offer)} />
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No offers for this combination. Adjust mode/service or route.
            </div>
          )}
        </div>

        {/* Selection footer */}
        <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800 sm:flex-row sm:items-center">
          <div className="text-gray-700 dark:text-gray-300">
            {selected ? (
              <>
                Selected <b>{selected.carrier}</b> · {selected.origin} →{" "}
                {selected.destination} · {selected.transitDays} d
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Est. {money(estAllIn)}
                  </span>
                </span>
              </>
            ) : (
              <>Choose an offer to continue.</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              disabled={!selected}
              className={`rounded-lg border px-4 py-2 font-medium ${
                selected
                  ? "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                  : "cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600"
              }`}
            >
              Request Callback
            </button>
            <button
              disabled={!selected}
              className={`rounded-lg px-4 py-2 font-medium text-white ${
                selected ? "bg-sky-600 hover:bg-sky-700" : "bg-sky-300"
              }`}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </div>

      {/* Recent quotes (demo) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Recent Quotes
        </div>
        <div className="mt-3 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.04]">
              <tr>
                {[
                  "ID",
                  "Carrier",
                  "Mode",
                  "Route",
                  "Transit",
                  "Price",
                  "Valid till",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OFFERS.slice(0, 5).map((o, idx) => (
                <tr
                  key={o.id}
                  className={
                    idx % 2
                      ? "bg-white dark:bg-transparent"
                      : "bg-gray-50/70 dark:bg-white/[0.02]"
                  }
                >
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.id}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.carrier}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.mode}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.origin} → {o.destination}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.transitDays} d
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.mode === "Air"
                      ? `${o.priceUSD.toFixed(2)} $/kg`
                      : money(o.priceUSD)}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {o.validTill}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
