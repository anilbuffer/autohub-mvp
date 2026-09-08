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
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { getStoredRequests, subscribeToStore } from "@/lib/store";
import { PartRequest } from "@/lib/types";

export default function FinanceDashboard() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRequests(getStoredRequests());
    setMounted(true);
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);

  if (!mounted) return null;

  // Calculate some numbers from requests
  const totalInvoiced = requests.reduce((sum, r) => {
    const quote = r.quote;
    return sum + (quote ? quote.totalNzd : (r.invoice?.totalNzd ?? 1450));
  }, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Treasury & Accounts
            </span>
            <span className="text-xs text-slate-500">ANZ Bank Integration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Finance & Remittance Clearing
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage customer payments, match ANZ direct bank deposits, issue IRD-compliant tax invoices, and supervise workshop trade credit limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/finance/payments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            Match Remittances
          </Link>
          <Link
            href="/finance/invoices"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
          >
            <Receipt className="h-4 w-4" />
            View Tax Invoices
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/90 border border-emerald-800/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Gross Monthly Invoiced
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            ${totalInvoiced.toLocaleString("en-NZ", { maximumFractionDigits: 0 })} NZD
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% vs previous month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Remittances
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">$5,420 NZD</div>
          <div className="text-xs text-slate-400 mt-2">3 bank transfers awaiting match</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trade Credit Drawn
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">$42,800 NZD</div>
          <div className="text-xs text-slate-400 mt-2">61% of $70,000 workshop facility</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              NZ GST Liability (15%)
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-teal-300 mt-2">
            ${(totalInvoiced * 0.15).toLocaleString("en-NZ", { maximumFractionDigits: 0 })} NZD
          </div>
          <div className="text-xs text-slate-400 mt-2">IRD GST # 134-582-901</div>
        </div>
      </div>

      {/* Two Columns: Unmatched Bank Remittances & Workshop Trade Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Unmatched Bank Remittance Queue */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-400" />
                ANZ Direct Deposit Remittances Awaiting Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Incoming bank transfers referencing part request numbers.
              </p>
            </div>
            <Link
              href="/finance/payments"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Verify All →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "DEP-8912",
                requestId: "REQ-2024-001",
                customer: "Auckland Euro Ltd",
                amount: 1450.0,
                bankRef: "REQ-2024-001 AKL EURO",
                date: "2024-03-29 09:12",
                matchConfidence: "100% Exact Match",
              },
              {
                id: "DEP-8913",
                requestId: "REQ-2024-003",
                customer: "Waikato Fleet Solutions",
                amount: 2890.0,
                bankRef: "WAIKATO FLEET REQ003",
                date: "2024-03-29 10:45",
                matchConfidence: "98% Match",
              },
              {
                id: "DEP-8914",
                requestId: "REQ-2024-004",
                customer: "Apex Performance & Dyno",
                amount: 1080.0,
                bankRef: "APEX DYNO REQ-004",
                date: "2024-03-28 16:30",
                matchConfidence: "95% Match",
              },
            ].map((dep) => (
              <div
                key={dep.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{dep.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {dep.matchConfidence}
                    </span>
                    <span className="text-xs text-slate-500">{dep.date}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{dep.customer}</div>
                  <div className="text-xs text-slate-400">
                    Bank Ref: <span className="font-mono text-slate-300">{dep.bankRef}</span> • Target:{" "}
                    <span className="font-mono text-emerald-400">{dep.requestId}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-base font-extrabold text-white">
                    ${dep.amount.toFixed(2)} NZD
                  </div>
                  <Link
                    href="/finance/payments"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Verify</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Trade Credit Facility Status */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-400" />
                  Workshop Trade Credit Accounts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Net 20th Month Payment Terms</p>
              </div>
              <Link
                href="/finance/credit"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Manage →
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {[
                { name: "Auckland Euro Ltd", limit: 25000, balance: 14200, status: "Good Standing" },
                { name: "Waikato Fleet Solutions", limit: 20000, balance: 16800, status: "Good Standing" },
                { name: "Southern European Workshop", limit: 15000, balance: 7400, status: "Good Standing" },
                { name: "Apex Performance", limit: 10000, balance: 4400, status: "Under Review" },
              ].map((acc, idx) => {
                const percent = Math.round((acc.balance / acc.limit) * 100);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{acc.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          acc.status === "Good Standing"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Drawn: <strong className="text-white">${acc.balance.toLocaleString()}</strong>
                      </span>
                      <span>Limit: ${acc.limit.toLocaleString()} NZD</span>
                      <span className="text-cyan-400 font-mono">{percent}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 80 ? "bg-amber-400" : "bg-blue-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Automated Statement Generation: 1st of Month
            </span>
            <Link href="/finance/credit" className="text-emerald-400 hover:underline">
              Review Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
