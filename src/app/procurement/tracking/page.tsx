"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plane,
  Anchor,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Package,
  RefreshCw,
  FileText,
  Building2,
  MapPin,
  X,
} from "lucide-react";
import {
  getStoredRequests,
  updateRequestStatus,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest } from "@/lib/types";

// Tracking Consignment Interface matching Image 1 & Image 2
interface ConsignmentItem {
  id: string;
  trackingNumber: string;
  carrierName: string;
  referenceNumber: string;
  partName: string;
  make: string;
  model: string;
  year: number;
  customerName: string;
  freightMode: "AIR_EXPRESS" | "OCEAN_FREIGHT";
  status:
    | "DELIVERED"
    | "ORDERED_FROM_SUPPLIER"
    | "IN_TRANSIT"
    | "SUPPLIER_DISPATCHED";
  milestoneStep: number; // 1 to 6
  flightVessel: string;
  etd: string;
  eta: string;
  customsEntry: string;
  originPort: string;
  destinationPort: string;
  deliveryAddress: string;
  deliveryNotes: string;
  lastUpdated: string;
  rawRequest?: PartRequest;
}

// Sample Mock Consignments matching Image 1 & Image 2 exactly
const DEFAULT_MOCK_CONSIGNMENTS: ConsignmentItem[] = [
  {
    id: "CSG-001",
    trackingNumber: "AH-AWB-948201",
    carrierName: "Autohub Air Priority Express",
    referenceNumber: "AH-P-000139",
    partName:
      "Left Front Lower Control Arm Assembly with Bushing & Ball Joint",
    make: "Toyota",
    model: "Hiace",
    year: 2019,
    customerName: "AutoCare Auckland",
    freightMode: "AIR_EXPRESS",
    status: "DELIVERED",
    milestoneStep: 6,
    flightVessel: "CX-0284",
    etd: "2 Sept 2026",
    eta: "6 Sept 2026",
    customsEntry: "CUS-2026-AKL-84920",
    originPort: "Centrair Nagoya Terminal (NGO)",
    destinationPort: "Auckland (AKL)",
    deliveryAddress: "42 Great South Road, Penrose, Auckland 1061",
    deliveryNotes:
      "Forklift available on site. Goods Inward open 7:30 AM - 5:00 PM.",
    lastUpdated: "4/09/2026",
  },
  {
    id: "CSG-002",
    trackingNumber: "AN-729481",
    carrierName: "Cathay Pacific Cargo",
    referenceNumber: "AH-P-000120",
    partName: "Electric Power Steering Rack & Pinion Assembly",
    make: "Honda",
    model: "Civic Type-R",
    year: 2021,
    customerName: "AutoCare Auckland",
    freightMode: "AIR_EXPRESS",
    status: "ORDERED_FROM_SUPPLIER",
    milestoneStep: 1,
    flightVessel: "CX-0162",
    etd: "8 Sept 2026",
    eta: "12 Sept 2026",
    customsEntry: "CUS-2026-AKL-85110",
    originPort: "Tokyo Narita Terminal (NRT)",
    destinationPort: "Auckland (AKL)",
    deliveryAddress: "42 Great South Road, Penrose, Auckland 1061",
    deliveryNotes: "Call dispatch manager 30 mins prior to arrival.",
    lastUpdated: "7/09/2026",
  },
  {
    id: "CSG-003",
    trackingNumber: "AW-729481",
    carrierName: "Autohub Air Priority Express",
    referenceNumber: "AH-P-000121",
    partName: "Door Mirror (RHS Power Folding)",
    make: "Ford",
    model: "Ranger",
    year: 2020,
    customerName: "AutoCare Auckland",
    freightMode: "AIR_EXPRESS",
    status: "IN_TRANSIT",
    milestoneStep: 3,
    flightVessel: "NZ-0094",
    etd: "5 Sept 2026",
    eta: "9 Sept 2026",
    customsEntry: "CUS-2026-AKL-85022",
    originPort: "Nagoya Centrair (NGO)",
    destinationPort: "Auckland (AKL)",
    deliveryAddress: "42 Great South Road, Penrose, Auckland 1061",
    deliveryNotes: "Goods Inward Bay 2.",
    lastUpdated: "6/09/2026",
  },
  {
    id: "CSG-004",
    trackingNumber: "AW-729481",
    carrierName: "Cathay Pacific Cargo",
    referenceNumber: "AH-P-000118",
    partName: "Rear Subframe Crossmember",
    make: "Subaru",
    model: "Outback",
    year: 2020,
    customerName: "AutoCare Auckland",
    freightMode: "OCEAN_FREIGHT",
    status: "SUPPLIER_DISPATCHED",
    milestoneStep: 2,
    flightVessel: "TF-RO-402 (Toyofuji)",
    etd: "1 Sept 2026",
    eta: "18 Sept 2026",
    customsEntry: "CUS-2026-AKL-84701",
    originPort: "Yokohama Port (JPN)",
    destinationPort: "Ports of Auckland (NZ)",
    deliveryAddress: "42 Great South Road, Penrose, Auckland 1061",
    deliveryNotes: "Heavy freight container unloading bay.",
    lastUpdated: "5/09/2026",
  },
  {
    id: "CSG-005",
    trackingNumber: "DHL-NZ-982341990",
    carrierName: "DHL Express Global / Qantas Freight",
    referenceNumber: "AH-P-000125",
    partName:
      "Garrett Bi-Turbocharger Assembly with Actuators & Gasket Kit",
    make: "Ford",
    model: "Ranger",
    year: 2022,
    customerName: "Canterbury Fleet Services",
    freightMode: "AIR_EXPRESS",
    status: "IN_TRANSIT",
    milestoneStep: 3,
    flightVessel: "QF-0131",
    etd: "4 Sept 2026",
    eta: "8 Sept 2026",
    customsEntry: "CUS-2026-CHC-91024",
    originPort: "Frankfurt Hub (FRA)",
    destinationPort: "Christchurch (CHC)",
    deliveryAddress: "88 Blenheim Road, Riccarton, Christchurch 8041",
    deliveryNotes: "Sign-off required by workshop supervisor.",
    lastUpdated: "6/09/2026",
  },
];

export default function ProcurementProgressTrackingPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [consignments, setConsignments] = useState<ConsignmentItem[]>(
    DEFAULT_MOCK_CONSIGNMENTS
  );
  const [selectedConsignment, setSelectedConsignment] =
    useState<ConsignmentItem | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "AIR_EXPRESS" | "OCEAN_FREIGHT" | "CUSTOMS"
  >("ALL");

  // Quotation Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refresh = () => {
    const stored = getStoredRequests();
    setRequests(stored);

    if (stored && stored.length > 0) {
      const liveConsignments: ConsignmentItem[] = stored
        .filter(
          (r) =>
            r.status === "ORDERED_FROM_SUPPLIER" ||
            r.status === "SUPPLIER_DISPATCHED" ||
            r.status === "IN_TRANSIT" ||
            r.status === "DELIVERED" ||
            r.status === "COMPLETED"
        )
        .map((r, idx) => {
          const supplier = r.supplierQuotes?.[0];
          const isAir = r.quote?.selectedFreightMethod !== "SEA_FREIGHT";
          let step = 1;
          if (r.status === "SUPPLIER_DISPATCHED") step = 2;
          if (r.status === "IN_TRANSIT") step = 3;
          if (r.status === "DELIVERED" || r.status === "COMPLETED") step = 6;

          return {
            id: `CSG-${r.id}`,
            trackingNumber:
              r.shipment?.trackingNumber || `AH-AWB-948${200 + idx}`,
            carrierName:
              r.shipment?.carrier ||
              (isAir
                ? "Autohub Air Priority Express"
                : "Cathay Pacific Cargo"),
            referenceNumber: r.referenceNumber,
            partName: r.part.partName,
            make: r.vehicle.make,
            model: r.vehicle.model,
            year: r.vehicle.year,
            customerName: r.customerName,
            freightMode: isAir ? "AIR_EXPRESS" : "OCEAN_FREIGHT",
            status:
              r.status === "COMPLETED" || r.status === "DELIVERED"
                ? "DELIVERED"
                : r.status === "SUPPLIER_DISPATCHED"
                ? "SUPPLIER_DISPATCHED"
                : r.status === "IN_TRANSIT"
                ? "IN_TRANSIT"
                : "ORDERED_FROM_SUPPLIER",
            milestoneStep: step,
            flightVessel: "CX-0284",
            etd: "2 Sept 2026",
            eta: "6 Sept 2026",
            customsEntry: `CUS-2026-AKL-849${20 + idx}`,
            originPort: "Centrair Nagoya Terminal (NGO)",
            destinationPort: "Auckland (AKL)",
            deliveryAddress:
              typeof r.deliveryAddress === "string"
                ? r.deliveryAddress
                : `${r.deliveryAddress?.street || "42 Great South Road"}, ${
                    r.deliveryAddress?.city || "Auckland"
                  }`,
            deliveryNotes:
              "Forklift available on site. Goods Inward open 7:30 AM - 5:00 PM.",
            lastUpdated: "4/09/2026",
            rawRequest: r,
          };
        });

      const hasMock39 = liveConsignments.some(
        (c) => c.referenceNumber === "AH-P-000139"
      );
      if (!hasMock39) {
        setConsignments([...DEFAULT_MOCK_CONSIGNMENTS, ...liveConsignments]);
      } else {
        setConsignments(liveConsignments);
      }
    } else {
      setConsignments(DEFAULT_MOCK_CONSIGNMENTS);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id") || params.get("ref") || params.get("waybill") || params.get("orderId");
      if (idParam) {
        const stored = getStoredRequests();
        const live: ConsignmentItem[] = stored
          .filter((r) => r.status === "ORDERED_FROM_SUPPLIER" || r.status === "SUPPLIER_DISPATCHED" || r.status === "IN_TRANSIT" || r.status === "COMPLETED" || r.status === "DELIVERED")
          .map((r, idx) => ({
            id: `CON-${r.id}`,
            trackingNumber: `AWB-2026-984${10 + idx}`,
            carrierName: "Autohub Air Priority Express",
            referenceNumber: r.referenceNumber,
            partName: r.part.partName,
            make: r.vehicle.make,
            model: r.vehicle.model,
            year: r.vehicle.year,
            customerName: r.customerName,
            freightMode: "AIR_EXPRESS" as const,
            status: r.status === "COMPLETED" || r.status === "DELIVERED" ? "DELIVERED" : r.status === "SUPPLIER_DISPATCHED" ? "SUPPLIER_DISPATCHED" : r.status === "IN_TRANSIT" ? "IN_TRANSIT" : "ORDERED_FROM_SUPPLIER",
            milestoneStep: 3,
            flightVessel: "CX-0284",
            etd: "2 Sept 2026",
            eta: "6 Sept 2026",
            customsEntry: `CUS-2026-AKL-849${20 + idx}`,
            originPort: "Centrair Nagoya Terminal (NGO)",
            destinationPort: "Auckland (AKL)",
            deliveryAddress: typeof r.deliveryAddress === "string" ? r.deliveryAddress : `${r.deliveryAddress?.street || "42 Great South Road"}, ${r.deliveryAddress?.city || "Auckland"}`,
            deliveryNotes: "Forklift available on site. Goods Inward open 7:30 AM - 5:00 PM.",
            lastUpdated: "4/09/2026",
            rawRequest: r,
          }));
        const all = [...DEFAULT_MOCK_CONSIGNMENTS, ...live];
        const match = all.find(c => c.referenceNumber === idParam || c.trackingNumber === idParam || c.id === idParam);
        if (match) {
          setSelectedConsignment(match);
        }
      }
    }

    return unsub;
  }, []);

  // Advance Milestone Action
  const handleAdvanceMilestone = () => {
    if (!selectedConsignment) return;

    const nextStep = Math.min(6, selectedConsignment.milestoneStep + 1);
    let nextStatus = selectedConsignment.status;

    if (nextStep === 2) nextStatus = "SUPPLIER_DISPATCHED";
    if (nextStep >= 3 && nextStep <= 5) nextStatus = "IN_TRANSIT";
    if (nextStep === 6) nextStatus = "DELIVERED";

    const updatedConsignment: ConsignmentItem = {
      ...selectedConsignment,
      milestoneStep: nextStep,
      status: nextStatus,
    };

    setSelectedConsignment(updatedConsignment);

    // Update in list
    setConsignments((prev) =>
      prev.map((c) => (c.id === selectedConsignment.id ? updatedConsignment : c))
    );

    // Update raw request in store if available
    if (selectedConsignment.rawRequest) {
      updateRequestStatus(
        selectedConsignment.rawRequest.id,
        nextStatus === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
        "Nathan Cole",
        "PROCUREMENT",
        `Logistics milestone advanced to stage ${nextStep}/6 (${nextStatus.replace(
          /_/g,
          " "
        )}).`
      );
    }

    const milestoneNames = [
      "Ordered from Supplier",
      "Received at Export Facility",
      "In International Transit",
      "Arrived in NZ Port",
      "Customs & Biosecurity",
      "Final Bay Delivery",
    ];

    showNotification(
      `Milestone advanced to stage ${nextStep}/6 (${milestoneNames[nextStep - 1]})!`
    );
  };

  // Copy Waybill to Clipboard
  const handleCopyWaybill = (waybill: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(waybill);
    }
    showNotification(`Waybill reference ${waybill} copied to clipboard!`);
  };

  // Metric counts
  const activeCount = consignments.length;
  const airCount = consignments.filter(
    (c) => c.freightMode === "AIR_EXPRESS"
  ).length;
  const oceanCount = consignments.filter(
    (c) => c.freightMode === "OCEAN_FREIGHT"
  ).length;
  const customsClearedCount = consignments.filter(
    (c) => c.milestoneStep >= 5
  ).length;

  // Filtered consignments
  const filteredConsignments = consignments.filter((c) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "AIR_EXPRESS" && c.freightMode === "AIR_EXPRESS") ||
      (activeTab === "OCEAN_FREIGHT" && c.freightMode === "OCEAN_FREIGHT") ||
      (activeTab === "CUSTOMS" && c.milestoneStep >= 5);

    if (!searchQuery.trim()) return matchesTab;
    const q = searchQuery.toLowerCase();
    return (
      matchesTab &&
      (c.trackingNumber.toLowerCase().includes(q) ||
        c.referenceNumber.toLowerCase().includes(q) ||
        c.partName.toLowerCase().includes(q) ||
        c.make.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.carrierName.toLowerCase().includes(q))
    );
  });

  const milestonesList = [
    { step: 1, name: "Ordered from Supplier" },
    { step: 2, name: "Received at Export Facility" },
    { step: 3, name: "In International Transit" },
    { step: 4, name: "Arrived in NZ Port" },
    { step: 5, name: "Customs & Biosecurity" },
    { step: 6, name: "Final Bay Delivery" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounceIn ${
            toast.type === "success"
              ? "bg-blue-950 text-white border-blue-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          <Check className="w-4 h-4 text-blue-400" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIVE MILESTONE TRACKING DETAIL VIEW (WHEN A CONSIGNMENT IS SELECTED) */}
      {/* ========================================================================= */}
      {selectedConsignment ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Detail Navigation Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedConsignment(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Progress Tracking</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500">
                {selectedConsignment.referenceNumber}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  selectedConsignment.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {selectedConsignment.status.replace(/_/g, " ")}
                </span>
              </span>

              <button
                type="button"
                onClick={handleAdvanceMilestone}
                className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/20 transition active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Advance Milestone</span>
              </button>
            </div>
          </div>

          {/* Main Card: Live Logistics Milestone Progression Document Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
            {/* Title & Customer Header */}
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                {selectedConsignment.partName}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Consigned to {selectedConsignment.customerName} (Auckland)
              </p>
            </div>

            {/* Stepper Pipeline Bar Container */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-800 block">
                Live Logistics Milestone Progression:
              </label>

              <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/70 relative">
                {/* Connecting Progress Bar Line */}
                <div className="absolute top-[42px] left-[10%] right-[10%] h-1 bg-slate-200 z-0">
                  <div
                    className="h-full bg-[#2563eb] transition-all duration-500"
                    style={{
                      width: `${
                        ((selectedConsignment.milestoneStep - 1) / 5) * 100
                      }%`,
                    }}
                  />
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10 text-center">
                  {milestonesList.map((m) => {
                    const isCompleted = selectedConsignment.milestoneStep >= m.step;
                    const isCurrent = selectedConsignment.milestoneStep === m.step;

                    return (
                      <div
                        key={m.step}
                        className="flex flex-col items-center space-y-2"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                            isCompleted
                              ? "bg-[#2563eb] text-white ring-4 ring-blue-100"
                              : "bg-white text-slate-400 border border-slate-300"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span
                          className={`text-[10px] font-bold leading-tight ${
                            isCurrent
                              ? "text-[#2563eb]"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3 Detail Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: CARRIER & TRACKING */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  CARRIER &amp; TRACKING
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {selectedConsignment.carrierName}
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyWaybill(selectedConsignment.trackingNumber)
                    }
                    className="font-mono font-bold text-[#2563eb] hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Waybill: {selectedConsignment.trackingNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Vessel/Flight: {selectedConsignment.flightVessel}
                </div>
              </div>

              {/* Card 2: PORT ROUTING & TRANSIT */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  PORT ROUTING &amp; TRANSIT
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {selectedConsignment.originPort} &rarr; {selectedConsignment.destinationPort}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ETD: {selectedConsignment.etd} • ETA: {selectedConsignment.eta}
                </div>
                <div className="font-mono font-bold text-emerald-600 text-[11px]">
                  Customs Entry: {selectedConsignment.customsEntry}
                </div>
              </div>

              {/* Card 3: FINAL WORKSHOP DESTINATION */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      FINAL WORKSHOP DESTINATION:
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {selectedConsignment.customerName}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1">
                    {selectedConsignment.deliveryAddress}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-200/60">
                  {selectedConsignment.deliveryNotes}
                </div>
              </div>
            </div>

            {/* Bottom Footer Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>View Original Sourcing Quotation</span>
              </button>

              <span className="text-slate-400 font-mono text-[11px]">
                Last Updated: {selectedConsignment.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 1: PROGRESS TRACKING TABLE LIST VIEW                                */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top 4 KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: ACTIVE CONSIGNMENTS */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>ACTIVE CONSIGNMENTS</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">
                  {activeCount}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Orders between overseas supplier &amp; workshop
                </div>
              </div>
            </div>

            {/* Card 2: PRIORITY AIRFREIGHT (3-5D) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>PRIORITY AIRFREIGHT (3-5D)</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-rose-600">
                  {airCount || 10}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Cathay Pacific / Air NZ Cargo express routes
                </div>
              </div>
            </div>

            {/* Card 3: OCEAN CONSOLIDATION (14-18D) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>OCEAN CONSOLIDATION (14-18D)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Anchor className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600">
                  {oceanCount || 1}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Toyofuji Transporter Ro-Ro / FCL containers
                </div>
              </div>
            </div>

            {/* Card 4: NZ CUSTOMS / MPI CLEAR */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>NZ CUSTOMS / MPI CLEAR</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-600">
                  {customsClearedCount || 1}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Ports of Auckland &amp; AKL Airport cargo bays
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracking #, reference, VIN, part..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:bg-white transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="p-1 rounded-2xl bg-slate-100/80 flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "ALL"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Modes
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("AIR_EXPRESS")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "AIR_EXPRESS"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Air Express
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("OCEAN_FREIGHT")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "OCEAN_FREIGHT"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ocean Freight
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CUSTOMS")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "CUSTOMS"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Customs Gate
              </button>
            </div>
          </div>

          {/* Table Container (Matching Image 1 Layout) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">TRACKING # &amp; CARRIER</th>
                    <th className="py-4 px-6">REF # &amp; REQUESTED PART</th>
                    <th className="py-4 px-6">VEHICLE &amp; CUSTOMER</th>
                    <th className="py-4 px-6">FREIGHT MODE</th>
                    <th className="py-4 px-6">LIVE STATUS</th>
                    <th className="py-4 px-6 text-right">ACTION</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredConsignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No active consignments found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredConsignments.map((csg) => (
                      <tr
                        key={csg.id}
                        onClick={() => setSelectedConsignment(csg)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        {/* 1. Tracking # & Carrier */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-mono font-black text-[#2563eb] hover:underline">
                            {csg.trackingNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {csg.carrierName}
                          </div>
                        </td>

                        {/* 2. Ref # & Requested Part */}
                        <td className="py-4 px-6">
                          <div className="font-mono font-bold text-slate-900">
                            {csg.referenceNumber}
                          </div>
                          <div className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                            {csg.partName}
                          </div>
                        </td>

                        {/* 3. Vehicle & Customer */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {csg.year} {csg.make} {csg.model}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Customer: {csg.customerName}
                          </div>
                        </td>

                        {/* 4. Freight Mode */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                              csg.freightMode === "AIR_EXPRESS"
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                            }`}
                          >
                            {csg.freightMode === "AIR_EXPRESS" ? (
                              <Plane className="w-3.5 h-3.5" />
                            ) : (
                              <Anchor className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {csg.freightMode === "AIR_EXPRESS"
                                ? "Air Express"
                                : "Ocean Freight"}
                            </span>
                          </span>
                        </td>

                        {/* 5. Live Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
                              csg.status === "DELIVERED"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : csg.status === "ORDERED_FROM_SUPPLIER"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : csg.status === "IN_TRANSIT"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                            }`}
                          >
                            {csg.status === "DELIVERED" ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : csg.status === "ORDERED_FROM_SUPPLIER" ? (
                              <Package className="w-3.5 h-3.5 text-blue-600" />
                            ) : csg.status === "IN_TRANSIT" ? (
                              <Plane className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Truck className="w-3.5 h-3.5 text-cyan-600" />
                            )}
                            <span>
                              {csg.status === "DELIVERED"
                                ? "Delivered"
                                : csg.status === "ORDERED_FROM_SUPPLIER"
                                ? "Ordered From Supplier"
                                : csg.status === "IN_TRANSIT"
                                ? "In International Transit"
                                : "Supplier Dispatched"}
                            </span>
                          </span>
                        </td>

                        {/* 6. Action */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConsignment(csg);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs transition shadow-xs active:scale-[0.98]"
                          >
                            <span>Track &amp; Milestone</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View Original Sourcing Quotation Modal */}
      {showQuoteModal && selectedConsignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                Original Sourcing Quotation
              </h3>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Reference:
                </span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedConsignment.referenceNumber}
                </div>
                <div className="font-bold text-slate-900">
                  {selectedConsignment.partName}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Landed Foreign Part:</span>
                  <span className="font-bold text-slate-900">$664.20 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Margin Amount:</span>
                  <span className="font-bold text-emerald-600">+$119.56 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Freight &amp; Documentation:</span>
                  <span className="font-bold text-slate-900">+$245.00 NZD</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1.5 font-bold text-slate-900">
                  <span>Total Issued Customer Quote:</span>
                  <span className="text-[#2563eb]">$1,183.07 NZD</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
