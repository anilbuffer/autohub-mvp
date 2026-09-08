"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DollarSign,
  CreditCard,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  LogOut,
  Landmark,
  Receipt,
  Scale,
  Activity,
  ArrowRightLeft,
  Briefcase
} from "lucide-react";
import { getStoredRequests, subscribeToStore, setActiveRole } from "@/lib/store";
import { PartRequest } from "@/lib/types";
import { PortalNavSwitcher } from "@/components/PortalNavSwitcher";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [unreconciledCount, setUnreconciledCount] = useState<number>(3);

  useEffect(() => {
    setRequests(getStoredRequests());
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);

  const handleLogout = () => {
    setActiveRole("CUSTOMER");
    router.push("/login");
  };

  const navItems = [
    {
      name: "Treasury Console",
      href: "/finance",
      icon: Landmark,
      badge: null,
    },
    {
      name: "Remittance Matching",
      href: "/finance/payments",
      icon: CheckCircle2,
      badge: unreconciledCount > 0 ? `${unreconciledCount} Pending` : null,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      name: "Tax Invoices (IRD)",
      href: "/finance/invoices",
      icon: Receipt,
      badge: null,
    },
    {
      name: "Trade Credit Accounts",
      href: "/finance/credit",
      icon: Building,
      badge: "Net 20th",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      name: "Transaction Ledger",
      href: "/finance/transactions",
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#06110f] text-slate-100 flex flex-col antialiased">
      {/* Top Bar for Finance Portal */}
      <header className="h-16 border-b border-emerald-900/30 bg-[#081815]/95 backdrop-blur sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base">AUTOHUB</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Finance
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Treasury, Trade Credit & Remittance Clearing
              </p>
            </div>
          </Link>

          {/* Bank Sync Status */}
          <div className="hidden lg:flex items-center gap-3 ml-6 pl-6 border-l border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ANZ NZ Clearing: <strong className="text-white">Connected</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>IRD GST: <strong className="text-emerald-400">134-582-901</strong></span>
          </div>
        </div>

        {/* Right tools and User Profile */}
        <div className="flex items-center gap-3">
          {/* Portal Switcher */}
          <PortalNavSwitcher currentPortal="FINANCE" />

          {/* Finance Officer Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">Clara Jenkins</div>
              <div className="text-[10px] text-emerald-400 font-medium">Finance Officer</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shadow-inner">
              CJ
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
        <aside className="w-64 bg-[#071512]/80 border-r border-emerald-900/20 p-4 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Treasury Navigation
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/finance"
                      ? pathname === "/finance"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-emerald-400" : "text-slate-500"
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

            {/* Live Financial Account Health */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-400" />
                  Operating Cashflow
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">ANZ NZD</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Available Liquidity</span>
                  <span className="text-white font-mono font-bold">$184,250 NZD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unmatched Remittance</span>
                  <span className="text-amber-400 font-mono font-bold">$5,420 NZD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trade Credit Drawn</span>
                  <span className="text-cyan-400 font-mono font-bold">$42,800 NZD</span>
                </div>
              </div>
            </div>

            {/* Compliance Tag */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs">
              <div className="text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" />
                NZ IRD Compliance
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All customer invoices automatically include 15% GST and IRD-prescribed seller tax registration.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Autohub Treasury v1.4</span>
            <span className="font-mono text-emerald-500/80">ANZ-01</span>
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
