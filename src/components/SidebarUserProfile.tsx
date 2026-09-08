"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Check,
  Settings,
  Home,
  LogOut,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import { PORTALS, PortalOption } from "@/components/PortalNavSwitcher";
import { setActiveRole, setActiveStaffMember } from "@/lib/store";

export interface PortalProfileInfo {
  avatarInitials: string;
  avatarBg: string;
  name: string;
  title: string;
  org: string;
  detail: string;
  badge: string;
  settingsLink?: {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

const PORTAL_PROFILES: Record<string, PortalProfileInfo> = {
  admin: {
    avatarInitials: "AH",
    avatarBg: "bg-red-600 text-white shadow-sm",
    name: "Autohub Admin",
    title: "Operations Desk",
    org: "Autohub Head Office",
    detail: "admin@autohub.co.nz",
    badge: "ADMINISTRATOR",
    settingsLink: {
      label: "System Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  },
  customer: {
    avatarInitials: "JW",
    avatarBg: "bg-blue-600 text-white shadow-sm",
    name: "James Wilson",
    title: "Service Manager",
    org: "AutoCare Auckland",
    detail: "NZBN: 9429041234567",
    badge: "TRADE CUSTOMER",
    settingsLink: {
      label: "Account Settings & Users",
      href: "/portal/settings",
      icon: Settings,
    },
  },
  procurement: {
    avatarInitials: "NC",
    avatarBg: "bg-amber-600 text-white shadow-sm",
    name: "Nathan Cole",
    title: "Sourcing Specialist",
    org: "Tokyo & Nagoya Desk",
    detail: "nathan.cole@autohub.co.nz",
    badge: "SOURCING DESK",
    settingsLink: {
      label: "Supplier Directory",
      href: "/procurement/suppliers",
      icon: Users,
    },
  },
  operations: {
    avatarInitials: "LP",
    avatarBg: "bg-cyan-600 text-white shadow-sm",
    name: "Liam Patel",
    title: "Logistics Lead",
    org: "Auckland Port & Depot",
    detail: "liam.patel@autohub.co.nz",
    badge: "LOGISTICS DESK",
    settingsLink: {
      label: "Live Tracking & Fleet",
      href: "/operations/shipments",
    },
  },
  finance: {
    avatarInitials: "CJ",
    avatarBg: "bg-emerald-600 text-white shadow-sm",
    name: "Clara Jenkins",
    title: "Finance Officer",
    org: "Autohub Treasury & Accounts",
    detail: "clara.jenkins@autohub.co.nz",
    badge: "FINANCE DESK",
    settingsLink: {
      label: "Ledger & Invoices",
      href: "/finance/invoices",
    },
  },
};

export interface SidebarUserProfileProps {
  currentPortal: "admin" | "customer" | "procurement" | "operations" | "finance";
  sidebarCollapsed?: boolean;
  customProfile?: Partial<PortalProfileInfo>;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  currentPortal,
  sidebarCollapsed = false,
  customProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const baseProfile = PORTAL_PROFILES[currentPortal] || PORTAL_PROFILES.admin;
  const profile: PortalProfileInfo = {
    ...baseProfile,
    ...customProfile,
    settingsLink: customProfile?.settingsLink ?? baseProfile.settingsLink,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSwitchPortal = (portal: PortalOption) => {
    setActiveRole(portal.role);
    if (portal.staffId) {
      setActiveStaffMember(portal.staffId);
    }
    setIsOpen(false);
    router.push(portal.href);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    setActiveRole("CUSTOMER");
    router.push("/login");
  };

  return (
    <div className="p-3 pb-5 sm:p-4 sm:pb-6 border-t border-slate-800/80 relative" ref={menuRef}>
      {/* Bottom Profile Card Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800/60 cursor-pointer transition text-left group focus:outline-none focus:ring-1 focus:ring-slate-700"
        title={sidebarCollapsed ? `${profile.name} (${profile.title})` : undefined}
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 transition-transform group-hover:scale-105 ${profile.avatarBg}`}
          >
            {profile.avatarInitials}
          </div>

          {!sidebarCollapsed && (
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {profile.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {profile.title}
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ml-1 ${
              isOpen ? "rotate-180 text-white" : "group-hover:text-slate-300"
            }`}
          />
        )}
      </button>

      {/* Profile Popover Menu with Role Switcher */}
      {isOpen && (
        <div
          role="menu"
          className={`absolute ${
            sidebarCollapsed
              ? "left-[calc(100%+0.75rem)] bottom-0"
              : "bottom-[calc(100%+0.75rem)] left-2 sm:left-3"
          } w-80 max-w-[calc(100vw-2rem)] bg-[#0b1324] border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-black/95 space-y-2.5 text-xs text-slate-300 z-50 animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-white/10`}
        >
          {/* Top User Info Card */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm ${profile.avatarBg}`}
              >
                {profile.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-bold text-white text-xs truncate leading-tight">
                    {profile.name}
                  </span>
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700/90 text-slate-200 border border-slate-600/70 whitespace-nowrap flex-shrink-0">
                    {profile.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {profile.detail}
                </div>
              </div>
            </div>
          </div>

          {/* Portal Contextual Link (Settings, etc.) */}
          {profile.settingsLink && (
            <Link
              href={profile.settingsLink.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 transition text-xs font-medium"
            >
              {profile.settingsLink.icon ? (
                <profile.settingsLink.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              ) : (
                <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span className="truncate">{profile.settingsLink.label}</span>
            </Link>
          )}

          {/* ================= SWITCH ROLE OF ALL PORTALS ================= */}
          <div className="border-t border-slate-800 pt-2.5">
            <div className="px-1.5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Layers className="w-3.5 h-3.5 text-[#ed2025]" />
                <span>Switch Portal Role</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/80">
                5 Portals
              </span>
            </div>

            <div className="space-y-1">
              {PORTALS.map((portal) => {
                const isCurrent = portal.id === currentPortal;
                const Icon = portal.icon;

                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => handleSwitchPortal(portal)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition group ${
                      isCurrent
                        ? "bg-slate-800 text-white font-semibold border border-slate-700/90 shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                          isCurrent
                            ? "bg-[#ed2025] text-white shadow-sm shadow-red-600/30"
                            : `${portal.color} border`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs leading-tight font-medium truncate">
                          <span className={isCurrent ? "font-bold text-white" : ""}>
                            {portal.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                          {portal.badge}
                        </div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex-shrink-0 ml-1.5">
                        <Check className="w-2.5 h-2.5" />
                        Active
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= FOOTER ACTIONS ================= */}
          <div className="border-t border-slate-800 pt-2 space-y-0.5">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 transition text-xs font-medium"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Website</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarUserProfile;
