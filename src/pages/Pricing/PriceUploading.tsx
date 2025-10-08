// src/pages/pricing/PriceUploading.tsx
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx"; // <-- yarn add xlsx  (or npm i xlsx)

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

type GridRow = Record<string, any>;
type ParsedBook = {
  fileName: string;
  sheets: { name: string; rows: GridRow[] }[];
};

export default function PriceUploading() {
  const [file, setFile] = useState<File | null>(null);
  const [service, setService] = useState<"FCL" | "LCL" | "Air">("FCL");
  const [carrier, setCarrier] = useState("MSC");
  const [notes, setNotes] = useState("");

  // parsed workbook (after selecting a CSV/XLSX)
  const [parsed, setParsed] = useState<ParsedBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const activeRows = useMemo(() => {
    if (!parsed || !activeSheet) return [];
    return parsed.sheets.find((s) => s.name === activeSheet)?.rows ?? [];
  }, [parsed, activeSheet]);

  const headers = useMemo(() => {
    if (!activeRows.length) return [];
    return Array.from(
      activeRows.reduce((set, row) => {
        Object.keys(row || {}).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );
  }, [activeRows]);

  const handleFileChange = async (f: File | null) => {
    setFile(f);
    setParsed(null);
    setActiveSheet(null);
    if (!f) return;

    const buf = await f.arrayBuffer();

    if (f.name.endsWith(".csv")) {
      // Parse CSV as a single-sheet workbook
      const text = new TextDecoder().decode(new Uint8Array(buf));
      const ws = XLSX.utils.aoa_to_sheet(
        text
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line) => line.split(","))
      );
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as GridRow[];
      const book: ParsedBook = {
        fileName: f.name,
        sheets: [{ name: f.name.replace(/\.csv$/i, ""), rows }],
      };
      setParsed(book);
      setActiveSheet(book.sheets[0].name);
    } else {
      // Parse Excel
      const wb = XLSX.read(buf, { type: "array" });
      const sheets = wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as GridRow[];
        return { name, rows };
      });
      const book: ParsedBook = { fileName: f.name, sheets };
      setParsed(book);
      setActiveSheet(sheets[0]?.name ?? null);
    }
  };

  const upload = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Uploaded ${
        file?.name || "(no file)"
      } for ${service} • ${carrier}\nNotes: ${notes || "-"}\nSheets: ${
        parsed?.sheets.map((s) => s.name).join(", ") || "-"
      }`
    );
    setNotes("");
  };

  const downloadActiveAsCsv = () => {
    if (!parsed || !activeSheet) return;
    const rows = parsed.sheets.find((s) => s.name === activeSheet)?.rows ?? [];
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base =
      parsed.fileName.replace(/\.(xlsx|xls|csv)$/i, "") + `__${activeSheet}`;
    a.download = `${base}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    // lightweight template headers; adjust as needed
    const template = [
      {
        origin: "INNSA", // UN/LOCODE
        destination: "DEHAM",
        container: "20GP",
        base: 500,
        BAF: 75,
        FSC: 20,
        LSS: 10,
        validity_from: "2025-10-01",
        validity_to: "2025-10-31",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "price_upload_template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Form + Imported Sheets */}
      <form
        onSubmit={upload}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
      >
        {/* Left: Upload */}
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
              <Label>Price Sheet (CSV/XLSX)</Label>
              <Input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
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
                onClick={downloadTemplate}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                Download Template
              </button>
              {parsed && activeSheet && (
                <button
                  type="button"
                  onClick={downloadActiveAsCsv}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  Download Current Sheet (CSV)
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* Right: Recent Uploads */}
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

      {/* Imported Sheets area */}
      <Section title="Imported Sheets">
        {!parsed ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No file imported yet. Select a CSV/XLSX above to see sheet previews
            here.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sheet selector chips */}
            <div className="flex flex-wrap gap-2">
              {parsed.sheets.map((s) => {
                const isActive = s.name === activeSheet;
                return (
                  <button
                    key={s.name}
                    onClick={() => setActiveSheet(s.name)}
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition
                    ${
                      isActive
                        ? "bg-sky-600 text-white border-sky-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Preview table */}
            <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/[0.04]">
                  <tr>
                    {headers.map((h) => (
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
                  {activeRows.slice(0, 100).map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2
                          ? "bg-white dark:bg-transparent"
                          : "bg-gray-50/70 dark:bg-white/[0.02]"
                      }
                    >
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap"
                        >
                          {String(row?.[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!activeRows.length && (
                    <tr>
                      <td
                        className="px-3 py-6 text-gray-500 dark:text-gray-400"
                        colSpan={headers.length || 1}
                      >
                        No rows found in this sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing first 100 rows. Use “Download Current Sheet (CSV)” for
              full data.
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
