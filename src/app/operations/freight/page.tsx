"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Plane,
  Truck,
  Calculator,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Info,
  Scale,
  Box,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface RateCard {
  origin: string;
  countryCode: string;
  airPerKg: number;
  airTransitDays: string;
  oceanPerCbm: number;
  oceanTransitDays: string;
  fuelSurchargePercent: number;
}

const RATE_CARDS: RateCard[] = [
  {
    origin: "Tokyo Hub (Narita - NRT)",
    countryCode: "JP",
    airPerKg: 14.5,
    airTransitDays: "3-4 Days",
    oceanPerCbm: 280,
    oceanTransitDays: "18-22 Days",
    fuelSurchargePercent: 12.5,
  },
  {
    origin: "Frankfurt Hub (FRA)",
    countryCode: "DE",
    airPerKg: 19.8,
    airTransitDays: "4-5 Days",
    oceanPerCbm: 340,
    oceanTransitDays: "28-34 Days",
    fuelSurchargePercent: 14.0,
  },
  {
    origin: "Los Angeles Hub (LAX)",
    countryCode: "US",
    airPerKg: 16.2,
    airTransitDays: "3-5 Days",
    oceanPerCbm: 310,
    oceanTransitDays: "20-25 Days",
    fuelSurchargePercent: 13.0,
  },
  {
    origin: "Sydney Hub (SYD)",
    countryCode: "AU",
    airPerKg: 8.9,
    airTransitDays: "1-2 Days",
    oceanPerCbm: 190,
    oceanTransitDays: "7-10 Days",
    fuelSurchargePercent: 9.5,
  },
];

export default function OperationsFreightPage() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("JP");
  const [cargoValueNzd, setCargoValueNzd] = useState<number>(1200);
  const [deadWeight, setDeadWeight] = useState<number>(14);
  const [lengthCm, setLengthCm] = useState<number>(60);
  const [widthCm, setWidthCm] = useState<number>(40);
  const [heightCm, setHeightCm] = useState<number>(30);
  const [shippingMode, setShippingMode] = useState<"AIR" | "OCEAN">("AIR");

  const currentRateCard = RATE_CARDS.find((r) => r.countryCode === selectedOrigin) || RATE_CARDS[0];

  // Volumetric weight formula: (L x W x H) / 5000
  const volumetricWeight = (lengthCm * widthCm * heightCm) / 5000;
  const billableWeight = Math.max(deadWeight, volumetricWeight);
  const cbm = (lengthCm * widthCm * heightCm) / 1000000;

  // Air calculation
  const baseAirFreight = billableWeight * currentRateCard.airPerKg;
  const airFuelSurcharge = baseAirFreight * (currentRateCard.fuelSurchargePercent / 100);
  const airFreightTotal = baseAirFreight + airFuelSurcharge;

  // Ocean calculation
  const oceanFreightTotal = Math.max(cbm * currentRateCard.oceanPerCbm, 95);

  const selectedFreightCost = shippingMode === "AIR" ? airFreightTotal : oceanFreightTotal;

  // Statutory Fees (NZ Customs & MPI)
  const mpiLevy = 45.0; // Biosecurity system levy
  const customsEntryFee = 41.5; // Customs Import Transaction Fee (ITF)
  const dutyRate = 0.0; // 0% under CPTPP for OEM auto parts

  // CIF Value = Cargo Cost + Insurance (1%) + Freight
  const insuranceNzd = cargoValueNzd * 0.01;
  const cifValue = cargoValueNzd + insuranceNzd + selectedFreightCost;
  const nzGst = (cifValue + customsEntryFee + mpiLevy) * 0.15; // 15% GST

  const totalLandedCost = cifValue + mpiLevy + customsEntryFee + nzGst;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Operations & Logistics
          </span>
          <span className="text-xs text-slate-500">Multimodal Freight Desk</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Anchor className="h-6 w-6 text-cyan-400" />
          Freight Tariffs & Landed Cost Calculator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compute accurate CIF landed costs including volumetric billable weight, fuel surcharges, MPI biosecurity clearance, and NZ 15% GST.
        </p>
      </div>

      {/* Interactive Landed Cost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Calculator Form */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Consignment Specifications
            </h2>
            <span className="text-xs text-slate-400 font-mono">Formula: IATA (L×W×H / 5000)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Hub */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Origin Depot / Hub
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {RATE_CARDS.map((rc) => (
                  <option key={rc.countryCode} value={rc.countryCode}>
                    {rc.origin}
                  </option>
                ))}
              </select>
            </div>

            {/* Cargo Value in NZD */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                FOB Part Value (NZD $)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={cargoValueNzd}
                  onChange={(e) => setCargoValueNzd(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Freight Transit Lane
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShippingMode("AIR")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  shippingMode === "AIR"
                    ? "bg-cyan-500/15 border-cyan-500 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Plane className={`h-5 w-5 ${shippingMode === "AIR" ? "text-cyan-400" : "text-slate-500"}`} />
                <div>
                  <div className="text-xs font-bold">Air Express Priority</div>
                  <div className="text-[11px] text-slate-400">{currentRateCard.airTransitDays} • ${currentRateCard.airPerKg}/kg</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMode("OCEAN")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  shippingMode === "OCEAN"
                    ? "bg-cyan-500/15 border-cyan-500 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Anchor className={`h-5 w-5 ${shippingMode === "OCEAN" ? "text-cyan-400" : "text-slate-500"}`} />
                <div>
                  <div className="text-xs font-bold">Ocean Consolidation</div>
                  <div className="text-[11px] text-slate-400">{currentRateCard.oceanTransitDays} • ${currentRateCard.oceanPerCbm}/CBM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Weight and Dimensions */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Scale className="h-4 w-4 text-cyan-400" />
              Weight & Volumetric Dimensions
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Deadweight (kg)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={deadWeight}
                  onChange={(e) => setDeadWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Width (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <div>
                Volumetric Weight: <strong className="text-white">{volumetricWeight.toFixed(2)} kg</strong>
              </div>
              <div>
                Volume: <strong className="text-white">{cbm.toFixed(3)} m³ (CBM)</strong>
              </div>
              <div>
                Billable Weight: <strong className="text-cyan-400">{billableWeight.toFixed(2)} kg</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Landed Cost Breakdown Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 via-[#0a1424] to-slate-950 border border-cyan-800/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Landed Cost Summary</h3>
                <p className="text-xs text-slate-400">Delivered Auckland Workshop Bay</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300">
                {shippingMode === "AIR" ? "Air Express" : "Ocean Freight"}
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>FOB Origin Part Cost</span>
                <span className="font-mono text-white">${cargoValueNzd.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Marine / Cargo Transit Insurance (1%)</span>
                <span className="font-mono text-white">${insuranceNzd.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>
                  International Freight ({shippingMode === "AIR" ? `${billableWeight.toFixed(1)}kg @ $${currentRateCard.airPerKg}` : `${cbm.toFixed(2)} CBM`})
                </span>
                <span className="font-mono text-cyan-300">${(shippingMode === "AIR" ? baseAirFreight : oceanFreightTotal).toFixed(2)} NZD</span>
              </div>

              {shippingMode === "AIR" && (
                <div className="flex justify-between text-slate-300 pl-3 text-[11px]">
                  <span>Airline Fuel Surcharge ({currentRateCard.fuelSurchargePercent}%)</span>
                  <span className="font-mono text-slate-400">${airFuelSurcharge.toFixed(2)} NZD</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>MPI Biosecurity System Levy</span>
                <span className="font-mono text-white">${mpiLevy.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>NZ Customs Import Transaction Fee (ITF)</span>
                <span className="font-mono text-white">${customsEntryFee.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>NZ Customs Tariff Duty (Auto Spares)</span>
                <span className="font-mono text-emerald-400 font-bold">0.00% (CPTPP Free)</span>
              </div>

              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2 font-medium">
                <span>NZ GST (15% on CIF + Fees)</span>
                <span className="font-mono text-amber-300">${nzGst.toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Landed Cost (NZD)
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              ${totalLandedCost.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Includes all NZ import duties, taxes & clearance
            </div>
          </div>
        </div>
      </div>

      {/* Published Rate Cards Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          Active Autohub Freight Rate Cards
        </h2>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Origin Hub</th>
                <th className="py-3 px-4">Air Priority Rate</th>
                <th className="py-3 px-4">Air Transit</th>
                <th className="py-3 px-4">Ocean Freight Rate</th>
                <th className="py-3 px-4">Ocean Transit</th>
                <th className="py-3 px-4">Fuel Surcharge</th>
                <th className="py-3 px-4 text-right">CPTPP Duty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {RATE_CARDS.map((rc) => (
                <tr key={rc.countryCode} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {rc.origin}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    ${rc.airPerKg.toFixed(2)} / kg
                  </td>
                  <td className="py-3.5 px-4">{rc.airTransitDays}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    ${rc.oceanPerCbm.toFixed(2)} / CBM
                  </td>
                  <td className="py-3.5 px-4">{rc.oceanTransitDays}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    +{rc.fuelSurchargePercent}%
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                    0.0% Free
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
