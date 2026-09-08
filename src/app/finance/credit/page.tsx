"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  ShieldCheck,
  Search,
  CheckCircle2,
  X,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { getStoredCustomers, saveCustomers, subscribeToStore, getStoredRequests } from "@/lib/store";
import { TradeCustomer, PartRequest } from "@/lib/types";

export default function FinanceCreditPage() {
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCust, setSelectedCust] = useState<TradeCustomer | null>(null);

  // Form State for Modal
  const [newCreditLimit, setNewCreditLimit] = useState<number>(25000);
  const [newStatus, setNewStatus] = useState<"APPROVED" | "PENDING_APPROVAL" | "SUSPENDED">("APPROVED");
  const [newTerms, setNewTerms] = useState<"NET_20TH_MONTH" | "STRICT_PREPAYMENT" | "NET_30" | "NET_7_DAYS">("NET_20TH_MONTH");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refresh = () => {
    setCustomers(getStoredCustomers());
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const openAdjustModal = (cust: TradeCustomer) => {
    setSelectedCust(cust);
    setNewCreditLimit(cust.billingDetails?.creditLimitNzd ?? 25000);
    setNewStatus(cust.billingDetails?.status || "APPROVED");
    const terms = (cust.billingDetails?.paymentTerms as any) || "NET_20TH_MONTH";
    setNewTerms(terms);
  };

  const handleSaveCreditTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;

    const currentCusts = getStoredCustomers();
    const updated = currentCusts.map((c) => {
      if (c.id === selectedCust.id) {
        const prevLimit = c.billingDetails?.creditLimitNzd ?? 25000;
        const prevAvail = c.billingDetails?.creditAvailableNzd ?? 18450;
        const currentDrawn = Math.max(0, prevLimit - prevAvail);
        const newAvail = Math.max(0, newCreditLimit - currentDrawn);

        return {
          ...c,
          billingDetails: {
            ...c.billingDetails,
            creditLimitNzd: newCreditLimit,
            creditAvailableNzd: newAvail,
            status: newStatus,
            paymentTerms: newTerms as any,
          },
        };
      }
      return c;
    });

    saveCustomers(updated);
    setSuccessMessage(
      `Credit facility saved for ${selectedCust.tradingName || selectedCust.legalBusinessName}! New limit: $${newCreditLimit.toLocaleString()} NZD.`
    );
    setSelectedCust(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Calculations
  const approvedCustomersCount = customers.filter(
    (c) => c.billingDetails?.status === "APPROVED"
  ).length;

  const totalFacility = customers.reduce(
    (sum, c) => sum + (c.billingDetails?.creditLimitNzd ?? 0),
    0
  );

  const totalDrawn = customers.reduce((sum, c) => {
    const limit = c.billingDetails?.creditLimitNzd ?? 0;
    const avail = c.billingDetails?.creditAvailableNzd ?? limit;
    return sum + Math.max(0, limit - avail);
  }, 0);

  const totalAvailable = Math.max(0, totalFacility - totalDrawn);
  const utilizationPercent = totalFacility > 0 ? ((totalDrawn / totalFacility) * 100).toFixed(1) : "0.0";

  // Pre-Order Clearance Orders filter
  const pendingClearanceOrders = requests.filter(
    (r) =>
      r.status === "AWAITING_PAYMENT" &&
      r.invoice?.paymentMethod === "TRADE_CREDIT"
  );

  // Search filter
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const name = (c.tradingName || c.legalBusinessName || "").toLowerCase();
    const nzbn = (c.nzbn || "").toLowerCase();
    const contact = (c.primaryContact?.name || "").toLowerCase();
    const type = (c.businessType || "").toLowerCase();
    return name.includes(q) || nzbn.includes(q) || contact.includes(q) || type.includes(q);
  });

  const formatBusinessType = (typeStr?: string) => {
    if (!typeStr) return "INDEPENDENT DEALER";
    return typeStr.replace(/_/g, " ").toUpperCase();
  };

  const formatTermsLabel = (terms?: string) => {
    if (terms === "STRICT_PREPAYMENT") return "STRICT PREPAYMENT";
    if (terms === "NET_30") return "NET 30 DAYS";
    if (terms === "NET_7_DAYS") return "NET 7 DAYS";
    return "NET 20TH MONTH";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar Actions & Toast */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER CARD: Corporate Portfolio Health (Dark Navy Container) */}
      <div className="bg-[#0b132a] text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Background glow ambient effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left Title & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-purple-950/90 text-purple-300 border border-purple-700/60 shadow-inner">
                CORPORATE PORTFOLIO HEALTH
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {approvedCustomersCount} Approved Trade Customers
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Total Trade Credit Facility: ${totalFacility.toLocaleString()} NZD
            </h2>

            <div className="flex items-center text-xs font-medium tracking-tight">
              <span className="text-amber-400 font-bold">
                Utilized: ${totalDrawn.toLocaleString()} ({utilizationPercent}%)
              </span>
              <span className="text-slate-500 mx-2 font-bold">•</span>
              <span className="text-emerald-400 font-bold">
                Available: ${totalAvailable.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right Progress Meter */}
          <div className="flex flex-col items-start md:items-end gap-1.5 self-start md:self-auto">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Facility Utilization</span>
              <span className="text-xs font-bold text-emerald-400">{utilizationPercent}%</span>
            </div>
            <div className="w-56 sm:w-64 h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, Number(utilizationPercent)))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE CARD: Pre-Order Release Gate (Trade Credit Validation) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Pre-Order Release Gate (Trade Credit Validation)
              </h3>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Orders placed on trade credit must satisfy 3-point automated risk validation before procurement can place supplier POs.
            </p>
          </div>

          <div className="flex-shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              {pendingClearanceOrders.length} Orders Awaiting Clearance
            </span>
          </div>
        </div>

        {/* Clear Queue State / Awaiting Orders */}
        {pendingClearanceOrders.length === 0 ? (
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center my-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-500 flex items-center justify-center mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-slate-900 font-bold text-base mb-1">
              Credit Validation Queue Clear
            </h4>
            <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
              All trade credit orders have undergone validation. Newly submitted trade requests will appear here automatically for treasury signoff.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClearanceOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ord.referenceNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-xs text-slate-800">
                      {ord.customerName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      Pending Release
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Part: {ord.part.partName} ({ord.part.quantity}x) • Total:{" "}
                    <strong className="text-slate-900">
                      ${ord.invoice?.totalNzd.toFixed(2)} NZD
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Credit Pre-Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CARD: Trade Account Directory & Credit Limits */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        {/* Directory Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Trade Account Directory &amp; Credit Limits
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage facility ceilings, approve pending applications, suspend high-risk accounts, or review payment terms.
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trade client or NZBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-2xs transition"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">TRADE CLIENT</th>
                <th className="py-3.5 px-4">BUSINESS TYPE</th>
                <th className="py-3.5 px-4">CREDIT LIMIT</th>
                <th className="py-3.5 px-4">UTILIZED</th>
                <th className="py-3.5 px-4">AVAILABLE CREDIT</th>
                <th className="py-3.5 px-4">TERMS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No matching trade accounts found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const compName = cust.tradingName || cust.legalBusinessName || "Commercial Workshop";
                  const limit = cust.billingDetails?.creditLimitNzd ?? 0;
                  const available = cust.billingDetails?.creditAvailableNzd ?? limit;
                  const drawn = Math.max(0, limit - available);
                  const status = cust.billingDetails?.status || "APPROVED";
                  const termsStr = formatTermsLabel(cust.billingDetails?.paymentTerms);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                      {/* TRADE CLIENT */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-xs">{compName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          NZBN: {cust.nzbn} • GST: {cust.billingDetails?.gstNumber || "128-492-381"}
                        </div>
                      </td>

                      {/* BUSINESS TYPE */}
                      <td className="py-4 px-4">
                        <span className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                          {formatBusinessType(cust.businessType)}
                        </span>
                      </td>

                      {/* CREDIT LIMIT */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                        ${limit.toLocaleString()}
                      </td>

                      {/* UTILIZED */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                        ${drawn.toLocaleString()}
                      </td>

                      {/* AVAILABLE CREDIT */}
                      <td className="py-4 px-4 font-mono font-bold text-emerald-600 text-xs">
                        ${available.toLocaleString()}
                      </td>

                      {/* TERMS */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase font-mono tracking-tight inline-block">
                          {termsStr}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4">
                        {status === "APPROVED" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-300/80 shadow-2xs inline-block">
                            APPROVED
                          </span>
                        )}
                        {status === "PENDING_APPROVAL" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-300/80 shadow-2xs inline-block">
                            PENDING_APPROVAL
                          </span>
                        )}
                        {status === "SUSPENDED" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300/80 shadow-2xs inline-block">
                            SUSPENDED
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openAdjustModal(cust)}
                          className="bg-[#0b132a] hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs inline-flex items-center gap-1.5 active:scale-[0.98]"
                        >
                          <span>Manage Credit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DIALOG: Credit Facility Review & Settings (Exact Match Image 2) */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            {/* Dark Navy Modal Header */}
            <div className="bg-[#0b132a] text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Credit Facility Review &amp; Settings
                </h3>
                <div className="text-cyan-400 text-xs font-mono font-medium mt-0.5">
                  {selectedCust.tradingName || selectedCust.legalBusinessName} (NZBN: {selectedCust.nzbn})
                </div>
              </div>
              <button
                onClick={() => setSelectedCust(null)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCreditTerms} className="p-6 space-y-5 text-xs text-slate-700">
              {/* Field 1: Credit Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Credit Limit ($NZD): *
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  required
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs"
                />
              </div>

              {/* Field 2: Account Facility Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Account Facility Status: *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs cursor-pointer"
                >
                  <option value="APPROVED">APPROVED — Active facility</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL — Application under review</option>
                  <option value="SUSPENDED">SUSPENDED — Block trade purchases</option>
                </select>
              </div>

              {/* Field 3: Approved Payment Terms */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Approved Payment Terms: *
                </label>
                <select
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-2xs cursor-pointer"
                >
                  <option value="NET_20TH_MONTH">NET 20TH MONTH (Standard NZ Trade)</option>
                  <option value="NET_7_DAYS">NET 7 DAYS (Weekly Settlement)</option>
                  <option value="NET_30">NET 30 DAYS (Monthly Settlement)</option>
                  <option value="STRICT_PREPAYMENT">STRICT PREPAYMENT (No Credit)</option>
                </select>
              </div>

              {/* Footer Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCust(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#ed2025] hover:bg-[#d3181d] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md active:scale-[0.98]"
                >
                  Save Credit Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
