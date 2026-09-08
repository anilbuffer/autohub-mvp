"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Truck,
  Plane,
  Anchor,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  MapPin,
  Save,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  getStoredRequests,
  updateShipmentDetails,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, ShipmentCarrier } from "@/lib/types";

export default function OperationsTrackingPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [search, setSearch] = useState("");
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [carrier, setCarrier] = useState<ShipmentCarrier>("MAINFREIGHT");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrierEta, setCarrierEta] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    const all = getStoredRequests();
    setRequests(all);
    if (!selectedReqId && all.length > 0) {
      setSelectedReqId(all[0].id);
      if (all[0].shipment) {
        setCarrier(all[0].shipment.carrier);
        setTrackingNumber(all[0].shipment.trackingNumber || "");
        setCarrierEta(all[0].shipment.carrierEta || "");
      }
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedReqId);

  const handleSelectRequest = (r: PartRequest) => {
    setSelectedReqId(r.id);
    if (r.shipment) {
      setCarrier(r.shipment.carrier);
      setTrackingNumber(r.shipment.trackingNumber || "");
      setCarrierEta(r.shipment.carrierEta || "");
    } else {
      setCarrier("MAINFREIGHT");
      setTrackingNumber("");
      setCarrierEta("");
    }
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId) return;

    updateShipmentDetails(selectedReqId, {
      carrier: carrier,
      trackingNumber: trackingNumber,
      carrierEta: carrierEta,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRequests = requests.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.part.partName.toLowerCase().includes(q) ||
        (r.shipment?.trackingNumber && r.shipment.trackingNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
            Tracking Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record international and domestic carrier waybills, container tracking numbers, and automated customer tracking links.
          </p>
        </div>

        <Link
          href="/operations/shipments"
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <Truck className="w-4 h-4 text-slate-500" />
          <span>View All Shipments</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Carrier consignment tracking details updated and broadcast to customer portal tracker.</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Consignment List */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Consignments ({filteredRequests.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ref or tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ed2025]"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.map((r) => {
              const isSelected = r.id === selectedReqId;
              const hasTracking = !!r.shipment?.trackingNumber;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRequest(r)}
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
                    {hasTracking ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
                        {r.shipment?.carrier}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        No Carrier AWB
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

        {/* Right: Tracking Entry & Live Milestone View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRequest ? (
            <div className="space-y-6">
              {/* Consignment Banner */}
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
                      Destination: {selectedRequest.customerName} (New Zealand)
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Current Milestone
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                {/* Entry Form */}
                <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Freight Logistics Carrier
                      </label>
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold outline-none focus:border-[#ed2025]"
                      >
                        <option value="MAINFREIGHT">Mainfreight Air &amp; Ocean</option>
                        <option value="DHL_EXPRESS">DHL Express Worldwide</option>
                        <option value="AIR_NZ_CARGO">Air New Zealand Cargo</option>
                        <option value="MAERSK_LINE">Maersk Ocean Line</option>
                        <option value="TOLL_GROUP">Toll Group New Zealand</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Tracking / Master Waybill (AWB/BOL) #
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MFL-NZ-982142"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Carrier Estimated Arrival (ETA)
                      </label>
                      <input
                        type="date"
                        value={carrierEta}
                        onChange={(e) => setCarrierEta(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-900 outline-none focus:border-[#ed2025]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {trackingNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(trackingNumber)}
                        className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied to clipboard!" : "Copy Consignment Number"}</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      className="ml-auto px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Update Carrier Tracking</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Milestone Timeline */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#ed2025]" />
                  <span>Consignment Milestone Timeline</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Origin Departure</span>
                    <span className="font-bold text-slate-800 block">Tokyo Hub / Yokohama</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Departed</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">2. In-Transit</span>
                    <span className="font-bold text-slate-800 block">{carrier} Express</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Active en-route</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">3. NZ Customs &amp; MPI</span>
                    <span className="font-bold text-slate-800 block">Auckland International</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Pending Arrival</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">4. Final Delivery</span>
                    <span className="font-bold text-slate-800 block">{selectedRequest.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
              Select a consignment to view tracking details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
