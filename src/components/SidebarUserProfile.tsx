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
    org: "Autohub Admin Console",
    detail: "Unified Operations & Governance",
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
    title: "Customer",
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
    avatarBg: "bg-[#ed2025]/20 text-[#ed2025] shadow-sm ring-1 ring-[#ed2025]/30",
    name: "Nathan Cole",
    title: "Nagoya / Tokyo Desk",
    org: "Nathan Cole",
    detail: "nathan.cole@autohub.co.nz",
    badge: "SOURCING SPECIALIST",
    settingsLink: {
      label: "Supplier Directory",
      href: "/procurement/suppliers",
      icon: Users,
    },
  },
  operations: {
    avatarInitials: "LP",
    avatarBg: "bg-[#ed2025] text-white shadow-sm",
    name: "Liam Patel",
    title: "Logistics & Customs Lead",
    org: "Liam Patel",
    detail: "Autohub Freight & Customs Desk",
    badge: "OPERATIONS LEAD",
    settingsLink: {
      label: "Live Tracking & Fleet",
      href: "/operations",
    },
  },
  finance: {
    avatarInitials: "CJ",
    avatarBg: "bg-[#ed2025] text-white shadow-sm",
    name: "Clara Jenkins",
    title: "Finance Officer",
    org: "Clara Jenkins",
    detail: "Autohub Treasury & Accounts Desk",
    badge: "FINANCE DESK",
    settingsLink: {
      label: "Billing & Treasury Desk",
      href: "/finance",
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
          className="absolute bottom-20 left-2 sm:left-3 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl shadow-black/80 space-y-2 text-xs text-slate-300 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Top User Info Card */}
          <div className="px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/50">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate leading-tight">
                  {profile.org}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                  {profile.detail}
                </div>
              </div>
              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 border border-slate-600/60 whitespace-nowrap">
                {profile.badge}
              </span>
            </div>
          </div>

          {/* Portal Contextual Link (Settings, etc.) */}
          {profile.settingsLink && (
            <Link
              href={profile.settingsLink.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 transition"
            >
              {profile.settingsLink.icon ? (
                <profile.settingsLink.icon className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Settings className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="truncate">{profile.settingsLink.label}</span>
            </Link>
          )}

          {/* ================= SWITCH ROLE OF ALL PORTALS ================= */}
          <div className="border-t border-slate-800/90 pt-2">
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Layers className="w-3 h-3 text-[#ed2025]" />
                <span>Switch Portal Role</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/80">
                5 Portals
              </span>
            </div>

            <div className="space-y-0.5 mt-0.5">
              {PORTALS.map((portal) => {
                const isCurrent = portal.id === currentPortal;
                const Icon = portal.icon;

                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => handleSwitchPortal(portal)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition group ${
                      isCurrent
                        ? "bg-slate-800 text-white font-bold border border-slate-700/90 shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                          isCurrent
                            ? "bg-[#ed2025] text-white shadow-sm shadow-red-600/30"
                            : `${portal.color} border`
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs leading-tight font-medium truncate flex items-center gap-1.5">
                          <span className={isCurrent ? "font-bold text-white" : ""}>
                            {portal.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight truncate">
                          {portal.badge}
                        </div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                        <Check className="w-2.5 h-2.5" />
                        Active
                      </span>
                    ) : (
                      <ArrowRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= FOOTER ACTIONS ================= */}
          <div className="border-t border-slate-800/90 pt-1.5 mt-1 space-y-0.5">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 transition"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Website</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition font-medium"
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
