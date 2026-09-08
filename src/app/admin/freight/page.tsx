"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plane,
  Anchor,
  Truck,
  Save,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sliders,
  DollarSign,
} from "lucide-react";
import {
  getStoredSettings,
  saveSettings,
  subscribeToStore,
} from "@/lib/store";
import { SystemSettings, FreightMethod } from "@/lib/types";

export default function AdminFreightManagementPage() {
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  // Manual Override Test Calculator
  const [calcWeightKg, setCalcWeightKg] = useState<number>(12);
  const [calcMethod, setCalcMethod] = useState<FreightMethod>("AIR_EXPRESS");
  const [customOverrideRate, setCustomOverrideRate] = useState<number>(0);
  const [overrideActive, setOverrideActive] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>("");

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsub = subscribeToStore(() => {
      setSettings(getStoredSettings());
    });
    return unsub;
  }, []);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Live calculator calculation
  const standardRate =
    calcMethod === "AIR_EXPRESS"
      ? settings.airFreightBaseRateNzd + (calcWeightKg > 5 ? (calcWeightKg - 5) * 12 : 0)
      : settings.seaFreightBaseRateNzd + (calcWeightKg > 20 ? (calcWeightKg - 20) * 2.5 : 0);

  const effectiveFreightRate = overrideActive ? customOverrideRate : standardRate;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Logistics &amp; Routing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Freight &amp; Carrier Rate Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure baseline tariffs, carrier partnerships, transit SLAs, and manual override controls for Air Express and Ocean Sea Freight corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/shipments"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-cyan-600" />
            <span>Track Live Shipments</span>
          </Link>
          <Link
            href="/admin/customer-quotes"
            className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
          >
            <span>Quotation Desk →</span>
          </Link>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Freight baseline rate matrix successfully updated across all active quote engines.</span>
        </div>
      )}

      {/* Two Freight Modes Showcase: Air Express vs Ocean Sea Freight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Air Express Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Air Express Priority Freight
                </h3>
                <span className="text-[11px] text-blue-600 font-bold">
                  Recommended for Urgent VOR &amp; Mechanical Components
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              Active Primary
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Tariff</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ${settings.airFreightBaseRateNzd} <span className="text-xs font-normal text-slate-500">NZD</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit SLA</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                3 - 5 <span className="text-xs font-normal text-slate-500">business days</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Primary Operating Carriers:</span>
              <span className="font-bold text-slate-800">Air New Zealand Cargo, Cathay Pacific, DHL Global</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Origin Gateways:</span>
              <span className="font-bold text-slate-800">Tokyo Narita (NRT), Frankfurt (FRA), Los Angeles (LAX)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">New Zealand Entry:</span>
              <span className="font-bold text-slate-800">Auckland International Airport (MPI Direct)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Volumetric Weight Divisor:</span>
              <span className="font-mono font-bold text-slate-800">5,000 cm³/kg (IATA Standard)</span>
            </div>
          </div>
        </div>

        {/* Ocean Sea Freight Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cyan-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Ocean Sea Freight Consolidated
                </h3>
                <span className="text-[11px] text-cyan-700 font-bold">
                  Recommended for Heavy Castings, Transmissions &amp; Body Panels
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800">
              Active Economic
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Tariff</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ${settings.seaFreightBaseRateNzd} <span className="text-xs font-normal text-slate-500">NZD</span>
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit SLA</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                18 - 24 <span className="text-xs font-normal text-slate-500">business days</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Primary Operating Carriers:</span>
              <span className="font-bold text-slate-800">Toyofuji Shipping, Ocean Network Express (ONE), Maersk</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Origin Ports:</span>
              <span className="font-bold text-slate-800">Nagoya, Osaka, Hamburg, Melbourne</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">New Zealand Entry:</span>
              <span className="font-bold text-slate-800">Ports of Auckland / Lyttelton Port</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Carbon Efficiency Rating:</span>
              <span className="font-mono font-bold text-emerald-600">A+ (Lowest Emissions per Tonne)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form: Adjust System Baseline Rates */}
      <form onSubmit={handleSaveRates} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#ed2025]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Adjust System Baseline Freight Rates ($NZD)
            </h3>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Rate Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Air Express Standard Baseline Tariff ($NZD)
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default allocation added to landed customer quotes for priority air shipping
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Ocean Sea Freight Standard Baseline Tariff ($NZD)
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default allocation added to landed customer quotes for consolidated sea cargo
            </span>
          </div>
        </div>
      </form>

      {/* Manual Override & Simulation Desk */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Manual Override &amp; Freight Simulation Testbed
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Test weight calculations and verify manager override parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Estimated Consignment Weight (kg)</label>
            <input
              type="number"
              value={calcWeightKg}
              onChange={(e) => setCalcWeightKg(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Freight Corridor</label>
            <select
              value={calcMethod}
              onChange={(e) => setCalcMethod(e.target.value as FreightMethod)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold bg-white"
            >
              <option value="AIR_EXPRESS">Air Express Priority (3-5 days)</option>
              <option value="SEA_FREIGHT">Ocean Sea Freight (18-24 days)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Enable Managerial Override?</label>
            <button
              type="button"
              onClick={() => {
                setOverrideActive(!overrideActive);
                if (!overrideActive && customOverrideRate === 0) {
                  setCustomOverrideRate(standardRate);
                }
              }}
              className={`w-full py-2 rounded-xl font-bold transition text-xs border ${
                overrideActive
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {overrideActive ? "✓ Manual Override Active" : "Standard Rate Formula Active"}
            </button>
          </div>
        </div>

        {overrideActive && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Managerial Freight Rate Override Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-amber-900 block mb-1">Custom Overridden Rate ($NZD)</label>
                <input
                  type="number"
                  value={customOverrideRate}
                  onChange={(e) => setCustomOverrideRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-amber-900 block mb-1">Override Justification / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Bulk shipment discount negotiated with Air NZ Cargo"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Effective Rate for Quote Generation</span>
            <span className="text-2xl font-black text-emerald-400">
              ${effectiveFreightRate.toFixed(2)} NZD
            </span>
          </div>
          <div className="text-slate-400 text-right text-[11px]">
            {overrideActive ? (
              <span className="text-amber-400 font-semibold">
                ⚠️ Overridden from formula rate (${standardRate.toFixed(2)} NZD)
              </span>
            ) : (
              <span>Formula Rate based on {calcWeightKg}kg weight</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
