"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Clock,
  ChevronRight,
  Truck,
  Sparkles,
  Info
} from "lucide-react";
import { getStoredRequests, subscribeToStore } from "@/lib/store";
import { PartRequest } from "@/lib/types";

interface SourcingException {
  id: string;
  requestId: string;
  partNumber: string;
  partDescription: string;
  customerName: string;
  supplierName: string;
  country: string;
  type: "SUPERSEDED" | "BACKORDER" | "PRICE_VARIANCE" | "OBSOLETE";
  severity: "HIGH" | "MEDIUM" | "LOW";
  details: string;
  resolutionOptions: string[];
  status: "OPEN" | "RESOLVED" | "CUSTOMER_REVIEW";
  createdAt: string;
}

const INITIAL_EXCEPTIONS: SourcingException[] = [
  {
    id: "EXC-101",
    requestId: "REQ-2024-001",
    partNumber: "13568-19195",
    partDescription: "Timing Belt Kit OEM Toyota",
    customerName: "Auckland Euro Ltd",
    supplierName: "Tokyo Parts Direct",
    country: "JP",
    type: "SUPERSEDED",
    severity: "MEDIUM",
    details: "OEM Part 13568-19195 superseded by Toyota Global to 13568-19205. Includes upgraded Kevlar tensile cord.",
    resolutionOptions: ["Adopt Superseded Part #13568-19205", "Request Stock Check on Legacy #", "Contact Account Manager"],
    status: "OPEN",
    createdAt: "2024-03-29 09:15"
  },
  {
    id: "EXC-102",
    requestId: "REQ-2024-002",
    partNumber: "06A145704T",
    partDescription: "BorgWarner K03 Turbocharger Core",
    customerName: "Southern European Workshop",
    supplierName: "Bavaria Auto Spares",
    country: "DE",
    type: "PRICE_VARIANCE",
    severity: "HIGH",
    details: "Supplier revised quote from €720 to €840 due to raw material surcharge. Exceeds customer preliminary budget by 16.7%.",
    resolutionOptions: ["Absorb Variance via Margin", "Issue Revised Quote to Customer", "Check Alternate Supplier (US Hub)"],
    status: "CUSTOMER_REVIEW",
    createdAt: "2024-03-29 08:30"
  },
  {
    id: "EXC-103",
    requestId: "REQ-2024-004",
    partNumber: "48815-30580",
    partDescription: "Front Stabilizer Bar Bushing Set",
    customerName: "Waikato Fleet Solutions",
    supplierName: "Yokohama Logistics Center",
    country: "JP",
    type: "BACKORDER",
    severity: "MEDIUM",
    details: "Supplier reported 14-day production delay at factory. Estimated export date delayed from 02 Apr to 16 Apr.",
    resolutionOptions: ["Expedite via Air Freight (Tokyo Hub)", "Approve 14-day delay", "Source OEM equivalent aftermarket"],
    status: "OPEN",
    createdAt: "2024-03-28 16:45"
  },
  {
    id: "EXC-104",
    requestId: "REQ-2024-005",
    partNumber: "22030-0P010",
    partDescription: "Electronic Throttle Body Assembly",
    customerName: "Apex Performance & Dyno",
    supplierName: "Nagoya Auto Parts",
    country: "JP",
    type: "OBSOLETE",
    severity: "HIGH",
    details: "Factory discontinued production of genuine assembly. Only remanufactured units or Denso aftermarket available.",
    resolutionOptions: ["Offer Denso Remanufactured Unit", "Query US Depot for NOS (New Old Stock)", "Cancel Part Request"],
    status: "OPEN",
    createdAt: "2024-03-28 11:20"
  }
];

export default function ProcurementExceptionsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  useEffect(() => {
    setRequests(getStoredRequests());
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);
  const [exceptions, setExceptions] = useState<SourcingException[]>(INITIAL_EXCEPTIONS);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [activeResolution, setActiveResolution] = useState<{ id: string; option: string } | null>(null);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  const filteredExceptions = exceptions.filter((exc) => {
    if (filterType !== "ALL" && exc.type !== filterType) return false;
    if (filterStatus !== "ALL" && exc.status !== filterStatus) return false;
    return true;
  });

  const handleApplyResolution = (exceptionId: string, chosenOption: string) => {
    setExceptions((prev) =>
      prev.map((exc) =>
        exc.id === exceptionId
          ? { ...exc, status: "RESOLVED" }
          : exc
      )
    );
    setResolutionSuccess(`Exception ${exceptionId} resolved: ${chosenOption}`);
    setActiveResolution(null);
    setTimeout(() => setResolutionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Procurement Desk
            </span>
            <span className="text-xs text-slate-500">Sourcing Incident Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            Sourcing Exceptions & Supersessions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage backorders, discontinued parts, superseded OEM part numbers, and supplier price variances before dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExceptions(INITIAL_EXCEPTIONS)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Success banner */}
      {resolutionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{resolutionSuccess}</span>
          </div>
          <button onClick={() => setResolutionSuccess(null)} className="text-slate-400 hover:text-white">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Exceptions</div>
          <div className="text-2xl font-bold text-white mt-1">{exceptions.length}</div>
          <div className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            {exceptions.filter((e) => e.status === "OPEN").length} action required
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Superseded Parts</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {exceptions.filter((e) => e.type === "SUPERSEDED").length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Automated interchange active</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Variances</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {exceptions.filter((e) => e.type === "PRICE_VARIANCE").length}
          </div>
          <div className="text-xs text-slate-400 mt-1">&gt; 15% threshold breaches</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backorders</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {exceptions.filter((e) => e.type === "BACKORDER").length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Factory delay mitigation</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Filter className="h-3.5 w-3.5" />
            Exception Type:
          </div>
          {["ALL", "SUPERSEDED", "PRICE_VARIANCE", "BACKORDER", "OBSOLETE"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterType === t
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50"
              }`}
            >
              {t === "ALL" ? "All Types" : t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Actions</option>
            <option value="CUSTOMER_REVIEW">Customer Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filteredExceptions.map((exc) => {
          const typeBadge =
            exc.type === "SUPERSEDED"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : exc.type === "PRICE_VARIANCE"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
              : exc.type === "BACKORDER"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "bg-purple-500/10 text-purple-400 border-purple-500/30";

          const statusBadge =
            exc.status === "OPEN"
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : exc.status === "CUSTOMER_REVIEW"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

          return (
            <div
              key={exc.id}
              className={`p-5 rounded-xl border transition-all ${
                exc.status === "OPEN"
                  ? "bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/20"
                  : exc.status === "CUSTOMER_REVIEW"
                  ? "bg-slate-900/70 border-amber-500/30"
                  : "bg-slate-950/40 border-slate-800/60 opacity-80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{exc.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadge}`}>
                      {exc.type.replace("_", " ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadge}`}>
                      {exc.status}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto lg:ml-2">
                      <Clock className="h-3 w-3" />
                      Reported {exc.createdAt}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>{exc.partDescription}</span>
                      <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {exc.partNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Request ID: <span className="text-slate-200 font-mono">{exc.requestId}</span> • Customer:{" "}
                      <span className="text-slate-200 font-medium">{exc.customerName}</span> • Supplier:{" "}
                      <span className="text-slate-200 font-medium">
                        {exc.supplierName} ({exc.country})
                      </span>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-amber-400" />
                      Supplier Report & Diagnostic:
                    </div>
                    {exc.details}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">Prescribed Resolutions:</div>
                    {exc.status !== "RESOLVED" ? (
                      <div className="space-y-1.5">
                        {exc.resolutionOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleApplyResolution(exc.id, opt)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 border border-slate-700/60 transition flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">{opt}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>Resolution applied and logged to audit trail</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <Link
                      href={`/procurement/queue`}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
                    >
                      Inspect in Queue
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-slate-500 text-[11px]">Auto-audit logged</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredExceptions.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-slate-900/30 border border-slate-800 text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No active exceptions matching criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              All supplier orders and RFQs are processing without supersession or pricing variance flags.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
