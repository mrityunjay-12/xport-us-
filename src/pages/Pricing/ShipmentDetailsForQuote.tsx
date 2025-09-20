// src/pages/rates/ShipmentDetailsForQuote.tsx
import React, { useState } from "react";

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

type Direction = "Export" | "Import";
type Service = "FCL" | "LCL" | "Air";
type Container = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC";

export default function ShipmentDetailsForQuote() {
  const [direction, setDirection] = useState<Direction>("Export");
  const [service, setService] = useState<Service>("FCL");
  const [container, setContainer] = useState<Container>("20 ft - Standard");
  const [origin, setOrigin] = useState("INNSA - Nhava Sheva, India");
  const [dest, setDest] = useState("DEHAM - Hamburg, Germany");
  const [weight, setWeight] = useState("");
  const [cargo, setCargo] = useState("");
  const [incoterm, setIncoterm] = useState("FOB");
  const [ready, setReady] = useState("");
  const [freeDays, setFreeDays] = useState("7");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Requesting quote:\n${direction} ${service} (${container})\n${origin} → ${dest}\nWeight: ${weight} kg | Cargo: ${cargo}\nIncoterm: ${incoterm} | Cargo Ready: ${ready} | Free Days: ${freeDays}\nNotes: ${
        notes || "-"
      }`
    );
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Freight Booking & Rates ▸ Quotes
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Enter Shipment Details for Quotes
        </div>
        <div className="mt-1 text-sm opacity-95">
          Provide shipment specifics to generate accurate quotes.
        </div>
      </div>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
      >
        <Section title="Shipment Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Direction</Label>
              <Select
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
              >
                <option>Export</option>
                <option>Import</option>
              </Select>
            </div>
            <div>
              <Label>Service</Label>
              <Select
                value={service}
                onChange={(e) => setService(e.target.value as Service)}
              >
                <option>FCL</option>
                <option>LCL</option>
                <option>Air</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Origin</Label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Destination</Label>
              <Input value={dest} onChange={(e) => setDest(e.target.value)} />
            </div>

            <div>
              <Label>Container</Label>
              <Select
                value={container}
                onChange={(e) => setContainer(e.target.value as Container)}
              >
                <option>20 ft - Standard</option>
                <option>40 ft - Standard</option>
                <option>40 ft - HC</option>
              </Select>
            </div>
            <div>
              <Label>Weight (kgs)</Label>
              <Input
                placeholder="e.g. 19,000"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div>
              <Label>Incoterm</Label>
              <Select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
              >
                {["EXW", "FCA", "FOB", "CIF", "CFR", "DAP", "DDP"].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Cargo Ready (Date)</Label>
              <Input
                type="date"
                value={ready}
                onChange={(e) => setReady(e.target.value)}
              />
            </div>

            <div>
              <Label>Free Days (at destination)</Label>
              <Input
                value={freeDays}
                onChange={(e) => setFreeDays(e.target.value)}
              />
            </div>
            <div>
              <Label>Cargo Description</Label>
              <Input
                placeholder="e.g. Textile rolls, HS 5512…"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions (direct svc, cut-offs, free days…)"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Request Quote
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                onClick={() => setNotes("")}
              >
                Save Draft
              </button>
            </div>
          </div>
        </Section>

        <Section title="Summary">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              <b>{direction}</b> · <b>{service}</b> · <b>{container}</b>
            </div>
            <div className="mt-1">
              {origin} → {dest}
            </div>
            <div className="mt-1">
              Weight: <b>{weight || "—"}</b> kg • Incoterm: <b>{incoterm}</b>
            </div>
            <div className="mt-1">
              Cargo Ready: <b>{ready || "—"}</b> • Free Days: <b>{freeDays}</b>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              You can plug this panel into a real-time rate fetch or quote
              builder.
            </div>
          </div>
        </Section>
      </form>
    </div>
  );
}
