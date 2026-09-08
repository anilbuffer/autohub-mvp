"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info
} from "lucide-react";
import { getStoredRequests, resolveSourcingException, subscribeToStore } from "@/lib/store";
import { PartRequest } from "@/lib/types";

interface SourcingExceptionCase {
  id: string;
  requestId: string;
  type: "OEM Discontinued" | "Severe Backorder";
  badgeColor: string;
  partTitle: string;
  oemNumber: string;
  vehicle: string;
  vin: string;
  customerName: string;
  constraintDescription: string;
  triageBadge: string;
  aiMatch: {
    title: string;
    confidence: string;
    descriptionPrefix: string;
    boldHighlight: string;
    descriptionSuffix: string;
    landedCost: string;
    allocationStatus: string;
  };
  defaultNotes: string;
  status: "OPEN" | "RESOLVED" | "CANCELLED";
}

const INITIAL_CASES: SourcingExceptionCase[] = [
  {
    id: "AH-P-000130",
    requestId: "REQ-000130",
    type: "OEM Discontinued",
    badgeColor: "bg-rose-100/80 text-rose-700 border-rose-200",
    partTitle: "Power Steering Gearbox Assembly (RHD Genuine)",
    oemNumber: "#44110-60201",
    vehicle: "1996 Toyota Land Cruiser 80-Series",
    vin: "HDJ81-0049281",
    customerName: "AutoCare Auckland",
    constraintDescription: "Factory Discontinued (OEM Obsolete) by Toyota Japan. Superceded by rebuild program.",
    triageBadge: "Specialist Triage Required",
    aiMatch: {
      title: "Rebuilt Japanese OEM Genuine Steering Box (Koyo Seiko Rebuild Program)",
      confidence: "High Confidence Match (98%)",
      descriptionPrefix: "Factory rebuilt in Osaka using brand-new Japanese NOK seals, high-pressure dyno-tested, includes ",
      boldHighlight: "24-Month Unlimited Km Warranty",
      descriptionSuffix: ". Available ex-stock Osaka EuroTech Spares with 3-day express air dispatch.",
      landedCost: "$1,280.00 NZD",
      allocationStatus: "Immediate Air Cargo Allocation"
    },
    defaultNotes: "Customer agreed to Japanese remanufactured OEM unit with 24-month warranty. Returning to active sourcing queue.",
    status: "OPEN"
  },
  {
    id: "AH-P-000131",
    requestId: "REQ-000131",
    type: "Severe Backorder",
    badgeColor: "bg-amber-100/80 text-amber-800 border-amber-200",
    partTitle: "M Carbon Fiber Roof Panel Assembly",
    oemNumber: "#54108072545",
    vehicle: "2021 BMW M5 Competition (F90 LCI)",
    vin: "WBS83CH09MBL10294",
    customerName: "EuroTech Waikato",
    constraintDescription: "Severe Manufacturer Backorder (75+ Days) at BMW Central Parts Warehouse Dingolfing.",
    triageBadge: "Backorder Allocation Required",
    aiMatch: {
      title: "Alpha-N Carbon Composite Lightweight Roof Panel (OEM Fitment)",
      confidence: "High Confidence Match (96%)",
      descriptionPrefix: "German TUV certified dry carbon fiber replacement panel. Exact factory mounting dimensions, in stock at Munich Performance Hub with ",
      boldHighlight: "5-Day Express Air Freight",
      descriptionSuffix: " included.",
      landedCost: "$2,450.00 NZD",
      allocationStatus: "Express Flight Reserved"
    },
    defaultNotes: "Customer approved Alpha-N aftermarket dry carbon alternative. Proceeding with express order.",
    status: "OPEN"
  }
];

export default function ProcurementExceptionsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [cases, setCases] = useState<SourcingExceptionCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "DISCONTINUED" | "BACKORDER">("ALL");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({
    "AH-P-000130": INITIAL_CASES[0].defaultNotes,
    "AH-P-000131": INITIAL_CASES[1].defaultNotes,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setRequests(getStoredRequests());
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);

  const openCases = cases.filter((c) => c.status === "OPEN");
  
  const filteredCases = cases.filter((c) => {
    if (activeTabFilter === "DISCONTINUED" && c.type !== "OEM Discontinued") return false;
    if (activeTabFilter === "BACKORDER" && c.type !== "Severe Backorder") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.partTitle.toLowerCase().includes(q) ||
        c.oemNumber.toLowerCase().includes(q) ||
        c.vehicle.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.constraintDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleProposeAlternative = (caseItem: SourcingExceptionCase) => {
    const notes = resolutionNotes[caseItem.id] || caseItem.defaultNotes;
    
    // Call store mutation to sync with global state if matching request exists
    if (caseItem.requestId) {
      resolveSourcingException(
        caseItem.requestId,
        "Nathan Cole (Sourcing Lead)",
        notes
      );
    }

    setCases((prev) =>
      prev.map((item) =>
        item.id === caseItem.id ? { ...item, status: "RESOLVED" } : item
      )
    );

    setToastMessage(`Exception ${caseItem.id} resolved. Alternative proposed and returned to active Sourcing Queue.`);
    setSelectedCaseId(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCancelRequest = (caseItem: SourcingExceptionCase) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseItem.id ? { ...item, status: "CANCELLED" } : item
      )
    );

    setToastMessage(`Part request for ${caseItem.id} cancelled. Notification issued to ${caseItem.customerName}.`);
    setSelectedCaseId(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const resetData = () => {
    setCases(INITIAL_CASES);
    setSelectedCaseId(null);
    setToastMessage("Demo exception queue reset.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ================= VIEW 2: TRIAGE & RESOLVE DETAIL FLOW =================
  if (selectedCase) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => setSelectedCaseId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition self-start shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Sourcing Exceptions</span>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-500">Case:</span>
            <span className="text-xs font-black text-slate-900 font-mono">{selectedCase.id}</span>
            <span className="text-slate-300">•</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${selectedCase.badgeColor}`}>
              {selectedCase.type}
            </span>
          </div>
        </div>

        {/* Main Detail Container Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs font-bold text-slate-500 tracking-wide">
                <span>{selectedCase.id}</span>
                <span className="mx-2 text-slate-300">•</span>
                <span>Customer: <strong className="text-slate-900">{selectedCase.customerName}</strong></span>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                {selectedCase.triageBadge}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">
              {selectedCase.partTitle}
            </h1>

            <div className="text-xs md:text-sm text-slate-500 font-medium mt-1">
              <span>{selectedCase.vehicle}</span>
              <span className="mx-2 text-slate-300">•</span>
              <span>VIN: <strong className="font-mono text-slate-700">{selectedCase.vin}</strong></span>
              <span className="mx-2 text-slate-300">•</span>
              <span>OEM <strong className="font-mono text-slate-700">{selectedCase.oemNumber}</strong></span>
            </div>
          </div>

          {/* Alert Box 1: Sourcing Bottleneck Diagnosis */}
          <div className="bg-[#fff1f2] border border-rose-200/90 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs md:text-sm">
              <AlertTriangle className="w-4.5 h-4.5 text-[#ed2025] flex-shrink-0" />
              <span>Sourcing Bottleneck Diagnosis</span>
            </div>
            <p className="text-xs md:text-sm text-rose-950 font-medium mt-1.5 leading-relaxed">
              {selectedCase.constraintDescription}
            </p>
          </div>

          {/* AI Match Box 2: Procurly AI Recommended Alternative Match */}
          <div className="bg-[#fffdf2] border border-amber-200/90 rounded-2xl p-5 md:p-6 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs md:text-sm">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                <span>Procurly AI Recommended Alternative Match</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 text-[11px] font-bold">
                {selectedCase.aiMatch.confidence}
              </span>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-black text-slate-900">
                {selectedCase.aiMatch.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                {selectedCase.aiMatch.descriptionPrefix}
                <strong className="text-slate-900 font-bold">{selectedCase.aiMatch.boldHighlight}</strong>
                {selectedCase.aiMatch.descriptionSuffix}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-amber-200/40 text-xs md:text-sm">
              <div>
                <span className="text-slate-600 font-medium">Alternative Landed Cost: </span>
                <span className="text-emerald-700 font-black font-mono text-base">{selectedCase.aiMatch.landedCost}</span>
              </div>
              <div className="text-emerald-700 font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedCase.aiMatch.allocationStatus}</span>
              </div>
            </div>
          </div>

          {/* Form Section: Sourcing Specialist Resolution Notes */}
          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-extrabold text-slate-900">
              Sourcing Specialist Resolution Notes:
            </label>
            <textarea
              rows={3}
              value={resolutionNotes[selectedCase.id] ?? selectedCase.defaultNotes}
              onChange={(e) =>
                setResolutionNotes({ ...resolutionNotes, [selectedCase.id]: e.target.value })
              }
              className="w-full rounded-2xl bg-slate-50/90 border border-slate-200 p-3.5 text-xs md:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ed2025]/20 focus:border-[#ed2025] transition resize-y"
              placeholder="Add details regarding customer agreement or resolution..."
            />
          </div>

          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleProposeAlternative(selectedCase)}
              className="flex-1 py-3.5 px-6 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold text-xs md:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Propose Alternative &amp; Return to Sourcing Queue</span>
            </button>

            <button
              onClick={() => handleCancelRequest(selectedCase)}
              className="py-3.5 px-6 rounded-full bg-rose-100/70 hover:bg-rose-200 text-rose-700 border border-rose-200 font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4.5 h-4.5 text-rose-600" />
              <span>Cancel Part Request</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW 1: SOURCING EXCEPTIONS LIST VIEW =================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header / Refresh Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Sourcing Exceptions
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Resolve factory backorders and discontinued OEM parts with AI alternative matching.
          </p>
        </div>

        <button
          onClick={resetData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#ed2025]" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Metric Stat Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Exceptions */}
        <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACTIVE EXCEPTIONS
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#ed2025]">
              {openCases.length}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Cases awaiting resolution
            </div>
          </div>
        </div>

        {/* Card 2: Alternative Match Rate */}
        <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ALTERNATIVE MATCH RATE
            </span>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
              94.5%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Successful alternative part solutions found
            </div>
          </div>
        </div>

        {/* Card 3: Resolution Velocity */}
        <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              RESOLUTION VELOCITY
            </span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-baseline">
              <span>1.4</span>
              <span className="text-sm font-semibold text-slate-500 ml-1.5">hrs</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Average time to re-route or offer alternative
            </div>
          </div>
        </div>

        {/* Card 4: Customer Retention */}
        <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CUSTOMER RETENTION
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-600">
              100%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Zero trade customers lost to dead-end parts
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exception reason, part, VIN, ref..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50/90 border border-slate-200/80 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ed2025]/20 focus:border-[#ed2025] transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap self-end md:self-auto">
          <button
            onClick={() => setActiveTabFilter("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTabFilter === "ALL"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Exceptions ({openCases.length})
          </button>
          <button
            onClick={() => setActiveTabFilter("DISCONTINUED")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTabFilter === "DISCONTINUED"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Factory Discontinued
          </button>
          <button
            onClick={() => setActiveTabFilter("BACKORDER")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTabFilter === "BACKORDER"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Severe Backorders
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-[18%]">CASE REF &amp; TYPE</th>
                <th className="py-4 px-6 w-[26%]">REQUESTED PART</th>
                <th className="py-4 px-6 w-[24%]">VEHICLE &amp; CUSTOMER</th>
                <th className="py-4 px-6 w-[22%]">SOURCING CONSTRAINT</th>
                <th className="py-4 px-6 w-[10%] text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50/60 transition ${
                    c.status !== "OPEN" ? "opacity-60 bg-slate-50/30" : ""
                  }`}
                >
                  {/* Case Ref & Type */}
                  <td className="py-5 px-6 align-top">
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-slate-900 font-mono text-xs md:text-sm">
                        {c.id}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold border ${c.badgeColor}`}>
                          {c.type}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Requested Part */}
                  <td className="py-5 px-6 align-top">
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs md:text-sm leading-snug">
                        {c.partTitle}
                      </div>
                      <div className="text-slate-400 font-mono text-xs font-medium mt-0.5">
                        OEM {c.oemNumber}
                      </div>
                    </div>
                  </td>

                  {/* Vehicle & Customer */}
                  <td className="py-5 px-6 align-top">
                    <div>
                      <div className="font-bold text-slate-800 text-xs md:text-sm leading-snug">
                        {c.vehicle}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5 font-medium">
                        Customer: <span className="text-slate-600 font-bold">{c.customerName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Sourcing Constraint */}
                  <td className="py-5 px-6 align-top">
                    <div className="bg-rose-50/80 border border-rose-100/90 text-rose-900 text-xs font-semibold rounded-xl p-3 leading-relaxed">
                      {c.constraintDescription}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-5 px-6 align-top text-right">
                    {c.status === "OPEN" ? (
                      <button
                        onClick={() => setSelectedCaseId(c.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
                      >
                        <span>Triage &amp; Resolve</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">No active exceptions found</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting demo data or clearing your search filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
