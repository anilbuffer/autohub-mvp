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
  Building,
} from "lucide-react";
import {
  getStoredRequests,
  recordManualPayment,
  subscribeToStore,
  getStoredCustomers,
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
    depositDate: "Today • 09:12",
    amountNzd: 485.0,
    payerName: "AutoCare Auckland",
    bankReference: "AH-P-000138 AUTOCARE",
    suggestedRequestId: "REQ-000138",
    matchScore: 100,
  },
  {
    id: "ANZ-DEP-9902",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "Today • 10:45",
    amountNzd: 1450.0,
    payerName: "Waikato Fleet Solutions Ltd",
    bankReference: "WAIKATO REQ-00123",
    suggestedRequestId: "REQ-000123",
    matchScore: 98,
  },
  {
    id: "ANZ-DEP-9903",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "Yesterday • 16:30",
    amountNzd: 650.0,
    payerName: "Apex Dyno & Motorsport",
    bankReference: "APEX REQ-00119 REF",
    suggestedRequestId: "REQ-000119",
    matchScore: 95,
  },
  {
    id: "ANZ-DEP-9904",
    bankAccount: "ANZ NZ 01-0205-0812900-00",
    depositDate: "Yesterday • 11:15",
    amountNzd: 1280.0,
    payerName: "Southern European Workshop",
    bankReference: "SOUTH EURO REQ-124",
    suggestedRequestId: "REQ-000124",
    matchScore: 96,
  },
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
    // Find matching request or fallback
    const matched = requests.find((r) => r.id === deposit.suggestedRequestId || r.referenceNumber === deposit.suggestedRequestId);
    setTargetRequestId(matched ? matched.id : requests[0]?.id || deposit.suggestedRequestId);
  };

  const handleConfirmRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !targetRequestId) return;

    // Call central store method to record manual payment & broadcast live
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
      `Direct bank deposit ${selectedDeposit.id} ($${selectedDeposit.amountNzd.toFixed(2)} NZD) reconciled against ${targetRequestId}! Status updated across all portals in real-time.`
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#ed2025] border border-red-200">
              Finance &amp; Treasury
            </span>
            <span className="text-xs text-slate-500">ANZ NZ Clearing Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#ed2025]" />
            Bank Remittance Verification &amp; Clearing
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Reconcile direct bank deposits, issue NZ IRD tax receipts, and release procurement gate for active customer requests.
          </p>
        </div>

        <button
          onClick={() => setDeposits(MOCK_DEPOSITS)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Reset Demo Remittances
        </button>
      </div>

      {/* Success banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats row (Symmetrical White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Unmatched Deposits</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{deposits.length} Pending</div>
          <div className="text-xs text-slate-400 mt-1">ANZ Account 01-0205-0812900-00</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Pending Value</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ${deposits.reduce((sum, d) => sum + d.amountNzd, 0).toFixed(2)} NZD
          </div>
          <div className="text-xs text-[#ed2025] font-semibold mt-1">Awaiting 1-click clearance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">Clearing Confidence</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">98.4%</div>
          <div className="text-xs text-slate-400 mt-1">Automated reference algorithm</div>
        </div>
      </div>

      {/* Search Bar (Symmetrical White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search remittance deposit, payer, reference, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredDeposits.length}</strong> unmatched bank transfers
        </span>
      </div>

      {/* Deposits Table (Symmetrical White Card) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">Deposit Reference</th>
              <th className="py-3.5 px-4 font-bold">Payer / Customer</th>
              <th className="py-3.5 px-4 font-bold">Statement Reference</th>
              <th className="py-3.5 px-4 font-bold">Suggested Match</th>
              <th className="py-3.5 px-4 font-bold text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDeposits.map((dep) => (
              <tr key={dep.id} className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-4">
                  <div className="font-mono text-xs font-bold text-slate-900">{dep.id}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {dep.depositDate}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="text-xs font-bold text-slate-900">{dep.payerName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{dep.bankAccount}</div>
                </td>

                <td className="py-4 px-4">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                    {dep.bankReference}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#ed2025]">
                      {dep.suggestedRequestId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {dep.matchScore}% Match
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="font-mono text-sm font-black text-slate-900">
                    ${dep.amountNzd.toFixed(2)}
                  </div>
                </td>

                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => openReconciliationModal(dep)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Reconcile</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeposits.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900">All bank deposits reconciled!</p>
            <p className="text-xs text-slate-500 mt-1">No unverified customer remittances in queue.</p>
          </div>
        )}
      </div>

      {/* Symmetrical Reconciliation Modal (Navy / Red Theme) */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn">
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#ed2025] uppercase tracking-wider border border-red-200">
                  Treasury Officer Action
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Reconcile Remittance: {selectedDeposit.id}
                </h3>
                <p className="text-xs text-slate-500">Payer: {selectedDeposit.payerName}</p>
              </div>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRemittance} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Received Amount:</span>
                  <span className="font-mono text-sm font-black text-slate-900">
                    ${selectedDeposit.amountNzd.toFixed(2)} NZD
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Bank Statement Reference:</span>
                  <span className="font-mono text-xs text-slate-800 font-bold">{selectedDeposit.bankReference}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Deposit Timestamp:</span>
                  <span className="text-slate-700">{selectedDeposit.depositDate}</span>
                </div>
              </div>

              {/* Target Request Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Link to Part Request:
                </label>
                <select
                  value={targetRequestId}
                  onChange={(e) => setTargetRequestId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025]"
                >
                  <option value="">Select Part Request</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.referenceNumber || r.id} - {r.customerName} ({r.vehicle.make} {r.vehicle.model}) [Status: {r.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Finance Audit Notes:
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Remittance &amp; Sync Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
