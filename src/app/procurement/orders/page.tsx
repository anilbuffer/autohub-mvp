"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Building2,
  DollarSign,
  Clock,
  ArrowRight,
  Search,
  ArrowLeft,
  Check,
  Printer,
  Send,
  ShieldCheck,
  Package,
  Truck,
  Compass,
} from "lucide-react";
import {
  getStoredRequests,
  updateRequestStatus,
  subscribeToStore,
  saveRequests,
} from "@/lib/store";
import { PartRequest } from "@/lib/types";

// Interface for PO order display items
interface POItem {
  id: string;
  poNumber: string;
  referenceNumber: string;
  date: string;
  partName: string;
  oemPartNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  customerName: string;
  paymentType: string;
  totalNzd: number;
  gateStatus: "PAYMENT_CONFIRMED" | "TRANSMITTED" | "DISPATCHED";
  vendorName: string;
  vendorCountry: string;
  vendorCurrency: string;
  destinationHub: string;
  freightMethodName: string;
  unitExHubCostForeign: string;
  totalLandedNzd: number;
  receiptNumber: string;
  packagingInstructions: string;
  rawRequest?: PartRequest;
}

// Sample Mock PO Orders matching Image 1 & Image 2
const DEFAULT_MOCK_POS: POItem[] = [
  {
    id: "PO-REQ-000124",
    poNumber: "PO-000124",
    referenceNumber: "AH-P-000124",
    date: "8/09/2026",
    partName: "Bi-Turbo Intercooler Core & Boost Hose Kit",
    oemPartNumber: "JB3Z-6K775-B",
    make: "Ford",
    model: "Ranger",
    year: 2022,
    vin: "MNBMSFE80NW192842",
    customerName: "AutoCare Auckland",
    paymentType: "Trade Credit",
    totalNzd: 1280.0,
    gateStatus: "PAYMENT_CONFIRMED",
    vendorName: "Toyota Nagoya Wholesale Distribution Center",
    vendorCountry: "Japan",
    vendorCurrency: "JPY",
    destinationHub: "Autohub Logistics Center — Auckland Terminal Bay 4",
    freightMethodName: "Priority Air Express (Cathay / Air NZ)",
    unitExHubCostForeign: "¥48,000 JPY",
    totalLandedNzd: 518.4,
    receiptNumber: "REC-2026-00892",
    packagingInstructions:
      "Priority packaging and air waybill dispatch. Export Bay: Centrair Nagoya Terminal.",
  },
  {
    id: "PO-REQ-000125",
    poNumber: "PO-000125",
    referenceNumber: "AH-P-000125",
    date: "7/09/2026",
    partName: "KDSS Hydraulic Cylinder Actuator (Front Stabilizer)",
    oemPartNumber: "48810-60040",
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2022,
    vin: "JTEBX3FJ5NK190284",
    customerName: "AutoCare Auckland",
    paymentType: "Direct Transfer",
    totalNzd: 1183.07,
    gateStatus: "TRANSMITTED",
    vendorName: "Nagoya Auto Direct K.K.",
    vendorCountry: "Japan",
    vendorCurrency: "JPY",
    destinationHub: "Autohub Logistics Center — Auckland Terminal Bay 2",
    freightMethodName: "Priority Air Express",
    unitExHubCostForeign: "¥58,000 JPY",
    totalLandedNzd: 626.4,
    receiptNumber: "REC-2026-00841",
    packagingInstructions: "Export sealed carton with biosecurity tags.",
  },
  {
    id: "PO-REQ-000126",
    poNumber: "PO-000126",
    referenceNumber: "AH-P-000126",
    date: "6/09/2026",
    partName: "High-Pressure Common Rail Diesel Fuel Pump (Bosch CP4)",
    oemPartNumber: "13518597818",
    make: "BMW",
    model: "X5 xDrive30d",
    year: 2021,
    vin: "WBAJU820409E19284",
    customerName: "Canterbury Commercial Fleet Services",
    paymentType: "Trade Credit",
    totalNzd: 1540.0,
    gateStatus: "TRANSMITTED",
    vendorName: "Munich Auto Teile GmbH",
    vendorCountry: "Germany",
    vendorCurrency: "EUR",
    destinationHub: "Autohub Logistics Center — Christchurch Terminal",
    freightMethodName: "Air Freight Express",
    unitExHubCostForeign: "€540 EUR",
    totalLandedNzd: 982.8,
    receiptNumber: "REC-2026-00812",
    packagingInstructions: "Original Bosch factory package with test report.",
  },
];

export default function SupplierOrdersPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [poList, setPoList] = useState<POItem[]>(DEFAULT_MOCK_POS);
  const [selectedPO, setSelectedPO] = useState<POItem | null>(null);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<"READY" | "TRANSMITTED" | "ALL">(
    "READY"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Detail View Form State
  const [packagingInstructions, setPackagingInstructions] = useState(
    "Priority packaging and air waybill dispatch. Export Bay: Centrair Nagoya Terminal."
  );

  // Toast Notification
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refresh = () => {
    const stored = getStoredRequests();
    setRequests(stored);

    // Convert stored payment confirmed / ordered requests to PO list items if available
    if (stored && stored.length > 0) {
      const livePOs: POItem[] = stored
        .filter(
          (r) =>
            r.status === "PAYMENT_CONFIRMED" ||
            r.status === "ORDERED_FROM_SUPPLIER" ||
            r.status === "SUPPLIER_DISPATCHED"
        )
        .map((r) => {
          const supplier = r.supplierQuotes?.[0];
          return {
            id: `PO-${r.id}`,
            poNumber: `PO-${r.referenceNumber.replace("AH-P-", "")}`,
            referenceNumber: r.referenceNumber,
            date: new Date(r.submittedDate).toLocaleDateString("en-GB"),
            partName: r.part.partName,
            oemPartNumber: r.part.oemPartNumber || r.part.oemNumber || "OEM-SPEC",
            make: r.vehicle.make,
            model: r.vehicle.model,
            year: r.vehicle.year,
            vin: r.vehicle.vin,
            customerName: r.customerName,
            paymentType: r.invoice?.paymentMethod || "Trade Credit",
            totalNzd: r.quote?.totalNzd || 1280.0,
            gateStatus:
              r.status === "PAYMENT_CONFIRMED" ? "PAYMENT_CONFIRMED" : "TRANSMITTED",
            vendorName: supplier?.supplierName || "Toyota Nagoya Wholesale Distribution Center",
            vendorCountry: supplier?.supplierCountry || "Japan",
            vendorCurrency: supplier?.partCostCurrency || "JPY",
            destinationHub: "Autohub Logistics Center — Auckland Terminal Bay 4",
            freightMethodName: "Priority Air Express (Cathay / Air NZ)",
            unitExHubCostForeign: supplier
              ? `${supplier.partCostCurrency === "JPY" ? "¥" : "$"}${supplier.partCostForeign.toLocaleString()} ${supplier.partCostCurrency}`
              : "¥48,000 JPY",
            totalLandedNzd: supplier?.partCostNzd || 518.4,
            receiptNumber: `REC-2026-00${Math.floor(800 + Math.random() * 100)}`,
            packagingInstructions:
              "Priority packaging and air waybill dispatch. Export Bay: Centrair Nagoya Terminal.",
            rawRequest: r,
          };
        });

      // Merge mock PO-000124 if not present
      const hasMock124 = livePOs.some((p) => p.poNumber === "PO-000124");
      if (!hasMock124) {
        setPoList([...DEFAULT_MOCK_POS, ...livePOs]);
      } else {
        setPoList(livePOs);
      }
    } else {
      setPoList(DEFAULT_MOCK_POS);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id") || params.get("ref");
      if (idParam) {
        const storedReqs = getStoredRequests();
        const live = storedReqs
          .filter((r) => r.status === "PAYMENT_CONFIRMED" || r.status === "ORDERED_FROM_SUPPLIER" || r.status === "SUPPLIER_DISPATCHED")
          .map((r) => ({
            id: `PO-${r.id}`,
            poNumber: `PO-${r.referenceNumber.replace("AH-P-", "")}`,
            referenceNumber: r.referenceNumber,
            date: new Date(r.submittedDate).toLocaleDateString("en-GB"),
            partName: r.part.partName,
            oemPartNumber: r.part.oemPartNumber || r.part.oemNumber || "OEM-SPEC",
            make: r.vehicle.make,
            model: r.vehicle.model,
            year: r.vehicle.year,
            vin: r.vehicle.vin,
            customerName: r.customerName,
            paymentType: r.invoice?.paymentMethod || "Trade Credit",
            totalNzd: r.quote?.totalNzd || 1280.0,
            gateStatus: r.status === "PAYMENT_CONFIRMED" ? ("PAYMENT_CONFIRMED" as const) : ("TRANSMITTED" as const),
            vendorName: "Toyota Nagoya Wholesale Distribution Center",
            vendorCountry: "Japan",
            vendorCurrency: "JPY",
            destinationHub: "Autohub Logistics Center — Auckland Terminal Bay 4",
            freightMethodName: "Priority Air Express (Cathay / Air NZ)",
            unitExHubCostForeign: "¥48,000 JPY",
            totalLandedNzd: r.quote?.basePartCostNzd || 518.4,
            receiptNumber: `REC-2026-0088`,
            packagingInstructions: "Priority packaging and air waybill dispatch. Export Bay: Centrair Nagoya Terminal.",
            rawRequest: r,
          }));
        const all = [...DEFAULT_MOCK_POS, ...live];
        const match = all.find(p => p.referenceNumber === idParam || p.poNumber === idParam || p.id === idParam || p.poNumber === `PO-${idParam.replace("AH-P-", "")}`);
        if (match) {
          setSelectedPO(match);
        }
      }
    }

    return unsub;
  }, []);

  // Update packaging instructions when selectedPO changes
  useEffect(() => {
    if (selectedPO) {
      setPackagingInstructions(
        selectedPO.packagingInstructions ||
          "Priority packaging and air waybill dispatch. Export Bay: Centrair Nagoya Terminal."
      );
    }
  }, [selectedPO]);

  // Transmit Official PO Handler
  const handleTransmitPO = () => {
    if (!selectedPO) return;

    // Update state locally
    const updatedList = poList.map((p) =>
      p.id === selectedPO.id ? { ...p, gateStatus: "TRANSMITTED" as const } : p
    );
    setPoList(updatedList);

    // If linked to rawRequest, update status in store
    if (selectedPO.rawRequest) {
      updateRequestStatus(
        selectedPO.rawRequest.id,
        "ORDERED_FROM_SUPPLIER",
        "Nathan Cole",
        "PROCUREMENT",
        `Official PO ${selectedPO.poNumber} transmitted to vendor ${selectedPO.vendorName}. Packaging & waybill dispatch confirmed.`
      );
    }

    showNotification(
      `Official Purchase Order ${selectedPO.poNumber} transmitted to ${selectedPO.vendorName}! Vendor dispatch authorized.`
    );
    setSelectedPO(null);
  };

  // Print PDF Action
  const handlePrintPDF = () => {
    showNotification(`Generating printable PO document PDF for ${selectedPO?.poNumber || "PO-000124"}...`);
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Counts for tabs & KPI cards
  const readyCount = poList.filter((p) => p.gateStatus === "PAYMENT_CONFIRMED").length;
  const transmittedCount = poList.filter((p) => p.gateStatus === "TRANSMITTED").length;
  const totalCount = poList.length;
  const committedSourcingValue = poList.reduce((acc, p) => acc + p.totalNzd, 0);

  // Filtered PO list based on active tab and search query
  const filteredPOs = poList.filter((p) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "READY" && p.gateStatus === "PAYMENT_CONFIRMED") ||
      (activeTab === "TRANSMITTED" && p.gateStatus === "TRANSMITTED");

    if (!searchQuery.trim()) return matchesTab;
    const q = searchQuery.toLowerCase();
    return (
      matchesTab &&
      (p.poNumber.toLowerCase().includes(q) ||
        p.referenceNumber.toLowerCase().includes(q) ||
        p.partName.toLowerCase().includes(q) ||
        p.vin.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounceIn ${
            toast.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PO TRANSMISSION DETAIL VIEW (WHEN AN ORDER IS SELECTED)           */}
      {/* ========================================================================= */}
      {selectedPO ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Detail Navigation Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedPO(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Purchase Orders</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                PO: <strong className="text-slate-900 font-mono">{selectedPO.poNumber}</strong> • Ref: <strong className="text-slate-900 font-mono">{selectedPO.referenceNumber}</strong>
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Confirmed</span>
              </span>
            </div>
          </div>

          {/* Main Card 1: Payment Confirmed Gate Cleared Banner */}
          <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-950/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-emerald-950 leading-tight">
                  Payment Confirmed Gate Cleared
                </h2>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                  Receipt {selectedPO.receiptNumber} verified • Funds held in Autohub Trust Account
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-base font-black text-emerald-950">
                ${selectedPO.totalNzd.toFixed(2)} NZD
              </div>
              <div className="text-[11px] font-bold text-emerald-700">
                100% Cleared
              </div>
            </div>
          </div>

          {/* Main Card 2: Official Purchase Order Document Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            {/* Header section of PO Document */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  AUTOHUB NEW ZEALAND LIMITED — GLOBAL PROCUREMENT DESK
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nagoya Port Logistics Bay (JP) • Auckland Trade HQ (NZBN 9429038472910)
                </p>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs font-black uppercase tracking-wider text-[#ed2025]">
                  PURCHASE ORDER: {selectedPO.poNumber}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  DATE: {selectedPO.date}
                </div>
              </div>
            </div>

            {/* 2 Inner Info Columns: Vendor & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  OVERSEAS SUPPLIER (VENDOR):
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {selectedPO.vendorName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Terminal Hub: {selectedPO.vendorCountry} • Currency: {selectedPO.vendorCurrency}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  DESTINATION &amp; FREIGHT CONSOLIDATION:
                </span>
                <div className="font-black text-slate-900 text-sm">
                  {selectedPO.destinationHub}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Method: {selectedPO.freightMethodName}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-5">ITEM / OEM PART NUMBER</th>
                    <th className="py-3 px-5">FITMENT TARGET</th>
                    <th className="py-3 px-5">QTY</th>
                    <th className="py-3 px-5">UNIT EX-HUB COST</th>
                    <th className="py-3 px-5 text-right">TOTAL LANDED (NZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">
                        {selectedPO.partName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {selectedPO.oemPartNumber}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800">
                        {selectedPO.year} {selectedPO.make} {selectedPO.model}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        VIN: {selectedPO.vin}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">1</td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-800">
                      {selectedPO.unitExHubCostForeign}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-black text-slate-900">
                      ${selectedPO.totalLandedNzd.toFixed(2)} NZD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Export Packaging & Carrier Waybill Dispatch Instructions Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 block">
                  Export Packaging &amp; Carrier Waybill Dispatch Instructions:
                </label>
                <span className="text-[10px] text-slate-400 italic">
                  Transmitted directly to overseas vendor
                </span>
              </div>
              <textarea
                rows={3}
                value={packagingInstructions}
                onChange={(e) => setPackagingInstructions(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#059669] bg-slate-50/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTransmitPO}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Transmit Official PO to Overseas Vendor</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print PO PDF</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 1: PLACE SUPPLIER POS TABLE LIST VIEW                                */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top 4 KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: READY FOR PO RELEASE */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>READY FOR PO RELEASE</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-600">
                  {readyCount}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Customer payment verified and cleared
                </div>
              </div>
            </div>

            {/* Card 2: TRANSMITTED TO VENDORS */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>TRANSMITTED TO VENDORS</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">
                  {transmittedCount}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Orders active in overseas fulfillment
                </div>
              </div>
            </div>

            {/* Card 3: COMMITTED SOURCING VALUE */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>COMMITTED SOURCING VALUE</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  ${committedSourcingValue.toLocaleString("en-NZ", { minimumFractionDigits: 0 })} <span className="text-xs font-bold text-slate-400">NZD</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Total active international supplier commitments
                </div>
              </div>
            </div>

            {/* Card 4: GATE RELEASE SLA */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>GATE RELEASE SLA</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900">
                  18 <span className="text-sm font-bold text-slate-500">mins</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Average time from payment to PO transmission
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="p-1 rounded-2xl bg-slate-100/80 flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("READY")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "READY"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ready to Order ({readyCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("TRANSMITTED")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "TRANSMITTED"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Transmitted ({transmittedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Orders ({totalCount})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PO ref, VIN, part, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Table Container (Matching Image 1 Layout) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">PO REFERENCE &amp; DATE</th>
                    <th className="py-4 px-6">REQUESTED PART</th>
                    <th className="py-4 px-6">TARGET VEHICLE &amp; VIN</th>
                    <th className="py-4 px-6">CUSTOMER &amp; PAYMENT</th>
                    <th className="py-4 px-6">TOTAL (NZD)</th>
                    <th className="py-4 px-6">GATE STATUS</th>
                    <th className="py-4 px-6 text-right">ACTION</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No purchase orders found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => (
                      <tr
                        key={po.id}
                        onClick={() => setSelectedPO(po)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        {/* 1. PO Reference & Date */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-mono font-black text-slate-900 group-hover:text-[#059669] transition">
                            {po.poNumber}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {po.referenceNumber}
                          </div>
                        </td>

                        {/* 2. Requested Part */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {po.partName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {po.oemPartNumber}
                          </div>
                        </td>

                        {/* 3. Target Vehicle & VIN */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {po.year} {po.make} {po.model}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            VIN: {po.vin}
                          </div>
                        </td>

                        {/* 4. Customer & Payment */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">
                            {po.customerName}
                          </div>
                          <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {po.paymentType}
                          </span>
                        </td>

                        {/* 5. Total (NZD) */}
                        <td className="py-4 px-6 whitespace-nowrap font-mono">
                          <div className="font-black text-slate-900 text-sm">
                            ${po.totalNzd.toFixed(2)} NZD
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Funds Cleared
                          </div>
                        </td>

                        {/* 6. Gate Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
                              po.gateStatus === "PAYMENT_CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {po.gateStatus === "PAYMENT_CONFIRMED"
                                ? "Payment Confirmed"
                                : "Transmitted to Vendor"}
                            </span>
                          </span>
                        </td>

                        {/* 7. Action */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPO(po);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs transition shadow-xs active:scale-[0.98]"
                          >
                            <span>Review &amp; Transmit</span>
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
    </div>
  );
}
