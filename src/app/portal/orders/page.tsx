"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  Download,
  ArrowRight,
  Truck,
  Car,
  Calendar,
  DollarSign,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { getStoredRequests, subscribeToStore } from "@/lib/store";
import { PartRequest } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerOrdersPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setRequests(getStoredRequests());
    const unsub = subscribeToStore(() => {
      setRequests(getStoredRequests());
    });
    return unsub;
  }, []);

  // Filter requests that have reached the confirmed order stage
  const confirmedOrderStatuses = [
    "PAYMENT_CONFIRMED",
    "ORDERED_FROM_SUPPLIER",
    "SUPPLIER_DISPATCHED",
    "RECEIVED_AT_SHIPPING_FACILITY",
    "IN_TRANSIT",
    "ARRIVED_IN_NZ",
    "CUSTOMS_CLEARANCE",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "COMPLETED",
  ];

  const orders = requests.filter((r) =>
    confirmedOrderStatuses.includes(r.status) || r.status === "AWAITING_PAYMENT"
  );

  const filtered = orders.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.referenceNumber.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q) ||
        r.part.partName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      "Order Reference",
      "Vehicle Make",
      "Vehicle Model",
      "VIN",
      "Part Name",
      "Status",
      "Amount NZD",
      "Date",
    ];
    const rows = filtered.map((r) => [
      r.referenceNumber,
      r.vehicle.make,
      r.vehicle.model,
      r.vehicle.vin,
      r.part.partName,
      r.status,
      r.quote?.totalNzd
        ? r.quote.totalNzd.toFixed(2)
        : r.invoice?.totalNzd
        ? r.invoice.totalNzd.toFixed(2)
        : "0.00",
      new Date(r.submittedDate).toLocaleDateString("en-NZ"),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procurly-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Trade Orders
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Confirmed Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track confirmed procurement purchase orders, dispatch status, and fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/portal/new-request"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold transition shadow-md shadow-red-600/20"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>New Request</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card-table p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by reference, VIN, vehicle or part..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed2025]/30 focus:border-[#ed2025]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All Orders", val: "ALL" },
            { label: "In Transit", val: "IN_TRANSIT" },
            { label: "Customs", val: "CUSTOMS_CLEARANCE" },
            { label: "Delivered", val: "DELIVERED" },
            { label: "Completed", val: "COMPLETED" },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                statusFilter === tab.val
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="portal-card-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="portal-table-head">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Part Details</th>
                <th className="py-3 px-4">Order Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const finalAmount = r.quote?.totalNzd
                    ? r.quote.totalNzd.toFixed(2)
                    : r.quote?.landedCostNzd
                    ? (r.quote.landedCostNzd * (1 + (r.quote.marginPercent || 15) / 100)).toFixed(2)
                    : r.invoice?.totalNzd
                    ? r.invoice.totalNzd.toFixed(2)
                    : "0.00";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link
                          href={`/portal/requests/${r.id}`}
                          className="text-[#2b4499] hover:underline"
                        >
                          {r.referenceNumber}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(r.submittedDate).toLocaleDateString("en-NZ")}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          VIN: {r.vehicle.vin}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {r.part.partName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          OEM: {r.part.oemNumber || r.part.oemPartNumber || "N/A"}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${finalAmount}{" "}
                        <span className="text-[10px] font-normal text-slate-400">NZD</span>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.shipment && (
                            <Link
                              href="/portal/shipments"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Track Shipment"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/portal/requests/${r.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
