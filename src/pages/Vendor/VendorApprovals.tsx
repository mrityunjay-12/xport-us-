import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Badge from "../../components/ui/badge/Badge";

// --- Types ---
type VendorStatus = "Pending" | "Approved" | "Rejected" | "In Review";

interface VendorDocument {
  id: string;
  name: string;
  type: "PDF" | "Image";
  size: string;
  date: string;
  status: "Verified" | "Pending" | "Rejected";
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  avatarInitials: string;
  submittedAt: string;
  status: VendorStatus;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  company: {
    legalName: string;
    gstin: string;
    pan: string;
    address: string;
    city: string;
    website?: string;
    established?: string;
  };
  bank: {
    accHolder: string;
    accNumber: string;
    bankName: string;
    ifsc: string;
    branch: string;
  };
  docs: VendorDocument[];
  notes?: string;
}

const statusColor = (s: VendorStatus) =>
  s === "Approved"
    ? "success"
    : s === "Rejected"
    ? "error"
    : s === "In Review"
    ? "warning"
    : "gray";

// --- Seed Data ---
const seed: Vendor[] = [
  {
    id: "VND-0001",
    name: "Mariner Logistics LLP",
    category: "Trucking",
    avatarInitials: "ML",
    submittedAt: "2025-10-12",
    status: "Pending",
    contact: {
      name: "Amit Sharma",
      role: "Operations Manager",
      email: "amit.sharma@marinerlogistics.in",
      phone: "+91 98765 00001",
    },
    company: {
      legalName: "Mariner Logistics Limited Liability Partnership",
      gstin: "27AAECM1234F1Z5",
      pan: "AAECM1234F",
      address: "Unit 304, Solaris Business Hub, Saki Vihar Road",
      city: "Mumbai, MH - 400072",
      website: "www.marinerlogistics.in",
      established: "2015",
    },
    bank: {
      accHolder: "Mariner Logistics LLP",
      accNumber: "915020055118822",
      bankName: "HDFC Bank",
      ifsc: "HDFC0000543",
      branch: "Andheri East",
    },
    docs: [
      {
        id: "D1",
        name: "GST_Certificate.pdf",
        type: "PDF",
        size: "1.2 MB",
        date: "2025-10-10",
        status: "Pending",
      },
      {
        id: "D2",
        name: "Cancelled_Cheque.jpg",
        type: "Image",
        size: "450 KB",
        date: "2025-10-10",
        status: "Pending",
      },
      {
        id: "D3",
        name: "PAN_Card.pdf",
        type: "PDF",
        size: "800 KB",
        date: "2025-10-10",
        status: "Verified",
      },
    ],
  },
  {
    id: "VND-0002",
    name: "Skyway Warehousing",
    category: "CFS / Warehouse",
    avatarInitials: "SW",
    submittedAt: "2025-10-08",
    status: "Approved",
    contact: {
      name: "Riya Singh",
      role: "Director",
      email: "riya@skywaycfs.com",
      phone: "+91 99887 77665",
    },
    company: {
      legalName: "Skyway Warehousing Pvt Ltd",
      gstin: "29BBGCW9876K1Z9",
      pan: "BBGCW9876K",
      address: "Plot 12, Industrial Area, Whitefield",
      city: "Bangalore, KA - 560066",
      website: "www.skywaycfs.com",
    },
    bank: {
      accHolder: "Skyway Warehousing Pvt Ltd",
      accNumber: "000999888777",
      bankName: "ICICI Bank",
      ifsc: "ICIC0001122",
      branch: "Whitefield",
    },
    docs: [
      {
        id: "D1",
        name: "Usage_License.pdf",
        type: "PDF",
        size: "2.5 MB",
        date: "2025-09-25",
        status: "Verified",
      },
    ],
  },
  {
    id: "VND-0003",
    name: "Swift Customs Broking",
    category: "CHA",
    avatarInitials: "SC",
    submittedAt: "2025-10-14",
    status: "In Review",
    contact: {
      name: "Sameer Khan",
      role: "Partner",
      email: "sameer@swiftcha.com",
      phone: "+91 88776 65544",
    },
    company: {
      legalName: "Swift Customs Broking services",
      gstin: "33AABCS1234H1Z1",
      pan: "AABCS1234H",
      address: "15, Shyama Prasad Mukherjee Road",
      city: "Kolkata, WB - 700026",
    },
    bank: {
      accHolder: "Swift Customs Broking",
      accNumber: "300400500600",
      bankName: "State Bank of India",
      ifsc: "SBIN0001234",
      branch: "Kalighat",
    },
    docs: [],
    notes: "Clarification pending on GST registration date.",
  },
];

export default function VendorApprovals() {
  const [vendors, setVendors] = useState<Vendor[]>(seed);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Details" | "Bank" | "Docs">("Details");

  // Drawer state
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => vendors.find((v) => v.id === openId) || null,
    [openId, vendors]
  );

  // Derived state
  const filtered = useMemo(() => {
    if (!search.trim()) return vendors;
    const s = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        v.id.toLowerCase().includes(s) ||
        v.company.gstin.toLowerCase().includes(s) ||
        v.category.toLowerCase().includes(s)
    );
  }, [vendors, search]);

  const stats = useMemo(() => {
    return {
        total: vendors.length,
        pending: vendors.filter(v => v.status === 'Pending' || v.status === 'In Review').length,
        approved: vendors.filter(v => v.status === 'Approved').length
    }
  }, [vendors]);

  // Actions
  const updateStatus = (id: string, status: VendorStatus) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  // Keyboard / Scroll Lock
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Focus & Key handling
    requestAnimationFrame(() => panelRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = ""; // reset
    };
  }, [open]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-700 to-blue-700 p-6 text-white shadow-xl shadow-blue-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                 <div className="flex items-center gap-2 text-xs font-medium text-sky-100 opacity-80">
                    <span className="uppercase tracking-wider">Vendors</span>
                    <span>/</span>
                    <span className="uppercase tracking-wider">Approvals</span>
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Vendor Management</h1>
                <p className="mt-1 max-w-xl text-sm text-sky-100/90">
                Verify documentation, check compliance compliance, and onboard new logistics partners.
                </p>
            </div>
            {/* Quick Stats */}
            <div className="flex gap-4">
                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-sky-200">Pending</div>
                </div>
                 <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
                    <div className="text-2xl font-bold">{stats.approved}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-sky-200">Active</div>
                </div>
            </div>
        </div>
      </div>

       {/* Search Bar */}
       <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="relative flex-1">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                 <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             <input
                type="text"
                placeholder="Search vendors by name, ID, GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border-none bg-gray-100 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-sky-500 dark:bg-gray-800 dark:text-gray-100"
             />
          </div>
          <div className="text-xs text-gray-500">
             Showing <b>{filtered.length}</b> result{filtered.length !== 1 && 's'}
          </div>
       </div>

      {/* Main List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <div
            key={v.id}
            onClick={() => setOpenId(v.id)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-sky-700 dark:hover:shadow-none"
          >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-bold text-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300">
                        {v.avatarInitials}
                    </div>
                    <div>
                         <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{v.name}</h3>
                         <div className="text-[11px] text-gray-500">{v.category}</div>
                    </div>
                </div>
                 <Badge size="sm" color={statusColor(v.status) as any}>{v.status}</Badge>
            </div>
            
            <div className="mt-4 space-y-2">
                 <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="size-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {v.contact.name}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="size-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {v.contact.email}
                 </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] dark:border-gray-800">
                <span className="text-gray-400">Submitted: {v.submittedAt}</span>
                <span className="font-medium text-sky-600 dark:text-sky-400 group-hover:underline">View Details →</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
             <div className="col-span-full py-10 text-center text-sm text-gray-500">
                No vendors found matching your search.
             </div>
        )}
      </div>

      {/* DRAWER PORTAL */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[5000] isolate"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setOpenId(null)}
            />

            {/* Slide-over panel */}
            <div
              ref={panelRef}
              tabIndex={-1}
              className="fixed inset-y-0 right-0 z-[5001] flex w-full max-w-2xl flex-col bg-white shadow-2xl outline-none dark:bg-gray-900"
            >
              {/* Drawer Header */}
              <div className="relative z-10 border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-sky-500/20">
                            {open.avatarInitials}
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white">{open.name}</h2>
                             <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{open.id}</span>
                                <span className="text-gray-300">•</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{open.category}</span>
                             </div>
                             <div className="mt-2 flex items-center gap-2">
                                <Badge size="sm" color={statusColor(open.status) as any}>{open.status}</Badge>
                                <span className="text-xs text-gray-400">Since {open.submittedAt}</span>
                             </div>
                        </div>
                    </div>
                     <button
                        onClick={() => setOpenId(null)}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 flex gap-6 border-b border-gray-200 text-sm font-medium dark:border-gray-800">
                    {(["Details", "Bank", "Docs"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-3 transition-colors ${
                                activeTab === tab 
                                ? "text-sky-600 dark:text-sky-400" 
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                        >
                            {tab === 'Details' ? 'Company Overview' : tab === 'Bank' ? 'Banking Info' : 'Documents'}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                            )}
                        </button>
                    ))}
                </div>
              </div>

              {/* Drawer Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-white p-6 dark:bg-gray-900">
                 
                 {/* 1. OVERVIEW TAB */}
                 {activeTab === 'Details' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Company Information
                            </h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-2xl bg-gray-50 p-5 dark:bg-white/[0.03]">
                                <div>
                                    <div className="text-xs text-gray-500">Registered Legal Name</div>
                                    <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">{open.company.legalName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Website</div>
                                    <div className="mt-1 font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">{open.company.website || "—"}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-xs text-gray-500">Address</div>
                                    <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">{open.company.address}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{open.company.city}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">GSTIN</div>
                                    <div className="mt-1 font-mono font-medium text-gray-800 dark:text-gray-200">{open.company.gstin}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">PAN</div>
                                    <div className="mt-1 font-mono font-medium text-gray-800 dark:text-gray-200">{open.company.pan}</div>
                                </div>
                            </div>
                        </section>

                        <section>
                             <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Point of Contact
                            </h3>
                            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                     <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{open.contact.name}</div>
                                    <div className="text-sm text-gray-500">{open.contact.role}</div>
                                    <div className="mt-1 flex gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1 hover:text-sky-600 cursor-pointer">
                                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {open.contact.phone}
                                        </span>
                                        <span className="flex items-center gap-1 hover:text-sky-600 cursor-pointer">
                                             <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {open.contact.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                 )}

                 {/* 2. BANK TAB */}
                 {activeTab === 'Bank' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-xl">
                            <div className="flex items-start justify-between">
                                 <div>
                                    <div className="text-xs text-indigo-200">Account Holder</div>
                                    <div className="mt-1 text-lg font-bold tracking-wide">{open.bank.accHolder}</div>
                                 </div>
                                 <svg className="size-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div className="mt-8 font-mono text-2xl tracking-widest">{open.bank.accNumber}</div>
                            <div className="mt-6 flex gap-10">
                                <div>
                                    <div className="text-[10px] text-indigo-300 uppercase">Bank Name</div>
                                    <div className="text-sm font-semibold">{open.bank.bankName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-indigo-300 uppercase">IFSC Code</div>
                                    <div className="text-sm font-semibold">{open.bank.ifsc}</div>
                                </div>
                                 <div>
                                    <div className="text-[10px] text-indigo-300 uppercase">Branch</div>
                                    <div className="text-sm font-semibold">{open.bank.branch}</div>
                                </div>
                            </div>
                         </div>
                         <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
                             <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             <div className="text-sm">
                                Please verify the Cancelled Cheque document matches these account details before approving.
                             </div>
                         </div>
                     </div>
                 )}

                 {/* 3. DOCS TAB */}
                 {activeTab === 'Docs' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {open.docs.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                                <p className="text-gray-500">No documents uploaded yet.</p>
                            </div>
                        ) : (
                            open.docs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/40">
                                    <div className="flex items-center gap-4">
                                         <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                             <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                         </div>
                                         <div>
                                             <div className="font-medium text-gray-900 dark:text-gray-200">{doc.name}</div>
                                             <div className="text-xs text-gray-500">{doc.size} • Uploaded {doc.date}</div>
                                         </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge size="sm" color={doc.status === 'Verified' ? 'success' : doc.status === 'Pending' ? 'warning' : 'error'}>{doc.status}</Badge>
                                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
                                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
                                             <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                 )}
              </div>

               {/* Footer / Actions */}
               <div className="border-t border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                         <div className="text-xs text-gray-500">
                            {open.status === 'Pending' ? 'Action required for this application.' : `Currently marked as ${open.status}`}
                         </div>
                         <div className="flex gap-3">
                             {open.status !== 'Rejected' && (
                                <button
                                    onClick={() => updateStatus(open.id, 'Rejected')}
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                                >
                                    Reject Application
                                </button>
                             )}
                             {(open.status === 'Pending' || open.status === 'In Review' || open.status === 'Rejected') && (
                                 <button
                                     onClick={() => updateStatus(open.id, 'Approved')}
                                     className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                 >
                                    Approve Vendor
                                 </button>
                             )}
                         </div>
                    </div>
               </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
