"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Edit2,
  Lock,
  Unlock,
  RefreshCw,
  X
} from "lucide-react";
import {
  getStoredCustomers,
  saveCustomers,
  subscribeToStore,
  approveCustomerAccount
} from "@/lib/store";
import { TradeCustomer } from "@/lib/types";

export default function FinanceTradeCreditPage() {
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<TradeCustomer | null>(null);
  const [newLimitNzd, setNewLimitNzd] = useState<number>(25000);
  const [creditNotes, setCreditNotes] = useState<string>("Approved for standard workshop trade credit terms.");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refresh = () => {
    setCustomers(getStoredCustomers());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const openAdjustModal = (customer: TradeCustomer) => {
    setSelectedCustomer(customer);
    setNewLimitNzd(customer.billingDetails?.creditLimitNzd ?? 25000);
  };

  const handleUpdateCreditLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Use store function to update credit account
    approveCustomerAccount(selectedCustomer.id, newLimitNzd);

    const compName = selectedCustomer.tradingName || selectedCustomer.legalBusinessName || "Workshop";
    setSuccessMessage(`Credit limit for ${compName} updated to $${newLimitNzd.toLocaleString()} NZD.`);
    setSelectedCustomer(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const toggleAccountLock = (cust: TradeCustomer) => {
    const isApproved = cust.billingDetails?.status === "APPROVED";
    const newStatus = isApproved ? "SUSPENDED" : "APPROVED";
    const updated = customers.map((c) => {
      if (c.id === cust.id) {
        return {
          ...c,
          billingDetails: {
            ...c.billingDetails,
            status: newStatus as any,
          },
        };
      }
      return c;
    });
    saveCustomers(updated);
    const compName = cust.tradingName || cust.legalBusinessName || "Workshop";
    setSuccessMessage(`Account status for ${compName} updated to ${newStatus}.`);
    setTimeout(() => setSuccessMessage(null), 4000);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Commercial Terms
            </span>
            <span className="text-xs text-slate-500">Net 20th Month Facility</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-400" />
            Workshop Trade Credit Facilities
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Approve credit limits, monitor workshop balance drawdowns, and govern Net 20th Month payment terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Accounts
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Facility Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Total Approved Facility</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${totalFacility.toLocaleString()} NZD
          </div>
          <div className="text-xs text-slate-500 mt-1">Across {customers.length} commercial workshops</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Total Drawn Balance</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">
            ${totalDrawn.toLocaleString()} NZD
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Utilization rate: {Math.round((totalDrawn / (totalFacility || 1)) * 100)}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Standard Settlement Terms</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">Net 20th Month</div>
          <div className="text-xs text-slate-500 mt-1">Next statement run: 1st of next month</div>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search workshop name, contact, account ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Account / Workshop</th>
              <th className="py-3.5 px-4 font-semibold">Primary Contact</th>
              <th className="py-3.5 px-4 font-semibold">Approved Limit</th>
              <th className="py-3.5 px-4 font-semibold">Drawn Balance</th>
              <th className="py-3.5 px-4 font-semibold">Available Credit</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-normal">
            {filteredCustomers.map((cust) => {
              const compName = cust.tradingName || cust.legalBusinessName || "Commercial Workshop";
              const limit = cust.billingDetails?.creditLimitNzd ?? 25000;
              const available = cust.billingDetails?.creditAvailableNzd ?? 15000;
              const drawn = Math.max(0, limit - available);
              const percent = Math.round((drawn / (limit || 1)) * 100);
              const isActive = cust.billingDetails?.status === "APPROVED";

              return (
                <tr key={cust.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-white text-sm">{compName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {cust.id}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">{cust.primaryContact?.name || "Account Manager"}</div>
                    <div className="text-[11px] text-slate-500">{cust.primaryContact?.email || "accounts@workshop.co.nz"}</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-white">
                    ${limit.toLocaleString()} NZD
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-mono font-semibold text-blue-400">
                      ${drawn.toLocaleString()} NZD
                    </div>
                    <div className="text-[10px] text-slate-500">{percent}% drawn</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    ${available.toLocaleString()} NZD
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openAdjustModal(cust)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                        Adjust Limit
                      </button>
                      <button
                        onClick={() => toggleAccountLock(cust)}
                        className={`p-1.5 rounded transition ${
                          isActive
                            ? "bg-slate-800 text-slate-400 hover:text-rose-400"
                            : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        }`}
                        title={isActive ? "Suspend Trade Credit" : "Re-activate Trade Credit"}
                      >
                        {isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Credit Limit Adjustment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1624] border border-blue-800/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                  Credit Committee Action
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Adjust Facility Limit
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCustomer.tradingName || selectedCustomer.legalBusinessName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCreditLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Approved Credit Facility (NZD):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={newLimitNzd}
                    onChange={(e) => setNewLimitNzd(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Terms Note / Committee Reason:
                </label>
                <textarea
                  rows={2}
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Authorize Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
