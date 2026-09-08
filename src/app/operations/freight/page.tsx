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
  CheckCircle2,
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
    airPerKg: 8.5,
    airTransitDays: "1-2 Days",
    oceanPerCbm: 160,
    oceanTransitDays: "5-7 Days",
    fuelSurchargePercent: 9.0,
  },
];

export default function OperationsFreightPage() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("JP");
  const [shippingMode, setShippingMode] = useState<"AIR" | "OCEAN">("AIR");
  const [deadWeight, setDeadWeight] = useState<number>(12);
  const [lengthCm, setLengthCm] = useState<number>(45);
  const [widthCm, setWidthCm] = useState<number>(35);
  const [heightCm, setHeightCm] = useState<number>(25);
  const [cargoValueNzd, setCargoValueNzd] = useState<number>(1200);

  const currentRateCard =
    RATE_CARDS.find((r) => r.countryCode === selectedOrigin) || RATE_CARDS[0];

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

  // CIF Value = Cargo Cost + Insurance (1%) + Freight
  const insuranceNzd = cargoValueNzd * 0.01;
  const cifValue = cargoValueNzd + insuranceNzd + selectedFreightCost;
  const nzGst = (cifValue + customsEntryFee + mpiLevy) * 0.15; // 15% GST

  const totalLandedCost = cifValue + mpiLevy + customsEntryFee + nzGst;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#ed2025] border border-red-200">
            Operations &amp; Logistics Desk
          </span>
          <span className="text-xs text-slate-500">IATA Volumetric Tariffs</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Anchor className="h-6 w-6 text-[#ed2025]" />
          Freight Tariffs &amp; Landed Cost Calculator
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Compute accurate CIF landed costs including volumetric billable weight, fuel surcharges, MPI biosecurity clearance, and NZ 15% GST.
        </p>
      </div>

      {/* Interactive Landed Cost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Calculator Form (Symmetrical White Card) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 shadow-xs rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#ed2025]" />
              Consignment Specifications
            </h3>
            <span className="text-xs text-slate-400 font-mono">Formula: IATA (L×W×H / 5000)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Hub */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Origin Depot / Hub
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025]"
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                FOB Part Value (NZD $)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={cargoValueNzd}
                  onChange={(e) => setCargoValueNzd(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025]"
                />
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Freight Transit Lane
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShippingMode("AIR")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  shippingMode === "AIR"
                    ? "bg-red-50 border-[#ed2025] text-slate-900 shadow-xs"
                    : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Plane className={`h-5 w-5 ${shippingMode === "AIR" ? "text-[#ed2025]" : "text-slate-400"}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Air Express Priority</div>
                  <div className="text-[11px] text-slate-500">{currentRateCard.airTransitDays} • ${currentRateCard.airPerKg}/kg</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMode("OCEAN")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  shippingMode === "OCEAN"
                    ? "bg-red-50 border-[#ed2025] text-slate-900 shadow-xs"
                    : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Anchor className={`h-5 w-5 ${shippingMode === "OCEAN" ? "text-[#ed2025]" : "text-slate-400"}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Ocean Consolidation</div>
                  <div className="text-[11px] text-slate-500">{currentRateCard.oceanTransitDays} • ${currentRateCard.oceanPerCbm}/CBM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Weight and Dimensions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#ed2025]" />
              Weight &amp; Volumetric Dimensions
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Deadweight (kg)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={deadWeight}
                  onChange={(e) => setDeadWeight(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Width (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-200">
              <div>
                Volumetric Weight: <strong className="text-slate-900">{volumetricWeight.toFixed(2)} kg</strong>
              </div>
              <div>
                Volume: <strong className="text-slate-900">{cbm.toFixed(3)} m³ (CBM)</strong>
              </div>
              <div>
                Billable Weight: <strong className="text-[#ed2025]">{billableWeight.toFixed(2)} kg</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Landed Cost Breakdown Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 shadow-xs rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Landed Cost Summary</h3>
                <p className="text-xs text-slate-500">Delivered Auckland Workshop Bay</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#ed2025] border border-red-200">
                {shippingMode === "AIR" ? "Air Express" : "Ocean Freight"}
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>FOB Origin Part Cost</span>
                <span className="font-mono text-slate-900 font-semibold">${cargoValueNzd.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Marine / Cargo Transit Insurance (1%)</span>
                <span className="font-mono text-slate-900 font-semibold">${insuranceNzd.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>
                  International Freight ({shippingMode === "AIR" ? `${billableWeight.toFixed(1)}kg @ $${currentRateCard.airPerKg}` : `${cbm.toFixed(2)} CBM`})
                </span>
                <span className="font-mono text-[#ed2025] font-bold">${(shippingMode === "AIR" ? baseAirFreight : oceanFreightTotal).toFixed(2)} NZD</span>
              </div>

              {shippingMode === "AIR" && (
                <div className="flex justify-between text-slate-500 pl-3 text-[11px]">
                  <span>Airline Fuel Surcharge ({currentRateCard.fuelSurchargePercent}%)</span>
                  <span className="font-mono text-slate-600">${airFuelSurcharge.toFixed(2)} NZD</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>MPI Biosecurity System Levy</span>
                <span className="font-mono text-slate-900 font-semibold">${mpiLevy.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>NZ Customs Import Transaction Fee (ITF)</span>
                <span className="font-mono text-slate-900 font-semibold">${customsEntryFee.toFixed(2)} NZD</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>NZ Customs Tariff Duty (Auto Spares)</span>
                <span className="font-mono text-emerald-700 font-bold">0.00% (CPTPP Free)</span>
              </div>

              <div className="flex justify-between text-slate-700 border-t border-slate-100 pt-2 font-medium">
                <span>NZ GST (15% on CIF + Fees)</span>
                <span className="font-mono text-amber-700 font-bold">${nzGst.toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
              Total Landed Cost (NZD)
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              ${totalLandedCost.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Includes all NZ import duties, taxes &amp; clearance
            </div>
          </div>
        </div>
      </div>

      {/* Published Rate Cards Table (Symmetrical White Card) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Published Multimodal Freight Rate Cards</h3>
          <p className="text-xs text-slate-500">Contracted commercial rates with Tier-1 air cargo and shipping lines</p>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Origin Hub</th>
              <th className="py-3 px-4">Air Freight ($/kg)</th>
              <th className="py-3 px-4">Air Transit</th>
              <th className="py-3 px-4">Ocean Freight ($/CBM)</th>
              <th className="py-3 px-4">Ocean Transit</th>
              <th className="py-3 px-4">Fuel Surcharge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {RATE_CARDS.map((rc) => (
              <tr key={rc.countryCode} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">{rc.origin}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-[#ed2025]">${rc.airPerKg.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-slate-600">{rc.airTransitDays}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">${rc.oceanPerCbm.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-slate-600">{rc.oceanTransitDays}</td>
                <td className="py-3.5 px-4 text-slate-500">{rc.fuelSurchargePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
