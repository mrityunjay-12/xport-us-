// AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  BoltIcon,
  DocsIcon,
  TimeIcon,
  FileIcon,
  GridIcon,
  ImportIcon,
  ExportIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

/* ========== ROLES ========== */
export type Role =
  | "SUPER_ADMIN"
  | "OPS_TEAM"
  | "PRICING_MANAGER_VENDOR_SHIPLINE"
  | "CUSTOMER_ORDER_CREATOR"
  | "SALES_TEAM"
  | "END_CUSTOMER";

/** Read role from SignInForm (localStorage), fallback to SUPER_ADMIN */
const readRole = (): Role => {
  const v = localStorage.getItem("demo_role") as Role | null;
  return (
    v ??
    ([
      "SUPER_ADMIN",
      "OPS_TEAM",
      "PRICING_MANAGER_VENDOR_SHIPLINE",
      "CUSTOMER_ORDER_CREATOR",
      "SALES_TEAM",
      "END_CUSTOMER",
    ][0] as Role)
  );
};

/* Per-role dashboard route (matches your SignInForm) */
const roleDashboard: Record<Role, string> = {
  SUPER_ADMIN: "/dashboard",
  OPS_TEAM: "/ops/dashboard",
  PRICING_MANAGER_VENDOR_SHIPLINE: "/dashboard",
  CUSTOMER_ORDER_CREATOR: "/dashboard",
  SALES_TEAM: "/sales/dashboard",
  END_CUSTOMER: "/user/dashboard",
};

/* ========== NAV MODEL ========== */
type SubItem = { name: string; path: string; pro?: boolean; new?: boolean };
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/user/dashboard",
    icon: <BoxCubeIcon />,
  },
  {
    name: "Sales Dashboard",
    path: "/sales/dashboard",
    icon: <BoxCubeIcon />,
  },
  {
    name: "Ops Dashboard",
    path: "/ops/dashboard",
    icon: <BoxCubeIcon />,
  },
  {
    name: "Quote & Book",
    path: "/quoterate/book",
    icon: <GridIcon />,
  },
  {
    name: "Export",
    path: "/user/export",
    icon: <ExportIcon />,
  },
  {
    name: "Import",
    path: "/user/import",
    icon: <ImportIcon />,
  },
  {
    name: "Finance",
    path: "/user/finance",
    icon: <FileIcon />,
  },
  {
    name: "Settings",
    path: "/user/settings",
    icon: <FileIcon />,
  },
  // --- Vendor Management ---
  {
    name: "Vendors",
    icon: <BoxCubeIcon />,
    subItems: [
      { name: "Register & Approve", path: "/vendor/vendors-approvals" },
      { name: "Manage Vendor Orders", path: "/vendor/vendor-orders" },
      {
        name: "Handle Shipment Execution",
        path: "/vendor/shipments/execution",
      },
    ],
  },

  // --- Pricing Manager ---
  {
    name: "Pricing Manager",
    icon: <DocsIcon />,
    subItems: [
      { name: "Price Uploading", path: "/pricing/upload" },
      { name: "API Price Fetching", path: "/pricing/api" }, // N/A for Pricing role
      { name: "Price Comparison", path: "/pricing/compare" },
      { name: "Price Selection", path: "/pricing/selection" },
      { name: "Dashboard & Reports", path: "/pricing/dashboard" },
    ],
  },

  // --- Freight Booking & Rates ---
  {
    name: "Freight Rates & Quotes",
    icon: <BoltIcon />,
    subItems: [
      { name: "Compare Freight Rates", path: "/rates/compare" },
      {
        name: "Enter Shipment Details for Quotes",
        path: "/rates/shipment-details",
      },
      { name: "Manage Bookings", path: "/rates/bookings" },
      { name: "Book FCL & LCL Shipments", path: "/rates/book" },
    ],
  },

  // --- Shipment Tracking ---
  {
    name: "Bookings & Operations",
    icon: <TimeIcon />,
    subItems: [
      { name: "Shipment Tracking & Milestones", path: "/operations/tracking" },
      { name: "Shipment Exceptions", path: "/operations/exceptions" },
    ],
  },

  // --- Notifications ---
  {
    name: "Notifications",
    icon: <PlugInIcon />,
    subItems: [{ name: "All Alerts & Actions", path: "/notifications" }],
  },

  // --- Billing & Payments ---
  {
    name: "Billing & Payments",
    icon: <PageIcon />,
    subItems: [
      { name: "Manage Invoices", path: "/billing/invoices" },
      { name: "Track Payments", path: "/billing/payments" },
      { name: "Handle Disputes", path: "/billing/disputes" }, // Customer: raise only
      { name: "View Subscription Status", path: "/billing/subscription" },
    ],
  },

  // --- CMS ---
  {
    name: "CMS Management",
    icon: <PieChartIcon />,
    subItems: [
      { name: "Manage Articles", path: "/cms/articles" }, // admin only
      { name: "View Articles & Guides", path: "/cms/knowledge" }, // SA(admin badge), Pricing/Customer/End full
    ],
  },

  // --- Analytics & Reports (SA only) ---
  {
    name: "Analytics & Reports",
    icon: <PieChartIcon />,
    subItems: [
      { name: "User & Activity Reports", path: "/analytics/user-activity" },
      { name: "Revenue Reports", path: "/analytics/revenue" },
      { name: "Booking Trends", path: "/analytics/booking-trends" },
      { name: "Vendor Performance", path: "/analytics/vendor-performance" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

/* ========== ACCESS RULES ========== */
type Access = "full" | "view" | "rate" | "raise" | "admin" | "none";
const A = (value: Access) => value;
type AccessTable = Record<Role, Record<string, Access>>;

const ACCESS_TABLE: AccessTable = {
  SUPER_ADMIN: {
    "/dashboard": A("full"),

    // Super Admin Management
    "/admin/users": A("full"),
    "/admin/vendor-subscriptions": A("full"),
    "/admin/platform-settings": A("full"),
    "/admin/vendors-and-subscriptions": A("full"),
    "/admin/saas-pricing-plans": A("full"),
    "/admin/analytics-activities": A("full"),
    "/admin/security-permissions": A("full"),

    // Vendor
    "/vendor/vendors-approvals": A("full"),
    "/vendor/vendor-orders": A("full"),
    "/vendor/shipments/execution": A("full"),

    // Pricing
    "/pricing/upload": A("full"),
    "/pricing/api": A("full"),
    "/pricing/compare": A("full"),
    "/pricing/selection": A("full"),
    "/pricing/dashboard": A("full"),

    // Freight
    "/rates/compare": A("full"),
    "/rates/shipment-details": A("full"),
    "/rates/bookings": A("full"),
    "/rates/book": A("full"),

    // Tracking
    "/operations/tracking": A("full"),
    "/operations/exceptions": A("full"),
    // Notifications
    "/notifications": A("full"),

    // Billing
    "/billing/invoices": A("full"),
    "/billing/payments": A("full"),
    "/billing/disputes": A("full"),
    "/billing/subscription": A("full"),

    // CMS
    "/cms/articles": A("admin"),
    "/cms/knowledge": A("full"),

    // Analytics & Reports
    "/analytics/user-activity": A("full"),
    "/analytics/revenue": A("full"),
    "/analytics/booking-trends": A("full"),
    "/analytics/vendor-performance": A("full"),

    "/signin": A("full"),
    "/signup": A("full"),
  },

  OPS_TEAM: {
    "/ops/dashboard": A("full"),
    "/dashboard": A("none"),

    // Vendor/Prices/Freight (no)
    "/vendor/vendors-approvals": A("full"),
    "/vendor/vendor-orders": A("full"),
    "/vendor/shipments/execution": A("full"),
    "/pricing/upload": A("none"),
    "/pricing/api": A("none"),
    "/pricing/compare": A("none"),
    "/pricing/selection": A("none"),
    "/pricing/dashboard": A("none"),
    "/rates/compare": A("none"),
    "/rates/shipment-details": A("none"),
    "/rates/bookings": A("none"),
    "/rates/book": A("none"),

    // Tracking (yes)
    "/operations/tracking": A("full"),
    "/operations/exceptions": A("full"),
    // Notifications (yes per sheet)
    "/notifications": A("full"),

    // Billing (no)
    "/billing/invoices": A("none"),
    "/billing/payments": A("none"),
    "/billing/disputes": A("none"),
    "/billing/subscription": A("none"),

    // CMS + Analytics (no view for CMS articles; knowledge view allowed)
    "/cms/articles": A("none"),
    "/cms/knowledge": A("none"), // sheet shows ❌ for Ops on "View Articles & Guides"
    "/analytics/user-activity": A("none"),
    "/analytics/revenue": A("none"),
    "/analytics/booking-trends": A("none"),
    "/analytics/vendor-performance": A("none"),

    "/signin": A("none"),
    "/signup": A("none"),
  },

  PRICING_MANAGER_VENDOR_SHIPLINE: {
    "/dashboard": A("full"),

    // Vendor (no)
    "/vendor/vendors-approvals": A("none"),
    "/vendor/vendor-orders": A("none"),
    "/vendor/shipments/execution": A("none"),

    // Pricing (yes except API fetch = N/A)
    "/pricing/upload": A("full"),
    "/pricing/api": A("none"), // '-'
    "/pricing/compare": A("full"),
    "/pricing/selection": A("full"),
    "/pricing/dashboard": A("full"),

    // Freight: compare = view-only; rest no
    "/rates/compare": A("view"),
    "/rates/shipment-details": A("none"),
    "/rates/bookings": A("none"),
    "/rates/book": A("none"),

    // Tracking (yes)
    "/operations/tracking": A("full"),

    // Notifications (rate-related only)
    "/notifications": A("rate"),

    // Billing (Track Payments = ✅; rest ❌)
    "/billing/invoices": A("none"),
    "/billing/payments": A("full"),
    "/billing/disputes": A("none"),
    "/billing/subscription": A("none"),

    // CMS knowledge view ✅
    "/cms/articles": A("none"),
    "/cms/knowledge": A("full"),

    // Analytics (no)
    "/analytics/user-activity": A("none"),
    "/analytics/revenue": A("none"),
    "/analytics/booking-trends": A("none"),
    "/analytics/vendor-performance": A("none"),

    "/signin": A("none"),
    "/signup": A("none"),
  },

  CUSTOMER_ORDER_CREATOR: {
    "/dashboard": A("full"),

    // Vendor: Register & Approve = (self)
    "/vendor/vendors-approvals": A("full"),
    "/vendor/vendor-orders": A("full"),
    "/vendor/shipments/execution": A("full"),

    // Pricing (no)
    "/pricing/upload": A("none"),
    "/pricing/api": A("none"),
    "/pricing/compare": A("none"),
    "/pricing/selection": A("none"),
    "/pricing/dashboard": A("none"),

    // Freight (all yes)
    "/rates/compare": A("full"),
    "/rates/shipment-details": A("full"),
    "/rates/bookings": A("full"),
    "/rates/book": A("full"),

    // Tracking (yes)
    "/operations/tracking": A("full"),

    // Notifications (yes)
    "/notifications": A("full"),

    // Billing (yes; disputes = raise only)
    "/billing/invoices": A("full"),
    "/billing/payments": A("full"),
    "/billing/disputes": A("raise"),
    "/billing/subscription": A("full"),

    // CMS knowledge view ✅
    "/cms/articles": A("none"),
    "/cms/knowledge": A("full"),

    // Analytics (no)
    "/analytics/user-activity": A("none"),
    "/analytics/revenue": A("none"),
    "/analytics/booking-trends": A("none"),
    "/analytics/vendor-performance": A("none"),

    "/signin": A("none"),
    "/signup": A("none"),
  },

  END_CUSTOMER: {
    "/user/dashboard": A("full"),
    "/quoterate/book": A("full"),
    "/user/export": A("full"),
    "/user/import": A("full"),
    "/user/finance": A("full"),
    "/user/settings": A("full"),

    // Vendor: all ❌
    "/vendor/vendors-approvals": A("none"),
    "/vendor/vendor-orders": A("none"),
    "/vendor/shipments/execution": A("none"),

    // Pricing & Freight (no)
    "/pricing/upload": A("none"),
    "/pricing/api": A("none"),
    "/pricing/compare": A("none"),
    "/pricing/selection": A("none"),
    "/pricing/dashboard": A("none"),
    "/rates/compare": A("none"),
    "/rates/shipment-details": A("none"),
    "/rates/bookings": A("none"),
    // "/rates/book": A("none"),

    // Tracking (yes)
    "/operations/tracking": A("none"),

    // Notifications (yes)
    "/notifications": A("none"),

    // Billing (all ❌)
    "/billing/invoices": A("none"),
    "/billing/payments": A("none"),
    "/billing/disputes": A("none"),
    "/billing/subscription": A("none"),

    // CMS knowledge view ✅
    "/cms/articles": A("none"),
    "/cms/knowledge": A("none"),

    // Analytics (no)
    "/analytics/user-activity": A("none"),
    "/analytics/revenue": A("none"),
    "/analytics/booking-trends": A("none"),
    "/analytics/vendor-performance": A("none"),

    "/signin": A("none"),
    "/signup": A("none"),
  },

  SALES_TEAM: {
    "/sales/dashboard": A("full"),
    "/dashboard": A("none"),

    "/vendor/vendors-approvals": A("view"),
    "/vendor/vendor-orders": A("view"),
    "/vendor/shipments/execution": A("view"),

    "/pricing/upload": A("view"),
    "/pricing/compare": A("full"),
    "/pricing/selection": A("full"),
    "/pricing/dashboard": A("full"),

    "/rates/compare": A("full"),
    "/rates/shipment-details": A("full"),
    "/rates/bookings": A("full"),
    "/rates/book": A("full"),

    "/operations/tracking": A("view"),

    "/notifications": A("full"),

    "/billing/invoices": A("view"),
    "/billing/payments": A("view"),
    "/billing/disputes": A("raise"),
    "/billing/subscription": A("none"),

    "/cms/articles": A("none"),
    "/cms/knowledge": A("full"),

    "/analytics/revenue": A("full"),
    "/analytics/booking-trends": A("full"),
    "/analytics/user-activity": A("none"),
    "/analytics/vendor-performance": A("view"),

    "/signin": A("none"),
    "/signup": A("none"),
  },
};

/* Badges for special access */
type AccessBadge = Partial<Record<Access, string>>;
const ACCESS_BADGE: AccessBadge = {
  view: "view",
  rate: "rate-related",
  raise: "raise only",
  admin: "admin",
};

/* Normalize dynamic paths so /dashboard/* matches the /dashboard rule */
const normalizePath = (p: string) =>
  p.startsWith("/dashboard") ? "/dashboard" : p;

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [role, setRole] = useState<Role>(readRole());
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // update role when localStorage changes (e.g., user re-signs in)
  // AppSidebar.tsx

  // A) react to custom role changes in this tab
  useEffect(() => {
    const onRoleChange = () => setRole(readRole());
    window.addEventListener("rolechange", onRoleChange);
    return () => window.removeEventListener("rolechange", onRoleChange);
  }, []);

  // B) also re-read on route changes (useful after navigate('/dashboard'))
  useEffect(() => {
    setRole(readRole());
  }, [location.pathname]);

  const isActive = useCallback(
    (path: string) => {
      const realPath = path === "/" ? roleDashboard[role] : path; // dashboard remap
      return location.pathname === realPath;
    },
    [location.pathname, role]
  );

  const accessOf = (path: string): Access => {
    const realPath = path === "/" ? roleDashboard[role] : path; // map dashboard
    return ACCESS_TABLE[role]?.[normalizePath(realPath)] ?? "none";
  };

  const filterSubItemsByRole = (subs: SubItem[]) =>
    subs
      .map((s) => ({ ...s, __access: accessOf(s.path) as Access }))
      .filter((s) => s.__access !== "none") as (SubItem & {
      __access: Access;
    })[];

  /* auto-open submenu for active route */
  useEffect(() => {
    let matched = false;
    (
      [
        { t: "main", list: navItems },
        { t: "others", list: othersItems },
      ] as const
    ).forEach(({ t, list }) => {
      list.forEach((nav, idx) => {
        if (nav.subItems) {
          const visible = filterSubItemsByRole(nav.subItems);
          visible.forEach((s) => {
            if (isActive(s.path)) {
              setOpenSubmenu({ type: t, index: idx });
              matched = true;
            }
          });
        } else if (nav.path && isActive(nav.path)) {
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, role]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "demo_role") setRole(readRole());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        // pre-check leaf access
        if (nav.path) {
          const acc = accessOf(nav.path);
          if (acc === "none") return null;
        }

        const visibleSubs = nav.subItems
          ? filterSubItemsByRole(nav.subItems)
          : [];
        if (nav.subItems && visibleSubs.length === 0) return null;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path &&
              (() => {
                const acc = accessOf(nav.path);
                if (acc === "none") return null;

                const toPath =
                  nav.path === "/" ? roleDashboard[role] : nav.path;

                return (
                  <Link
                    to={toPath}
                    className={`menu-item group ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <>
                        <span className="menu-item-text">{nav.name}</span>
                        {ACCESS_BADGE[acc] && (
                          <span
                            className={`ml-auto ${
                              isActive(nav.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            {ACCESS_BADGE[acc]}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })()
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {visibleSubs.map((subItem) => {
                    const acc = (subItem as any).__access as Access;
                    return (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {ACCESS_BADGE[acc] && (
                              <span
                                className={`${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                {ACCESS_BADGE[acc]}
                              </span>
                            )}
                            {subItem.new && (
                              <span
                                className={`${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to={roleDashboard[role]} aria-label="Xport Us" title="Xport Us">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="ml-1">
              <img
                src="/images/logo/white-logo.png"
                alt="Xport Us"
                className="h-14 w-auto dark:hidden"
              />
              <img
                src="/images/logo/dark-logo.png"
                alt="Xport Us"
                className="h-14 w-auto hidden dark:block"
              />
            </div>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Xport Us"
              className="h-10 w-auto"
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
