import React, { useMemo, useState } from "react";

/* ---------- Primitives (same style as your app) ---------- */
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

/* ---------- Types & demo data ---------- */
const FIN_STATUS = ["unpaid", "due soon", "overdue", "paid"] as const;
type FinStatus = (typeof FIN_STATUS)[number];

type Invoice = {
  id: string;
  customer: string;
  shipmentId?: string;
  date: string; // YYYY-MM-DD
  due: string; // YYYY-MM-DD
  amount: number;
  currency: "USD" | "INR" | "EUR";
  status: FinStatus;
};

const INVOICES: Invoice[] = [
  {
    id: "INV-10001",
    customer: "Acme Imports",
    shipmentId: "BKG-81021",
    date: "2025-10-01",
    due: "2025-10-31",
    amount: 2450,
    currency: "USD",
    status: "unpaid",
  },
  {
    id: "INV-10002",
    customer: "Zen Traders",
    shipmentId: "IMP-91011",
    date: "2025-09-25",
    due: "2025-10-15",
    amount: 980,
    currency: "USD",
    status: "overdue",
  },
  {
    id: "INV-10003",
    customer: "Globex Pvt Ltd",
    shipmentId: "BKG-81024",
    date: "2025-09-20",
    due: "2025-10-20",
    amount: 1520,
    currency: "USD",
    status: "due soon",
  },
  {
    id: "INV-10004",
    customer: "BlueLine Retail",
    shipmentId: "IMP-91014",
    date: "2025-09-10",
    due: "2025-10-10",
    amount: 620,
    currency: "EUR",
    status: "paid",
  },
  {
    id: "INV-10005",
    customer: "Acme Imports",
    shipmentId: "IMP-91012",
    date: "2025-10-05",
    due: "2025-11-04",
    amount: 450,
    currency: "USD",
    status: "unpaid",
  },
];

function money(n: number, c: Invoice["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
  }).format(n);
}

const FinPill = ({ s }: { s: FinStatus }) => {
  const map: Record<FinStatus, string> = {
    unpaid: "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200",
    "due soon":
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s]}`}
    >
      {s[0].toUpperCase() + s.slice(1)}
    </span>
  );
};

export default function FinancePage() {
  const [status, setStatus] = useState<FinStatus | "all">("all");
  const [customer, setCustomer] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return INVOICES.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (
        customer &&
        !i.customer.toLowerCase().includes(customer.toLowerCase())
      )
        return false;
      if (from && new Date(i.date) < from) return false;
      if (to && new Date(i.date) > to) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${i.id} ${i.customer} ${i.shipmentId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [status, customer, dateFrom, dateTo, search]);

  const totals = useMemo(() => {
    const sum = (fltr: (i: Invoice) => boolean) =>
      filtered.filter(fltr).reduce((acc, i) => acc + i.amount, 0);
    const unpaid = sum((i) => i.status === "unpaid");
    const dueSoon = sum((i) => i.status === "due soon");
    const overdue = sum((i) => i.status === "overdue");
    const paid = sum((i) => i.status === "paid");
    return { unpaid, dueSoon, overdue, paid };
  }, [filtered]);

  const aging = useMemo(() => {
    const now = new Date();
    const bucket = { "0-30": 0, "31-60": 0, "61-90": 0, ">90": 0 } as Record<
      string,
      number
    >;
    filtered.forEach((i) => {
      const diff = Math.floor(
        (now.getTime() - new Date(i.due).getTime()) / (24 * 3600 * 1000)
      );
      if (i.status === "paid") return; // exclude paid from aging
      if (diff <= 0) bucket["0-30"] += i.amount;
      // not yet due or due soon falls here for demo
      else if (diff <= 30) bucket["0-30"] += i.amount;
      else if (diff <= 60) bucket["31-60"] += i.amount;
      else if (diff <= 90) bucket["61-90"] += i.amount;
      else bucket[">90"] += i.amount;
    });
    return bucket;
  }, [filtered]);

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">User ▸ Finance</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Finance</div>
        <div className="mt-1 text-sm opacity-95">
          View invoices, track dues, and export statements.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Unpaid"
          value={money(totals.unpaid, "USD")}
          sub="Outstanding"
        />
        <Card
          title="Due Soon"
          value={money(totals.dueSoon, "USD")}
          sub="Within 30 days"
        />
        <Card
          title="Overdue"
          value={money(totals.overdue, "USD")}
          sub="Past due"
        />
        <Card title="Paid" value={money(totals.paid, "USD")} sub="Settled" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.currentTarget.value as FinStatus | "all")
              }
            >
              {["all", ...FIN_STATUS].map((opt) => (
                <option key={opt} value={opt as any}>
                  {String(opt).replace(/^./, (c) => c.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Customer</Label>
            <Input
              placeholder="Search customer name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>
          <div>
            <Label>Date From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by invoice or shipment ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => {
                setStatus("all");
                setCustomer("");
                setDateFrom("");
                setDateTo("");
                setSearch("");
              }}
              className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Export Statement
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card title="0–30" value={money(aging["0-30"], "USD")} sub="USD" />
        <Card title="31–60" value={money(aging["31-60"], "USD")} sub="USD" />
        <Card title="61–90" value={money(aging["61-90"], "USD")} sub="USD" />
        <Card title="> 90" value={money(aging[">90"], "USD")} sub="USD" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Invoices ({filtered.length})
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <button className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Export CSV
            </button>
            <button className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
              Bulk Actions
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.04]">
              <tr>
                {[
                  "Invoice",
                  "Customer",
                  "Shipment",
                  "Date",
                  "Due",
                  "Amount",
                  "Currency",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((i, idx) => (
                  <tr
                    key={i.id}
                    className={
                      idx % 2
                        ? "bg-white dark:bg-transparent"
                        : "bg-gray-50/70 dark:bg-white/[0.02]"
                    }
                  >
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.id}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.customer}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.shipmentId ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.date}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.due}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {money(i.amount, i.currency)}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      {i.currency}
                    </td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                      <FinPill s={i.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-gray-500 dark:text-gray-400"
                    colSpan={8}
                  >
                    No results match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} invoices
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Quick Actions
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
            Record Payment
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Send Reminder
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Download SOA
          </button>
        </div>
      </div>
    </div>
  );
}
