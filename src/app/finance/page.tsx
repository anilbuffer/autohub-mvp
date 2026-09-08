"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  CreditCard,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  Landmark,
  Receipt,
  Scale,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { getStoredRequests, getStoredCustomers, subscribeToStore } from "@/lib/store";
import { PartRequest, TradeCustomer } from "@/lib/types";

export default function FinanceDashboard() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    setRequests(getStoredRequests());
    setCustomers(getStoredCustomers());
  };

  useEffect(() => {
    refresh();
    setMounted(true);
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  if (!mounted) return null;

  // Calculate live financial numbers
  const totalInvoiced = requests.reduce((sum, r) => {
    const quote = r.quote;
    return sum + (quote ? quote.totalNzd : (r.invoice?.totalNzd ?? 1450));
  }, 0);

  const pendingPayments = requests.filter(
    (r) => r.status === "AWAITING_PAYMENT" || r.status === "PAYMENT_DISPUTED"
  );
  const pendingAmount = pendingPayments.reduce((sum, r) => {
    return sum + (r.invoice?.totalNzd || r.quote?.totalNzd || 1450);
  }, 0);

  const totalCreditFacility = customers.reduce(
    (sum, c) => sum + (c.billingDetails?.creditLimitNzd ?? 25000),
    0
  );
  const totalCreditAvailable = customers.reduce(
    (sum, c) => sum + (c.billingDetails?.creditAvailableNzd ?? 15000),
    0
  );
  const totalCreditDrawn = Math.max(0, totalCreditFacility - totalCreditAvailable);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ================= TOP BANNER (SYMMETRIC WITH CUSTOMER PORTAL) ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/60 text-[#ed2025] text-[11px] font-bold tracking-wider uppercase">
            <span>TREASURY &amp; CLEARING DESK</span>
            <span className="text-red-300">•</span>
            <span className="font-mono">ANZ NZ DIRECT INTEGRATION ACTIVE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Finance &amp; Remittance Clearing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Reconcile direct bank deposits, issue IRD-compliant tax invoices, and supervise workshop trade credit facilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            id="dashboard-match-remittances-button"
            href="/finance/payments"
            className="px-5 py-3 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 group"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>MATCH REMITTANCES</span>
          </Link>
          <Link
            href="/finance/invoices"
            className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>Tax Invoices</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 KPI STAT CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Invoiced */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              GROSS INVOICED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ${totalInvoiced.toLocaleString("en-NZ", { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Pending Remittances */}
        <div className={`rounded-2xl p-5 border-2 shadow-sm flex items-start justify-between relative overflow-hidden ${pendingPayments.length > 0 ? "bg-amber-50/40 border-amber-300" : "bg-white border-slate-200/80"
          }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-wider block ${pendingPayments.length > 0 ? "text-amber-900" : "text-slate-500"
                }`}>
                PENDING PAYMENTS
              </span>
              {pendingPayments.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${pendingPayments.length > 0 ? "text-amber-950" : "text-slate-900"
              }`}>
              ${pendingAmount.toLocaleString("en-NZ", { maximumFractionDigits: 0 })}
            </div>
            <span className={`text-[11px] font-semibold block ${pendingPayments.length > 0 ? "text-amber-700" : "text-slate-400"
              }`}>
              {pendingPayments.length} invoices awaiting payment
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingPayments.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Trade Credit Drawn */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              TRADE CREDIT DRAWN
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ${totalCreditDrawn.toLocaleString("en-NZ", { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Facility: ${totalCreditFacility.toLocaleString("en-NZ")} NZD
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: GST Liability (15%) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              NZ GST 15% (IRD)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ${(totalInvoiced * 0.15).toLocaleString("en-NZ", { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              GST # 134-582-901
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ed2025] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= TWO COLUMNS: BANK REMITTANCES & WORKSHOP CREDIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Unmatched Bank Remittance Queue */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[#ed2025]" />
                ANZ Direct Deposit Remittances Awaiting Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming bank transfers matched with parts request references
              </p>
            </div>
            <Link
              href="/finance/payments"
              className="text-xs font-bold text-[#ed2025] hover:text-[#d3181d] flex items-center gap-1"
            >
              Verify All →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "DEP-8912",
                requestId: "REQ-000138",
                customer: "AutoCare Auckland",
                amount: 485.0,
                bankRef: "AH-P-000138 AUTOCARE",
                date: "Today • 09:12",
                matchConfidence: "100% Match",
              },
              {
                id: "DEP-8913",
                requestId: "REQ-000123",
                customer: "Waikato Fleet Solutions",
                amount: 1450.0,
                bankRef: "WAIKATO REQ00123",
                date: "Today • 10:45",
                matchConfidence: "98% Match",
              },
              {
                id: "DEP-8914",
                requestId: "REQ-000119",
                customer: "Apex Performance Dyno",
                amount: 650.0,
                bankRef: "APEX REQ119 REF",
                date: "Yesterday • 16:30",
                matchConfidence: "95% Match",
              },
            ].map((dep) => (
              <div
                key={dep.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{dep.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {dep.matchConfidence}
                    </span>
                    <span className="text-xs text-slate-400">{dep.date}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{dep.customer}</div>
                  <div className="text-xs text-slate-500">
                    Bank Ref: <span className="font-mono text-slate-700">{dep.bankRef}</span> • Target:{" "}
                    <span className="font-mono text-[#ed2025] font-bold">{dep.requestId}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-base font-black text-slate-900">
                    ${dep.amount.toFixed(2)} NZD
                  </div>
                  <Link
                    href="/finance/payments"
                    className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <span>Match</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Trade Credit Facility Status */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Workshop Trade Credit Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Net 20th Month Payment Terms</p>
              </div>
              <Link
                href="/finance/credit"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Manage →
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {[
                { name: "AutoCare Auckland", limit: 25000, balance: 14200, status: "Good Standing" },
                { name: "Waikato Fleet Solutions", limit: 20000, balance: 16800, status: "Good Standing" },
                { name: "Southern European Spares", limit: 15000, balance: 7400, status: "Good Standing" },
                { name: "Apex Performance", limit: 10000, balance: 4400, status: "Under Review" },
              ].map((acc, idx) => {
                const percent = Math.round((acc.balance / acc.limit) * 100);
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{acc.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${acc.status === "Good Standing"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {acc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Drawn: <strong className="text-slate-900">${acc.balance.toLocaleString()}</strong>
                      </span>
                      <span>Limit: ${acc.limit.toLocaleString()} NZD</span>
                      <span className="text-[#ed2025] font-mono font-bold">{percent}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${percent > 80 ? "bg-amber-500" : "bg-[#ed2025]"
                          }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Automated Statement Generation: 1st of Month
            </span>
            <Link href="/finance/credit" className="text-[#ed2025] hover:underline font-bold">
              Review Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
