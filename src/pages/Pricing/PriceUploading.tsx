// src/pages/pricing/PriceUploading.tsx
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

export default function PriceUploading() {
  const [file, setFile] = useState<File | null>(null);
  const [service, setService] = useState<"FCL" | "LCL" | "Air">("FCL");
  const [carrier, setCarrier] = useState("MSC");
  const [notes, setNotes] = useState("");

  const upload = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Uploaded ${
        file?.name || "(no file)"
      } for ${service} • ${carrier}\nNotes: ${notes || "-"}`
    );
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Pricing Manager ▸ Price Uploading
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Price Uploading
        </div>
        <div className="mt-1 text-sm opacity-95">
          Import tariffs (Excel/CSV) from carriers and partners.
        </div>
      </div>

      <form
        onSubmit={upload}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
      >
        <Section title="Upload File">
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
              <Label>Price Sheet</Label>
              <Input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                CSV/XLSX with origin, destination, container, base, surcharges…
              </p>
            </div>
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Upload & Validate
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                Download Template
              </button>
            </div>
          </div>
        </Section>

        <Section title="Recent Uploads">
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              2025-09-15 · MSC FCL India→EU · <b>approved</b>
            </li>
            <li>
              2025-09-10 · LCL Console China→IN · <b>processing</b>
            </li>
          </ul>
        </Section>
      </form>
    </div>
  );
}
