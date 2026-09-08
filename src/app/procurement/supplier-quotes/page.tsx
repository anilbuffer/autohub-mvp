"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Globe,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  Sliders,
  DollarSign,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  addSupplierQuote,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  SupplierProfile,
  SupplierQuotation,
} from "@/lib/types";

export default function ProcurementSupplierQuotesPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  // New quote form state
  const [supplierId, setSupplierId] = useState<string>("");
  const [partCostForeign, setPartCostForeign] = useState<number>(0);
  const [partCostCurrency, setPartCostCurrency] = useState<string>("JPY");
  const [exchangeRate, setExchangeRate] = useState<number>(0.0108);
  const [domesticFreightForeign, setDomesticFreightForeign] = useState<number>(0);
  const [availabilityDays, setAvailabilityDays] = useState<number>(3);
  const [quoteNotes, setQuoteNotes] = useState<string>("");
  const [successBanner, setSuccessBanner] = useState(false);

  const refresh = () => {
    const reqs = getStoredRequests();
    setRequests(reqs);
    const sups = getStoredSuppliers();
    setSuppliers(sups);
    if (!selectedReqId && reqs.length > 0) {
      setSelectedReqId(reqs[0].id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedReqId);
  const existingQuotes: SupplierQuotation[] = selectedRequest?.supplierQuotes || [];

  // Update currency and exchange rate defaults when supplier is chosen
  const handleSupplierSelect = (id: string) => {
    setSupplierId(id);
    const sup = suppliers.find((s) => s.id === id);
    if (sup) {
      setPartCostCurrency(sup.currency);
      if (sup.currency === "JPY") setExchangeRate(0.0108);
      else if (sup.currency === "AUD") setExchangeRate(1.085);
      else if (sup.currency === "USD") setExchangeRate(1.642);
      else if (sup.currency === "AED") setExchangeRate(0.447);
      else if (sup.currency === "GBP") setExchangeRate(2.12);
      else setExchangeRate(1.0);
    }
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId || !supplierId) return;

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const costForeign = Number(partCostForeign);
    const exRate = Number(exchangeRate);
    const freightForeign = Number(domesticFreightForeign);
    const pCostNzd = Number((costForeign * exRate).toFixed(2));
    const fCostNzd = Number((freightForeign * exRate).toFixed(2));
    const landedTotal = pCostNzd + fCostNzd;

    addSupplierQuote(selectedReqId, {
      id: `QUO-${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierCountry: supplier.country,
      country: supplier.country,
      partCostForeign: costForeign,
      partCostCurrency: partCostCurrency,
      currency: partCostCurrency,
      exchangeRateToNzd: exRate,
      partCostNzd: pCostNzd,
      domesticFreightForeign: freightForeign,
      domesticFreightNzd: fCostNzd,
      totalLandedCostNzd: landedTotal,
      availabilityDays: Number(availabilityDays),
      notes: quoteNotes,
      status: "RECEIVED",
      createdAt: new Date().toISOString(),
    });

    setModalOpen(false);
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 4000);

    // Reset form
    setPartCostForeign(0);
    setDomesticFreightForeign(0);
    setQuoteNotes("");
  };

  const getSupplierLandedCost = (sq: any) =>
    sq.totalLandedCostNzd ?? ((sq.partCostNzd || 0) + (sq.domesticFreightNzd || 0));

  // Find the lowest landed quote for comparison badge
  const lowestLandedQuote = existingQuotes.length > 0
    ? [...existingQuotes].sort((a, b) => getSupplierLandedCost(a) - getSupplierLandedCost(b))[0]
    : null;

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
            Supplier Quotes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture overseas supplier quotations, auto-convert foreign currency landed costs, and compare bids side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/procurement/quote-builder"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <span>Proceed to Quote Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!selectedRequest}
            className="px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-950/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Capture Supplier Quote</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Supplier quote captured and normalized into NZD landed cost ledger.</span>
        </div>
      )}

      {/* Main Sourcing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Request Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sourcing Queue ({requests.length})
            </h3>
            <span className="text-[10px] text-slate-400">Select to compare</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {requests.map((r) => {
              const isSelected = r.id === selectedReqId;
              const qCount = r.supplierQuotes?.length || 0;

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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      qCount > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {qCount} {qCount === 1 ? "quote" : "quotes"}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 line-clamp-1">
                    {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Side by Side Quotation Comparison */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRequest ? (
            <>
              {/* Request Banner Card */}
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
                      {selectedRequest.vehicle.year} {selectedRequest.vehicle.make} {selectedRequest.vehicle.model} • VIN: {selectedRequest.vehicle.vin}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Status</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-slate-800">{selectedRequest.part.category}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">OEM Part #</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedRequest.part.oemPartNumber || selectedRequest.part.oemNumber || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                    <span className="font-bold text-slate-800">{selectedRequest.part.conditionRequirement || selectedRequest.part.conditionPreference || "Genuine OEM"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-800 truncate block">{selectedRequest.customerName}</span>
                  </div>
                </div>
              </div>

              {/* Quotes Grid / Side by Side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Captured Overseas Supplier Quotes ({existingQuotes.length})</span>
                  </h3>
                </div>

                {existingQuotes.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-3">
                    <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">No Supplier Quotes Captured Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click &quot;Capture Supplier Quote&quot; to log overseas cost, currency exchange rates, and availability.
                    </p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                    >
                      Log Supplier Quote
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {existingQuotes.map((q) => {
                      const isLowest = lowestLandedQuote?.id === q.id;

                      return (
                        <div
                          key={q.id}
                          className={`bg-white rounded-2xl p-5 border shadow-xs space-y-4 relative ${
                            isLowest ? "border-emerald-500/80 ring-2 ring-emerald-500/20" : "border-slate-200/80"
                          }`}
                        >
                          {isLowest && (
                            <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Best Landed Cost
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-900">{q.supplierName}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {q.country || q.supplierCountry}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              Recorded: {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-NZ") : "Recent"}
                            </span>
                          </div>

                          {/* Foreign Cost & Converted NZD */}
                          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Foreign Price</span>
                              <div className="font-mono font-bold text-slate-900">
                                {q.currency || q.partCostCurrency} {q.partCostForeign.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Ex: {q.exchangeRateToNzd.toFixed(4)}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Landed NZD</span>
                              <div className="font-mono font-black text-slate-900 text-sm">
                                ${getSupplierLandedCost(q).toFixed(2)}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Avail: {q.availabilityDays} days
                              </span>
                            </div>
                          </div>

                          {q.notes && (
                            <p className="text-[11px] text-slate-600 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                              &quot;{q.notes}&quot;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
              Select a part request from the left column to view quotes.
            </div>
          )}
        </div>
      </div>

      {/* Capture Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Capture Overseas Supplier Quotation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For {selectedRequest?.referenceNumber} — {selectedRequest?.part.partName}
              </p>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Select Supplier</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                >
                  <option value="">-- Choose Overseas Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country} • {s.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Part Cost ({partCostCurrency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={partCostForeign || ""}
                    onChange={(e) => setPartCostForeign(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Exchange Rate ({partCostCurrency} → NZD)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={exchangeRate || ""}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Dispatch Readiness (Days)</label>
                  <input
                    type="number"
                    required
                    value={availabilityDays}
                    onChange={(e) => setAvailabilityDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Calculated Landed (NZD)</label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-slate-900">
                    ${((Number(partCostForeign) + Number(domesticFreightForeign)) * Number(exchangeRate)).toFixed(2)} NZD
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Supplier Notes / Condition</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Tested running condition, 90 day warranty, Grade A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow"
                >
                  Save Supplier Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
