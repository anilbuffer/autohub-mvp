"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Building2,
  Package,
  Truck,
  DollarSign,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  X,
  FileText,
  Search,
} from "lucide-react";
import {
  getStoredRequests,
  updateRequestStatus,
  subscribeToStore,
  saveRequests,
} from "@/lib/store";
import { PartRequest } from "@/lib/types";

export default function SupplierOrdersPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [showPoModal, setShowPoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // PO Modal state
  const [poNumber, setPoNumber] = useState("");
  const [supplierTracking, setSupplierTracking] = useState("");
  const [estimatedDispatchDate, setEstimatedDispatchDate] = useState("");
  const [notes, setNotes] = useState("");

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleOpenPoModal = (req: PartRequest) => {
    setSelectedRequest(req);
    const generatedPo = `PO-2026-${req.referenceNumber.replace("AH-P-", "")}`;
    setPoNumber(generatedPo);
    setSupplierTracking(`NAGOYA-WH-${Math.floor(100000 + Math.random() * 900000)}`);
    setEstimatedDispatchDate(new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]);
    setNotes(`Purchase Order ${generatedPo} issued to overseas OEM factory supplier. Awaiting export staging.`);
    setShowPoModal(true);
  };

  const handleConfirmPoPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const allRequests = getStoredRequests();
    const idx = allRequests.findIndex((r) => r.id === selectedRequest.id);
    if (idx !== -1) {
      const current = allRequests[idx];
      const now = new Date().toISOString();

      const updatedShipment = current.shipment || {
        id: `SHP-${Date.now()}`,
        carrier: current.quote?.selectedFreightMethod === "AIR_EXPRESS" ? "Cathay Cargo" : "Toyofuji Shipping",
        trackingNumber: supplierTracking,
        originPort: "Nagoya Port (Japan)",
        destinationPort: "Auckland Port (NZ)",
        etd: estimatedDispatchDate,
        eta: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        milestones: [
          {
            id: `MLS-${Date.now()}-1`,
            stage: "Supplier Purchase Order Issued",
            status: "ORDERED_FROM_SUPPLIER",
            timestamp: now,
            location: "Nagoya Sourcing Desk",
            notes: `PO ${poNumber} formally accepted by supplier.`,
            completed: true,
          },
        ],
      };

      allRequests[idx] = {
        ...current,
        status: "ORDERED_FROM_SUPPLIER",
        shipment: updatedShipment,
        updatedDate: now,
        messages: [
          ...current.messages,
          {
            id: `MSG-${Date.now()}`,
            senderId: "STAFF-01",
            senderName: "Nathan Cole (Procurement)",
            senderRole: "PROCUREMENT",
            timestamp: now,
            content: `Supplier Purchase Order ${poNumber} has been placed with our genuine parts supplier in Nagoya. Expected factory dispatch: ${estimatedDispatchDate}.`,
            isInternalOnly: false,
          },
        ],
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: now,
            actorName: "Nathan Cole",
            actorRole: "PROCUREMENT",
            action: `Issued Supplier Purchase Order ${poNumber}`,
            previousState: current.status,
            newState: "ORDERED_FROM_SUPPLIER",
            details: `Supplier tracking ref: ${supplierTracking}. ${notes}`,
          },
          ...current.auditLogs,
        ],
      };

      saveRequests([...allRequests]);
    }

    setShowPoModal(false);
    setSelectedRequest(null);
  };

  const handleMarkDispatched = (reqId: string) => {
    updateRequestStatus(
      reqId,
      "SUPPLIER_DISPATCHED",
      "Nathan Cole",
      "PROCUREMENT",
      "Supplier has handed over consignment to international freight carrier at origin airport/port."
    );
  };

  const poReadyRequests = requests.filter((r) => {
    const isPoStatus =
      r.status === "PAYMENT_CONFIRMED" ||
      r.status === "ORDERED_FROM_SUPPLIER" ||
      r.status === "SUPPLIER_DISPATCHED";

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return isPoStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Supplier Purchase Orders &amp; Dispatch
          </h1>
          <p className="text-xs text-slate-500">
            Convert payment-confirmed customer orders into verified factory POs with overseas suppliers
          </p>
        </div>

        <Link
          href="/procurement/queue"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-2xs"
        >
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Sourcing Intake Queue</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search POs by reference, part name, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          {poReadyRequests.length} Active Supplier Orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Vehicle &amp; Part</th>
                <th className="py-3 px-4">Selected Supplier</th>
                <th className="py-3 px-4">Total Amount (NZD)</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {poReadyRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No orders currently in the PO procurement pipeline.
                  </td>
                </tr>
              ) : (
                poReadyRequests.map((req) => {
                  const bestQuote = req.supplierQuotes?.[0];
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {req.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {req.part.partName} ({req.part.quantity}x)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {bestQuote?.supplierName || "Nagoya OEM Genuine Hub"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {bestQuote?.supplierCountry || "Japan"} • Lead Time: {bestQuote?.availabilityDays || 3} days
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        ${(req.quote?.totalNzd || (bestQuote ? bestQuote.partCostNzd * 1.18 : 650)).toFixed(2)} NZD
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            req.status === "PAYMENT_CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "ORDERED_FROM_SUPPLIER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {req.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === "PAYMENT_CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => handleOpenPoModal(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs transition"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Issue PO</span>
                          </button>
                        )}

                        {req.status === "ORDERED_FROM_SUPPLIER" && (
                          <button
                            type="button"
                            onClick={() => handleMarkDispatched(req.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Mark Dispatched</span>
                          </button>
                        )}

                        {req.status === "SUPPLIER_DISPATCHED" && (
                          <span className="text-[11px] text-purple-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Logistics Care</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ISSUE PO MODAL ================= */}
      {showPoModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Place Supplier Purchase Order
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Ref: {selectedRequest.referenceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPoPlacement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Purchase Order Reference Number:
                </label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Origin Staging / Tracking Code:
                </label>
                <input
                  type="text"
                  required
                  value={supplierTracking}
                  onChange={(e) => setSupplierTracking(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Expected Factory Dispatch Date:
                </label>
                <input
                  type="date"
                  required
                  value={estimatedDispatchDate}
                  onChange={(e) => setEstimatedDispatchDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Supplier Confirmation Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
                >
                  Confirm PO Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
