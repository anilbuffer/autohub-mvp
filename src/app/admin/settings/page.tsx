"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  Percent,
  Plane,
  Anchor,
  Sliders,
  Building,
  Check,
} from "lucide-react";
import {
  getStoredSettings,
  saveSettings,
  subscribeToStore,
} from "@/lib/store";
import { SystemSettings } from "@/lib/types";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());

    const unsub = subscribeToStore(() => {
      setSettings(getStoredSettings());
    });
    return unsub;
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              System Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Procurement &amp; Freight System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage target margin thresholds, baseline freight options, GST tax rates, reference formats, and NZ Trust settlement details.
          </p>
        </div>
      </div>

      {/* Symmetrical 3-Stat KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Target Margin Threshold
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono flex items-center gap-1">
            <span>{settings.defaultMarginPercent}%</span>
            <Percent className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Standard customer quote landed markup
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-blue-600" />
            Air Express Freight Base
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${settings.airFreightBaseRateNzd}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">NZD</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Express 3-5 business days delivery
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-cyan-600" />
            Ocean Sea Freight Base
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${settings.seaFreightBaseRateNzd}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">NZD</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Consolidated container ocean transit
          </span>
        </div>
      </div>

      {/* System Baseline Configuration Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {savedSettings && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              System configuration parameters successfully updated and active for all quote calculations.
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#ed2025] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Baseline Procurement &amp; Calculation Parameters
                </h3>
                <p className="text-[11px] text-slate-500">
                  Governs customer quote calculations, pricing rules, and logistics presets
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

          {/* Symmetrical 3-Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Default Target Margin (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.defaultMarginPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultMarginPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard baseline margin on imported supplier cost
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Air Express Freight Base Rate ($NZD)
              </label>
              <input
                type="number"
                value={settings.airFreightBaseRateNzd}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    airFreightBaseRateNzd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Priority Air NZ / Cathay 3-5 business day transit
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Ocean Sea Freight Base Rate ($NZD)
              </label>
              <input
                type="number"
                value={settings.seaFreightBaseRateNzd}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seaFreightBaseRateNzd: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Consolidated container ocean transit (18-24 business days)
              </span>
            </div>
          </div>

          {/* Symmetrical 2-Input Grid: Tax & Reference Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                New Zealand GST Statutory Tax Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={settings.gstRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gstRate: parseFloat(e.target.value) || 0.15,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  {(settings.gstRate * 100).toFixed(0)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Inland Revenue Department (IRD) requirement (0.15 = 15%)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Request Reference Number Format Prefix
              </label>
              <input
                type="text"
                value={settings.requestRefPrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    requestRefPrefix: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                Generates sequential reference numbers: {settings.requestRefPrefix}000142
              </span>
            </div>
          </div>

          {/* NZ Trust Bank Account Details for Tax Invoices */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Autohub Procurement Trust Bank Account (Appears on Official NZ Tax Invoices)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bank Name</span>
                <input
                  type="text"
                  value={settings.bankAccountDetails.bankName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankAccountDetails: {
                        ...settings.bankAccountDetails,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 font-medium bg-white text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Name</span>
                <input
                  type="text"
                  value={settings.bankAccountDetails.accountName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankAccountDetails: {
                        ...settings.bankAccountDetails,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 font-medium bg-white text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Number</span>
                <input
                  type="text"
                  value={settings.bankAccountDetails.accountNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankAccountDetails: {
                        ...settings.bankAccountDetails,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold bg-white text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SWIFT / BIC</span>
                <input
                  type="text"
                  value={settings.bankAccountDetails.swiftBic}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankAccountDetails: {
                        ...settings.bankAccountDetails,
                        swiftBic: e.target.value,
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold bg-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
