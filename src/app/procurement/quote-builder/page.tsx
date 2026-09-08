"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BadgePercent,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plane,
  Anchor,
  FileText,
  DollarSign,
  AlertCircle,
  Percent,
  Layers,
  Banknote,
  Send,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSettings,
  issueCustomerQuote,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  CustomerQuote,
  FreightOption,
  FreightMethod,
  SystemSettings,
} from "@/lib/types";

export default function ProcurementQuoteBuilderPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [marginPercent, setMarginPercent] = useState<number>(settings.defaultMarginPercent || 25);
  const [airFreightNzd, setAirFreightNzd] = useState<number>(settings.airFreightBaseRateNzd || 280);
  const [seaFreightNzd, setSeaFreightNzd] = useState<number>(settings.seaFreightBaseRateNzd || 140);
  const [validDays, setValidDays] = useState<number>(7);
  const [issuedSuccess, setIssuedSuccess] = useState<string | null>(null);

  const refresh = () => {
    const all = getStoredRequests();
    setRequests(all);
    setSettings(getStoredSettings());
    if (!selectedReqId && all.length > 0) {
      setSelectedReqId(all[0].id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedReqId);
  const quotes = selectedRequest?.supplierQuotes || [];
  const bestSupplierQuote = quotes.length > 0
    ? [...quotes].sort((a, b) => a.totalLandedCostNzd - b.totalLandedCostNzd)[0]
    : null;

  // Calculation parameters
  const baseCostNzd = bestSupplierQuote ? bestSupplierQuote.totalLandedCostNzd : 500;
  const marginMultiplier = 1 + marginPercent / 100;
  const partPriceCustomerNzd = Math.round(baseCostNzd * marginMultiplier);

  // Air calculation
  const airSubtotal = partPriceCustomerNzd + airFreightNzd;
  const airGst = Math.round(airSubtotal * settings.gstRate * 100) / 100;
  const airTotal = airSubtotal + airGst;

  // Sea calculation
  const seaSubtotal = partPriceCustomerNzd + seaFreightNzd;
  const seaGst = Math.round(seaSubtotal * settings.gstRate * 100) / 100;
  const seaTotal = seaSubtotal + seaGst;

  const handleIssueQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const freightOpts: FreightOption[] = [
      {
        method: "AIR",
        costForeign: 0,
        currency: "NZD",
        freightCostNzd: airFreightNzd,
        estimatedDays: "3-5 Business Days",
        subtotalNzd: airSubtotal,
        gstNzd: airGst,
        totalNzd: airTotal,
      },
      {
        method: "SEA",
        costForeign: 0,
        currency: "NZD",
        freightCostNzd: seaFreightNzd,
        estimatedDays: "18-24 Business Days",
        subtotalNzd: seaSubtotal,
        gstNzd: seaGst,
        totalNzd: seaTotal,
      },
    ];

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validDays);

    const quotePayload: CustomerQuote = {
      id: `QUO-${Date.now().toString().slice(-6)}`,
      requestId: selectedRequest.id,
      selectedSupplierQuoteId: bestSupplierQuote?.id,
      partPriceCustomerNzd: partPriceCustomerNzd,
      marginPercent: marginPercent,
      freightOptions: freightOpts,
      gstRate: settings.gstRate,
      totalNzd: airTotal, // baseline default
      validUntil: expiryDate.toISOString().split("T")[0],
      status: "ISSUED",
      createdAt: new Date().toISOString(),
    };

    issueCustomerQuote(selectedRequest.id, quotePayload);
    setIssuedSuccess(`Customer quote successfully issued for ${selectedRequest.referenceNumber}`);
    setTimeout(() => setIssuedSuccess(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Sourcing Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Quote Builder
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure margin markups, air/sea freight landed estimates, and generate official customer quotations.
          </p>
        </div>

        <Link
          href="/procurement/queue"
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <span>Return to Sourcing Queue</span>
        </Link>
      </div>

      {issuedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{issuedSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Awaiting Customer Quote ({requests.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {requests.map((r) => {
              const isSelected = r.id === selectedReqId;
              const hasQuotes = (r.supplierQuotes?.length || 0) > 0;
              const isAlreadyQuoted = !!r.quote;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReqId(r.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "border-[#ed2025] bg-red-50/20 shadow-xs"
                      : "border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {r.referenceNumber}
                    </span>
                    {isAlreadyQuoted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Quoted
                      </span>
                    ) : hasQuotes ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        Ready to Build
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        No Supplier Quote
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-800 line-clamp-1">
                    {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.customerName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quote Builder Form */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRequest ? (
            <form onSubmit={handleIssueQuote} className="space-y-6">
              {/* Part Overview Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#ed2025]">
                      {selectedRequest.referenceNumber}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedRequest.part.partName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customer: {selectedRequest.customerName} • {selectedRequest.vehicle.year} {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Best Sourced Cost
                    </span>
                    <div className="font-mono font-black text-slate-900 text-lg">
                      ${baseCostNzd.toFixed(2)} NZD
                    </div>
                  </div>
                </div>

                {!bestSupplierQuote && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>No supplier quotes recorded yet. Using baseline default cost estimate.</span>
                    </div>
                    <Link
                      href="/procurement/supplier-quotes"
                      className="font-bold text-amber-900 underline whitespace-nowrap ml-2"
                    >
                      Capture Quote First →
                    </Link>
                  </div>
                )}
              </div>

              {/* Margin & Pricing Parameters */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Percent className="w-4 h-4 text-[#ed2025]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Commercial Margin &amp; Validity
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Target Margin (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Gross profit: ${(partPriceCustomerNzd - baseCostNzd).toFixed(2)} NZD
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Customer Part Subtotal (NZD)
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-slate-900">
                      ${partPriceCustomerNzd.toFixed(2)} NZD
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Before freight &amp; 15% GST
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Quote Validity Window
                    </label>
                    <select
                      value={validDays}
                      onChange={(e) => setValidDays(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                    >
                      <option value="3">3 Days (Express Volatile)</option>
                      <option value="7">7 Days (Standard)</option>
                      <option value="14">14 Days (Extended)</option>
                      <option value="30">30 Days (Fixed Contract)</option>
                    </select>
                  </div>
                </div>

                {/* Freight Options Preview */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Freight Landed Matrix (inc. GST 15%)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Air Option */}
                    <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs text-slate-900">Air Express</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">3-5 Days</span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Freight:</span>
                          <span className="font-mono">${airFreightNzd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>NZ GST (15%):</span>
                          <span className="font-mono">${airGst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                          <span>Total Customer Landed:</span>
                          <span className="font-mono text-sm">${airTotal.toFixed(2)} NZD</span>
                        </div>
                      </div>
                    </div>

                    {/* Sea Option */}
                    <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-cyan-600" />
                          <span className="font-bold text-xs text-slate-900">Ocean Sea Freight</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">18-24 Days</span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Freight:</span>
                          <span className="font-mono">${seaFreightNzd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>NZ GST (15%):</span>
                          <span className="font-mono">${seaGst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                          <span>Total Customer Landed:</span>
                          <span className="font-mono text-sm">${seaTotal.toFixed(2)} NZD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow-lg shadow-red-950/20 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Issue Customer Quote</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
              Select a part request to build a customer quote.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
