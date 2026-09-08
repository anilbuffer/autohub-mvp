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
  RefreshCw
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
    requestId: "REQ-2024-004",
    customerName: "Apex Performance & Dyno",
    consignment: "Subaru Brembo Caliper Seal Rebuild Kit",
    carrier: "FedEx International (7812-9901-21)",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Operations
            </span>
            <span className="text-xs text-slate-500">Border Clearance & Freight Exceptions</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            Customs Holds & Logistics Exceptions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Resolve MPI biosecurity notices, customs tariff classification holds, and cargo transit delays before final delivery.
          </p>
        </div>

        <button
          onClick={() => setHolds(INITIAL_HOLDS)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Demo Holds
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {["ALL", "CUSTOMS_HOLD", "BIOSECURITY_INSPECTION", "FLIGHT_DELAY"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === tab
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab === "ALL" ? "All Holds" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Holds List */}
      <div className="space-y-4">
        {filtered.map((hold) => {
          const isCritical = hold.severity === "CRITICAL";
          const isResolved = hold.status === "RESOLVED";

          return (
            <div
              key={hold.id}
              className={`p-5 rounded-xl border transition ${
                isResolved
                  ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                  : isCritical
                  ? "bg-rose-950/20 border-rose-800/40 shadow-lg shadow-black/20"
                  : "bg-slate-900/70 border-slate-800"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{hold.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        hold.type === "CUSTOMS_HOLD"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : hold.type === "BIOSECURITY_INSPECTION"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {hold.type.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        isResolved
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {hold.status}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto lg:ml-2">
                      <Clock className="h-3 w-3" />
                      Logged {hold.dateLogged}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{hold.consignment}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Request: <span className="font-mono text-cyan-400">{hold.requestId}</span> • Customer:{" "}
                      <span className="text-slate-200 font-medium">{hold.customerName}</span> • Carrier:{" "}
                      <span className="text-slate-200 font-mono">{hold.carrier}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-rose-400" />
                      Border Authority / Carrier Notice:
                    </div>
                    {hold.description}
                  </div>
                </div>

                {/* Resolution Column */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">Available Actions:</div>
                    {!isResolved ? (
                      <div className="space-y-1.5">
                        {hold.resolutionOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleResolveHold(hold.id, opt)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-200 border border-slate-700/60 transition flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">{opt}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>Border release approved and stamped</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <Link
                      href="/operations/shipments"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
                    >
                      Inspect Waybill
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-slate-500 text-[11px]">Audit ID: NZC-9802</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-slate-900/30 border border-slate-800 text-slate-400">
            <ShieldCheck className="h-10 w-10 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No active logistics holds</p>
            <p className="text-xs text-slate-500 mt-1">All border clearances and cargo flights are operating normally.</p>
          </div>
        )}
      </div>
    </div>
  );
}
