import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

type VendorStatus = "Pending" | "Approved" | "Rejected";
interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  gstin?: string;
  docs: string[]; // filenames
  status: VendorStatus;
}

const statusColor = (s: VendorStatus) =>
  s === "Approved" ? "success" : s === "Rejected" ? "error" : "warning";

const seed: Vendor[] = [
  {
    id: "VND-0001",
    name: "Mariner Logistics LLP",
    category: "Trucking",
    contact: "Amit Sharma",
    email: "ops@marinerlogistics.in",
    gstin: "27ABCDE1234F1Z5",
    docs: ["gst.pdf", "msme.pdf"],
    status: "Pending",
  },
  {
    id: "VND-0002",
    name: "Skyway Warehousing",
    category: "CFS / Warehouse",
    contact: "Riya Singh",
    email: "hello@skywaycfs.com",
    docs: ["gst.pdf"],
    status: "Approved",
  },
  {
    id: "VND-0003",
    name: "Swift Customs Broking",
    category: "CHA",
    contact: "Sameer Khan",
    email: "desk@swiftcha.com",
    docs: [],
    status: "Pending",
  },
];

export default function VendorApprovals() {
  const [vendors, setVendors] = useState<Vendor[]>(seed);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => vendors.find((v) => v.id === openId) || null,
    [openId, vendors]
  );

  const approve = (id: string) =>
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Approved" } : v))
    );
  const reject = (id: string) =>
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "Rejected" } : v))
    );

  // drawer helpers
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;

    // lock background scroll
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // focus drawer for keyboard users
    requestAnimationFrame(() => panelRef.current?.focus());

    // close on ESC + simple focus loop
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open, setOpenId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-4 text-white sm:p-5">
        <div className="text-xs/5 opacity-90">Vendors ▸ Register & Approve</div>
        <div className="mt-1 text-lg font-semibold sm:text-xl">
          Register & Approve Vendors
        </div>
        <div className="mt-1 text-sm opacity-95">
          Review vendor applications, verify documents, and approve or reject.
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {v.id} · {v.name}
                    </div>
                    <Badge size="sm" color={statusColor(v.status) as any}>
                      {v.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {v.category} • Contact: <b>{v.contact}</b> • {v.email}
                  </div>
                  {v.gstin && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      GSTIN: <b>{v.gstin}</b>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(v.id)}
                  >
                    View
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() => approve(v.id)}
                    disabled={v.status === "Approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => reject(v.id)}
                    disabled={v.status === "Rejected"}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200000]" // ⬅️ bump well above header/sidebar
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[200000] bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpenId(null)}
            />

            {/* Drawer panel */}
            <div
              ref={panelRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="
          fixed right-0 inset-y-0 z-[200001]
          w-full max-w-xl
          bg-white shadow-2xl outline-none dark:bg-gray-900
          flex flex-col
        "
            >
              {/* Header */}
              <div className="relative">
                <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 pb-4 pt-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        id="drawer-title"
                        className="text-base font-semibold leading-6"
                      >
                        {open.name}
                      </div>
                      <div className="mt-0.5 text-xs/5 opacity-90">
                        ID: <b>{open.id}</b> · Category: {open.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium ring-1 ring-white/30">
                        {open.email}
                      </span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium ring-1 ring-white/30">
                        Contact: {open.contact}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-white/40 ${
                        open.status === "Approved"
                          ? "bg-emerald-400/20"
                          : open.status === "Rejected"
                          ? "bg-rose-400/20"
                          : "bg-amber-400/20"
                      }`}
                    >
                      {open.status}
                    </span>
                    {open.gstin ? (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] ring-1 ring-white/30">
                        GSTIN: {open.gstin}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Top-right close */}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4">
                {/* Details Card */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Vendor Details
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Name
                      </div>
                      <div className="font-medium">{open.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Category
                      </div>
                      <div className="font-medium">{open.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Contact
                      </div>
                      <div className="font-medium">{open.contact}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Email
                      </div>
                      <div className="font-medium">{open.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        GSTIN
                      </div>
                      <div className="font-medium">{open.gstin || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Status
                      </div>
                      <div className="inline-flex">
                        <Badge
                          size="sm"
                          color={statusColor(open.status) as any}
                        >
                          {open.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-gray-100 dark:bg-gray-800" />

                {/* Documents */}
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                    Documents
                  </div>

                  {open.docs.length ? (
                    <div className="flex flex-wrap gap-2">
                      {open.docs.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                          <svg
                            className="size-3.5 opacity-70"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M4 3a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0117 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" />
                          </svg>
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No files uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="pointer-events-auto sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/85 px-5 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => setOpenId(null)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    onClick={() => approve(open.id)}
                    disabled={open.status === "Approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => reject(open.id)}
                    disabled={open.status === "Rejected"}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
