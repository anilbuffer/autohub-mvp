"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Truck,
  Plane,
  Anchor,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Plus,
} from "lucide-react";
import {
  getStoredRequests,
  updateShipmentStage,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, RequestStatus, LogisticsMilestone } from "@/lib/types";

export default function AdminShipmentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<"ALL" | "IN_TRANSIT" | "CUSTOMS" | "DELIVERED">("ALL");

  // Advance milestone modal state
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [newStage, setNewStage] = useState<RequestStatus>("IN_TRANSIT");
  const [locationName, setLocationName] = useState("Auckland International Airport Air Cargo Terminal");
  const [carrierInput, setCarrierInput] = useState("Air New Zealand Cargo");
  const [trackingInput, setTrackingInput] = useState("");
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const refresh = () => {
    const reqs = getStoredRequests();
    setRequests(reqs);
    if (!selectedReqId && reqs.length > 0) {
      const firstWithShipment = reqs.find((r) => r.shipment) || reqs[0];
      setSelectedReqId(firstWithShipment.id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const shipmentsList = requests.filter((r) => {
    // Show requests that either have shipment details or are in transit statuses
    const isShipmentRelevant =
      r.shipment ||
      [
        "ORDERED_FROM_SUPPLIER",
        "SUPPLIER_DISPATCHED",
        "RECEIVED_AT_SHIPPING_FACILITY",
        "IN_TRANSIT",
        "ARRIVED_IN_NZ",
        "CUSTOMS_CLEARANCE",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
      ].includes(r.status);

    const matchesFilter =
      filterStage === "ALL" ||
      (filterStage === "IN_TRANSIT" && ["SUPPLIER_DISPATCHED", "RECEIVED_AT_SHIPPING_FACILITY", "IN_TRANSIT", "ARRIVED_IN_NZ"].includes(r.status)) ||
      (filterStage === "CUSTOMS" && r.status === "CUSTOMS_CLEARANCE") ||
      (filterStage === "DELIVERED" && (r.status === "DELIVERED" || r.status === "COMPLETED"));

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.shipment?.trackingNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    return isShipmentRelevant && matchesFilter && matchesSearch;
  });

  const selectedReq = requests.find((r) => r.id === selectedReqId) || shipmentsList[0];
  const shipment = selectedReq?.shipment;

  const handleOpenMilestoneModal = (stage: RequestStatus) => {
    setNewStage(stage);
    setCarrierInput(shipment?.carrier || "Air New Zealand Cargo / Cathay Priority");
    setTrackingInput(shipment?.trackingNumber || `NZ-${Math.floor(10000000 + Math.random() * 90000000)}`);
    if (stage === "CUSTOMS_CLEARANCE") {
      setLocationName("MPI Biosecurity & NZ Customs Inspection Facility, Mangere");
      setMilestoneNotes("Document clearance lodged via NZ Trade Single Window (TSW). MPI biosecurity clearance pending.");
    } else if (stage === "OUT_FOR_DELIVERY") {
      setLocationName("Auckland Domestic Freight Hub");
      setMilestoneNotes("Onboard with local freight carrier for workshop depot handover today.");
    } else if (stage === "DELIVERED") {
      setLocationName(selectedReq?.deliveryAddress.street + ", " + selectedReq?.deliveryAddress.city);
      setMilestoneNotes("Signed proof of delivery receipt obtained at customer workshop depot.");
    } else {
      setLocationName("Tokyo Narita Air Cargo Terminal / Export Port Hub");
      setMilestoneNotes("Consignment processed and manifested for international dispatch.");
    }
    setMilestoneModalOpen(true);
  };

  const handleAdvanceMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    updateShipmentStage(
      selectedReq.id,
      newStage,
      carrierInput,
      trackingInput,
      locationName,
      "Liam Patel",
      milestoneNotes
    );

    setMilestoneModalOpen(false);
    refresh();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Consignment Tracking
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Shipment Tracking &amp; Logistics Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor international cargo flights, ocean container vessels, MPI biosecurity clearance, and final domestic door delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/freight"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Plane className="w-4 h-4 text-blue-600" />
            <span>Freight Rates</span>
          </Link>
          <Link
            href="/admin/procurement"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Supplier POs</span>
          </Link>
        </div>
      </div>

      {/* Main Layout: Left Shipments Queue / Right Detailed Tracking & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Shipments Selector */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#ed2025]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Consignments ({shipmentsList.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Click to view</span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracking, ref, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px] py-1">
              {[
                { id: "ALL", label: "All" },
                { id: "IN_TRANSIT", label: "In Transit" },
                { id: "CUSTOMS", label: "Customs/MPI" },
                { id: "DELIVERED", label: "Delivered" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStage(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                    filterStage === tab.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {shipmentsList.map((r) => {
              const isSelected = r.id === selectedReq?.id;
              const isAir = r.quote?.selectedFreightMethod === "AIR_EXPRESS";

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReqId(r.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? "border-[#ed2025] bg-red-50/30 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{r.referenceNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        r.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "CUSTOMS_CLEARANCE"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 truncate">
                    {r.part.quantity}x {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    {isAir ? (
                      <Plane className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Anchor className="w-3 h-3 text-cyan-600" />
                    )}
                    <span>{r.shipment?.carrier || "Carrier Assigned"}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Tracking: {r.shipment?.trackingNumber || "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Comprehensive Shipment Tracking Details & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReq ? (
            <>
              {/* Selected Shipment Overview Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {selectedReq.referenceNumber}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        {selectedReq.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 mt-1">
                      {selectedReq.part.quantity}x {selectedReq.part.partName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Destination: {selectedReq.customerName} ({selectedReq.deliveryAddress.street}, {selectedReq.deliveryAddress.city})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMilestoneModal("CUSTOMS_CLEARANCE")}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Customs Clearance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenMilestoneModal("OUT_FOR_DELIVERY")}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Out for Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenMilestoneModal("DELIVERED")}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Carrier</span>
                    <span className="font-bold text-slate-900">{shipment?.carrier || "Air New Zealand Cargo"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tracking / AWB #</span>
                    <span className="font-mono font-bold text-blue-700">{shipment?.trackingNumber || "NZ-74892019"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Origin Gateway</span>
                    <span className="font-semibold text-slate-900">{shipment?.originPort || "Tokyo Narita (NRT)"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Arrival</span>
                    <span className="font-semibold text-slate-900">
                      {shipment?.eta ? new Date(shipment.eta).toLocaleDateString() : "3 business days"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sequential Logistics Milestones Timeline */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Logistics Milestone History ({shipment?.milestones.length || 0})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenMilestoneModal("IN_TRANSIT")}
                    className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Milestone</span>
                  </button>
                </div>

                {!shipment || shipment.milestones.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No logistics milestones recorded yet. Advance the stage to create tracking records.</span>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {shipment.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="relative space-y-1">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{m.stage}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold">
                              {m.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(m.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <span>{m.location}</span>
                        </div>

                        {m.notes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {m.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              No active consignment selected.
            </div>
          )}
        </div>
      </div>

      {/* Advance Milestone Modal */}
      {milestoneModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Advance Logistics Milestone
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedReq.referenceNumber}: {selectedReq.part.quantity}x {selectedReq.part.partName}
              </p>
            </div>

            <form onSubmit={handleAdvanceMilestoneSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Target Milestone Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as RequestStatus)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white"
                >
                  <option value="SUPPLIER_DISPATCHED">Supplier Dispatched (Origin Departure)</option>
                  <option value="RECEIVED_AT_SHIPPING_FACILITY">Received at Shipping Facility (Export Hub)</option>
                  <option value="IN_TRANSIT">In Transit (Air Cargo Flight / Ocean Vessel)</option>
                  <option value="ARRIVED_IN_NZ">Arrived in NZ (Port of Auckland)</option>
                  <option value="CUSTOMS_CLEARANCE">Customs &amp; MPI Biosecurity Clearance</option>
                  <option value="OUT_FOR_DELIVERY">Out for Local Delivery (Domestic Courier)</option>
                  <option value="DELIVERED">Delivered (Completed Workshop Handover)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Carrier Name</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Checkpoint Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Milestone Notes / Courier Updates</label>
                <textarea
                  rows={2}
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Confirm &amp; Broadcast Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
