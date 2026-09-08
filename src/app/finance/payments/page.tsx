"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Landmark,
  Search,
  Filter,
  ArrowRight,
  Receipt,
  FileCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  Building
} from "lucide-react";
import {
  getStoredRequests,
  recordManualPayment,
  subscribeToStore,
  getStoredCustomers
} from "@/lib/store";
import { PartRequest, TradeCustomer } from "@/lib/types";

interface PendingBankDeposit {
  id: string;
  bankAccount: string;
  depositDate: string;
  amountNzd: number;
  payerName: string;
  bankReference: string;
  suggestedRequestId: string;
  matchScore: number;
}

const MOCK_DEPOSITS: PendingBankDeposit[] = [
  {
    id: "ANZ-DEP-9901",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "2024-03-29 09:12",
    amountNzd: 1450.0,
    payerName: "Auckland Euro Workshop",
    bankReference: "REQ-2024-001 AKLEURO",
    suggestedRequestId: "REQ-2024-001",
    matchScore: 100,
  },
  {
    id: "ANZ-DEP-9902",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "2024-03-29 10:45",
    amountNzd: 2890.0,
    payerName: "Waikato Fleet Solutions Ltd",
    bankReference: "WAIKATO REQ-003",
    suggestedRequestId: "REQ-2024-003",
    matchScore: 98,
  },
  {
    id: "ANZ-DEP-9903",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "2024-03-28 16:30",
    amountNzd: 1080.0,
    payerName: "Apex Dyno & Motorsport",
    bankReference: "APEX REQ-004 REF",
    suggestedRequestId: "REQ-2024-004",
    matchScore: 95,
  },
  {
    id: "ANZ-DEP-9904",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "2024-03-28 11:15",
    amountNzd: 3450.0,
    payerName: "Southern European Workshop",
    bankReference: "SOUTH EURO REQ-002",
    suggestedRequestId: "REQ-2024-002",
    matchScore: 96,
  }
];

export default function FinancePaymentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [deposits, setDeposits] = useState<PendingBankDeposit[]>(MOCK_DEPOSITS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<PendingBankDeposit | null>(null);
  const [targetRequestId, setTargetRequestId] = useState<string>("");
  const [officerNotes, setOfficerNotes] = useState<string>("Remittance confirmed against ANZ clearing statement.");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const openReconciliationModal = (deposit: PendingBankDeposit) => {
    setSelectedDeposit(deposit);
    setTargetRequestId(deposit.suggestedRequestId);
  };

  const handleConfirmRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !targetRequestId) return;

    // Call central store method to record manual payment
    recordManualPayment(
      targetRequestId,
      "BANK_TRANSFER",
      selectedDeposit.amountNzd,
      selectedDeposit.bankReference,
      "Clara Jenkins",
      officerNotes
    );

    // Remove from pending deposits list
    setDeposits((prev) => prev.filter((d) => d.id !== selectedDeposit.id));
    setSuccessNotice(
      `Direct bank deposit ${selectedDeposit.id} ($${selectedDeposit.amountNzd.toFixed(2)} NZD) reconciled against ${targetRequestId}! IRD Tax Receipt generated.`
    );
    setSelectedDeposit(null);
    setTimeout(() => setSuccessNotice(null), 6000);
  };

  const filteredDeposits = deposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.payerName.toLowerCase().includes(q) ||
      d.bankReference.toLowerCase().includes(q) ||
      d.suggestedRequestId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Finance & Treasury
            </span>
            <span className="text-xs text-slate-500">ANZ NZ Clearing Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            Bank Remittance Verification & Clearing
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Reconcile direct bank deposits, issue NZ IRD tax receipts, and unlock procurement dispatch for pending customer requests.
          </p>
        </div>

        <button
          onClick={() => setDeposits(MOCK_DEPOSITS)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Demo Remittances
        </button>
      </div>

      {/* Success banner */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Unmatched Deposits</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{deposits.length} Pending</div>
          <div className="text-xs text-slate-500 mt-1">ANZ Account 01-0205-0812900-00</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Pending Value</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${deposits.reduce((sum, d) => sum + d.amountNzd, 0).toFixed(2)} NZD
          </div>
          <div className="text-xs text-emerald-400 mt-1">Awaiting 1-click confirmation</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Clearing Confidence</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">98.4%</div>
          <div className="text-xs text-slate-500 mt-1">Exact reference matching algorithm</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search remittance deposit, payer, reference, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong>{filteredDeposits.length}</strong> unmatched bank transfers
        </span>
      </div>

      {/* Deposits Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Deposit Reference</th>
              <th className="py-3.5 px-4 font-semibold">Payer / Customer</th>
              <th className="py-3.5 px-4 font-semibold">Statement Reference</th>
              <th className="py-3.5 px-4 font-semibold">Suggested Match</th>
              <th className="py-3.5 px-4 font-semibold text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredDeposits.map((dep) => (
              <tr key={dep.id} className="hover:bg-slate-800/30 transition">
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-bold text-white">{dep.id}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {dep.depositDate}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="text-xs font-semibold text-white">{dep.payerName}</div>
                  <div className="text-[11px] text-slate-500">{dep.bankAccount}</div>
                </td>

                <td className="py-4 px-4">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                    {dep.bankReference}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {dep.suggestedRequestId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {dep.matchScore}% Match
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="font-mono text-sm font-extrabold text-white">
                    ${dep.amountNzd.toFixed(2)}
                  </div>
                </td>

                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => openReconciliationModal(dep)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Reconcile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeposits.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">All bank deposits reconciled!</p>
            <p className="text-xs text-slate-500 mt-1">No unverified customer remittances in queue.</p>
          </div>
        )}
      </div>

      {/* Interactive Reconciliation Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#091714] border border-emerald-800/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  Treasury Officer Action
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Reconcile Remittance: {selectedDeposit.id}
                </h2>
                <p className="text-xs text-slate-400">Payer: {selectedDeposit.payerName}</p>
              </div>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRemittance} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Received Amount:</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    ${selectedDeposit.amountNzd.toFixed(2)} NZD
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Bank Statement Reference:</span>
                  <span className="font-mono text-xs text-slate-200">{selectedDeposit.bankReference}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Deposit Timestamp:</span>
                  <span className="text-slate-300">{selectedDeposit.depositDate}</span>
                </div>
              </div>

              {/* Target Request Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Link to Part Request ID:
                </label>
                <select
                  value={targetRequestId}
                  onChange={(e) => setTargetRequestId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Part Request</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.customerName} ({r.vehicle.make} {r.vehicle.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Finance Audit Notes:
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Remittance & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
