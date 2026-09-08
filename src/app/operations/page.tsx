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
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Globe,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ExternalLink
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

  // Derive logistics metrics
  const activeShipments = requests.filter((r) =>
    ACTIVE_SHIPMENT_STATUSES.includes(r.status)
  );
  const urgentDispatches = requests.filter(
    (r) => r.status === "ORDERED_FROM_SUPPLIER" || r.status === "PAYMENT_CONFIRMED"
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Operations Control
            </span>
            <span className="text-xs text-slate-500">Auckland Hub (AKL-01)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Logistics & Freight Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time multimodal tracking, MPI biosecurity clearance, customs duty manifests, and bay delivery dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/shipments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 transition"
          >
            <Truck className="h-4 w-4" />
            Dispatch Consignments
          </Link>
          <Link
            href="/operations/freight"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
          >
            <Anchor className="h-4 w-4" />
            Tariff Calculator
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-900/90 border border-cyan-800/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Active Shipments
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {activeShipments.length + 8}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>98.2% on scheduled arrival</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Air Express Velocity
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Plane className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">3.8 Days</div>
          <div className="text-xs text-slate-400 mt-2">
            Tokyo & Frankfurt gateway direct to AKL
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              MPI Biosecurity Clear
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">100%</div>
          <div className="text-xs text-slate-400 mt-2">
            0 quarantine rejections this cycle
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Customs Holds
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">2</div>
          <div className="text-xs text-rose-300/80 mt-2 flex items-center gap-1">
            <span>Awaiting HS Code verification</span>
          </div>
        </div>
      </div>

      {/* Multimodal Transit Pipeline Flow */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Multimodal 6-Stage Freight Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual pipeline tracking consignments from foreign origin depots to customer workshop delivery bays.
            </p>
          </div>
          <Link
            href="/operations/shipments"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Manage Stage Milestones
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {[
            { stage: "Stage 1", name: "Supplier Pickup", count: 4, icon: Box, status: "Origin Warehouses" },
            { stage: "Stage 2", name: "Export Port / Air Hub", count: 3, icon: Plane, status: "Narita / Frankfurt" },
            { stage: "Stage 3", name: "In Transit Lane", count: 5, icon: Anchor, status: "Airways / Pacific" },
            { stage: "Stage 4", name: "NZ Customs Clearance", count: 2, icon: ShieldCheck, status: "Auckland Cargo Hub" },
            { stage: "Stage 5", name: "MPI Biosecurity", count: 3, icon: CheckCircle2, status: "Inspection Depot" },
            { stage: "Stage 6", name: "Workshop Delivery", count: 6, icon: Truck, status: "Courier Bay Drop" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-mono font-medium">{item.stage}</span>
                    <Icon className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.status}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-base font-extrabold text-cyan-400">{item.count}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Urgent Consignments to Dispatch & Active Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Consignments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              Consignments Ready for Dispatch / Milestone Updates
            </h2>
            <Link
              href="/operations/shipments"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View Full Register →
            </Link>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{req.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Air Express #NZ-{req.id.slice(-3)}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {req.part?.partName || req.part?.descriptionNotes || "OEM Assembly Components"}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      Dest: {typeof req.deliveryAddress === "object" && req.deliveryAddress ? `${req.deliveryAddress.street}, ${req.deliveryAddress.city}` : (req.deliveryAddress as any) || "Auckland Workshop Bay"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      ETA: 2 Business Days
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-xs font-bold text-emerald-400">
                    {ACTIVE_SHIPMENT_STATUSES.includes(req.status) ? "In Transit" : "Ready to Dispatch"}
                  </span>
                  <Link
                    href={`/operations/shipments`}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Update Milestone</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Port Customs & Operations Notices */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Port Hub Notices & Biosecurity
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">MPI Brown Marmorated Stink Bug</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  CLEARED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Heat treatment certificates verified for all container consignments arriving from Yokohama and Bremerhaven.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Cert: #HT-2024-MPI-8912</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">NZ Customs Tariff Schedule</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                0% tariff duty under Singapore-NZ / Japan-NZ CPTPP trade agreement applies to qualifying OEM automotive spares.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">Customs Hold: REQ-2024-002</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  ACTION REQ
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Airway bill commercial invoice requires HS Code 8414.80 confirmation from Bavaria Auto Spares.
              </p>
              <Link
                href="/operations/exceptions"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 pt-1"
              >
                Resolve Customs Exception →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
