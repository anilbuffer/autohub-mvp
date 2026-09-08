"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Bell,
  FileText,
  Clock,
  BarChart3,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  Compass,
  Truck,
  Banknote,
  Building2,
  Home,
  CheckCircle2,
  X,
  LucideIcon,
  MessageSquare,
  PackageCheck,
  BadgePercent,
  Layers,
  Mail,
  Scale,
  Database,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredCustomers,
  getStoredStaffUsers,
  getStoredNotificationTemplates,
  getAllSystemAuditLogs,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  TradeCustomer,
  StaffUser,
  NotificationTemplate,
  AuditLogEntry,
} from "@/lib/types";
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

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = () => {
    setRequests(getStoredRequests());
    setCustomers(getStoredCustomers());
    setStaffUsers(getStoredStaffUsers());
    setTemplates(getStoredNotificationTemplates());
    setAuditLogs(getAllSystemAuditLogs());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
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
        setNotifDropdownOpen(false);
        setActionDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute live badges
  const pendingApprovalsCount = customers.filter(
    (c) => c.billingDetails.status === "PENDING_APPROVAL"
  ).length;

  const pendingPaymentsCount = requests.filter(
    (r) => r.status === "AWAITING_PAYMENT"
  ).length;

  const activeStaffCount = staffUsers.filter((u) => u.status === "ACTIVE").length;
  const activeTemplatesCount = templates.filter((t) => t.isActive).length;

  // Derive dynamic page title
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/staff") return "Staff Management";
    if (pathname === "/admin/customers") return "Customer Approvals";
    if (pathname === "/admin/settings") return "System Configuration";
    if (pathname === "/admin/notifications") return "Notification Templates";
    if (pathname === "/admin/email") return "Email Configuration (Microsoft 365)";
    if (pathname === "/admin/legal") return "Legal & Policies";
    if (pathname === "/admin/audit") return "Audit Log";
    if (pathname === "/admin/reports") return "Reports & Analytics";
    if (pathname === "/admin/reference-data") return "Reference Data";
    if (pathname === "/admin/requests") return "Parts Request Management";
    if (pathname === "/admin/supplier-quotes") return "Supplier Quote Management";
    if (pathname === "/admin/customer-quotes") return "Customer Quote Management";
    if (pathname === "/admin/freight") return "Freight Management";
    if (pathname === "/admin/procurement") return "Procurement Workflow";
    if (pathname === "/admin/shipments") return "Shipment Tracking";
    if (pathname === "/admin/payments") return "Payment & Trade Credit Management";
    return "Administrator Portal";
  };

  const navGroups: NavGroup[] = [
    {
      group: "ADMINISTRATOR",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          label: "Staff Management",
          href: "/admin/staff",
          icon: Users,
          badge: activeStaffCount > 0 ? activeStaffCount : undefined,
          badgeColor: "bg-slate-700",
        },
        {
          label: "Customer Approvals",
          href: "/admin/customers",
          icon: ShieldCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-rose-600",
        },
        {
          label: "System Configuration",
          href: "/admin/settings",
          icon: Settings,
        },
        {
          label: "Notification Templates",
          href: "/admin/notifications",
          icon: Bell,
          badge: activeTemplatesCount,
          badgeColor: "bg-slate-700",
        },
        {
          label: "Email Configuration",
          href: "/admin/email",
          icon: Mail,
        },
        {
          label: "Legal & Policies",
          href: "/admin/legal",
          icon: Scale,
        },
        {
          label: "Audit Log",
          href: "/admin/audit",
          icon: Clock,
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
        },
        {
          label: "Reference Data",
          href: "/admin/reference-data",
          icon: Database,
        },
      ],
    },
  ];

  // Search filtering
  const searchResults = searchQuery.trim()
    ? [
      ...requests
        .filter(
          (r) =>
            r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((r) => ({
          type: "Part Request",
          title: `${r.referenceNumber} • ${r.part.partName}`,
          subtitle: `${r.customerName} • ${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} (${r.status})`,
          link: `/admin/requests`,
        })),
      ...staffUsers
        .filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.department.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((u) => ({
          type: "Staff User",
          title: u.name,
          subtitle: `${u.department} • ${u.email}`,
          link: "/admin/staff",
        })),
      ...customers
        .filter(
          (c) =>
            c.tradingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.nzbn.includes(searchQuery) ||
            c.businessType.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((c) => ({
          type: "Customer Account",
          title: c.tradingName || c.legalBusinessName,
          subtitle: `NZBN: ${c.nzbn} • Credit Status: ${c.billingDetails.status}`,
          link: "/admin/customers",
        })),
    ]
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-row font-sans text-slate-900 antialiased selection:bg-[#ed2025] selection:text-white">
      {/* ================= LEFT SIDEBAR (DARK NAVY) ================= */}
      <aside
        className={`bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 z-30 sticky top-0 h-screen ${sidebarCollapsed ? "w-20" : "w-64"
          }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/60">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
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
                    ADMINISTRATION PORTAL
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

          {/* Navigation Items by Group */}
          <div className="px-3 py-2 space-y-5 flex-1">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {grp.group}
                  </div>
                )}
                <div className="space-y-0.5">
                  {grp.items.map((nav) => {
                    const Icon = nav.icon;
                    const isActive = pathname === nav.href;

                    return (
                      <Link
                        key={nav.label}
                        href={nav.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${sidebarCollapsed ? "justify-center" : ""
                          } ${isActive
                            ? "bg-slate-800/90 text-white font-bold shadow-sm border-l-4 border-[#ed2025] pl-2.5"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition flex-shrink-0 ${isActive ? "text-[#ed2025]" : "text-slate-400"
                              }`}
                          />
                          {!sidebarCollapsed && <span className="truncate">{nav.label}</span>}
                        </div>

                        {!sidebarCollapsed && nav.badge !== undefined && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white ${nav.badgeColor || "bg-slate-700"
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
          currentPortal="admin"
          sidebarCollapsed={sidebarCollapsed}
        />
      </aside>

      {/* ================= RIGHT MAIN LAYOUT ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 min-h-[64px] py-2.5 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Breadcrumb & Title */}
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
                href="/admin"
                className="hover:text-slate-900 transition text-slate-600 font-medium"
              >
                Admin
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

          {/* Right: Search, Quick Action, Alerts */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Global Search Bar */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center justify-between w-56 sm:w-72 lg:w-80 px-3.5 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200 text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate font-normal">
                  Search requests, quotes, customers...
                </span>
              </div>
              <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-400 border border-slate-200 shadow-2xs ml-2">
                ⌘K
              </kbd>
            </button>


            {/* Portal Switcher */}
            <PortalNavSwitcher currentPortal="admin" variant="light" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {(pendingApprovalsCount > 0 || pendingPaymentsCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ed2025] text-white text-[9px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                    {pendingApprovalsCount + pendingPaymentsCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-scaleIn text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Operational Alerts</span>
                    <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {pendingApprovalsCount > 0 && (
                      <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-purple-900 font-bold">
                          <span>Trade Account Approvals</span>
                          <span className="text-[10px] font-mono">{pendingApprovalsCount} Pending</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Automotive businesses waiting for trade account approval.
                        </p>
                        <Link
                          href="/admin/customers"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-[11px] font-bold text-purple-700 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <span>Review Accounts →</span>
                        </Link>
                      </div>
                    )}

                    {pendingPaymentsCount > 0 && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-amber-900 font-bold">
                          <span>Payments Pending</span>
                          <span className="text-[10px] font-mono">{pendingPaymentsCount} Orders</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Orders awaiting bank transfer confirmation or credit validation.
                        </p>
                        <Link
                          href="/admin/payments"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-[11px] font-bold text-amber-700 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <span>Go to Payments →</span>
                        </Link>
                      </div>
                    )}

                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span>System Status</span>
                        <span className="text-[10px] font-mono text-emerald-700">Healthy</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Autohub NZ core procurement workflows operating normally.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Admin Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ================= GLOBAL SEARCH MODAL (⌘K) ================= */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search requests, VIN, customers, NZBN, staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent border-none outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div className="text-xs text-slate-400 py-6 text-center space-y-2">
                  <p className="font-semibold text-slate-600">Quick Navigation Shortcuts</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Link
                      href="/admin/requests"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Parts Requests
                    </Link>
                    <Link
                      href="/admin/supplier-quotes"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Supplier Quotes
                    </Link>
                    <Link
                      href="/admin/customer-quotes"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Customer Quotes
                    </Link>
                    <Link
                      href="/admin/procurement"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Procurement POs
                    </Link>
                    <Link
                      href="/admin/payments"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Payments &amp; Remittances
                    </Link>
                    <Link
                      href="/admin/shipments"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Shipments
                    </Link>
                    <Link
                      href="/admin/customers"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Customer Accounts
                    </Link>
                    <Link
                      href="/admin/messaging"
                      onClick={() => setSearchModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      Messaging Desk
                    </Link>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching system entities found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {searchResults.map((res, idx) => (
                    <Link
                      key={idx}
                      href={res.link}
                      onClick={() => setSearchModalOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{res.title}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                            {res.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{res.subtitle}</p>
                      </div>
                      <span className="text-xs font-bold text-[#ed2025]">Open →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
