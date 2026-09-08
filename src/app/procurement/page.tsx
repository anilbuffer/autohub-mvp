"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckSquare,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Truck,
  Plus,
  Car,
  Package,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, SupplierProfile } from "@/lib/types";

export default function ProcurementDashboardPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  const refresh = () => {
    setRequests(getStoredRequests());
    setSuppliers(getStoredSuppliers());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const sourcingQueue = requests.filter(
    (r) => r.status === "SOURCING" || r.status === "SUBMITTED"
  );

  const activeOrders = requests.filter(
    (r) =>
      r.status === "PAYMENT_CONFIRMED" ||
      r.status === "ORDERED_FROM_SUPPLIER" ||
      r.status === "SUPPLIER_DISPATCHED"
  );

  const totalQuotesCaptured = requests.reduce(
    (acc, r) => acc + (r.supplierQuotes?.length || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ed2025]/20 border border-[#ed2025]/40 text-[#ed2025] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ed2025] animate-pulse" />
            <span>Nagoya &amp; Tokyo Global Sourcing Desk Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Procurement &amp; Global Sourcing Console
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct factory &amp; Tier-1 supplier querying across Japan, Germany, USA and Australia. Capture foreign currency quotations, calculate landed NZD conversions, and place factory Purchase Orders.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/procurement/queue"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-md transition"
            >
              <Compass className="w-4 h-4" />
              <span>Review Sourcing Queue ({sourcingQueue.length})</span>
            </Link>
            <Link
              href="/procurement/suppliers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              <Building2 className="w-4 h-4 text-[#ed2025]" />
              <span>Supplier Directory ({suppliers.length})</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none pr-8 pb-4 hidden lg:block">
          <Compass className="w-64 h-64 text-[#ed2025]" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Sourcing</span>
            <div className="w-9 h-9 rounded-xl bg-[#ed2025]/10 text-[#ed2025] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{sourcingQueue.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Parts requests requiring supplier quotes</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Quotes Captured</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalQuotesCaptured}</div>
          <p className="text-[11px] text-slate-500 font-medium">Foreign currency quotes logged</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active PO Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeOrders.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Paid orders ready or placed with suppliers</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Suppliers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{suppliers.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Verified OEM &amp; aftermarket vendors</p>
        </div>
      </div>

      {/* Sourcing Intake Queue Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Sourcing Queue (Pending Supplier Quotes)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              New RFQs allocated to Nathan Cole &amp; global procurement desks
            </p>
          </div>

          <Link
            href="/procurement/queue"
            className="text-xs font-bold text-[#ed2025] hover:underline flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sourcingQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            All requests have been quoted! No pending items in sourcing queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Vehicle &amp; VIN</th>
                  <th className="py-3 px-4">Part Specification</th>
                  <th className="py-3 px-4">Preference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Quotes Added</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sourcingQueue.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0f172a]">
                      {req.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        VIN: {req.vehicle.vin}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.part.partName}</div>
                      <div className="text-[10px] text-slate-500">
                        Qty: {req.part.quantity} • {req.part.oemPartNumber || "OEM pending"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {req.part.genuinePreference.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{req.customerName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                        {req.supplierQuotes?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/procurement/queue"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] transition shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Quote</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sourcing Country Coverage Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Japan Hub (Nagoya)</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">JPY</span>
          </div>
          <p className="text-xs text-slate-500">Toyota, Lexus, Nissan, Honda OEM factory stock. Fast-track Narita air cargo.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Germany Hub (Hamburg)</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">EUR</span>
          </div>
          <p className="text-xs text-slate-500">BMW, Mercedes-Benz, Audi, Porsche Tier-1 direct distributors.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">USA Hub (Los Angeles)</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">USD</span>
          </div>
          <p className="text-xs text-slate-500">Ford, GM, RAM, Tesla &amp; commercial heavy fleet powertrain parts.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Australia (Melbourne)</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">AUD</span>
          </div>
          <p className="text-xs text-slate-500">Trans-Tasman 24–48hr express priority courier bridge to Auckland depot.</p>
        </div>
      </div>
    </div>
  );
}
