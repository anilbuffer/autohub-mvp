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

export default function AdminSupplierQuotesPage() {
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
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const currentRequest = requests.find((r) => r.id === selectedReqId) || requests[0];

  const handleSupplierChange = (sId: string) => {
    setSupplierId(sId);
    const s = suppliers.find((sup) => sup.id === sId);
    if (s) {
      setPartCostCurrency(s.currency);
      setExchangeRate(s.exchangeRateToNzd);
      setAvailabilityDays(s.leadTimeDays);
    }
  };

  const handleOpenAddModal = (reqId?: string) => {
    if (reqId) setSelectedReqId(reqId);
    if (suppliers.length > 0) {
      handleSupplierChange(suppliers[0].id);
    }
    setPartCostForeign(15000);
    setDomesticFreightForeign(2500);
    setQuoteNotes("Direct OEM ex-factory stock. Cross-verified with chassis schematic.");
    setModalOpen(true);
  };

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRequest || !supplierId) return;

    const s = suppliers.find((sup) => sup.id === supplierId);
    if (!s) return;

    const partCostNzd = Number((partCostForeign * exchangeRate).toFixed(2));
    const domesticFreightNzd = Number((domesticFreightForeign * exchangeRate).toFixed(2));

    const newQuote: SupplierQuotation = {
      id: `QUO-${Date.now()}`,
      supplierId: s.id,
      supplierName: s.name,
      supplierCountry: s.country,
      quantity: currentRequest.part.quantity,
      partCostCurrency,
      partCostForeign,
      exchangeRateToNzd: exchangeRate,
      partCostNzd,
      domesticFreightForeign,
      domesticFreightNzd,
      availabilityDays,
      notes: quoteNotes,
    };

    addSupplierQuote(currentRequest.id, newQuote);
    setModalOpen(false);
    refresh();
  };

  const partCostNzdCalc = Number((partCostForeign * exchangeRate).toFixed(2));
  const freightNzdCalc = Number((domesticFreightForeign * exchangeRate).toFixed(2));
  const totalLandedBaseCalc = partCostNzdCalc + freightNzdCalc;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Global Sourcing Network
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Supplier Quotation Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture, compare, and analyze overseas quotations from certified Japanese OEM, European, US, and Australian suppliers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Supplier Quote</span>
        </button>
      </div>

      {/* Main Sourcing Layout: Left Request Selector / Right Quote Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Request Intake List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Parts Requests ({requests.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Select to view quotes</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {requests.map((r) => {
              const isSelected = r.id === (currentRequest?.id);
              const quotesCount = r.supplierQuotes.length;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReqId(r.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? "border-[#ed2025] bg-red-50/30 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{r.referenceNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        quotesCount > 0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {quotesCount} {quotesCount === 1 ? "quote" : "quotes"}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 truncate">
                    {r.part.quantity}x {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {r.customerName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Detailed Supplier Quotation Comparison Desk */}
        <div className="lg:col-span-2 space-y-6">
          {currentRequest ? (
            <>
              {/* Selected Request Context Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {currentRequest.referenceNumber}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {currentRequest.status}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 mt-1">
                      {currentRequest.part.quantity}x {currentRequest.part.partName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(currentRequest.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Quote</span>
                    </button>
                    <Link
                      href="/admin/customer-quotes"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <span>Prepare Customer Quote →</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                    <span className="font-bold text-slate-900">
                      {currentRequest.vehicle.year} {currentRequest.vehicle.make} {currentRequest.vehicle.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">VIN / Chassis</span>
                    <span className="font-mono text-slate-900 truncate block">
                      {currentRequest.vehicle.vin}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preference</span>
                    <span className="font-semibold text-slate-900">
                      {currentRequest.part.genuinePreference.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                    <span className="font-semibold text-slate-900">
                      {currentRequest.part.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Captured Supplier Quotes Table */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ed2025]" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Captured Supplier Quotes ({currentRequest.supplierQuotes.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    All prices converted to landed NZD base cost
                  </span>
                </div>

                {currentRequest.supplierQuotes.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 space-y-3">
                    <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">No supplier quotes captured yet for this request.</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Query our global supplier network in Japan, Europe, or the US and add quotation lines to calculate landed pricing.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(currentRequest.id)}
                      className="px-4 py-2 rounded-xl bg-[#ed2025] text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Capture First Supplier Quote</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentRequest.supplierQuotes.map((sq, idx) => {
                      const totalNzd = sq.partCostNzd + (sq.domesticFreightNzd || 0);

                      return (
                        <div
                          key={sq.id || idx}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                                #{idx + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">
                                  {sq.supplierName}
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  {sq.supplierCountry} • Direct OEM Partner
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-lg font-black text-slate-900 font-mono">
                                ${totalNzd.toFixed(2)} NZD
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Foreign: {sq.partCostForeign.toLocaleString()} {sq.partCostCurrency} (FX: {sq.exchangeRateToNzd})
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Foreign Part Cost</span>
                              <span className="font-mono font-bold text-slate-800">
                                {sq.partCostForeign.toLocaleString()} {sq.partCostCurrency}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                (${sq.partCostNzd.toFixed(2)} NZD)
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Origin Freight</span>
                              <span className="font-mono font-bold text-slate-800">
                                {sq.domesticFreightForeign.toLocaleString()} {sq.partCostCurrency}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                (${sq.domesticFreightNzd.toFixed(2)} NZD)
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Supplier Lead Time</span>
                              <span className="font-semibold text-slate-800 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {sq.availabilityDays} days dispatch
                              </span>
                            </div>

                            <div className="flex items-center justify-end">
                              <Link
                                href="/admin/customer-quotes"
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                              >
                                <span>Apply to Customer Quote</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>

                          {sq.notes && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                              <strong>Notes:</strong> {sq.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              No parts request selected.
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Quote Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Capture Overseas Supplier Quote
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                For {currentRequest.referenceNumber}: {currentRequest.part.quantity}x {currentRequest.part.partName}
              </p>
            </div>

            <form onSubmit={handleAddQuoteSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Select Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country} • {s.currency} • Lead time: {s.leadTimeDays}d)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Foreign Part Cost ({partCostCurrency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={partCostForeign}
                    onChange={(e) => setPartCostForeign(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Origin Domestic Freight
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={domesticFreightForeign}
                    onChange={(e) => setDomesticFreightForeign(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    FX Rate to NZD
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Converted Preview Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">Converted Landed Base Cost:</span>
                <span className="font-mono font-black text-sm text-slate-900">
                  ${totalLandedBaseCalc.toFixed(2)} NZD
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    (Part: ${partCostNzdCalc.toFixed(2)} + Freight: ${freightNzdCalc.toFixed(2)})
                  </span>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Dispatch Lead Time (Days)</label>
                <input
                  type="number"
                  value={availabilityDays}
                  onChange={(e) => setAvailabilityDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Supplier Notes / Fitment Remarks</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-xs"
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
