"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  ChevronRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Layers,
  Banknote,
  Compass,
  AlertTriangle,
} from "lucide-react";
import {
  getStoredRequests,
  updateRequestStatus,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, RequestStatus } from "@/lib/types";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusModalReq, setStatusModalReq] = useState<PartRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>("SOURCING");
  const [statusReason, setStatusReason] = useState("");

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "SOURCING" && (r.status === "SUBMITTED" || r.status === "SOURCING")) ||
      (selectedStatus === "QUOTED" && (r.status === "QUOTE_PREPARED" || r.status === "AWAITING_CUSTOMER_APPROVAL")) ||
      (selectedStatus === "PAYMENT" && r.status === "AWAITING_PAYMENT") ||
      (selectedStatus === "PROCUREMENT" && r.status === "PAYMENT_CONFIRMED") ||
      (selectedStatus === "TRANSIT" &&
        ["SUPPLIER_DISPATCHED", "RECEIVED_AT_SHIPPING_FACILITY", "IN_TRANSIT", "ARRIVED_IN_NZ", "CUSTOMS_CLEARANCE", "OUT_FOR_DELIVERY"].includes(r.status)) ||
      (selectedStatus === "DELIVERED" && (r.status === "DELIVERED" || r.status === "COMPLETED")) ||
      (selectedStatus === "EXCEPTIONS" && (r.status.includes("EXCEPTION") || r.status === "PAYMENT_DISPUTED" || r.status === "ON_HOLD"));

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalReq) return;
    updateRequestStatus(
      statusModalReq.id,
      newStatus,
      "Autohub Operations",
      "ADMIN",
      statusReason || `Status transition to ${newStatus}`
    );
    setStatusModalReq(null);
    setStatusReason("");
    refresh();
  };

  const getStatusBadgeClass = (status: RequestStatus) => {
    switch (status) {
      case "SUBMITTED":
      case "SOURCING":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "QUOTE_PREPARED":
      case "AWAITING_CUSTOMER_APPROVAL":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "AWAITING_PAYMENT":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "PAYMENT_CONFIRMED":
      case "ORDERED_FROM_SUPPLIER":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "SUPPLIER_DISPATCHED":
      case "IN_TRANSIT":
      case "ARRIVED_IN_NZ":
      case "CUSTOMS_CLEARANCE":
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-900 border-cyan-300";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      default:
        return "bg-rose-100 text-rose-900 border-rose-300";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Intake &amp; Fulfillment Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Parts Request Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, filter, triage, and route customer parts requests across all operational fulfillment phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/supplier-quotes"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Supplier Quotes</span>
          </Link>
          <Link
            href="/admin/customer-quotes"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4" />
            <span>Customer Quotes</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, vehicle, VIN, part, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ed2025] transition"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredRequests.length}</strong> of{" "}
            <strong className="text-slate-900">{requests.length}</strong> total requests
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "All Requests", count: requests.length },
            { id: "SOURCING", label: "Sourcing Desk", count: requests.filter((r) => r.status === "SUBMITTED" || r.status === "SOURCING").length },
            { id: "QUOTED", label: "Quoted", count: requests.filter((r) => r.status === "QUOTE_PREPARED" || r.status === "AWAITING_CUSTOMER_APPROVAL").length },
            { id: "PAYMENT", label: "Awaiting Payment", count: requests.filter((r) => r.status === "AWAITING_PAYMENT").length },
            { id: "PROCUREMENT", label: "Procurement PO", count: requests.filter((r) => r.status === "PAYMENT_CONFIRMED").length },
            { id: "TRANSIT", label: "In Transit", count: requests.filter((r) => ["SUPPLIER_DISPATCHED", "RECEIVED_AT_SHIPPING_FACILITY", "IN_TRANSIT", "ARRIVED_IN_NZ", "CUSTOMS_CLEARANCE", "OUT_FOR_DELIVERY"].includes(r.status)).length },
            { id: "DELIVERED", label: "Delivered", count: requests.filter((r) => r.status === "DELIVERED" || r.status === "COMPLETED").length },
            { id: "EXCEPTIONS", label: "Exceptions", count: requests.filter((r) => r.status.includes("EXCEPTION") || r.status === "PAYMENT_DISPUTED" || r.status === "ON_HOLD").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedStatus === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle &amp; VIN</th>
                <th className="py-3 px-4">Required Part</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Quote / Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No parts requests match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{req.referenceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(req.submittedDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NZBN: {req.customerNzbn}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        VIN: {req.vehicle.vin}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {req.part.quantity}x {req.part.partName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {req.part.genuinePreference.replace(/_/g, " ")} • {req.part.category}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                          req.status
                        )}`}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.quote ? (
                        <div>
                          <div>${req.quote.totalNzd.toFixed(2)} NZD</div>
                          <div className="text-[10px] text-emerald-600 font-normal">
                            Quote {req.quote.quoteNumber}
                          </div>
                        </div>
                      ) : req.supplierQuotes.length > 0 ? (
                        <div className="text-blue-600 font-semibold text-[11px]">
                          {req.supplierQuotes.length} Supplier Quotes
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Unquoted</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalReq(req);
                            setNewStatus(req.status);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition"
                        >
                          Change Status
                        </button>
                        <Link
                          href={`/portal/requests/${req.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Status Modal */}
      {statusModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Update Request Status • {statusModalReq.referenceNumber}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {statusModalReq.customerName} • {statusModalReq.part.quantity}x {statusModalReq.part.partName}
              </p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  <option value="SUBMITTED">SUBMITTED (Customer Form Intake)</option>
                  <option value="SOURCING">SOURCING (Querying Suppliers)</option>
                  <option value="QUOTE_PREPARED">QUOTE_PREPARED (Pricing Ready)</option>
                  <option value="AWAITING_CUSTOMER_APPROVAL">AWAITING_CUSTOMER_APPROVAL</option>
                  <option value="AWAITING_PAYMENT">AWAITING_PAYMENT (Invoice Issued)</option>
                  <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED (Ready for PO)</option>
                  <option value="ORDERED_FROM_SUPPLIER">ORDERED_FROM_SUPPLIER</option>
                  <option value="SUPPLIER_DISPATCHED">SUPPLIER_DISPATCHED</option>
                  <option value="RECEIVED_AT_SHIPPING_FACILITY">RECEIVED_AT_SHIPPING_FACILITY</option>
                  <option value="IN_TRANSIT">IN_TRANSIT (International Route)</option>
                  <option value="ARRIVED_IN_NZ">ARRIVED_IN_NZ (Port of Auckland)</option>
                  <option value="CUSTOMS_CLEARANCE">CUSTOMS_CLEARANCE (MPI / Customs)</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Domestic Courier)</option>
                  <option value="DELIVERED">DELIVERED (Signed POD)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="SOURCING_EXCEPTION">SOURCING_EXCEPTION</option>
                  <option value="LOGISTICS_EXCEPTION">LOGISTICS_EXCEPTION</option>
                  <option value="PAYMENT_DISPUTED">PAYMENT_DISPUTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Reason / Transition Notes</label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter audit trail rationale for this status transition..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold transition shadow-xs"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
