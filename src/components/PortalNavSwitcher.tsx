"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { setActiveRole, setActiveStaffMember, getActiveRole } from "@/lib/store";
import {
  Shield,
  Building2,
  Compass,
  Truck,
  Banknote,
  Home,
  ChevronDown,
  Check,
  ExternalLink,
  Layers,
} from "lucide-react";

export interface PortalOption {
  id: string;
  role: UserRole;
  staffId?: string;
  label: string;
  badge: string;
  href: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PORTALS: PortalOption[] = [
  {
    id: "admin",
    role: "ADMIN",
    staffId: "STAFF-00",
    label: "Admin Portal",
    badge: "Unified Desk & Governance",
    href: "/admin",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: Shield,
  },
  {
    id: "customer",
    role: "CUSTOMER",
    staffId: "STAFF-04",
    label: "Customer Portal",
    badge: "Trade Dealership & Orders",
    href: "/portal",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Building2,
  },
  {
    id: "procurement",
    role: "PROCUREMENT",
    staffId: "STAFF-01",
    label: "Procurement Portal",
    badge: "Global Sourcing Desk",
    href: "/procurement",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: Compass,
  },
  {
    id: "operations",
    role: "OPERATIONS",
    staffId: "STAFF-02",
    label: "Operations Portal",
    badge: "Freight & Port Logistics",
    href: "/operations",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    icon: Truck,
  },
  {
    id: "finance",
    role: "FINANCE",
    staffId: "STAFF-03",
    label: "Finance Portal",
    badge: "Billing & Treasury Desk",
    href: "/finance",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: Banknote,
  },
];

interface PortalNavSwitcherProps {
  currentPortal?: "admin" | "customer" | "procurement" | "operations" | "finance";
  variant?: "dark" | "light";
}

export const PortalNavSwitcher: React.FC<PortalNavSwitcherProps> = ({
  currentPortal,
  variant = "dark",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto detect current portal if not passed explicitly
  const activePortalId =
    currentPortal ||
    (pathname?.startsWith("/admin")
      ? "admin"
      : pathname?.startsWith("/procurement")
      ? "procurement"
      : pathname?.startsWith("/operations")
      ? "operations"
      : pathname?.startsWith("/finance")
      ? "finance"
      : pathname?.startsWith("/portal")
      ? "customer"
      : "admin");

  const currentConfig =
    PORTALS.find((p) => p.id === activePortalId) || PORTALS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPortal = (portal: PortalOption) => {
    setActiveRole(portal.role);
    if (portal.staffId) {
      setActiveStaffMember(portal.staffId);
    }
    setIsOpen(false);
    router.push(portal.href);
  };

  const isDark = variant === "dark";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
          isDark
            ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80 hover:border-slate-600"
            : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm"
        }`}
        title="Switch between Portals"
      >
        <Layers className="w-3.5 h-3.5 text-red-500" />
        <span className="truncate max-w-[130px] sm:max-w-[160px]">
          {currentConfig.label}
        </span>
        <span
          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border hidden md:inline-block ${currentConfig.color}`}
        >
          Phase 1
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Phase 1 MVP Portals
              </div>
              <div className="text-[10px] text-slate-500">
                Switch role perspective &amp; console
              </div>
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              5 Portals
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {PORTALS.map((portal) => {
              const isCurrent = portal.id === activePortalId;
              const Icon = portal.icon;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => handleSelectPortal(portal)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                    isCurrent
                      ? "bg-slate-900 text-white font-bold shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-red-600 text-white"
                          : `${portal.color} border`
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-tight truncate">
                        {portal.label}
                      </div>
                      <div
                        className={`text-[10px] leading-tight truncate ${
                          isCurrent ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {portal.badge}
                      </div>
                    </div>
                  </div>

                  {isCurrent ? (
                    <Check className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      →
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 mt-1 pt-1.5 px-2 flex items-center justify-between text-[11px] text-slate-500">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-50 transition"
            >
              <Home className="w-3 h-3" />
              <span>Public Site</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-red-600 font-semibold hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition"
            >
              <span>Login Switchboard →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
