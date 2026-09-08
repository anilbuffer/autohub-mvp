"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plane,
  Anchor,
  Box,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Globe,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { getStoredRequests, subscribeToStore } from "@/lib/store";
import { PartRequest, RequestStatus } from "@/lib/types";

const ACTIVE_SHIPMENT_STATUSES: RequestStatus[] = [
  "SUPPLIER_DISPATCHED",
  "RECEIVED_AT_SHIPPING_FACILITY",
  "IN_TRANSIT",
  "ARRIVED_IN_NZ",
  "CUSTOMS_CLEARANCE",
  "OUT_FOR_DELIVERY",
];

export default function OperationsDashboard() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRequests(getStoredRequests());
    setMounted(true);
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);

  if (!mounted) return null;

  // Derive live logistics metrics from central store
  const activeShipments = requests.filter((r) =>
    ACTIVE_SHIPMENT_STATUSES.includes(r.status)
  );
  const urgentDispatches = requests.filter(
    (r) => r.status === "ORDERED_FROM_SUPPLIER" || r.status === "PAYMENT_CONFIRMED"
  );
  const customsHolds = requests.filter(
    (r) => r.status === "CUSTOMS_CLEARANCE" || r.status === "SOURCING_EXCEPTION"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ================= TOP GREETING BANNER (DARK NAVY / RED ACCENTS) ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/60 text-[#ed2025] text-[11px] font-bold tracking-wider uppercase">
            <span>OPERATIONS COMMAND CENTER</span>
            <span className="text-red-300">•</span>
            <span className="font-mono">AUCKLAND AIR CARGO &amp; PORTS (AKL-01)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Global Freight &amp; Logistics Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time multimodal shipment tracking, MPI biosecurity releases, and bay delivery dispatch across New Zealand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            id="dashboard-dispatch-consignments-button"
            href="/operations/shipments"
            className="px-5 py-3 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 group"
          >
            <Truck className="w-4 h-4 stroke-[3]" />
            <span>DISPATCH CONSIGNMENT</span>
          </Link>
          <Link
            href="/operations/freight"
            className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
          >
            <Anchor className="w-4 h-4 text-slate-500" />
            <span>Tariff Calc</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 KPI STAT CARDS (SYMMETRIC WITH CUSTOMER PORTAL) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Shipments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              ACTIVE SHIPMENTS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeShipments.length.toString().padStart(2, "0")}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>98.2% on schedule</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Ready for Dispatch */}
        <div className={`rounded-2xl p-5 border-2 shadow-sm flex items-start justify-between relative overflow-hidden ${
          urgentDispatches.length > 0 ? "bg-amber-50/40 border-amber-300" : "bg-white border-slate-200/80"
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-wider block ${
                urgentDispatches.length > 0 ? "text-amber-900" : "text-slate-500"
              }`}>
                READY FOR DISPATCH
              </span>
              {urgentDispatches.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${
              urgentDispatches.length > 0 ? "text-amber-950" : "text-slate-900"
            }`}>
              {urgentDispatches.length.toString().padStart(2, "0")}
            </div>
            <span className={`text-[11px] font-semibold block ${
              urgentDispatches.length > 0 ? "text-amber-700" : "text-slate-400"
            }`}>
              Paid &amp; allocated orders
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            urgentDispatches.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
          }`}>
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Air Express Velocity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              AIR EXPRESS VELOCITY
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              3.8 Days
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Narita/FRA to AKL
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Customs & Biosecurity Holds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              BORDER HOLDS
            </span>
            <div className={`text-2xl sm:text-3xl font-black ${customsHolds.length > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {customsHolds.length.toString().padStart(2, "0")}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold block">
              MPI / HS classification
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= MULTIMODAL 6-STAGE FREIGHT PIPELINE ================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#ed2025]" />
              Multimodal 6-Stage Consignment Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consignment pipeline tracking parts from international supplier hubs to workshop bays.
            </p>
          </div>
          <Link
            href="/operations/shipments"
            className="text-xs font-bold text-[#ed2025] hover:text-[#d3181d] flex items-center gap-1"
          >
            <span>Manage All Milestones</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {[
            { stage: "Stage 1", name: "Supplier Pickup", count: 4, icon: Box, status: "Origin Depots" },
            { stage: "Stage 2", name: "Export Port / Air", count: 3, icon: Plane, status: "Narita / Frankfurt" },
            { stage: "Stage 3", name: "In Transit Lane", count: Math.max(activeShipments.length, 5), icon: Anchor, status: "Trans-Pacific Flight" },
            { stage: "Stage 4", name: "NZ Customs Clearance", count: 2, icon: ShieldCheck, status: "Auckland Cargo Hub" },
            { stage: "Stage 5", name: "MPI Biosecurity", count: 3, icon: CheckCircle2, status: "Ramp Inspection" },
            { stage: "Stage 6", name: "Workshop Delivery", count: 6, icon: Truck, status: "Courier Bay Drop" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-mono font-medium">{item.stage}</span>
                    <Icon className="h-3.5 w-3.5 text-[#ed2025] group-hover:scale-110 transition" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{item.status}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{item.count}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= BOTTOM SPLIT: RECENT SHIPMENTS & NOTICES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Consignments Ready for Milestone Update */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Active Freight Consignments
              </h3>
              <p className="text-xs text-slate-500">
                Click any consignment to advance milestone stages in real time
              </p>
            </div>

            <Link
              href="/operations/shipments"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              View All Consignments →
            </Link>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{req.referenceNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Airway Bill #NZ-{req.id.slice(-3)}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {req.part?.partName || req.part?.descriptionNotes || "OEM Assembly Components"}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      Dest: {typeof req.deliveryAddress === "object" && req.deliveryAddress ? `${req.deliveryAddress.street}, ${req.deliveryAddress.city}` : "Auckland Workshop Bay"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Status: <strong className="text-slate-700">{req.status.replace(/_/g, " ")}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="text-xs font-bold text-[#ed2025]">
                    {ACTIVE_SHIPMENT_STATUSES.includes(req.status) ? "In Transit" : "Ready to Dispatch"}
                  </span>
                  <Link
                    href={`/operations/shipments`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <span>Update Stage</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Customs & Biosecurity Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Port Notices &amp; Biosecurity
              </h3>
              <p className="text-xs text-slate-500">
                MPI &amp; NZ Customs border clearance advisories
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">MPI BMSB Clearance</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    CLEARED
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Heat treatment certificates verified for container consignments arriving from Yokohama and Nagoya.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">Cert: #HT-2026-MPI-8912</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">NZ Customs Tariff Duty</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                    0% TARIFF
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  0% tariff duty under Singapore-NZ / Japan-NZ CPTPP trade agreement applies to qualifying automotive spares.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">Customs Classification Hold</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                    ACTION REQ
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Airway bill commercial invoice requires HS Code 8414.80 confirmation from supplier.
                </p>
                <Link
                  href="/operations/exceptions"
                  className="text-xs text-[#ed2025] hover:text-[#d3181d] font-bold flex items-center gap-1 pt-1"
                >
                  Resolve Customs Exception →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
