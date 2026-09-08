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
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Plus,
  FileText,
  X,
} from "lucide-react";
import { getStoredRequests, saveRequests, subscribeToStore } from "@/lib/store";
import { PartRequest, TimelineEvent, RequestStatus } from "@/lib/types";

const STAGES = [
  { id: 1, name: "Origin Warehouse", code: "ORIGIN_PICKUP", description: "Supplier warehouse dispatch" },
  { id: 2, name: "Port / Air Hub", code: "PORT_EXPORT", description: "Export gateway customs lodged" },
  { id: 3, name: "International Transit", code: "TRANSIT_LANE", description: "Trans-pacific flight / sea lane" },
  { id: 4, name: "NZ Customs Clearance", code: "CUSTOMS_CLEARED", description: "Auckland cargo terminal clearance" },
  { id: 5, name: "MPI Biosecurity", code: "BIOSECURITY_PASS", description: "Ministry for Primary Industries released" },
  { id: 6, name: "Workshop Delivery", code: "DELIVERED", description: "Courier drop at customer workshop bay" },
];

const stageToStatus: Record<number, RequestStatus> = {
  1: "SUPPLIER_DISPATCHED",
  2: "RECEIVED_AT_SHIPPING_FACILITY",
  3: "IN_TRANSIT",
  4: "CUSTOMS_CLEARANCE",
  5: "ARRIVED_IN_NZ",
  6: "DELIVERED",
};

const getStageFromStatus = (status: RequestStatus): number => {
  if (status === "DELIVERED" || status === "COMPLETED") return 6;
  if (status === "ARRIVED_IN_NZ") return 5;
  if (status === "CUSTOMS_CLEARANCE") return 4;
  if (status === "IN_TRANSIT") return 3;
  if (status === "RECEIVED_AT_SHIPPING_FACILITY") return 2;
  if (status === "SUPPLIER_DISPATCHED") return 1;
  return 3;
};

export default function OperationsShipmentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCarrier, setFilterCarrier] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);

  useEffect(() => {
    setRequests(getStoredRequests());
    const unsub = subscribeToStore(() => setRequests(getStoredRequests()));
    return unsub;
  }, []);

  // Modal fields for milestone update
  const [modalStage, setModalStage] = useState<number>(3);
  const [modalCarrier, setModalCarrier] = useState<string>("DHL Express");
  const [modalWaybill, setModalWaybill] = useState<string>("");
  const [modalLocation, setModalLocation] = useState<string>("Auckland Air Cargo Gateway");
  const [modalNotes, setModalNotes] = useState<string>("Consignment cleared pre-arrival manifest scanning.");
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  const openMilestoneModal = (req: PartRequest) => {
    setSelectedRequest(req);
    const stage = getStageFromStatus(req.status);
    setModalStage(stage);
    setModalWaybill(req.part?.oemPartNumber ? `AWB-NZ-${req.id.replace("REQ-", "")}-78` : "AWB-8921-391");
  };

  const handleUpdateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const newEvent: TimelineEvent = {
      status: STAGES[modalStage - 1].name,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      description: `${modalCarrier} (${modalWaybill || "N/A"}) - ${modalLocation}. ${modalNotes}`,
    };

    const newStatus: RequestStatus = stageToStatus[modalStage] || "IN_TRANSIT";

    // Update central store which broadcasts real-time across all tabs
    const currentList = getStoredRequests();
    const updated = currentList.map((r) => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: newStatus,
          timeline: [...(r.timeline || []), newEvent],
        };
      }
      return r;
    });
    saveRequests(updated);

    setIsSuccessMessage(`Shipment milestone for ${selectedRequest.referenceNumber || selectedRequest.id} successfully updated to Stage ${modalStage} (${STAGES[modalStage - 1].name})!`);
    setSelectedRequest(null);
    setTimeout(() => setIsSuccessMessage(null), 5000);
  };

  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      req.id.toLowerCase().includes(q) ||
      req.referenceNumber.toLowerCase().includes(q) ||
      req.customerName?.toLowerCase().includes(q) ||
      req.part?.partName?.toLowerCase().includes(q) ||
      req.part?.oemPartNumber?.toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shipment Dispatch &amp; Milestone Register</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-[#ed2025] font-bold border border-red-200">
              Live Real-Time Sync
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Door-to-door multimodal freight milestones, air cargo waybills, customs entry clearances, and bay courier drops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/operations/freight"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Anchor className="h-3.5 w-3.5 text-slate-500" />
            <span>Freight Tariffs</span>
          </Link>
          <Link
            href="/operations/exceptions"
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>Customs Holds</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{isSuccessMessage}</span>
          </div>
          <button onClick={() => setIsSuccessMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar (Symmetrical White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search consignment, request ID, part #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold">Carrier:</span>
          <select
            value={filterCarrier}
            onChange={(e) => setFilterCarrier(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 focus:ring-1 focus:ring-red-500/20 focus:border-[#ed2025]"
          >
            <option value="ALL">All Carriers</option>
            <option value="DHL">DHL Express Air</option>
            <option value="FEDEX">FedEx Priority</option>
            <option value="MAINFREIGHT">Mainfreight Multimodal</option>
            <option value="NIPPON">Nippon Express</option>
          </select>
        </div>
      </div>

      {/* Shipments Table (Symmetrical White Card) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Consignment / Request</th>
                <th className="py-3.5 px-4 font-bold">Customer &amp; Vehicle</th>
                <th className="py-3.5 px-4 font-bold">Route &amp; Hub</th>
                <th className="py-3.5 px-4 font-bold">Waybill / Container</th>
                <th className="py-3.5 px-4 font-bold">Milestone Stage</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {filteredRequests.map((req, idx) => {
                const stageNum = getStageFromStatus(req.status);
                const stageName = STAGES[stageNum - 1].name;
                const isDelivered = stageNum === 6;

                const originHub = idx % 2 === 0 ? "Tokyo (NRT)" : "Frankfurt (FRA)";
                const carrier = idx % 2 === 0 ? "DHL Express" : "Mainfreight Ocean";

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-slate-900">{req.referenceNumber}</div>
                      <div className="text-xs text-slate-600 truncate max-w-xs mt-0.5">
                        {req.part?.partName || req.part?.descriptionNotes}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {req.part?.oemPartNumber || "OEM-SPARE"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-xs text-slate-500">
                        {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {typeof req.deliveryAddress === "object" && req.deliveryAddress ? `${req.deliveryAddress.street}, ${req.deliveryAddress.city}` : "Auckland Workshop Bay"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <span className="text-slate-500">{originHub}</span>
                        <ArrowRight className="h-3 w-3 text-[#ed2025]" />
                        <span className="font-bold text-slate-900">AKL Hub</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Air Cargo Express</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        AWB-NZ-{req.id.slice(-3)}-9281
                      </div>
                      <div className="text-[11px] text-[#ed2025] font-semibold mt-0.5">
                        {carrier}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold ${isDelivered ? "text-emerald-700" : "text-slate-900"}`}>
                            Stage {stageNum}: {stageName}
                          </span>
                        </div>
                        {/* Symmetrical progress bar */}
                        <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDelivered ? "bg-emerald-500" : "bg-[#ed2025]"
                            }`}
                            style={{ width: `${(stageNum / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openMilestoneModal(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1"
                      >
                        <span>Update Stage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Symmetrical Milestone Update Modal (Navy / Red Theme) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn">
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#ed2025] uppercase tracking-wider border border-red-200">
                  Logistics Coordinator Action
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Update Transit Milestone: {selectedRequest.referenceNumber || selectedRequest.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: {selectedRequest.customerName} • {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              {/* Select 6 Stages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Milestone Stage:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setModalStage(st.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        modalStage === st.id
                          ? "bg-red-50 border-[#ed2025] text-slate-900 font-bold shadow-xs"
                          : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
                          modalStage === st.id
                            ? "bg-[#ed2025] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {st.id}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier and Waybill Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Freight Carrier
                  </label>
                  <select
                    value={modalCarrier}
                    onChange={(e) => setModalCarrier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025]"
                  >
                    <option value="DHL Express">DHL Express Air</option>
                    <option value="FedEx International">FedEx International</option>
                    <option value="Mainfreight Multimodal">Mainfreight Multimodal</option>
                    <option value="Nippon Express">Nippon Express</option>
                    <option value="NZ Post Couriers">NZ Post Couriers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Airway Bill / Tracking Code
                  </label>
                  <input
                    type="text"
                    value={modalWaybill}
                    onChange={(e) => setModalWaybill(e.target.value)}
                    placeholder="e.g. AWB-9281-NZ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#ed2025]"
                  />
                </div>
              </div>

              {/* Checkpoint Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Checkpoint Location / Depot
                </label>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025]"
                />
              </div>

              {/* Coordinator Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inspection / Milestone Notes
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#ed2025] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save &amp; Broadcast Live Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
