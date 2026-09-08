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
  X
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
  const [filterOrigin, setFilterOrigin] = useState("ALL");
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

    // Update in central store
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

    setIsSuccessMessage(`Shipment milestone for ${selectedRequest.id} successfully updated to Stage ${modalStage} (${STAGES[modalStage - 1].name})!`);
    setSelectedRequest(null);
    setTimeout(() => setIsSuccessMessage(null), 5000);
  };

  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      req.id.toLowerCase().includes(q) ||
      req.customerName?.toLowerCase().includes(q) ||
      req.part?.partName?.toLowerCase().includes(q) ||
      req.part?.oemPartNumber?.toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Operations
            </span>
            <span className="text-xs text-slate-500">6-Stage Milestone Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-cyan-400" />
            Shipment Dispatch & Milestone Register
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track airway bills, container ocean manifests, customs releases, and courier bay drop-offs in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/operations/freight"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Anchor className="h-3.5 w-3.5" />
            Freight Tariffs
          </Link>
          <Link
            href="/operations/exceptions"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Customs Holds
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{isSuccessMessage}</span>
          </div>
          <button onClick={() => setIsSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search consignment, request ID, part #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400">Carrier:</span>
          <select
            value={filterCarrier}
            onChange={(e) => setFilterCarrier(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Carriers</option>
            <option value="DHL">DHL Express</option>
            <option value="FEDEX">FedEx International</option>
            <option value="MAINFREIGHT">Mainfreight Air & Ocean</option>
            <option value="NIPPON">Nippon Express</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Consignment / Request</th>
                <th className="py-3.5 px-4 font-semibold">Customer & Vehicle</th>
                <th className="py-3.5 px-4 font-semibold">Route & Hub</th>
                <th className="py-3.5 px-4 font-semibold">Waybill / Container</th>
                <th className="py-3.5 px-4 font-semibold">Milestone Stage</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredRequests.map((req, idx) => {
                // Determine stage number
                const stageNum = getStageFromStatus(req.status);
                const stageName = STAGES[stageNum - 1].name;
                const isDelivered = stageNum === 6;

                const originHub = idx % 2 === 0 ? "Tokyo (NRT)" : "Frankfurt (FRA)";
                const carrier = idx % 2 === 0 ? "DHL Express" : "Mainfreight Ocean";

                return (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-white">{req.id}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                        {req.part?.partName || req.part?.descriptionNotes}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400">
                        {req.part?.oemPartNumber || "OEM-SPARE"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-white">{req.customerName}</div>
                      <div className="text-xs text-slate-400">
                        {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {typeof req.deliveryAddress === "object" && req.deliveryAddress ? `${req.deliveryAddress.street}, ${req.deliveryAddress.city}` : (req.deliveryAddress as any) || "Auckland Workshop Bay"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <span className="font-medium text-slate-400">{originHub}</span>
                        <ArrowRight className="h-3 w-3 text-cyan-400" />
                        <span className="font-semibold text-white">AKL Hub</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Airway: Trans-Pacific Express</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-xs text-slate-300">
                        AWB-NZ-{req.id.slice(-3)}-9281
                      </div>
                      <div className="text-[11px] text-cyan-400/90 font-medium mt-0.5">
                        {carrier}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-300">
                            Stage {stageNum}: {stageName}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isDelivered ? "bg-emerald-400" : "bg-cyan-500"
                            }`}
                            style={{ width: `${(stageNum / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openMilestoneModal(req)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
                      >
                        Update Milestone
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Milestone Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-cyan-800/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 uppercase tracking-wider">
                  Logistics Coordinator Action
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Update Transit Milestone: {selectedRequest.id}
                </h2>
                <p className="text-xs text-slate-400">
                  Customer: {selectedRequest.customerName} • {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="space-y-4">
              {/* Select 6 Stages */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Multimodal Milestone Stage:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setModalStage(st.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        modalStage === st.id
                          ? "bg-cyan-500/20 border-cyan-500 text-white shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          modalStage === st.id
                            ? "bg-cyan-500 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {st.id}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold">{st.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier and Waybill Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Freight Carrier
                  </label>
                  <select
                    value={modalCarrier}
                    onChange={(e) => setModalCarrier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DHL Express">DHL Express Air</option>
                    <option value="FedEx International">FedEx International</option>
                    <option value="Mainfreight Air & Ocean">Mainfreight Air & Ocean</option>
                    <option value="Nippon Express">Nippon Express</option>
                    <option value="NZ Post Courier">NZ Post Couriers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Airway Bill / Tracking Code
                  </label>
                  <input
                    type="text"
                    value={modalWaybill}
                    onChange={(e) => setModalWaybill(e.target.value)}
                    placeholder="e.g. AWB-9281-NZ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Checkpoint Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Current Checkpoint Location / Depot
                </label>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Coordinator Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Inspection / Milestone Notes
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Notify Customer Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
