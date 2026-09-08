"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  Truck,
  Plane,
  Clock,
  ExternalLink,
  ArrowRight,
  Info,
  RefreshCw,
} from "lucide-react";

interface LogisticsHold {
  id: string;
  requestId: string;
  customerName: string;
  consignment: string;
  carrier: string;
  type: "CUSTOMS_HOLD" | "BIOSECURITY_INSPECTION" | "FLIGHT_DELAY" | "ADDRESS_VERIFICATION";
  severity: "CRITICAL" | "MODERATE" | "MINOR";
  description: string;
  resolutionOptions: string[];
  status: "PENDING_RELEASE" | "RESOLVED";
  dateLogged: string;
}

const INITIAL_HOLDS: LogisticsHold[] = [
  {
    id: "HOLD-301",
    requestId: "REQ-2024-002",
    customerName: "Southern European Workshop",
    consignment: "BorgWarner K03 Turbocharger Core",
    carrier: "DHL Express (AWB-NZ-002-981)",
    type: "CUSTOMS_HOLD",
    severity: "CRITICAL",
    description: "NZ Customs held clearance at Auckland Cargo Terminal. Commercial invoice requires HS Code 8414.80 and country of origin declaration certificate.",
    resolutionOptions: ["Attach Supplier EUR.1 Certificate & HS Code", "Submit Urgent Customs Broker Amendment", "Hold for Workshop Clearance"],
    status: "PENDING_RELEASE",
    dateLogged: "2024-03-29 08:45"
  },
  {
    id: "HOLD-302",
    requestId: "REQ-2024-003",
    customerName: "Waikato Fleet Solutions",
    consignment: "Denso Common Rail Diesel Injectors (Set of 4)",
    carrier: "Mainfreight Ocean (CBM-NRT-884)",
    type: "BIOSECURITY_INSPECTION",
    severity: "MODERATE",
    description: "MPI biosecurity quarantine flag: Container require random phytosanitary inspection for BMSB (Brown Marmorated Stink Bug) compliance.",
    resolutionOptions: ["Authorize $145 MPI Inspection Fee", "Present Japanese Heat Treatment Cert #HT-891", "Request Expedited Ramp Inspection"],
    status: "PENDING_RELEASE",
    dateLogged: "2024-03-28 14:10"
  },
  {
    id: "HOLD-303",
    requestId: "REQ-2024-001",
    customerName: "Auckland Euro Workshop",
    consignment: "ZF 8HP Transmission Valve Body & Solenoid Pack",
    carrier: "Air New Zealand Cargo (ANZ-89)",
    type: "FLIGHT_DELAY",
    severity: "MINOR",
    description: "Narita to Auckland direct cargo flight ANZ-89 delayed by 18 hours due to typhoon weather routing.",
    resolutionOptions: ["Update ETA in Customer Portal (+1 Day)", "Rebook via Sydney Air Transit Hub", "Acknowledge Flight Schedule Change"],
    status: "PENDING_RELEASE",
    dateLogged: "2024-03-28 10:00"
  }
];

export default function OperationsExceptionsPage() {
  const [holds, setHolds] = useState<LogisticsHold[]>(INITIAL_HOLDS);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResolveHold = (holdId: string, action: string) => {
    setHolds((prev) =>
      prev.map((h) => (h.id === holdId ? { ...h, status: "RESOLVED" } : h))
    );
    setSuccessMessage(`Hold ${holdId} resolved: ${action}. Consignment released for delivery pipeline.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const filtered = holds.filter((h) => {
    if (filterType !== "ALL" && h.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#ed2025] border border-red-200">
              Operations
            </span>
            <span className="text-xs text-slate-500">Border Clearance &amp; Freight Exceptions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-[#ed2025]" />
            Customs Holds &amp; Logistics Exceptions
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Resolve MPI biosecurity notices, customs tariff classification holds, and cargo transit delays before final delivery.
          </p>
        </div>

        <button
          onClick={() => setHolds(INITIAL_HOLDS)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Reset Demo Holds
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-slate-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "CUSTOMS_HOLD", "BIOSECURITY_INSPECTION", "FLIGHT_DELAY"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === tab
                ? "bg-[#ed2025] text-white font-bold shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab === "ALL" ? "All Holds" : tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Holds List (Symmetrical White Cards) */}
      <div className="space-y-4">
        {filtered.map((hold) => {
          const isCritical = hold.severity === "CRITICAL";
          const isResolved = hold.status === "RESOLVED";

          return (
            <div
              key={hold.id}
              className={`p-5 rounded-2xl border transition shadow-xs ${
                isResolved
                  ? "bg-slate-50/70 border-slate-200 opacity-80"
                  : isCritical
                  ? "bg-rose-50/30 border-rose-200"
                  : "bg-white border-slate-200/80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{hold.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        hold.type === "CUSTOMS_HOLD"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : hold.type === "BIOSECURITY_INSPECTION"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {hold.type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-rose-100 text-[#ed2025] border-red-200"
                      }`}
                    >
                      {hold.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto lg:ml-2">
                      <Clock className="h-3 w-3" />
                      Logged {hold.dateLogged}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {hold.consignment}
                  </div>
                  <div className="text-xs text-slate-600">
                    Workshop: <strong className="text-slate-800">{hold.customerName}</strong> • Carrier: <span className="font-mono text-slate-700">{hold.carrier}</span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                    {hold.description}
                  </p>
                </div>

                {/* Resolution Action Buttons */}
                {!isResolved && (
                  <div className="lg:w-72 flex-shrink-0 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Select Clearance Action:
                    </div>
                    {hold.resolutionOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleResolveHold(hold.id, opt)}
                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-red-50 hover:border-[#ed2025] border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#ed2025] transition"
                      >
                        → {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
