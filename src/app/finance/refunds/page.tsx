"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  DollarSign,
  Receipt,
  Check,
} from "lucide-react";
import {
  getStoredRequests,
  processRefund,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest } from "@/lib/types";

interface RefundRecord {
  id: string;
  requestId: string;
  referenceNumber: string;
  customerName: string;
  amountNzd: number;
  reason: string;
  status: "PENDING_APPROVAL" | "PROCESSED" | "REJECTED";
  requestedDate: string;
  approvedBy?: string;
}

export default function FinanceRefundsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROCESSED">("ALL");

  const [refunds, setRefunds] = useState<RefundRecord[]>([
    {
      id: "REF-2026-119",
      requestId: "REQ-000119",
      referenceNumber: "AH-P-000119",
      customerName: "AutoCare Auckland",
      amountNzd: 650.00,
      reason: "Payment dispute remittance reconciliation & invoice credit adjustment",
      status: "PENDING_APPROVAL",
      requestedDate: "2026-09-06",
    },
    {
      id: "REF-2026-140",
      requestId: "REQ-000140",
      referenceNumber: "AH-P-000140",
      customerName: "AutoCare Auckland",
      amountNzd: 185.00,
      reason: "Freight rebate adjustment for combined terminal dispatch",
      status: "PENDING_APPROVAL",
      requestedDate: "2026-09-07",
    },
    {
      id: "REF-2026-139",
      requestId: "REQ-000139",
      referenceNumber: "AH-P-000139",
      customerName: "AutoCare Auckland",
      amountNzd: 45.00,
      reason: "Supplier trade promotional volume credit refund",
      status: "PROCESSED",
      requestedDate: "2026-09-04",
      approvedBy: "Clara Jenkins (Finance Desk)",
    },
  ]);

  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleApprove = (refId: string) => {
    const target = refunds.find((r) => r.id === refId);
    if (!target) return;

    // Call store helper to sync status and log ledger transaction
    processRefund(
      target.requestId,
      target.amountNzd,
      target.reason,
      "Clara Jenkins (Finance Desk)",
      "AWAITING_PAYMENT"
    );

    setRefunds(
      refunds.map((r) => {
        if (r.id === refId) {
          return {
            ...r,
            status: "PROCESSED",
            approvedBy: "Clara Jenkins (Finance Desk)",
          };
        }
        return r;
      })
    );

    setSuccessNotice(`Refund ${refId} for ${target.referenceNumber} approved. Reversal entry posted to Transaction Ledger & Order updated in real-time.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const filtered = refunds.filter((r) => {
    if (filter === "PENDING" && r.status !== "PENDING_APPROVAL") return false;
    if (filter === "PROCESSED" && r.status !== "PROCESSED") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Treasury Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Refunds &amp; Credit Notes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorize customer credit notes, process bank transfer payment reversals, and post double-entry ledger adjustments.
          </p>
        </div>

        <Link
          href="/finance/transactions"
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>View Ledger Transactions</span>
        </Link>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending Refunds
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            ${refunds.filter((r) => r.status === "PENDING_APPROVAL").reduce((sum, r) => sum + r.amountNzd, 0).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">NZD</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {refunds.filter((r) => r.status === "PENDING_APPROVAL").length} claims awaiting review
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Processed Reversals
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${refunds.filter((r) => r.status === "PROCESSED").reduce((sum, r) => sum + r.amountNzd, 0).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">NZD</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Reconciled to general ledger
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Average Resolution
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            2.4 hrs
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block">
            Within SLA target (&lt; 24 hrs)
          </span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Refund &amp; Credit Note Registry
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(["ALL", "PENDING", "PROCESSED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    filter === tab
                      ? "bg-[#0f172a] text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab === "ALL" && "All"}
                  {tab === "PENDING" && "Pending"}
                  {tab === "PROCESSED" && "Processed"}
                </button>
              ))}
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search refunds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ed2025]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Credit Note #</th>
                <th className="px-5 py-3.5">Customer / Reference</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    {r.id}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{r.customerName}</div>
                    <Link
                      href={`/portal/requests/${r.requestId}`}
                      target="_blank"
                      className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>{r.referenceNumber}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  </td>
                  <td className="px-5 py-4 max-w-xs text-slate-600">
                    {r.reason}
                  </td>
                  <td className="px-5 py-4 font-mono font-black text-slate-900 text-sm">
                    ${r.amountNzd.toFixed(2)} NZD
                  </td>
                  <td className="px-5 py-4">
                    {r.status === "PENDING_APPROVAL" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        PENDING APPROVAL
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        PROCESSED
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {r.status === "PENDING_APPROVAL" ? (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] transition shadow"
                      >
                        Approve &amp; Reverse
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {r.approvedBy || "Approved"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
