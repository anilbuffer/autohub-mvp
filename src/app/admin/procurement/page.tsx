"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Search,
  Banknote,
  Building2,
  Lock,
  Unlock,
  Truck
} from "lucide-react";
import {
  getStoredRequests,
  updateRequestStatus,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, RequestStatus } from "@/lib/types";

export default function AdminProcurementWorkflowPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "READY_TO_ORDER" | "ORDERED" | "LOCKED">("ALL");

  // PO Action Modal
  const [poModalReq, setPoModalReq] = useState<PartRequest | null>(null);
  const [poSupplierName, setPoSupplierName] = useState("");
  const [poCurrency, setPoCurrency] = useState("JPY");
  const [poAmount, setPoAmount] = useState<number>(0);
  const [poNotes, setPoNotes] = useState("");

  // Dispatch Action Modal
  const [dispatchModalReq, setDispatchModalReq] = useState<PartRequest | null>(null);
  const [carrierName, setCarrierName] = useState("Yamato Transport / Japan Post");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");

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

  const readyToOrder = requests.filter((r) => r.status === "PAYMENT_CONFIRMED");
  const orderedFromSupplier = requests.filter((r) => r.status === "ORDERED_FROM_SUPPLIER");
  const awaitingPayment = requests.filter(
    (r) => r.status === "AWAITING_PAYMENT" || r.status === "AWAITING_CUSTOMER_APPROVAL" || r.status === "SOURCING"
  );

  const handleOpenPoModal = (req: PartRequest) => {
    setPoModalReq(req);
    const sq = req.supplierQuotes[0];
    setPoSupplierName(sq ? sq.supplierName : "Nagoya Auto Direct K.K.");
    setPoCurrency(sq ? sq.partCostCurrency : "JPY");
    setPoAmount(sq ? sq.partCostForeign : 18500);
    setPoNotes(`Procurement purchase order authorized for VIN ${req.vehicle.vin}`);
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poModalReq) return;

    const poNumber = `PO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    updateRequestStatus(
      poModalReq.id,
      "ORDERED_FROM_SUPPLIER",
      "Nathan Cole",
      "ADMIN",
      `Placed Purchase Order ${poNumber} with ${poSupplierName} for ${poAmount.toLocaleString()} ${poCurrency}. ${poNotes}`
    );

    setPoModalReq(null);
    refresh();
  };

  const handleOpenDispatchModal = (req: PartRequest) => {
    setDispatchModalReq(req);
    setTrackingNumber(`JP-${Math.floor(100000000 + Math.random() * 900000000)}`);
    setDispatchNotes("Consignment handed over to origin courier for transit to export hub.");
  };

  const handleRecordDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalReq) return;

    updateRequestStatus(
      dispatchModalReq.id,
      "SUPPLIER_DISPATCHED",
      "Liam Patel",
      "ADMIN",
      `Supplier dispatched with carrier ${carrierName} (Tracking: ${trackingNumber}). ${dispatchNotes}`
    );

    setDispatchModalReq(null);
    refresh();
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter =
      filterTab === "ALL" ||
      (filterTab === "READY_TO_ORDER" && r.status === "PAYMENT_CONFIRMED") ||
      (filterTab === "ORDERED" && r.status === "ORDERED_FROM_SUPPLIER") ||
      (filterTab === "LOCKED" && ["AWAITING_PAYMENT", "AWAITING_CUSTOMER_APPROVAL", "SOURCING"].includes(r.status));

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Supply Chain Execution
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Procurement Workflow &amp; Supplier POs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage purchase order generation, supplier commitments, and dispatch tracking once payment gate is unlocked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4 text-purple-600" />
            <span>Verify Payments</span>
          </Link>
          <Link
            href="/admin/shipments"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-cyan-600" />
            <span>Shipments Console</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Unlock className="w-4 h-4 text-emerald-600" />
            Unlocked &amp; Ready to Order
          </span>
          <div className="text-3xl font-black text-emerald-700 font-mono">
            {readyToOrder.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Payment confirmed or trade credit validated
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-blue-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            Ordered from Supplier
          </span>
          <div className="text-3xl font-black text-blue-700 font-mono">
            {orderedFromSupplier.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Awaiting supplier dispatch handover
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-amber-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600" />
            Payment Gate Locked
          </span>
          <div className="text-3xl font-black text-amber-700 font-mono">
            {awaitingPayment.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Orders pending customer payment clearance
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, customer, part, VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ed2025] transition"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: "ALL", label: "All Orders", count: requests.length },
              { id: "READY_TO_ORDER", label: "Ready to Order", count: readyToOrder.length },
              { id: "ORDERED", label: "Supplier Ordered", count: orderedFromSupplier.length },
              { id: "LOCKED", label: "Gate Locked", count: awaitingPayment.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${filterTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${filterTab === tab.id
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
      </div>

      {/* Procurement Orders Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Part &amp; Quantity</th>
                <th className="py-3 px-4">Payment Gate</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Supplier Quote</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const isUnlocked = r.status === "PAYMENT_CONFIRMED" || r.status === "ORDERED_FROM_SUPPLIER" || r.status === "SUPPLIER_DISPATCHED";
                  const sq = r.supplierQuotes[0];

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{r.referenceNumber}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(r.submittedDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NZBN: {r.customerNzbn}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {r.part.quantity}x {r.part.partName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>GATE UNLOCKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>GATE LOCKED</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-800 text-[11px]">
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {sq ? (
                          <div>
                            <div className="font-bold text-slate-900">${sq.partCostNzd.toFixed(2)} NZD</div>
                            <div className="text-[10px] text-slate-400">{sq.supplierName}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No supplier quote</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {r.status === "PAYMENT_CONFIRMED" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPoModal(r)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center gap-1.5"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Place Supplier PO</span>
                          </button>
                        ) : r.status === "ORDERED_FROM_SUPPLIER" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDispatchModal(r)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Record Dispatch</span>
                          </button>
                        ) : isUnlocked ? (
                          <span className="text-xs text-emerald-600 font-semibold">
                            ✓ Dispatched to Transit
                          </span>
                        ) : (
                          <Link
                            href="/admin/payments"
                            className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Validate Payment →</span>
                          </Link>
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

      {/* Place Supplier Purchase Order Modal */}
      {poModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Generate Supplier Purchase Order
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                For {poModalReq.referenceNumber}: {poModalReq.part.quantity}x {poModalReq.part.partName}
              </p>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Assigned Overseas Supplier</label>
                <input
                  type="text"
                  value={poSupplierName}
                  onChange={(e) => setPoSupplierName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Currency</label>
                  <input
                    type="text"
                    value={poCurrency}
                    onChange={(e) => setPoCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Supplier PO Amount</label>
                  <input
                    type="number"
                    value={poAmount}
                    onChange={(e) => setPoAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div><strong>Vehicle VIN:</strong> {poModalReq.vehicle.vin}</div>
                <div><strong>Customer Address:</strong> {poModalReq.deliveryAddress.street}, {poModalReq.deliveryAddress.city}</div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">PO Instructions</label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPoModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Confirm &amp; Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Supplier Dispatch Modal */}
      {dispatchModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Record Supplier Dispatch &amp; Tracking
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dispatchModalReq.referenceNumber}: {dispatchModalReq.part.quantity}x {dispatchModalReq.part.partName}
              </p>
            </div>

            <form onSubmit={handleRecordDispatchSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Origin Carrier Name</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Origin Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Dispatch Remarks</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
