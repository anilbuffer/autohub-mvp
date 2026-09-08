"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  X,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  addSupplierQuote,
  updateRequestStatus,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, SupplierProfile, SupplierQuotation } from "@/lib/types";

export default function SourcingQueuePage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState("ALL");

  // Form states for new supplier quote
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [partCostForeign, setPartCostForeign] = useState<number>(45000);
  const [currency, setCurrency] = useState("JPY");
  const [exchangeRate, setExchangeRate] = useState<number>(0.011); // 1 JPY = 0.011 NZD
  const [domesticFreightForeign, setDomesticFreightForeign] = useState<number>(2500);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [quoteNotes, setQuoteNotes] = useState("");

  const refresh = () => {
    setRequests(getStoredRequests());
    const storedSuppliers = getStoredSuppliers();
    setSuppliers(storedSuppliers);
    if (storedSuppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(storedSuppliers[0].id);
      setCurrency(storedSuppliers[0].currency);
      setExchangeRate(storedSuppliers[0].exchangeRateToNzd);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleSupplierSelectChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const found = suppliers.find((s) => s.id === supId);
    if (found) {
      setCurrency(found.currency);
      setExchangeRate(found.exchangeRateToNzd);
      if (found.currency === "JPY") {
        setPartCostForeign(45000);
        setDomesticFreightForeign(2500);
      } else if (found.currency === "EUR") {
        setPartCostForeign(380);
        setDomesticFreightForeign(25);
      } else if (found.currency === "USD") {
        setPartCostForeign(420);
        setDomesticFreightForeign(35);
      } else {
        setPartCostForeign(550);
        setDomesticFreightForeign(40);
      }
    }
  };

  const handleOpenQuoteModal = (req: PartRequest) => {
    setSelectedRequest(req);
    setShowQuoteModal(true);
    setQuoteNotes(`OEM verified fitment for ${req.vehicle.year} ${req.vehicle.make} ${req.vehicle.model}. In stock ready for Nagoya airport dispatch.`);
  };

  const handleSubmitSupplierQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const partCostNzd = partCostForeign * exchangeRate;
    const domesticFreightNzd = domesticFreightForeign * exchangeRate;

    const newQuote: SupplierQuotation = {
      id: `SQTE-${Date.now()}`,
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || "Global OEM Supplier",
      supplierCountry: supplier?.country || "Japan",
      quantity: selectedRequest.part.quantity,
      partCostCurrency: currency,
      partCostForeign: Number(partCostForeign),
      exchangeRateToNzd: Number(exchangeRate),
      partCostNzd: Number(partCostNzd),
      domesticFreightForeign: Number(domesticFreightForeign),
      domesticFreightNzd: Number(domesticFreightNzd),
      availabilityDays: Number(leadTimeDays),
      notes: quoteNotes,
    };

    addSupplierQuote(selectedRequest.id, newQuote);
    setShowQuoteModal(false);
    setSelectedRequest(null);
  };

  const handleAdvanceToQuotePrepared = (reqId: string) => {
    updateRequestStatus(
      reqId,
      "QUOTE_PREPARED",
      "Nathan Cole",
      "PROCUREMENT",
      "Supplier quotes verified and landed customer quote ready"
    );
  };

  const filteredRequests = requests.filter((r) => {
    const isQueueStatus =
      r.status === "SOURCING" ||
      r.status === "SUBMITTED" ||
      r.status === "QUOTE_PREPARED";

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCondition =
      filterCondition === "ALL" || r.part.conditionRequirement === filterCondition;

    return isQueueStatus && matchesSearch && matchesCondition;
  });

  const partCostNzdCalc = partCostForeign * exchangeRate;
  const domesticFreightNzdCalc = domesticFreightForeign * exchangeRate;
  const totalForeignNzd = partCostNzdCalc + domesticFreightNzdCalc;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ed2025]/10 text-[#ed2025] border border-[#ed2025]/20">
              Procurement Desk
            </span>
            <span className="text-xs text-slate-500 font-medium">Global Sourcing Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#ed2025]" />
            Sourcing Intake Queue &amp; Supplier Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming parts RFQs from NZ trade customers and record verified overseas supplier quotations.
          </p>
        </div>

        <Link
          href="/procurement/suppliers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-xs"
        >
          <Building2 className="w-4 h-4 text-[#ed2025]" />
          <span>Manage Suppliers Directory</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by ref, make, part, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Condition:</span>
          {["ALL", "NEW_GENUINE", "NEW_AFTERMARKET", "RECONDITIONED_OEM", "USED_TESTED"].map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => setFilterCondition(cond)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterCondition === cond
                  ? "bg-[#0f172a] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cond.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Sourcing Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 text-xs">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No parts requests matched your sourcing filters.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-4"
            >
              {/* Card Top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-[#0f172a] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {req.referenceNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      req.status === "SOURCING"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : req.status === "QUOTE_PREPARED"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {req.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Requested on {new Date(req.submittedDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuoteModal(req)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Capture Supplier Quote</span>
                  </button>

                  {req.status === "SOURCING" && req.supplierQuotes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceToQuotePrepared(req.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ready For Customer Quote</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Vehicle & Part Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
                    Target Vehicle
                  </span>
                  <div className="font-black text-slate-900 text-sm">
                    {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                  </div>
                  <div className="font-mono text-slate-600 text-[11px]">
                    VIN: {req.vehicle.vin}
                  </div>
                  {req.vehicle.engineCode && (
                    <div className="text-slate-500 text-[11px]">
                      Engine: {req.vehicle.engineCode} • {req.vehicle.transmission || "Automatic"}
                    </div>
                  )}
                </div>

                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
                    Part Specification
                  </span>
                  <div className="font-black text-slate-900 text-sm">
                    {req.part.partName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Qty: <span className="font-bold font-mono text-slate-900">{req.part.quantity}</span> • Condition: {req.part.conditionRequirement.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-[#ed2025] font-bold">
                    Pref: {req.part.genuinePreference.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
                    Trade Customer
                  </span>
                  <div className="font-black text-slate-900 text-sm">
                    {req.customerName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Delivery: {req.deliveryAddress.city}, {req.deliveryAddress.suburb}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    NZBN: {req.customerNzbn}
                  </div>
                </div>
              </div>

              {/* Logged Supplier Quotes on this Request */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Overseas Quotations Captured ({req.supplierQuotes?.length || 0}):</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Quoted in supplier native currency with landed NZD conversion
                  </span>
                </div>

                {(!req.supplierQuotes || req.supplierQuotes.length === 0) ? (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    No supplier quote logged yet. Sourcing specialists in Nagoya, Hamburg or Los Angeles should query suppliers and capture quotation above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {req.supplierQuotes.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 relative shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#ed2025]" />
                            <span>{q.supplierName}</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {q.supplierCountry}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <div className="text-[11px] text-slate-500">
                            Foreign Cost:{" "}
                            <span className="font-mono font-bold text-slate-800">
                              {q.partCostForeign.toLocaleString()} {q.partCostCurrency}
                            </span>{" "}
                            (FX: {q.exchangeRateToNzd})
                          </div>
                          <div className="font-mono font-black text-sm text-emerald-600">
                            ${q.partCostNzd.toFixed(2)} NZD
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                          <span>Lead time: {q.availabilityDays} days</span>
                          <span>Domestic freight: ${q.domesticFreightNzd.toFixed(2)} NZD</span>
                        </div>
                        {q.notes && (
                          <div className="text-[10px] text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100">
                            "{q.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= CAPTURE SUPPLIER QUOTE MODAL ================= */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ed2025]/10 text-[#ed2025] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Capture Supplier Quotation
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Ref: {selectedRequest.referenceNumber} • {selectedRequest.part.partName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplierQuote} className="space-y-4 text-xs">
              {/* Supplier Selection */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Select Overseas Supplier:
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country} • {s.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency & Part Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Part Cost in Foreign Currency:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={partCostForeign}
                      onChange={(e) => setPartCostForeign(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Exchange Rate to NZD:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Domestic Freight & Lead Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Origin Domestic Freight ({currency}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={domesticFreightForeign}
                    onChange={(e) => setDomesticFreightForeign(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Supplier Lead Time (Days):
                  </label>
                  <input
                    type="number"
                    required
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Conversion Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Part Cost in NZD:</span>
                  <span className="font-mono font-bold text-slate-900">${partCostNzdCalc.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Origin Freight in NZD:</span>
                  <span className="font-mono text-slate-800">${domesticFreightNzdCalc.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                  <span>Total Base Cost (NZD):</span>
                  <span className="font-mono text-[#0f172a] font-black text-sm">${totalForeignNzd.toFixed(2)} NZD</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Fitment &amp; Warranty Notes:
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-md transition"
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
