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
  RefreshCw
} from "lucide-react";
import { getStoredTransactions, subscribeToStore } from "@/lib/store";
import { FinancialTransaction } from "@/lib/types";

export default function FinanceTransactionsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const refresh = () => {
    setTransactions(getStoredTransactions());
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
      t.referenceNumber?.toLowerCase().includes(q);

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

  return (
    <div className="space-y-6">
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
            Audit customer card receipts, ANZ direct bank deposits, supplier PO settlements, and freight disbursements.
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
          <div className="text-xs text-slate-400 mt-1 font-medium">Stripe & ANZ bank remittances</div>
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
          <div className="text-xs text-slate-400 mt-1 font-medium">Vendor POs & air cargo freight</div>
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
              <th className="py-3.5 px-4 font-bold">Payment Channel & Ref</th>
              <th className="py-3.5 px-4 font-bold text-center">Type</th>
              <th className="py-3.5 px-4 font-bold text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4 font-bold text-center">Ledger Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-normal">
            {filtered.map((t) => {
              const isInflow = t.amountNzd >= 0;
              return (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0f172a]">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {t.timestamp.replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{t.customerName}</div>
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
                      POSTED
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
