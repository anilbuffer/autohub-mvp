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
  Clock,
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
  ArrowRightLeft
} from "lucide-react";
import { getStoredRequests, subscribeToStore, setActiveRole } from "@/lib/store";
import { PartRequest } from "@/lib/types";
import { PortalNavSwitcher } from "@/components/PortalNavSwitcher";

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [transitCount, setTransitCount] = useState<number>(0);
  const [customsCount, setCustomsCount] = useState<number>(0);

  const refresh = () => {
    const data = getStoredRequests();
    setRequests(data);
    const inTransit = data.filter(
      (r) =>
        r.status === "SUPPLIER_DISPATCHED" ||
        r.status === "IN_TRANSIT" ||
        r.status === "CUSTOMS_CLEARANCE" ||
        r.timeline?.some((t) => t.status.toLowerCase().includes("transit"))
    ).length;
    setTransitCount(Math.max(inTransit, 4));
    setCustomsCount(2);
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleLogout = () => {
    setActiveRole("CUSTOMER");
    router.push("/login");
  };

  const navItems = [
    {
      name: "Logistics Console",
      href: "/operations",
      icon: Activity,
      badge: null,
    },
    {
      name: "Shipment Milestones",
      href: "/operations/shipments",
      icon: Truck,
      badge: transitCount > 0 ? `${transitCount} Active` : null,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      name: "Freight & Landed Cost",
      href: "/operations/freight",
      icon: Anchor,
      badge: null,
    },
    {
      name: "Customs & Exceptions",
      href: "/operations/exceptions",
      icon: AlertTriangle,
      badge: "2 Holds",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col antialiased">
      {/* Top Bar for Operations Portal */}
      <header className="h-16 border-b border-cyan-900/30 bg-[#0a1322]/95 backdrop-blur sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/operations" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base">AUTOHUB</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Operations
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Global Freight & Logistics Command Center
              </p>
            </div>
          </Link>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 ml-6 pl-6 border-l border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Air Cargo: <strong className="text-white">99.2% on-time</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>Auckland Port Hub: <strong className="text-emerald-400">Operational</strong></span>
          </div>
        </div>

        {/* Right tools and User Profile */}
        <div className="flex items-center gap-3">
          {/* Portal Switcher */}
          <PortalNavSwitcher currentPortal="OPERATIONS" />

          {/* Logistics User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">Liam Patel</div>
              <div className="text-[10px] text-cyan-400 font-medium">Logistics & Customs Lead</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-inner">
              LP
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-[#08101e]/80 border-r border-cyan-900/20 p-4 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Freight Navigation
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/operations"
                      ? pathname === "/operations"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-cyan-400" : "text-slate-500"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Live Logistics Routing Hubs */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5 text-cyan-400" />
                  Hub Routing
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>NRT (Tokyo) → AKL</span>
                  <span className="text-white font-mono">14h Transit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>FRA (Frankfurt) → AKL</span>
                  <span className="text-white font-mono">32h Air Express</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>LAX (Los Angeles) → AKL</span>
                  <span className="text-white font-mono">18h Transit</span>
                </div>
              </div>
            </div>

            {/* Quick Link to Customer & Admin Portals */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs">
              <div className="text-cyan-300 font-semibold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Customs & Biosecurity
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                NZ Customs & MPI import documentation automated under clearance code #9802.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Autohub Ops v1.4</span>
            <span className="font-mono text-cyan-500/80">AKL-AIR-01</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
