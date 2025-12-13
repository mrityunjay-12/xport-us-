// src/pages/pricing/PricingDashboard.tsx

const Card = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
      {value}
    </div>
    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>
  </div>
);

export default function PricingDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Pricing Manager ▸ Dashboard</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Dashboard & Reports
        </div>
        <div className="mt-1 text-sm opacity-95">
          KPIs from uploads, API pulls, and published rates.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Published Rates" value="1,284" sub="Last 30 days" />
        <Card
          title="Avg. Transit (Export FCL)"
          value="24.6 d"
          sub="India → EU"
        />
        <Card title="Upload Success" value="98.2%" sub="Validations passed" />
        <Card title="API Pulls" value="312" sub="This week" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Recent Activity
        </div>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• Published MSC FAK India→EU (FCL)</li>
          <li>• Pulled spot from Maersk API (CNSHA→INNSA LCL)</li>
          <li>• Upload validated: ONE IN→NA service</li>
        </ul>
      </div>
    </div>
  );
}
