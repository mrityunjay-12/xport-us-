import React, { useMemo, useState } from "react";

/* ---------- Shared primitives (kept lightweight, same style) ---------- */
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

/* ---------- User-only Settings Page (no admin/company/team/API) ---------- */
const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "Europe/Paris",
  "America/New_York",
  "Asia/Singapore",
] as const;
const CURRENCIES = ["INR", "USD", "EUR"] as const;
const UNITS = ["Metric", "Imperial"] as const;

export default function UserSettingsPage() {
  // Profile
  const [fullName, setFullName] = useState("Alex Doe");
  const [email, setEmail] = useState("alex@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");

  // Defaults & preferences
  const [timezone, setTimezone] =
    useState<(typeof TIMEZONES)[number]>("Asia/Kolkata");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("INR");
  const [units, setUnits] = useState<(typeof UNITS)[number]>("Metric");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifApp, setNotifApp] = useState(true);

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  // Addresses (personal saved addresses for pickup/delivery)
  type Addr = {
    id: string;
    label: string;
    line: string;
    city: string;
    pincode: string;
    country: string;
  };
  const [addresses, setAddresses] = useState<Addr[]>([
    {
      id: "A1",
      label: "Home",
      line: "221B Baker Street",
      city: "Mumbai",
      pincode: "400001",
      country: "IN",
    },
  ]);
  const [newAddr, setNewAddr] = useState<Addr>({
    id: "",
    label: "",
    line: "",
    city: "",
    pincode: "",
    country: "IN",
  });

  // Connected accounts (demo toggles only)
  const [connectGoogle, setConnectGoogle] = useState(false);
  const [connectDrive, setConnectDrive] = useState(false);

  const kpi = useMemo(
    () => ({
      alerts: (notifEmail ? 1 : 0) + (notifSMS ? 1 : 0) + (notifApp ? 1 : 0),
      addresses: addresses.length,
      security: twoFA ? "2FA On" : "2FA Off",
    }),
    [notifEmail, notifSMS, notifApp, addresses, twoFA]
  );

  function addAddress() {
    if (!newAddr.label || !newAddr.line || !newAddr.city) return;
    const id = `A${Math.random().toString(36).slice(2, 6)}`;
    setAddresses((a) => [...a, { ...newAddr, id }]);
    setNewAddr({
      id: "",
      label: "",
      line: "",
      city: "",
      pincode: "",
      country: "IN",
    });
  }
  function removeAddress(id: string) {
    setAddresses((a) => a.filter((x) => x.id !== id));
  }

  const pwdError = useMemo(() => {
    if (!pwd1 && !pwd2) return "";
    if (pwd1.length < 8) return "Password must be at least 8 characters.";
    if (pwd1 !== pwd2) return "Passwords do not match.";
    return "";
  }, [pwd1, pwd2]);

  function resetAll() {
    setFullName("Alex Doe");
    setEmail("alex@example.com");
    setPhone("+91 98765 43210");
    setTimezone("Asia/Kolkata");
    setCurrency("INR");
    setUnits("Metric");
    setTheme("system");
    setNotifEmail(true);
    setNotifSMS(false);
    setNotifApp(true);
    setTwoFA(false);
    setPwd1("");
    setPwd2("");
    setAddresses([
      {
        id: "A1",
        label: "Home",
        line: "221B Baker Street",
        city: "Mumbai",
        pincode: "400001",
        country: "IN",
      },
    ]);
    setConnectGoogle(false);
    setConnectDrive(false);
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs leading-5 opacity-90">User ▸ Settings</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">Settings</div>
        <div className="mt-1 text-sm opacity-95">
          Personal preferences, security and notifications. (No admin features)
        </div>
      </div>

      {/* KPIs (personal) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Notifications" value={kpi.alerts} sub="Active channels" />
        <Card
          title="Saved Addresses"
          value={kpi.addresses}
          sub="Pickup / Delivery"
        />
        <Card title="Security" value={kpi.security} sub="Two‑factor status" />
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Profile
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Security
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2 md:col-span-3">
            <input
              type="checkbox"
              checked={twoFA}
              onChange={(e) => setTwoFA(e.target.checked)}
            />
            <Label>Enable 2‑factor authentication (TOTP/SMS)</Label>
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 min-h-5 md:col-span-3">
            {pwdError}
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Preferences
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label>Timezone</Label>
            <Select
              value={timezone}
              onChange={(e) =>
                setTimezone(e.currentTarget.value as (typeof TIMEZONES)[number])
              }
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Currency</Label>
            <Select
              value={currency}
              onChange={(e) =>
                setCurrency(
                  e.currentTarget.value as (typeof CURRENCIES)[number]
                )
              }
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Units</Label>
            <Select
              value={units}
              onChange={(e) =>
                setUnits(e.currentTarget.value as (typeof UNITS)[number])
              }
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Theme</Label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.currentTarget.value as any)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Notifications
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
            />
            <Label>Email</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifSMS}
              onChange={(e) => setNotifSMS(e.target.checked)}
            />
            <Label>SMS</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifApp}
              onChange={(e) => setNotifApp(e.target.checked)}
            />
            <Label>In‑app</Label>
          </div>
        </div>
      </section>

      {/* Addresses */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Saved Addresses
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800 sm:grid-cols-[1fr_auto]"
            >
              <div className="text-gray-700 dark:text-gray-300">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {a.label}
                </div>
                <div>
                  {a.line}, {a.city} {a.pincode}, {a.country}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => removeAddress(a.id)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px]">
          <div>
            <Label>Label</Label>
            <Input
              value={newAddr.label}
              onChange={(e) =>
                setNewAddr({ ...newAddr, label: e.target.value })
              }
              placeholder="Home / Office"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={newAddr.line}
              onChange={(e) => setNewAddr({ ...newAddr, line: e.target.value })}
              placeholder="Street, area"
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
            />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input
              value={newAddr.pincode}
              onChange={(e) =>
                setNewAddr({ ...newAddr, pincode: e.target.value })
              }
            />
          </div>
          <button
            onClick={addAddress}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Add
          </button>
        </div>
      </section>

      {/* Connected Accounts (personal) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Connected Accounts
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Google Account
            </div>
            <button
              onClick={() => setConnectGoogle((v) => !v)}
              className={`rounded-lg px-3 py-1 text-sm ${
                connectGoogle
                  ? "border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                  : "bg-sky-600 text-white hover:bg-sky-700"
              }`}
            >
              {connectGoogle ? "Disconnect" : "Connect"}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Google Drive
            </div>
            <button
              onClick={() => setConnectDrive((v) => !v)}
              className={`rounded-lg px-3 py-1 text-sm ${
                connectDrive
                  ? "border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
                  : "bg-sky-600 text-white hover:bg-sky-700"
              }`}
            >
              {connectDrive ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Data & Privacy
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Download my data
          </button>
          <button className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5">
            Delete account (request)
          </button>
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={resetAll}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          Reset
        </button>
        <button
          type="button"
          disabled={!!pwdError}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            pwdError ? "bg-sky-300" : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
