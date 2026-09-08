"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  X,
  Edit2,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";
import { getStoredCustomers, saveCustomers, subscribeToStore } from "@/lib/store";
import { TradeCustomer } from "@/lib/types";

export default function FinanceCreditPage() {
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCust, setSelectedCust] = useState<TradeCustomer | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState<number>(25000);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refresh = () => {
    setCustomers(getStoredCustomers());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const openAdjustModal = (cust: TradeCustomer) => {
    setSelectedCust(cust);
    setNewCreditLimit(cust.billingDetails?.creditLimitNzd ?? 25000);
    setNewStatus(cust.billingDetails?.status === "APPROVED" ? "ACTIVE" : "SUSPENDED");
  };

  const handleSaveCreditTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;

    const currentCusts = getStoredCustomers();
    const updated = currentCusts.map((c) => {
      if (c.id === selectedCust.id) {
        const drawn = (c.billingDetails?.creditLimitNzd ?? 25000) - (c.billingDetails?.creditAvailableNzd ?? 15000);
        return {
          ...c,
          billingDetails: {
            ...c.billingDetails,
            creditLimitNzd: newCreditLimit,
            creditAvailableNzd: Math.max(0, newCreditLimit - drawn),
            status: newStatus === "ACTIVE" ? ("APPROVED" as const) : ("SUSPENDED" as const),
          },
        };
      }
      return c;
    });

    saveCustomers(updated);
    setSuccessMessage(`Credit terms updated for ${selectedCust.tradingName || selectedCust.legalBusinessName || "Workshop"}! Limit: $${newCreditLimit.toLocaleString()} NZD.`);
    setSelectedCust(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const name = (c.tradingName || c.legalBusinessName || "").toLowerCase();
    const contact = (c.primaryContact?.name || "").toLowerCase();
    const id = (c.id || "").toLowerCase();
    return name.includes(q) || contact.includes(q) || id.includes(q);
  });

  const totalFacility = customers.reduce((sum, c) => sum + (c.billingDetails?.creditLimitNzd ?? 25000), 0);
  const totalDrawn = customers.reduce(
    (sum, c) =>
      sum +
      Math.max(
        0,
        (c.billingDetails?.creditLimitNzd ?? 25000) - (c.billingDetails?.creditAvailableNzd ?? 15000)
      ),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#ed2025] border border-red-200">
              Commercial Credit Terms
            </span>
            <span className="text-xs text-slate-500">Net 20th Month Facility</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-[#ed2025]" />
            Workshop Trade Credit Facilities
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Approve credit limits, monitor workshop balance drawdowns, and govern Net 20th Month payment terms.
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Facility Overview Cards (Symmetrical White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Total Approved Facility</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ${totalFacility.toLocaleString()} NZD
          </div>
          <div className="text-xs text-slate-400 mt-1">Across {customers.length} commercial workshops</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Total Drawn Balance</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
            ${totalDrawn.toLocaleString()} NZD
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Utilization rate: {Math.round((totalDrawn / (totalFacility || 1)) * 100)}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Standard Settlement Terms</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">Net 20th Month</div>
          <div className="text-xs text-slate-400 mt-1">Automatic statement run on 1st of month</div>
        </div>
      </div>

      {/* Search Bar (Symmetrical White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search workshop name, contact, account ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          <strong>{filteredCustomers.length}</strong> registered workshops
        </span>
      </div>

      {/* Table (Symmetrical White Card) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">Account / Workshop</th>
              <th className="py-3.5 px-4 font-bold">Primary Contact</th>
              <th className="py-3.5 px-4 font-bold">Approved Limit</th>
              <th className="py-3.5 px-4 font-bold">Drawn Balance</th>
              <th className="py-3.5 px-4 font-bold">Available Credit</th>
              <th className="py-3.5 px-4 font-bold text-center">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCustomers.map((cust) => {
              const compName = cust.tradingName || cust.legalBusinessName || "Commercial Workshop";
              const limit = cust.billingDetails?.creditLimitNzd ?? 25000;
              const available = cust.billingDetails?.creditAvailableNzd ?? 15000;
              const drawn = Math.max(0, limit - available);
              const percent = Math.round((drawn / (limit || 1)) * 100);
              const isActive = cust.billingDetails?.status === "APPROVED";

              return (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-xs">{compName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {cust.id}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-slate-800 font-medium">{cust.primaryContact?.name || "Accounts Dept"}</div>
                    <div className="text-[11px] text-slate-500">{cust.primaryContact?.email || "accounts@workshop.co.nz"}</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    ${limit.toLocaleString()} NZD
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-blue-700">
                      ${drawn.toLocaleString()} NZD
                    </div>
                    <div className="text-[10px] text-slate-500">{percent}% drawn</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-black text-emerald-700">
                    ${available.toLocaleString()} NZD
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => openAdjustModal(cust)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition inline-flex items-center gap-1 shadow-xs ml-auto"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-[#ed2025]" />
                      <span>Adjust Terms</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Symmetrical Adjust Credit Terms Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn">
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#ed2025] uppercase tracking-wider border border-red-200">
                  Credit Risk Governance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Adjust Terms: {selectedCust.tradingName || selectedCust.legalBusinessName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCust(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreditTerms} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approved Credit Limit (NZD $):
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Standing:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatus("ACTIVE")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      newStatus === "ACTIVE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <Unlock className="h-4 w-4 text-emerald-600" />
                    <span>Active Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus("SUSPENDED")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      newStatus === "SUSPENDED"
                        ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <Lock className="h-4 w-4 text-rose-600" />
                    <span>Suspended</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCust(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition"
                >
                  Save Credit Terms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
