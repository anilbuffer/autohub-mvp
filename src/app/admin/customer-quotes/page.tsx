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
  acceptCustomerQuote,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  CustomerQuote,
  FreightOption,
  FreightMethod,
  SystemSettings,
} from "@/lib/types";

export default function AdminCustomerQuotesPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "NEED_QUOTE" | "ISSUED" | "ACCEPTED">("ALL");

  // Modal State for Generating / Issuing Quote
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReq, setCurrentReq] = useState<PartRequest | null>(null);

  // Quote form state
  const [selectedSupplierQuoteId, setSelectedSupplierQuoteId] = useState<string>("");
  const [targetMargin, setTargetMargin] = useState<number>(18.0);
  const [procurementFee, setProcurementFee] = useState<number>(25.0);
  const [airFreightCost, setAirFreightCost] = useState<number>(185.0);
  const [seaFreightCost, setSeaFreightCost] = useState<number>(65.0);
  const [validDays, setValidDays] = useState<number>(7);

  const refresh = () => {
    const reqs = getStoredRequests();
    setRequests(reqs);
    setSettings(getStoredSettings());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const handleOpenQuoteModal = (req: PartRequest) => {
    setCurrentReq(req);
    setTargetMargin(settings.defaultMarginPercent || 18.0);
    setAirFreightCost(settings.airFreightBaseRateNzd || 185.0);
    setSeaFreightCost(settings.seaFreightBaseRateNzd || 65.0);
    if (req.supplierQuotes.length > 0) {
      setSelectedSupplierQuoteId(req.supplierQuotes[0].id);
    } else {
      setSelectedSupplierQuoteId("");
    }
    setModalOpen(true);
  };

  // Calculations for active modal
  const selectedSQ = currentReq?.supplierQuotes.find((sq) => sq.id === selectedSupplierQuoteId) || currentReq?.supplierQuotes[0];
  const basePartCostNzd = selectedSQ ? selectedSQ.partCostNzd + (selectedSQ.domesticFreightNzd || 0) : 350.0;
  const marginAmountNzd = Number(((basePartCostNzd * targetMargin) / 100).toFixed(2));
  const landedBeforeIntFreight = basePartCostNzd + marginAmountNzd + procurementFee;

  // Air Express freight subtotal & total
  const airSubtotal = landedBeforeIntFreight + airFreightCost;
  const airGst = Number((airSubtotal * 0.15).toFixed(2));
  const airTotal = Number((airSubtotal + airGst).toFixed(2));

  // Sea Freight subtotal & total
  const seaSubtotal = landedBeforeIntFreight + seaFreightCost;
  const seaGst = Number((seaSubtotal * 0.15).toFixed(2));
  const seaTotal = Number((seaSubtotal + seaGst).toFixed(2));

  const handleIssueQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000).toISOString();
    const quoteNum = `QTE-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const freightOptions: FreightOption[] = [
      {
        method: "AIR_EXPRESS",
        carrierName: "Air New Zealand Cargo / Cathay Priority",
        estimatedTransitDays: "3 - 5 business days",
        costNzd: airFreightCost,
        co2Rating: "B",
        available: true,
      },
      {
        method: "SEA_FREIGHT",
        carrierName: "Toyofuji / Ocean Network Express (Consolidated)",
        estimatedTransitDays: "18 - 24 business days",
        costNzd: seaFreightCost,
        co2Rating: "A+",
        available: true,
      },
    ];

    const customerQuote: CustomerQuote = {
      id: `CQT-${Date.now()}`,
      quoteNumber: quoteNum,
      createdAt: now.toISOString(),
      expiresAt,
      selectedSupplierQuoteId: selectedSupplierQuoteId || "SQ-DEFAULT",
      basePartCostNzd,
      targetMarginPercentage: targetMargin,
      marginAmountNzd,
      procurementFeeNzd: procurementFee,
      landedCostNzd: basePartCostNzd,
      freightOptions,
      subtotalNzd: airSubtotal, // Baseline with Air Express
      gstAmountNzd: airGst,
      totalNzd: airTotal,
      termsAccepted: false,
      status: "ISSUED",
      revisionNumber: 1,
    };

    issueCustomerQuote(currentReq.id, customerQuote);
    setModalOpen(false);
    refresh();
  };

  const handleManualAccept = (req: PartRequest, method: FreightMethod) => {
    acceptCustomerQuote(req.id, method, req.customerName);
    refresh();
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter =
      filterTab === "ALL" ||
      (filterTab === "NEED_QUOTE" && !r.quote) ||
      (filterTab === "ISSUED" && r.quote?.status === "ISSUED") ||
      (filterTab === "ACCEPTED" && r.quote?.status === "ACCEPTED");

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.quote?.quoteNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Commercial Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Customer Quotation Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulate landed pricing, apply target trade margins, configure Air &amp; Sea freight options, and track customer quote acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/freight"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Plane className="w-4 h-4 text-blue-600" />
            <span>Freight Settings</span>
          </Link>
          <Link
            href="/admin/payments"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4 text-purple-600" />
            <span>Payments Desk</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search request ref, quote number, customer, part..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ed2025] transition"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: "ALL", label: "All Records", count: requests.length },
              { id: "NEED_QUOTE", label: "Awaiting Quotation", count: requests.filter((r) => !r.quote).length },
              { id: "ISSUED", label: "Quote Issued", count: requests.filter((r) => r.quote?.status === "ISSUED").length },
              { id: "ACCEPTED", label: "Quote Accepted", count: requests.filter((r) => r.quote?.status === "ACCEPTED").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  filterTab === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Part &amp; Vehicle</th>
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Total (NZD)</th>
                <th className="py-3 px-4">Quote Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No requests match the current quotation filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const q = r.quote;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{r.referenceNumber}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {r.status}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NZBN: {r.customerNzbn}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{r.part.quantity}x {r.part.partName}</div>
                        <div className="text-[10px] text-slate-500">{r.vehicle.year} {r.vehicle.make} {r.vehicle.model}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {q ? (
                          <div className="font-bold text-blue-700">{q.quoteNumber}</div>
                        ) : (
                          <span className="text-slate-400 italic">Not issued</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {q ? (
                          <div>
                            <div>${q.totalNzd.toFixed(2)} NZD</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              incl 15% GST (${q.gstAmountNzd.toFixed(2)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal italic">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {q ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              q.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : q.status === "ISSUED"
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {q.status}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            NEEDS QUOTE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {q && q.status === "ISSUED" && (
                            <button
                              type="button"
                              onClick={() => handleManualAccept(r, "AIR_EXPRESS")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition border border-emerald-200"
                              title="Accept quote on behalf of customer (e.g. phoned in approval)"
                            >
                              ✓ Accept (Air)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModal(r)}
                            className="px-2.5 py-1 rounded-lg bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] transition shadow-xs"
                          >
                            {q ? "Revise Quote" : "Prepare Quote"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prepare / Issue Customer Quote Modal */}
      {modalOpen && currentReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-scaleIn text-xs max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2 py-0.2 rounded-full">
                  Customer Landed Pricing
                </span>
                <span className="font-mono font-bold text-slate-500">{currentReq.referenceNumber}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Prepare Official Quotation: {currentReq.part.quantity}x {currentReq.part.partName}
              </h3>
              <p className="text-[11px] text-slate-500">
                Customer: {currentReq.customerName} • Vehicle: {currentReq.vehicle.year} {currentReq.vehicle.make} {currentReq.vehicle.model}
              </p>
            </div>

            <form onSubmit={handleIssueQuoteSubmit} className="space-y-4">
              {/* Supplier Quote Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Select Base Supplier Quote
                </label>
                {currentReq.supplierQuotes.length > 0 ? (
                  <select
                    value={selectedSupplierQuoteId}
                    onChange={(e) => setSelectedSupplierQuoteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                  >
                    {currentReq.supplierQuotes.map((sq) => (
                      <option key={sq.id} value={sq.id}>
                        {sq.supplierName} ({sq.supplierCountry}) — ${sq.partCostNzd.toFixed(2)} NZD ({sq.partCostForeign} {sq.partCostCurrency})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    ⚠️ No supplier quotes captured yet. A default placeholder base cost of $350.00 NZD is being used. You can add actual quotes in Supplier Quotes desk.
                  </div>
                )}
              </div>

              {/* Landed Pricing Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Target Margin (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Margin amount: ${marginAmountNzd.toFixed(2)} NZD
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Procurement Fee ($NZD)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={procurementFee}
                    onChange={(e) => setProcurementFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Handling &amp; document prep
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Quote Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Exchange rate guarantee
                  </span>
                </div>
              </div>

              {/* Freight Options Pricing Grid */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" />
                  <span>Freight Delivery Options Presented to Customer</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900">1. Air Express Priority</span>
                      <span className="text-[10px] text-slate-500 font-semibold">3-5 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Freight Rate: $</span>
                      <input
                        type="number"
                        value={airFreightCost}
                        onChange={(e) => setAirFreightCost(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono font-bold text-xs"
                      />
                    </div>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between font-mono font-bold text-slate-900">
                      <span>Landed Customer Total:</span>
                      <span className="text-blue-700">${airTotal.toFixed(2)} NZD</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-900">2. Ocean Sea Freight</span>
                      <span className="text-[10px] text-slate-500 font-semibold">18-24 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Freight Rate: $</span>
                      <input
                        type="number"
                        value={seaFreightCost}
                        onChange={(e) => setSeaFreightCost(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono font-bold text-xs"
                      />
                    </div>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between font-mono font-bold text-slate-900">
                      <span>Landed Customer Total:</span>
                      <span className="text-cyan-700">${seaTotal.toFixed(2)} NZD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Landed Summary Calculation Breakdown */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Supplier Cost (Landed NZD):</span>
                  <span>${basePartCostNzd.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Margin ({targetMargin}%):</span>
                  <span>+${marginAmountNzd.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Procurement Administrative Handling:</span>
                  <span>+${procurementFee.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Air Express Freight Allocation:</span>
                  <span>+${airFreightCost.toFixed(2)} NZD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Statutory 15% NZ GST:</span>
                  <span>+${airGst.toFixed(2)} NZD</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-emerald-400">
                  <span>Official Total Landed Price (Air Priority):</span>
                  <span>${airTotal.toFixed(2)} NZD</span>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Issue Quote to Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
