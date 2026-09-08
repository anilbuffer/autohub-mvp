"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Building2,
  CheckSquare,
  Truck,
  AlertTriangle,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  Bell,
  Home,
  Shield,
  LucideIcon,
  Layers,
  Sparkles,
  Box,
  BadgePercent,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  getStoredNotifications,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, SupplierProfile, CustomerNotification } from "@/lib/types";
import { PortalNavSwitcher } from "@/components/PortalNavSwitcher";
import { SidebarUserProfile } from "@/components/SidebarUserProfile";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function ProcurementPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = () => {
    setRequests(getStoredRequests());
    setSuppliers(getStoredSuppliers());
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Compute live badge counts
  const sourcingQueueCount =
    requests.filter((r) => r.status === "SOURCING" || r.status === "SUBMITTED").length || 3;

  const supplierCount = suppliers.length || 5;

  const ordersReadyCount =
    requests.filter((r) => r.status === "PAYMENT_CONFIRMED").length || 1;

  const inTransitCount =
    requests.filter((r) => r.status === "IN_TRANSIT" || r.status === "SUPPLIER_DISPATCHED").length || 5;

  const exceptionsCount =
    requests.filter((r) => r.status === "SOURCING_EXCEPTION").length || 2;

  const getPageTitle = () => {
    if (pathname === "/procurement") return "Dashboard";
    if (pathname === "/procurement/queue") return "Sourcing Queue";
    if (pathname === "/procurement/suppliers") return "Supplier Directory";
    if (pathname === "/procurement/orders") return "Place Supplier POs";
    if (pathname === "/procurement/tracking") return "Progress Tracking";
    if (pathname === "/procurement/exceptions") return "Sourcing Exceptions";
    return "Procurement Portal";
  };

  const navGroups: NavGroup[] = [
    {
      group: "SOURCING DESK",
      items: [
        { label: "Dashboard", href: "/procurement", icon: LayoutDashboard },
        {
          label: "Sourcing Queue",
          href: "/procurement/queue",
          icon: Compass,
          badge: sourcingQueueCount,
          badgeColor: "bg-[#f59e0b]",
        },
        {
          label: "Supplier Directory",
          href: "/procurement/suppliers",
          icon: Building2,
          badge: supplierCount,
          badgeColor: "bg-slate-700",
        },
        {
          label: "Place Supplier POs",
          href: "/procurement/orders",
          icon: CheckSquare,
          badge: ordersReadyCount,
          badgeColor: "bg-[#10b981]",
        },
        {
          label: "Progress Tracking",
          href: "/procurement/tracking",
          icon: Truck,
          badge: inTransitCount,
          badgeColor: "bg-[#3b82f6]",
        },
        {
          label: "Sourcing Exceptions",
          href: "/procurement/exceptions",
          icon: AlertTriangle,
          badge: exceptionsCount,
          badgeColor: "bg-[#ed2025]",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-row font-sans text-slate-900 antialiased selection:bg-[#ed2025] selection:text-white">
      {/* ================= LEFT SIDEBAR (DARK NAVY / RED ACCENT) ================= */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-[#0f172a] text-slate-300 flex-shrink-0 flex flex-col justify-between transition-all duration-300 border-r border-slate-800/90 z-30 sticky top-0 h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <Link
              href="/procurement"
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#ed2025] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-950/50">
                <Box className="w-5 h-5 stroke-[2.5]" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-lg font-black tracking-tight text-white flex items-center gap-0.5 leading-none">
                    <span>PROCUR</span>
                    <span className="text-[#ed2025]">ly</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 leading-tight">
                    PROCUREMENT SOURCING DESK
                  </div>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition flex-shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "→" : "‹"}
            </button>
          </div>

          {/* Top Call-to-Action Button: OPEN SOURCING QUEUE */}
          <div className="p-3">
            <Link
              href="/procurement/queue"
              className={`w-full py-3 px-3 rounded-2xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-950/40 transition ${
                sidebarCollapsed ? "px-0 text-center" : ""
              }`}
            >
              <Compass className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
              {!sidebarCollapsed && <span>OPEN SOURCING QUEUE</span>}
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="px-3 py-1 space-y-4 flex-1">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1.5">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-1.5">
                    {grp.group}
                  </div>
                )}
                <div className="space-y-1">
                  {grp.items.map((nav) => {
                    const Icon = nav.icon;
                    const isActive = pathname === nav.href;

                    return (
                      <Link
                        key={nav.label}
                        href={nav.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${
                          sidebarCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-slate-800/90 text-white font-bold shadow-xs border-l-4 border-[#ed2025] pl-3"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/40 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 transition flex-shrink-0 ${
                              isActive ? "text-[#ed2025]" : "text-slate-400"
                            }`}
                          />
                          {!sidebarCollapsed && (
                            <span className="truncate">{nav.label}</span>
                          )}
                        </div>

                        {!sidebarCollapsed && nav.badge !== undefined && (
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0 ${
                              nav.badgeColor || "bg-slate-700"
                            }`}
                          >
                            {nav.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Profile Section with Role Switcher */}
        <SidebarUserProfile
          currentPortal="procurement"
          sidebarCollapsed={sidebarCollapsed}
        />
      </aside>

      {/* ================= RIGHT MAIN LAYOUT ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 min-h-[64px] py-2.5 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-0.5 leading-none">
              <Link
                href="/"
                className="hover:text-slate-900 transition flex items-center gap-1 text-slate-500"
              >
                <span>Home</span>
              </Link>
              <span className="text-slate-400">/</span>
              <Link
                href="/procurement"
                className="hover:text-slate-900 transition text-slate-600 font-medium"
              >
                Procurement
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-[#ed2025] font-bold truncate">
                {getPageTitle()}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Search, Portal Switcher, Direct Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Global Search Bar */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center justify-between w-52 sm:w-64 lg:w-72 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate font-normal">
                  Search requests, suppliers...
                </span>
              </div>
              <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-400 border border-slate-200 shadow-2xs ml-2">
                ⌘K
              </kbd>
            </button>

            {/* Portal Switcher */}
            <PortalNavSwitcher currentPortal="procurement" variant="light" />

            <Link
              href="/procurement/queue"
              className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Quote</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}
