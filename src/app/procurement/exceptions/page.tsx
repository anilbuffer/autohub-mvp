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
import { getStoredRequests, resolveSourcingException, subscribeToStore } from "@/lib/store";
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
    requestId: "REQ-000130",
    partNumber: "13568-19195",
    partDescription: "Timing Belt Kit OEM Toyota",
    customerName: "AutoCare Auckland",
    supplierName: "Nagoya Auto Direct K.K.",
    country: "JP",
    type: "SUPERSEDED",
    severity: "MEDIUM",
    details: "OEM Part 13568-19195 superseded by Toyota Global to 13568-19205. Includes upgraded Kevlar tensile cord.",
    resolutionOptions: ["Adopt Superseded Part #13568-19205", "Request Stock Check on Legacy #", "Contact Workshop Manager"],
    status: "OPEN",
    createdAt: "Today 09:15"
  },
  {
    id: "EXC-102",
    requestId: "REQ-000131",
    partNumber: "06A145704T",
    partDescription: "BorgWarner K03 Turbocharger Core",
    customerName: "Canterbury Commercial Fleet Services",
    supplierName: "Hanseatic Auto Wholesale GmbH",
    country: "DE",
    type: "PRICE_VARIANCE",
    severity: "HIGH",
    details: "Supplier revised quote from €720 to €840 due to raw material surcharge. Exceeds customer preliminary budget by 16.7%.",
    resolutionOptions: ["Absorb Variance via Margin", "Issue Revised Quote to Customer", "Check Alternate Supplier (US Hub)"],
    status: "CUSTOMER_REVIEW",
    createdAt: "Today 08:30"
  },
  {
    id: "EXC-103",
    requestId: "REQ-000140",
    partNumber: "48815-30580",
    partDescription: "Front Stabilizer Bar Bushing Set",
    customerName: "AutoCare Auckland",
    supplierName: "Osaka EuroTech Spares",
    country: "JP",
    type: "BACKORDER",
    severity: "MEDIUM",
    details: "Supplier reported 14-day production delay at factory. Estimated export date delayed from 02 Apr to 16 Apr.",
    resolutionOptions: ["Expedite via Air Freight (Nagoya Hub)", "Approve 14-day factory delay", "Source OEM equivalent aftermarket"],
    status: "OPEN",
    createdAt: "Yesterday 16:45"
  },
  {
    id: "EXC-104",
    requestId: "REQ-000141",
    partNumber: "22030-0P010",
    partDescription: "Electronic Throttle Body Assembly",
    customerName: "EuroTech Waikato",
    supplierName: "Nagoya Auto Direct K.K.",
    country: "JP",
    type: "OBSOLETE",
    severity: "HIGH",
    details: "Factory discontinued production of genuine assembly. Only remanufactured units or Denso aftermarket available.",
    resolutionOptions: ["Offer Denso Remanufactured Unit", "Query US Depot for NOS (New Old Stock)", "Cancel Part Request"],
    status: "OPEN",
    createdAt: "Yesterday 11:20"
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
    const found = exceptions.find((e) => e.id === exceptionId);
    if (found && found.requestId) {
      resolveSourcingException(
        found.requestId,
        "Nathan Cole (Sourcing Lead)",
        `Resolution applied: ${chosenOption}. Part cleared for procurement queue.`
      );
    }
    setExceptions((prev) =>
      prev.map((exc) =>
        exc.id === exceptionId
          ? { ...exc, status: "RESOLVED" }
          : exc
      )
    );
    setResolutionSuccess(`Exception ${exceptionId} resolved: ${chosenOption}. Request returned to active Sourcing Queue.`);
    setActiveResolution(null);
    setTimeout(() => setResolutionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ed2025]/10 text-[#ed2025] border border-[#ed2025]/20">
              Procurement Desk
            </span>
            <span className="text-xs text-slate-500 font-medium">Sourcing Incident Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-[#ed2025]" />
            Sourcing Exceptions &amp; Supersessions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage backorders, discontinued parts, superseded OEM part numbers, and supplier price variances before dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExceptions(INITIAL_EXCEPTIONS)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#ed2025]" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Success banner */}
      {resolutionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{resolutionSuccess}</span>
          </div>
          <button onClick={() => setResolutionSuccess(null)} className="text-slate-400 hover:text-slate-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Exceptions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{exceptions.length}</div>
          <div className="text-xs text-[#ed2025] font-semibold mt-1 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            {exceptions.filter((e) => e.status === "OPEN").length} action required
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Superseded Parts</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {exceptions.filter((e) => e.type === "SUPERSEDED").length}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">Automated interchange active</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Variances</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {exceptions.filter((e) => e.type === "PRICE_VARIANCE").length}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">&gt; 15% threshold breaches</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Backorders</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {exceptions.filter((e) => e.type === "BACKORDER").length}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">Factory delay mitigation</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mr-1">
            <Filter className="h-3.5 w-3.5 text-[#ed2025]" />
            Type:
          </div>
          {["ALL", "SUPERSEDED", "PRICE_VARIANCE", "BACKORDER", "OBSOLETE"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === t
                  ? "bg-[#0f172a] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t === "ALL" ? "All Types" : t.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
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
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : exc.type === "PRICE_VARIANCE"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : exc.type === "BACKORDER"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-purple-50 text-purple-700 border-purple-200";

          const statusBadge =
            exc.status === "OPEN"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : exc.status === "CUSTOMER_REVIEW"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <div
              key={exc.id}
              className={`p-5 rounded-2xl border transition-all bg-white ${
                exc.status === "OPEN"
                  ? "border-slate-300 shadow-sm"
                  : exc.status === "CUSTOMER_REVIEW"
                  ? "border-amber-200"
                  : "border-slate-200/80 opacity-80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#0f172a]">{exc.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge}`}>
                      {exc.type.replace("_", " ")}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                      {exc.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 ml-auto lg:ml-2">
                      <Clock className="h-3 w-3" />
                      Reported {exc.createdAt}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{exc.partDescription}</span>
                      <span className="text-xs font-mono text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {exc.partNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Request ID: <span className="text-slate-800 font-mono font-bold">{exc.requestId}</span> • Customer:{" "}
                      <span className="text-slate-800 font-bold">{exc.customerName}</span> • Supplier:{" "}
                      <span className="text-slate-800 font-medium">
                        {exc.supplierName} ({exc.country})
                      </span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-[#ed2025]" />
                      Supplier Report &amp; Diagnostic:
                    </div>
                    {exc.details}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">Prescribed Resolutions:</div>
                    {exc.status !== "RESOLVED" ? (
                      <div className="space-y-2">
                        {exc.resolutionOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleApplyResolution(exc.id, opt)}
                            className="w-full text-left px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-[#ed2025]/10 hover:border-[#ed2025]/30 text-xs text-slate-800 hover:text-[#ed2025] border border-slate-200 transition flex items-center justify-between group font-medium"
                          >
                            <span className="truncate pr-2">{opt}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#ed2025] group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                        <span>Resolution applied and logged to audit trail</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/portal/requests/${exc.requestId}`}
                      className="text-[#ed2025] hover:underline flex items-center gap-1 font-bold transition"
                    >
                      View Request ({exc.requestId})
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-slate-400 text-[11px]">Auto-audit logged</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredExceptions.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-white border border-slate-200/80 text-slate-400 shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-900">No active exceptions matching criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              All supplier orders and RFQs are processing without supersession or pricing variance flags.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
