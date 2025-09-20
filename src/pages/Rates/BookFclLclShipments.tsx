// src/pages/rates/BookFclLclShipments.tsx
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

type Service = "FCL" | "LCL";
type Container = "20 ft - Standard" | "40 ft - Standard" | "40 ft - HC" | "LCL";
interface Draft {
  customer: string;
  service: Service;
  origin: string;
  destination: string;
  carrier: string;
  schedule: string; // ETD
  container: Container;
  pieces?: string;
  cbm?: string;
  weight?: string;
  notes: string;
}

export default function BookFclLclShipments() {
  const [form, setForm] = useState<Draft>({
    customer: "",
    service: "FCL",
    origin: "INNSA - Nhava Sheva, India",
    destination: "DEHAM - Hamburg, Germany",
    carrier: "MSC",
    schedule: "",
    container: "20 ft - Standard",
    notes: "",
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Booking created!
Customer: ${form.customer || "-"}
${form.service} • Carrier: ${form.carrier} • ETD ${form.schedule || "-"}
${form.origin} → ${form.destination}
Container: ${form.container}
Weight: ${form.weight || "-"} kg • Pieces: ${form.pieces || "-"} • CBM: ${
        form.cbm || "-"
      }
Notes: ${form.notes || "-"}`
    );
    setForm((f) => ({ ...f, notes: "" }));
  };

  const isLCL = form.service === "LCL";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Freight Booking & Rates ▸ Book
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Book FCL & LCL Shipments
        </div>
        <div className="mt-1 text-sm opacity-95">
          Select service, schedule, and confirm booking details.
        </div>
      </div>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
      >
        <Section title="Booking Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Customer</Label>
              <Input
                placeholder="Account / Customer name"
                value={form.customer}
                onChange={(e) => set("customer", e.target.value)}
              />
            </div>

            <div>
              <Label>Service</Label>
              <Select
                value={form.service}
                onChange={(e) => set("service", e.target.value as Service)}
              >
                <option>FCL</option>
                <option>LCL</option>
              </Select>
            </div>

            <div>
              <Label>Carrier</Label>
              <Select
                value={form.carrier}
                onChange={(e) => set("carrier", e.target.value)}
              >
                <option>MSC</option>
                <option>CMA CGM</option>
                <option>Maersk</option>
                <option>ONE</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Origin</Label>
              <Input
                value={form.origin}
                onChange={(e) => set("origin", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              />
            </div>

            <div>
              <Label>ETD (Schedule)</Label>
              <Input
                type="date"
                value={form.schedule}
                onChange={(e) => set("schedule", e.target.value)}
              />
            </div>

            <div>
              <Label>{isLCL ? "Mode" : "Container"}</Label>
              <Select
                value={form.container}
                onChange={(e) => set("container", e.target.value as Container)}
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

            {isLCL ? (
              <>
                <div>
                  <Label>Pieces</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="e.g. 12"
                    value={form.pieces || ""}
                    onChange={(e) => set("pieces", e.target.value)}
                  />
                </div>
                <div>
                  <Label>CBM</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="e.g. 28.4"
                    value={form.cbm || ""}
                    onChange={(e) => set("cbm", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Weight (kgs)</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="e.g. 6,500"
                    value={form.weight || ""}
                    onChange={(e) => set("weight", e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <Label>Weight (kgs)</Label>
                <Input
                  inputMode="numeric"
                  placeholder="e.g. 19,000"
                  value={form.weight || ""}
                  onChange={(e) => set("weight", e.target.value)}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Pickup window, free days, shipper/consignee refs…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Create Booking
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                onClick={() => setForm((f) => ({ ...f, notes: "" }))}
              >
                Save Draft
              </button>
            </div>
          </div>
        </Section>

        <Section title="Preview">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              <b>{form.service}</b> • <b>{form.carrier}</b> • ETD{" "}
              <b>{form.schedule || "—"}</b>
            </div>
            <div className="mt-1">
              {form.origin} → {form.destination}
            </div>
            <div className="mt-1">
              {form.service === "LCL" ? (
                <>
                  Pieces: <b>{form.pieces || "—"}</b> • CBM:{" "}
                  <b>{form.cbm || "—"}</b> • Weight: <b>{form.weight || "—"}</b>{" "}
                  kg
                </>
              ) : (
                <>
                  Container: <b>{form.container}</b> • Weight:{" "}
                  <b>{form.weight || "—"}</b> kg
                </>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This summary can be sent with a booking confirmation email/PDF.
            </div>
          </div>
        </Section>
      </form>
    </div>
  );
}
