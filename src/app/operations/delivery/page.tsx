"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  User,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Check,
  Calendar,
} from "lucide-react";
import {
  getStoredRequests,
  updateShipmentStage,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest } from "@/lib/types";

export default function OperationsDeliveryConfirmationPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [podRef, setPodRef] = useState("");
  const [conditionChecked, setConditionChecked] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const refresh = () => {
    const all = getStoredRequests();
    setRequests(all);
    if (!selectedReqId && all.length > 0) {
      setSelectedReqId(all[0].id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedReqId);

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId) return;

    updateShipmentStage(
      selectedReqId,
      "DELIVERED",
      selectedRequest?.shipment?.carrier || "Mainfreight",
      podRef || selectedRequest?.shipment?.trackingNumber || "MFL-POD",
      "Auckland Logistics Depot / Customer Handover",
      recipientName || "Logistics Officer",
      deliveryNotes || `Proof of Delivery: ${podRef}. Signed by ${recipientName}.`
    );

    setConfirmedSuccess(true);
    setTimeout(() => setConfirmedSuccess(false), 4000);
    setRecipientName("");
    setPodRef("");
    setDeliveryNotes("");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Logistics Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Delivery Confirmation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official Proof of Delivery (POD), recipient verification, condition sign-off, and close completed logistics lifecycles.
          </p>
        </div>

        <Link
          href="/operations/shipments"
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <Truck className="w-4 h-4 text-slate-500" />
          <span>Shipments Console</span>
        </Link>
      </div>

      {confirmedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Proof of Delivery recorded. Order milestone updated to DELIVERED and customer notified.</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Final Delivery */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            In-Transit Deliveries ({requests.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {requests.map((r) => {
              const isSelected = r.id === selectedReqId;
              const isDelivered = r.status === "DELIVERED";

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReqId(r.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "border-[#ed2025] bg-red-50/20 shadow-xs"
                      : "border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {r.referenceNumber}
                    </span>
                    {isDelivered ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Delivered
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {r.status}
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-800 line-clamp-1">
                    {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.customerName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Delivery Form & POD Verification */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRequest ? (
            <div className="space-y-6">
              {/* Part & Customer Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#ed2025]">
                      {selectedRequest.referenceNumber}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedRequest.part.partName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Consignee: {selectedRequest.customerName} • Vehicle: {selectedRequest.vehicle.year} {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Delivery Status
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Carrier</span>
                    <span className="font-bold text-slate-800">{selectedRequest.shipment?.carrier || "Mainfreight"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">AWB / BOL #</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedRequest.shipment?.trackingNumber || "MFL-NZ-091823"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Arrival</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedRequest.shipment?.carrierEta || "Today"}</span>
                  </div>
                </div>
              </div>

              {/* Proof of Delivery (POD) Form */}
              <form onSubmit={handleConfirmDelivery} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <FileCheck className="w-4 h-4 text-[#ed2025]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Official Proof of Delivery (POD) Recording
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Recipient / Workshop Signatory Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Henderson (Head Mechanic)"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Carrier POD / Consignment Reference #
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. POD-AKL-89104"
                      value={podRef}
                      onChange={(e) => setPodRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="conditionBox"
                      checked={conditionChecked}
                      onChange={(e) => setConditionChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-[#ed2025] focus:ring-red-500 border-slate-300"
                    />
                    <label htmlFor="conditionBox" className="text-xs text-slate-700 font-bold cursor-pointer">
                      Physical inspection completed — no transit damage observed
                    </label>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Delivery Remarks &amp; Handover Location
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Unloaded into Workshop Bay 3 via forklift. Signed delivery manifest on file."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Updates lifecycle state to DELIVERED
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/20 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Delivery &amp; Close Consignment</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
              Select a delivery to confirm Proof of Delivery.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
