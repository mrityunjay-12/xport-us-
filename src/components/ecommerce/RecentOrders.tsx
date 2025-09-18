import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// ===== Shipment model for export–import (Xportus) =====
interface Shipment {
  id: number;
  ref: string; // booking or reference no.
  direction: "Export" | "Import";
  mode: "Sea" | "Air" | "Road";
  service: "FCL" | "LCL" | "Air";
  route: string; // "Mundra → Jebel Ali"
  carrier: string; // "MSC", "Maersk", "Emirates"
  etd: string; // "2025-09-18"
  eta: string; // "2025-09-25"
  status:
    | "Booked"
    | "Pending SI"
    | "CRO Issued"
    | "In Transit"
    | "Delivered"
    | "Canceled";
  image: string; // mode icon or carrier logo
}

// ===== Example data (replace with API later) =====
const tableData: Shipment[] = [
  {
    id: 101,
    ref: "BK-XP-240917-001",
    direction: "Export",
    mode: "Sea",
    service: "FCL",
    route: "Mundra, IN → Jebel Ali, AE",
    carrier: "MSC",
    etd: "2025-09-18",
    eta: "2025-09-25",
    status: "Booked",
    image: "/images/shipping/sea-fcl.webp",
  },
  {
    id: 102,
    ref: "BK-XP-240917-002",
    direction: "Import",
    mode: "Sea",
    service: "LCL",
    route: "Shanghai, CN → Nhava Sheva, IN",
    carrier: "Maersk",
    etd: "2025-09-16",
    eta: "2025-09-24",
    status: "Pending SI",
    image: "/images/shipping/sea-fcl.webp",
  },
  {
    id: 103,
    ref: "BK-XP-240917-003",
    direction: "Export",
    mode: "Air",
    service: "Air",
    route: "DEL, IN → DXB, AE",
    carrier: "Emirates",
    etd: "2025-09-17",
    eta: "2025-09-17",
    status: "In Transit",
    image: "/images/shipping/air.webp",
  },
  {
    id: 104,
    ref: "BK-XP-240917-004",
    direction: "Import",
    mode: "Sea",
    service: "FCL",
    route: "Jebel Ali, AE → Mundra, IN",
    carrier: "CMA CGM",
    etd: "2025-09-10",
    eta: "2025-09-18",
    status: "Delivered",
    image: "/images/shipping/sea-fcl.webp",
  },
];

// badge color mapper (stick to success/warning/error for safety)
const statusToColor = (s: Shipment["status"]) =>
  s === "Delivered" ? "success" : s === "Canceled" ? "error" : "warning"; // Booked, Pending SI, CRO Issued, In Transit → warning

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Shipments
          </h3>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            Xportus · Export &amp; Import bookings overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Shipment
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Route
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                ETD / ETA
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((s) => (
              <TableRow key={s.id}>
                {/* Shipment */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-50 dark:bg-gray-800">
                      <img
                        src={s.image}
                        className="h-[50px] w-[50px] object-contain"
                        alt={`${s.mode} ${s.service}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">
                        {s.ref} · {s.direction} {s.service} ({s.mode})
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        Carrier: {s.carrier}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Route */}
                <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                  {s.route}
                </TableCell>

                {/* ETD / ETA */}
                <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-theme-xs">
                      ETD
                    </span>
                    <span className="font-medium">{s.etd}</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-gray-500 dark:text-gray-400 text-theme-xs">
                      ETA
                    </span>
                    <span className="font-medium">{s.eta}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={statusToColor(s.status) as any}>
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
