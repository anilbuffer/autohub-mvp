"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plane,
  Anchor,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  MessageSquare,
  BadgePercent,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  getStoredRequests,
  acceptCustomerQuote,
  rejectCustomerQuote,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, FreightOption, FreightMethod } from "@/lib/types";

export default function CustomerQuotesPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTION_REQUIRED" | "ACCEPTED" | "EXPIRED">("ALL");
  const [selectedFreightMethod, setSelectedFreightMethod] = useState<{ [reqId: string]: FreightMethod }>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const refresh = () => {
    const all = getStoredRequests();
    setRequests(all);
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Filter requests that have quotes
  const quoteRequests = requests.filter((r) => r.quote);

  const filtered = quoteRequests.filter((r) => {
    if (filter === "ACTION_REQUIRED" && r.status !== "AWAITING_CUSTOMER_APPROVAL" && r.status !== "QUOTE_PREPARED") return false;
    if (filter === "ACCEPTED" && r.status !== "PAYMENT_CONFIRMED" && r.status !== "AWAITING_PAYMENT" && r.quote?.status !== "ACCEPTED") return false;
    if (filter === "EXPIRED" && r.status !== "CANCELLED") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.part.partName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAccept = (req: PartRequest) => {
    if (!req.quote) return;
    const method: FreightMethod = selectedFreightMethod[req.id] || "AIR_EXPRESS";
    acceptCustomerQuote(req.id, method, req.customerName);
    setActionSuccess(`Quote for ${req.referenceNumber} has been accepted. Payment request generated.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (req: PartRequest) => {
    rejectCustomerQuote(req.id, "Customer requested cancellation from portal", req.customerName);
    setActionSuccess(`Quote for ${req.referenceNumber} has been declined.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Quotations Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Customer Quotes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review landed international quotes, select preferred air or sea freight options, and authorize procurement.
          </p>
        </div>

        <Link
          href="/portal/new-request"
          className="px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-950/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>New Part Request</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "ACTION_REQUIRED", "ACCEPTED", "EXPIRED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab
                  ? "bg-[#0f172a] text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "ALL" && "All Quotes"}
              {tab === "ACTION_REQUIRED" && "Action Required"}
              {tab === "ACCEPTED" && "Accepted"}
              {tab === "EXPIRED" && "Archived"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotes, VIN, parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ed2025]"
          />
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
            <BadgePercent className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No quotes match your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When our procurement specialists finalize international sourcing and freight estimates, your quotes will appear here for review.
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const q = req.quote!;
            const airOption = q.freightOptions.find((f) => f.method === "AIR_EXPRESS" || f.method === "AIR");
            const seaOption = q.freightOptions.find((f) => f.method === "SEA_FREIGHT" || f.method === "SEA");
            const activeFreight: FreightMethod = selectedFreightMethod[req.id] || "AIR_EXPRESS";
            const currentFreight = (activeFreight === "AIR_EXPRESS" || activeFreight === "AIR") ? airOption : (seaOption || airOption);

            const calcTotal = (opt?: FreightOption) => {
              if (!opt) return q.totalNzd;
              if (opt.totalNzd) return opt.totalNzd;
              const subtotal = q.basePartCostNzd + q.marginAmountNzd + q.procurementFeeNzd + (opt.costNzd ?? opt.freightCostNzd ?? 0);
              return subtotal * 1.15;
            };

            const airTotal = calcTotal(airOption);
            const seaTotal = calcTotal(seaOption);
            const currentTotal = calcTotal(currentFreight);

            const isActionable = req.status === "AWAITING_CUSTOMER_APPROVAL" || req.status === "QUOTE_PREPARED";

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 transition hover:border-slate-300"
              >
                {/* Quote Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#ed2025]">
                        {req.referenceNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        Quote #{q.id}
                      </span>
                      {isActionable ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Awaiting Your Approval
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {req.status}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {req.part.partName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {req.vehicle.year} {req.vehicle.make} {req.vehicle.model} • VIN: {req.vehicle.vin}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Total Landed (inc. GST)
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      ${currentTotal.toFixed(2)}
                      <span className="text-xs font-normal text-slate-400 font-sans ml-1">NZD</span>
                    </div>
                  </div>
                </div>

                {/* Freight Selection Options */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Select Delivery Freight Method:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {airOption && (
                      <div
                        onClick={() =>
                          setSelectedFreightMethod({ ...selectedFreightMethod, [req.id]: "AIR_EXPRESS" })
                        }
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                          (activeFreight === "AIR_EXPRESS" || activeFreight === "AIR")
                            ? "border-[#ed2025] bg-red-50/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            (activeFreight === "AIR_EXPRESS" || activeFreight === "AIR") ? "bg-red-50 text-[#ed2025]" : "bg-slate-100 text-slate-500"
                          }`}>
                            <Plane className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>Air Express Priority</span>
                              <span className="text-[10px] font-medium text-slate-500">
                                ({airOption.estimatedTransitDays || airOption.estimatedDays || "3-5 business days"})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Freight: ${airOption.costNzd ?? airOption.freightCostNzd ?? 0} NZD
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900">
                            ${airTotal.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-400">Total Landed</span>
                        </div>
                      </div>
                    )}

                    {seaOption && (
                      <div
                        onClick={() =>
                          setSelectedFreightMethod({ ...selectedFreightMethod, [req.id]: "SEA_FREIGHT" })
                        }
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                          (activeFreight === "SEA_FREIGHT" || activeFreight === "SEA")
                            ? "border-[#ed2025] bg-red-50/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            (activeFreight === "SEA_FREIGHT" || activeFreight === "SEA") ? "bg-red-50 text-[#ed2025]" : "bg-slate-100 text-slate-500"
                          }`}>
                            <Anchor className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>Ocean Sea Freight</span>
                              <span className="text-[10px] font-medium text-slate-500">
                                ({seaOption.estimatedTransitDays || seaOption.estimatedDays || "18-24 business days"})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Freight: ${seaOption.costNzd ?? seaOption.freightCostNzd ?? 0} NZD
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900">
                            ${seaTotal.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-400">Total Landed</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Valid through {q.validUntil || (q.expiresAt ? new Date(q.expiresAt).toLocaleDateString("en-NZ") : "14 Days")}
                    </span>
                    <Link
                      href={`/portal/messages?req=${req.id}`}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Request Info / Inquire
                    </Link>
                  </div>

                  {isActionable ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(req)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                      >
                        Decline Quote
                      </button>
                      <button
                        onClick={() => handleAccept(req)}
                        className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold transition shadow-md shadow-red-950/20 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept &amp; Proceed to Payment</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/portal/requests/${req.id}`}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>View Request Tracker</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
