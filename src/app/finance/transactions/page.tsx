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
      t.reference,
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
      t.reference?.toLowerCase().includes(q);

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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              General Ledger
            </span>
            <span className="text-xs text-slate-500">Double-Entry Financial Register</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-400" />
            Financial Transactions Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit customer card receipts, ANZ direct bank deposits, supplier PO settlements, and freight disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Total Inflows (Receipts)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            +${totalInflows.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-slate-500 mt-1">Stripe & ANZ bank remittances</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Supplier Outflows</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2">
            -${totalOutflows.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-slate-500 mt-1">Vendor POs & air cargo freight</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Net Operating Margin</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            +${Math.max(0, totalInflows - totalOutflows).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NZD
          </div>
          <div className="text-xs text-emerald-400 mt-1">Retained trade gross profit</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transaction ID, customer, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "INFLOW", "OUTFLOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === f
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {f === "ALL" ? "All Entries" : f === "INFLOW" ? "Customer Inflows (+)" : "Disbursements (-)"}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
              <th className="py-3.5 px-4 font-semibold">Timestamp</th>
              <th className="py-3.5 px-4 font-semibold">Customer / Counterparty</th>
              <th className="py-3.5 px-4 font-semibold">Payment Channel & Ref</th>
              <th className="py-3.5 px-4 font-semibold text-center">Type</th>
              <th className="py-3.5 px-4 font-semibold text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4 font-semibold text-center">Ledger Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-normal">
            {filtered.map((t) => {
              const isInflow = t.amountNzd >= 0;
              return (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {t.timestamp.replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{t.customerName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {t.reference || "DIRECT-REM"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isInflow
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {isInflow ? "RECEIPT" : "DISBURSEMENT"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={isInflow ? "text-emerald-400" : "text-rose-400"}>
                      {isInflow ? "+" : "-"}${Math.abs(t.amountNzd).toFixed(2)} NZD
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
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
