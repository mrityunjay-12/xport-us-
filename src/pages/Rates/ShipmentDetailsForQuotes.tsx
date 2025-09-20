// src/pages/rates/ShipmentDetailsForQuotes.tsx
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

type Service = "FCL" | "LCL" | "Air";
type Container = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC" | "LCL";

export default function ShipmentDetailsForQuotes() {
  const [service, setService] = useState<Service>("FCL");
  const [origin, setOrigin] = useState("INNSA - Nhava Sheva, India");
  const [destination, setDestination] = useState("DEHAM - Hamburg, Germany");
  const [container, setContainer] = useState<Container>("20 ft - Standard");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Saved shipment details for quote:\n${service} • ${origin} → ${destination}\nContainer/Mode: ${container}\nWeight: ${weight} kg • CBM: ${cbm}\nNotes: ${
        notes || "-"
      }`
    );
  };

  const isLCL = service === "LCL";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Freight Booking & Rates ▸ Quote Inputs
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Enter Shipment Details for Quotes
        </div>
        <div className="mt-1 text-sm opacity-95">
          Capture shipment attributes used to price a quote.
        </div>
      </div>

      <form onSubmit={submit}>
        <Section title="Shipment Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div>
              <Label>{isLCL ? "Mode" : "Container"}</Label>
              <Select
                value={container}
                onChange={(e) => setContainer(e.target.value as Container)}
              >
                {isLCL ? (
                  <option>LCL</option>
                ) : (
                  <>
                    <option>20 ft - Standard</option>
                    <option>40 ft - Standard</option>
                    <option>40 ft - HC</option>
                  </>
                )}
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
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div>
              <Label>Weight (kgs)</Label>
              <Input
                inputMode="numeric"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 19,000"
              />
            </div>
            <div>
              <Label>CBM (for LCL/Air)</Label>
              <Input
                inputMode="decimal"
                value={cbm}
                onChange={(e) => setCbm(e.target.value)}
                placeholder="e.g. 28.4"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Save for Quote
              </button>
            </div>
          </div>
        </Section>
      </form>
    </div>
  );
}
