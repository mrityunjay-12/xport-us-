// src/pages/billing/Subscription.tsx
import React from "react";

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

export default function Subscription() {
  const sub = {
    plan: "Pro (Annual)",
    users: 25,
    renewsOn: "2026-01-15",
    status: "Active",
    lastInvoice: "INV-2025-00123",
    amountINR: 120000,
    paymentMethod: "Card •••• 4242",
    features: [
      "Unlimited quotes",
      "API pricing",
      "Advanced analytics",
      "Priority support",
    ],
  };

  const inr = (v: number) =>
    `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      v
    )}`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">
          Billing & Payments ▸ Subscription
        </div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Subscription Status
        </div>
        <div className="mt-1 text-sm opacity-95">
          Plan details, renewal, and payment method.
        </div>
      </div>

      <Section title="Plan">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm dark:text-gray-300">
          <div>
            Plan: <b>{sub.plan}</b>
          </div>
          <div>
            Status: <b>{sub.status}</b>
          </div>
          <div>
            Seats: <b>{sub.users}</b>
          </div>
          <div>
            Renews On: <b>{sub.renewsOn}</b>
          </div>
          <div>
            Payment Method: <b>{sub.paymentMethod}</b>
          </div>
          <div>
            Last Invoice: <b>{sub.lastInvoice}</b>
          </div>
          <div className="sm:col-span-2">
            Annual Amount: <b>{inr(sub.amountINR)}</b>
          </div>
        </div>
      </Section>

      <Section title="Included Features">
        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          {sub.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Section>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Upgrade
        </button>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          Change Payment Method
        </button>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
          Cancel Subscription
        </button>
      </div>
    </div>
  );
}
