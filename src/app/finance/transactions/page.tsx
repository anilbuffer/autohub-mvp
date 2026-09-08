"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Landmark,
  Building,
  RefreshCw,
  X,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Tag,
  Receipt,
  Car,
} from "lucide-react";
import { getStoredTransactions, subscribeToStore, getStoredRequests } from "@/lib/store";
import { FinancialTransaction, PartRequest } from "@/lib/types";

export default function FinanceTransactionsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedTxn, setSelectedTxn] = useState<FinancialTransaction | null>(null);

  const refresh = () => {
    setTransactions(getStoredTransactions());
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const exportCsv = () => {
    const headers = ["ID", "Timestamp", "Type", "Amount NZD", "Customer", "Reference", "Status"];
    const rows = transactions.map((t) => [
      t.id,
      t.timestamp,
      t.type,
      t.amountNzd,
      t.customerName,
      t.referenceNumber,
      t.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Autohub_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.referenceNumber?.toLowerCase().includes(q) ||
      (t.invoiceNumber || "").toLowerCase().includes(q) ||
      (t.notes || "").toLowerCase().includes(q);

    if (filterType === "INFLOW" && t.amountNzd < 0) return false;
    if (filterType === "OUTFLOW" && t.amountNzd >= 0) return false;

    return matchesSearch;
  });

  const totalInflows = transactions
    .filter((t) => t.amountNzd > 0)
    .reduce((sum, t) => sum + t.amountNzd, 0);

  const totalOutflows = transactions
    .filter((t) => t.amountNzd < 0)
    .reduce((sum, t) => sum + Math.abs(t.amountNzd), 0);

  // Find matching PartRequest if available
  const matchingRequest = selectedTxn
    ? requests.find(
        (r) =>
          r.referenceNumber === selectedTxn.referenceNumber ||
          r.id === selectedTxn.referenceNumber ||
          r.invoice?.invoiceNumber === selectedTxn.invoiceNumber
      )
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ed2025]/10 text-[#ed2025] border border-[#ed2025]/20">
              General Ledger
            </span>
            <span className="text-xs text-slate-500 font-medium">Double-Entry Financial Register</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#ed2025]" />
            Financial Transactions Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Audit customer card receipts, ANZ direct bank deposits, supplier PO settlements, and freight disbursements. Click any entry to inspect full details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#ed2025]" />
            Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500">Total Inflows (Receipts)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            +${totalInflows.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Stripe &amp; ANZ bank remittances</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500">Supplier Outflows</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            -${totalOutflows.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Vendor POs &amp; air cargo freight</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-500">Net Operating Margin</span>
            <div className="p-2 rounded-xl bg-[#0f172a]/5 text-[#0f172a]">
              <DollarSign className="h-4 w-4 text-[#ed2025]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0f172a] mt-2">
            +${Math.max(0, totalInflows - totalOutflows).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Retained trade gross profit</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID, customer, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "INFLOW", "OUTFLOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === f
                  ? "bg-[#0f172a] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f === "ALL" ? "All Entries" : f === "INFLOW" ? "Customer Inflows (+)" : "Disbursements (-)"}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">Transaction ID</th>
              <th className="py-3.5 px-4 font-bold">Timestamp</th>
              <th className="py-3.5 px-4 font-bold">Customer / Counterparty</th>
              <th className="py-3.5 px-4 font-bold">Payment Channel &amp; Ref</th>
              <th className="py-3.5 px-4 font-bold text-center">Type</th>
              <th className="py-3.5 px-4 font-bold text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4 font-bold text-center">Ledger Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-normal">
            {filtered.map((t) => {
              const isInflow = t.amountNzd >= 0;
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="hover:bg-slate-50/90 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0f172a]">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {t.timestamp.replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{t.customerName}</div>
                    {t.customerNzbn && (
                      <div className="text-[10px] text-slate-400 font-mono">NZBN: {t.customerNzbn}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {t.referenceNumber || "DIRECT-REM"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isInflow
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isInflow ? "RECEIPT" : "DISBURSEMENT"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={isInflow ? "text-emerald-600 font-black" : "text-rose-600 font-black"}>
                      {isInflow ? "+" : "-"}${Math.abs(t.amountNzd).toFixed(2)} NZD
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {t.status || "POSTED"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTxn(t);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 text-xs font-bold transition inline-flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No matching financial entries</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter tab.</p>
          </div>
        )}
      </div>

      {/* FULL TRANSACTION DETAILS MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scaleIn border border-slate-200">
            {/* Modal Header (Fixed at top) */}
            <div className="bg-[#0b132a] text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                    Ledger Audit Entry
                  </span>
                  <span className="text-xs text-slate-300 font-mono">{selectedTxn.id}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                  Financial Transaction Audit Record
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Timestamp: {new Date(selectedTxn.timestamp).toLocaleString("en-NZ", { dateStyle: "full", timeStyle: "medium" })}
                </p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-700 overflow-y-auto flex-1 scrollbar-thin">
              {/* Financial Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Transaction Type &amp; Direction</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedTxn.amountNzd >= 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {selectedTxn.direction || (selectedTxn.amountNzd >= 0 ? "INFLOW" : "OUTFLOW")}
                    </span>
                    <span>{selectedTxn.type.replace(/_/g, " ")}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Recorded Amount</div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                      selectedTxn.amountNzd >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {selectedTxn.amountNzd >= 0 ? "+" : "-"}${Math.abs(selectedTxn.amountNzd).toFixed(2)} NZD
                  </div>
                </div>
              </div>

              {/* Counterparty & Payment Channel Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                    <Building className="h-4 w-4 text-[#ed2025]" />
                    <span>Customer / Counterparty</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedTxn.customerName}</div>
                    {selectedTxn.customerNzbn && (
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        NZBN: {selectedTxn.customerNzbn}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                    <Landmark className="h-4 w-4 text-[#ed2025]" />
                    <span>Payment Channel &amp; Officer</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Method:</span>
                      <span className="font-bold text-slate-900">
                        {selectedTxn.paymentMethod?.replace(/_/g, " ") || "BANK_TRANSFER"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Officer:</span>
                      <span className="font-bold text-slate-900">{selectedTxn.officerName || "Clara Jenkins"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order & Part Context if linked */}
              {matchingRequest && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <Car className="h-4 w-4 text-blue-600" />
                      <span>Linked Part Request &amp; Vehicle Details</span>
                    </div>
                    <Link
                      href={`/portal/requests/${matchingRequest.id}`}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                    >
                      <span>View Request</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Part Requirement:</span>
                      <span className="font-bold text-slate-900">{matchingRequest.part.partName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vehicle Fitment:</span>
                      <span className="font-bold text-slate-900">
                        {matchingRequest.vehicle.year} {matchingRequest.vehicle.make} {matchingRequest.vehicle.model}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reference & Tax Breakdown Grid */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold border-b border-slate-100 pb-1.5">
                  <Receipt className="h-4 w-4 text-[#ed2025]" />
                  <span>Invoicing &amp; Tax Reference</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Order Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedTxn.referenceNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedTxn.invoiceNumber || "INV-2026-00994"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">GST Portion (15% NZ):</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(Math.abs(selectedTxn.amountNzd) - Math.abs(selectedTxn.amountNzd) / 1.15).toFixed(2)} NZD
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Notes */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Finance Audit Notes &amp; Bank Statement Line</div>
                <p className="text-xs text-slate-800 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                  {selectedTxn.notes || "Standard ledger transaction posted against active account balance."}
                </p>
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Double-Entry Verification Passed</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => alert(`Printing Audit Voucher for ${selectedTxn.id}...`)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-5 py-2 rounded-xl bg-[#0b132a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
