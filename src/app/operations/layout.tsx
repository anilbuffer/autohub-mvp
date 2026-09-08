"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Truck,
  Plane,
  Anchor,
  Box,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  LogOut,
  User,
  ExternalLink,
  ChevronDown,
  Navigation,
  Layers,
  Activity,
  ArrowRightLeft,
  Plus,
  Search,
  HelpCircle,
  Home,
  Settings,
  LucideIcon,
  Compass,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { getStoredRequests, subscribeToStore, setActiveRole } from "@/lib/store";
import { PartRequest } from "@/lib/types";
import { PortalNavSwitcher } from "@/components/PortalNavSwitcher";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeColor?: string;
  isModal?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setUserMenuOpen(false);
        setHelpModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live badge counts
  const inTransitCount = requests.filter(
    (r) =>
      r.status === "SUPPLIER_DISPATCHED" ||
      r.status === "RECEIVED_AT_SHIPPING_FACILITY" ||
      r.status === "IN_TRANSIT" ||
      r.status === "ARRIVED_IN_NZ" ||
      r.status === "CUSTOMS_CLEARANCE" ||
      r.status === "OUT_FOR_DELIVERY"
  ).length;

  const customsHoldsCount = requests.filter(
    (r) => r.status === "CUSTOMS_CLEARANCE" || r.status === "SOURCING_EXCEPTION"
  ).length || 2;

  const handleLogout = () => {
    setActiveRole("CUSTOMER");
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname === "/operations") return "Dashboard";
    if (pathname === "/operations/freight") return "Freight Options";
    if (pathname === "/operations/shipments") return "Shipments";
    if (pathname === "/operations/tracking") return "Tracking";
    if (pathname === "/operations/delivery") return "Delivery Confirmation";
    if (pathname === "/operations/exceptions") return "Exceptions";
    return "Operations Portal";
  };

  const navGroups: NavGroup[] = [
    {
      group: "OPERATIONS (LOGISTICS)",
      items: [
        { label: "Dashboard", href: "/operations", icon: LayoutDashboard },
        { label: "Freight Options", href: "/operations/freight", icon: Anchor },
        {
          label: "Shipments",
          href: "/operations/shipments",
          icon: Truck,
          badge: inTransitCount > 0 ? inTransitCount : undefined,
          badgeColor: "bg-[#ed2025]",
        },
        {
          label: "Tracking",
          href: "/operations/tracking",
          icon: Compass,
        },
        {
          label: "Delivery Confirmation",
          href: "/operations/delivery",
          icon: FileCheck,
        },
        {
          label: "Exceptions",
          href: "/operations/exceptions",
          icon: AlertTriangle,
          badge: customsHoldsCount > 0 ? `${customsHoldsCount} Holds` : undefined,
          badgeColor: "bg-rose-600",
        },
      ],
    },
  ];

  // Search filtering
  const searchResults = searchQuery.trim()
    ? requests.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.shipment?.trackingNumber && r.shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-row font-sans text-slate-900 antialiased selection:bg-[#ed2025] selection:text-white">
      {/* ================= LEFT SIDEBAR (DARK NAVY - SYMMETRIC WITH CUSTOMER PORTAL) ================= */}
      <aside
        className={`bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 z-30 sticky top-0 h-screen ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/60">
            <Link href="/operations" className="flex items-center gap-2.5 overflow-hidden">
              {/* 3D Box Logo */}
              <div className="w-8 h-8 rounded-xl bg-[#ed2025] shadow-md shadow-red-600/30 flex items-center justify-center text-white flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-white"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-base font-black tracking-tight text-white leading-none">
                    PROCUR<span className="text-[#ed2025]">ly</span>
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                    OPERATIONS PORTAL
                  </div>
                </div>
              )}
            </Link>

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "→" : "‹"}
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="p-3 sm:p-4">
            <Link
              id="sidebar-dispatch-cargo-button"
              href="/operations/shipments"
              className={`w-full py-3 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center justify-center gap-2 ${
                sidebarCollapsed ? "px-2" : "px-4"
              }`}
            >
              <Truck className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
              {!sidebarCollapsed && <span>DISPATCH CONSIGNMENT</span>}
            </Link>
          </div>

          {/* Navigation Items by Group */}
          <div className="px-3 py-2 space-y-6 flex-1">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {grp.group}
                  </div>
                )}
                <div className="space-y-0.5">
                  {grp.items.map((nav) => {
                    const Icon = nav.icon;
                    const isActive = pathname === nav.href;

                    if (nav.isModal) {
                      return (
                        <button
                          key={nav.label}
                          type="button"
                          onClick={() => setHelpModalOpen(true)}
                          className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            sidebarCollapsed ? "justify-center" : ""
                          } text-slate-400 hover:text-white hover:bg-slate-800/60`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-slate-400" />
                            {!sidebarCollapsed && <span>{nav.label}</span>}
                          </div>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={nav.label}
                        href={nav.href}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          sidebarCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-slate-800/90 text-white font-bold shadow-sm border-l-4 border-[#ed2025] pl-2.5"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition ${
                              isActive ? "text-[#ed2025]" : "text-slate-400"
                            }`}
                          />
                          {!sidebarCollapsed && <span>{nav.label}</span>}
                        </div>

                        {!sidebarCollapsed && nav.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
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

        {/* Bottom User Profile Section */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 relative">
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800/60 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Avatar LP */}
              <div className="w-8 h-8 rounded-full bg-[#ed2025] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                LP
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    Liam Patel
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Logistics &amp; Customs Lead
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </div>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 text-xs text-slate-300 z-50 animate-scaleIn">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px]">
                <div className="font-bold text-white">Liam Patel</div>
                <div className="text-slate-400 font-mono text-[10px]">Autohub Freight &amp; Customs Desk</div>
              </div>

              <Link
                href="/admin"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#ed2025]" />
                <span>Admin Portal</span>
              </Link>

              <Link
                href="/portal"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer Portal</span>
              </Link>

              <div className="border-t border-slate-800/80 pt-1 mt-1">
                <Link
                  href="/"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 transition"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Website</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= RIGHT MAIN LAYOUT ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 min-h-[64px] py-2.5 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left Title & Breadcrumbs */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-0.5 leading-none">
              <Link
                href="/"
                className="hover:text-slate-900 transition flex items-center gap-1 text-slate-500"
                title="Return to Public Website"
              >
                <span>Home</span>
              </Link>
              <span className="text-slate-400">/</span>
              <Link
                href="/operations"
                className="hover:text-slate-900 transition text-slate-600 font-medium"
              >
                Operations Portal
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-[#ed2025] font-semibold truncate">
                {getPageTitle()}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Search Button */}
            <div className="flex-1 max-w-md hidden md:block">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="w-full py-2 pl-3.5 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-left text-xs text-slate-500 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  <span>Search shipments, airway bills, parts...</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-400 shadow-sm border border-slate-200">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Portal Switcher */}
            <PortalNavSwitcher currentPortal="operations" variant="light" />

            {/* Primary Action Button */}
            <Link
              href="/operations/shipments"
              className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
            >
              <Truck className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Dispatch Cargo</span>
            </Link>

            {/* Help Question Icon */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1 text-xs font-semibold"
              title="Help &amp; Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search shipments, airway bills, parts or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs hover:bg-slate-200"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {searchQuery ? "No matching consignments found" : "Type a tracking number, vehicle make or part..."}
                </div>
              ) : (
                searchResults.map((r) => (
                  <Link
                    key={r.id}
                    href="/operations/shipments"
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{r.referenceNumber}</span>
                      <span className="text-slate-500 mx-2">•</span>
                      <span className="text-slate-700">{r.part.partName}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Operations &amp; Logistics Desk Guide</h3>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Logistics Desk Console:</strong> Monitor multi-stage container consignments, trans-Pacific air freight, and customs clearance manifests across Nagoya, Narita, Frankfurt and Auckland.
              </p>
              <p>
                <strong>Shipment Milestones:</strong> Real-time stage advancements update the Customer Portal and IRD invoicing instantly without page reload.
              </p>
              <p>
                <strong>Customs Clearance:</strong> Clear biosecurity flags (MPI) and lodging import tariff duty statements with New Zealand Customs Service.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
