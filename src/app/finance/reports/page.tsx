"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  PieChart,
  Percent,
  Receipt,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { getStoredRequests, getStoredTransactions, subscribeToStore } from "@/lib/store";
import { PartRequest, FinancialTransaction } from "@/lib/types";

export default function FinancialReportsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [reportPeriod, setReportPeriod] = useState<"Q1_2026" | "CURRENT_MONTH" | "YTD">("CURRENT_MONTH");

  const refresh = () => {
    setRequests(getStoredRequests());
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Compute financial metrics
  const invoicedRequests = requests.filter((r) => r.invoice);
  const totalRevenueNzd = invoicedRequests.reduce((sum, r) => sum + (r.invoice?.totalNzd || 0), 0);
  const totalGstLiabilityNzd = invoicedRequests.reduce((sum, r) => sum + (r.invoice?.gstAmountNzd ?? r.invoice?.gstNzd ?? 0), 0);
  const totalNetTurnoverNzd = totalRevenueNzd - totalGstLiabilityNzd;
  const estimatedCostOfGoods = totalNetTurnoverNzd * 0.72; // baseline supplier import cost
  const grossProfitNzd = totalNetTurnoverNzd - estimatedCostOfGoods;
  const averageMarginPercent = totalNetTurnoverNzd > 0 ? (grossProfitNzd / totalNetTurnoverNzd) * 100 : 25;

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
            Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sourcing margin realization reports, New Zealand Inland Revenue (IRD) GST 15% settlement, and trade credit exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Gross Invoiced Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${totalRevenueNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 block">Total customer landed invoicing</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Realized Gross Margin
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-1">
            <span>{averageMarginPercent.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-slate-500 block">
            ${grossProfitNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} gross profit
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            NZ IRD GST Collected
          </span>
          <div className="text-2xl font-black text-blue-600 font-mono">
            ${totalGstLiabilityNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 block">Statutory 15% GST output liability</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Net Sourcing Surplus
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(grossProfitNzd * 0.88).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 block">After freight &amp; banking fees</span>
        </div>
      </div>

      {/* Margin Realization by Request */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Margin Realization by Parts Request
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {invoicedRequests.length} completed customer billings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Reference #</th>
                <th className="px-5 py-3.5">Customer &amp; Vehicle</th>
                <th className="px-5 py-3.5">Part Description</th>
                <th className="px-5 py-3.5">Landed Cost (NZD)</th>
                <th className="px-5 py-3.5">Invoiced (inc. GST)</th>
                <th className="px-5 py-3.5">Gross Margin</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoicedRequests.map((r) => {
                const inv = r.invoice!;
                const landedEst = inv.subtotalNzd * 0.75;
                const profit = inv.subtotalNzd - landedEst;
                const margin = (profit / inv.subtotalNzd) * 100;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {r.referenceNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{r.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {r.part.partName}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      ${landedEst.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      ${inv.totalNzd.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-emerald-600">
                      +{margin.toFixed(1)}% (${profit.toFixed(2)})
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AR Aging & GST Settlement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NZ IRD GST Settlement Summary */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Receipt className="w-4 h-4 text-[#ed2025]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              NZ Inland Revenue (IRD) GST 15% Ledger
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Total Output GST (15% Sales Tax Invoiced):</span>
              <span className="font-mono font-bold text-slate-900">${totalGstLiabilityNzd.toFixed(2)} NZD</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Input GST Credits (Import Clearance &amp; Freight):</span>
              <span className="font-mono font-bold text-emerald-600">-${(totalGstLiabilityNzd * 0.65).toFixed(2)} NZD</span>
            </div>

            <div className="flex justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl font-bold">
              <span className="text-slate-900">Net GST Settlement Payable to IRD:</span>
              <span className="font-mono text-[#ed2025]">${(totalGstLiabilityNzd * 0.35).toFixed(2)} NZD</span>
            </div>
          </div>
        </div>

        {/* Accounts Receivable Aging */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Trade Credit Accounts Receivable Aging
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Current (0-30 Days)</span>
              <span className="font-mono font-black text-slate-900 text-base">$42,390 NZD</span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">88.5% of ledger</span>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl">
              <span className="text-[10px] text-blue-800 font-bold uppercase block">31-60 Days</span>
              <span className="font-mono font-black text-slate-900 text-base">$4,850 NZD</span>
              <span className="text-[10px] text-blue-700 block mt-0.5">Net 20th terms</span>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">61-90 Days</span>
              <span className="font-mono font-black text-slate-900 text-base">$640 NZD</span>
              <span className="text-[10px] text-amber-700 block mt-0.5">Follow-up notice sent</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">90+ Days (Default)</span>
              <span className="font-mono font-black text-slate-900 text-base">$0.00 NZD</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Zero bad debt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
