"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckSquare,
  Building2,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  DollarSign,
  Truck,
  Plus,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, SupplierProfile } from "@/lib/types";

interface PipelineItem {
  id: string;
  initials: string;
  referenceNumber: string;
  badges: {
    label: string;
    type: "sourcing" | "quotes" | "delivered" | "delay" | "po" | "payment";
  }[];
  partName: string;
  vehicleCustomerText: string;
  priceText: string;
  freightText: string;
  stageGroup: "STAGE1" | "STAGE2" | "STAGE3" | "STAGE4" | "STAGE5" | "EXCEPTION";
  workspaceHref: string;
}

// Sample Mock Pipeline Items matching the exact screenshot
const DEFAULT_MOCK_PIPELINE: PipelineItem[] = [
  {
    id: "AH-P-000142",
    initials: "TO",
    referenceNumber: "AH-P-000142",
    badges: [{ label: "Logistics Delay / Hold", type: "delay" }],
    partName: "Rear Axle Assembly with E-Locker Differential",
    vehicleCustomerText:
      "2023 Toyota Hilux GR Sport • VIN: MR0HA3CD801984210 • Customer: Canterbury Commercial Fleet Services",
    priceText: "$5183.63 NZD",
    freightText: "Air Express",
    stageGroup: "EXCEPTION",
    workspaceHref: "/procurement/exceptions?id=AH-P-000142",
  },
  {
    id: "AH-P-000140",
    initials: "TO",
    referenceNumber: "AH-P-000140",
    badges: [
      { label: "Sourcing Desk", type: "sourcing" },
      { label: "2 quotes", type: "quotes" },
    ],
    partName: "KDSS Hydraulic Cylinder Actuator (Front Stabilizer)",
    vehicleCustomerText:
      "2022 Toyota Land Cruiser Prado • VIN: JTEBX3FJ5NK190284 • Customer: AutoCare Auckland",
    priceText: "Evaluating Quotes",
    freightText: "Freight Pending",
    stageGroup: "STAGE1",
    workspaceHref: "/procurement/queue?id=AH-P-000140",
  },
  {
    id: "AH-P-000141",
    initials: "BM",
    referenceNumber: "AH-P-000141",
    badges: [
      { label: "Sourcing Desk", type: "sourcing" },
      { label: "2 quotes", type: "quotes" },
    ],
    partName: "High-Pressure Common Rail Diesel Fuel Pump (Bosch CP4)",
    vehicleCustomerText:
      "2021 BMW X5 xDrive30d • VIN: WBAJU820409E19284 • Customer: Canterbury Commercial Fleet Services",
    priceText: "Evaluating Quotes",
    freightText: "Freight Pending",
    stageGroup: "STAGE1",
    workspaceHref: "/procurement/queue?id=AH-P-000141",
  },
  {
    id: "AH-P-000139",
    initials: "TO",
    referenceNumber: "AH-P-000139",
    badges: [{ label: "Delivered", type: "delivered" }],
    partName:
      "Left Front Lower Control Arm Assembly with Bushing & Ball Joint",
    vehicleCustomerText:
      "2019 Toyota Hiace • VIN: JTFLH22P407089139 • Customer: AutoCare Auckland",
    priceText: "$485.00 NZD",
    freightText: "Air Express",
    stageGroup: "STAGE5",
    workspaceHref: "/procurement/tracking?id=AH-P-000139",
  },
  {
    id: "AH-P-000124",
    initials: "FO",
    referenceNumber: "AH-P-000124",
    badges: [{ label: "Payment Confirmed", type: "payment" }],
    partName: "Bi-Turbo Intercooler Core & Boost Hose Kit",
    vehicleCustomerText:
      "2022 Ford Ranger • VIN: MNBMSFE80NW192842 • Customer: AutoCare Auckland",
    priceText: "$1280.00 NZD",
    freightText: "PO Release Ready",
    stageGroup: "STAGE4",
    workspaceHref: "/procurement/orders?id=AH-P-000124",
  },
];

export default function ProcurementDashboardPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [activeStage, setActiveStage] = useState<string>("ALL");
  const [pipelineSearch, setPipelineSearch] = useState<string>("");

  const refresh = () => {
    setRequests(getStoredRequests());
    setSuppliers(getStoredSuppliers());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const sourcingQueue = requests.filter(
    (r) => r.status === "SOURCING" || r.status === "SUBMITTED"
  );

  const activeOrders = requests.filter(
    (r) =>
      r.status === "PAYMENT_CONFIRMED" ||
      r.status === "ORDERED_FROM_SUPPLIER" ||
      r.status === "SUPPLIER_DISPATCHED"
  );

  const totalQuotesCaptured = requests.reduce(
    (acc, r) => acc + (r.supplierQuotes?.length || 0),
    0
  );

  // Convert stored requests into pipeline items if available
  const livePipelineItems: PipelineItem[] = requests.map((r) => {
    const makeInit = r.vehicle.make.slice(0, 2).toUpperCase() || "AU";
    let stage: PipelineItem["stageGroup"] = "STAGE1";
    let badges: PipelineItem["badges"] = [{ label: "Sourcing Desk", type: "sourcing" }];
    let priceText = "Evaluating Quotes";
    let freightText = "Freight Pending";
    let baseHref = "/procurement/queue";

    if (r.status === "QUOTE_PREPARED") {
      stage = "STAGE2";
      badges = [{ label: "Quote Prepared", type: "quotes" }];
      priceText = `$${(r.quote?.totalNzd || 1183).toFixed(2)} NZD`;
      freightText = "Awaiting Approval";
    } else if (r.status === "AWAITING_PAYMENT" || r.status === "AWAITING_CUSTOMER_APPROVAL") {
      stage = "STAGE3";
      badges = [{ label: "Awaiting Pay", type: "payment" }];
      priceText = `$${(r.quote?.totalNzd || 1183).toFixed(2)} NZD`;
      freightText = "Invoice Issued";
    } else if (r.status === "PAYMENT_CONFIRMED") {
      stage = "STAGE4";
      badges = [{ label: "PO Release Gate", type: "po" }];
      priceText = `$${(r.quote?.totalNzd || 1280).toFixed(2)} NZD`;
      freightText = "Funds Cleared";
      baseHref = "/procurement/orders";
    } else if (r.status === "ORDERED_FROM_SUPPLIER" || r.status === "SUPPLIER_DISPATCHED" || r.status === "IN_TRANSIT") {
      stage = "STAGE5";
      badges = [{ label: "In Transit", type: "delivered" }];
      priceText = `$${(r.quote?.totalNzd || 980).toFixed(2)} NZD`;
      freightText = "Air / Ocean Freight";
      baseHref = "/procurement/tracking";
    } else if (r.status === "COMPLETED" || r.status === "DELIVERED") {
      stage = "STAGE5";
      badges = [{ label: "Delivered", type: "delivered" }];
      priceText = `$${(r.quote?.totalNzd || 485).toFixed(2)} NZD`;
      freightText = "Air Express";
      baseHref = "/procurement/tracking";
    } else if (r.status.includes("EXCEPTION")) {
      stage = "EXCEPTION";
      badges = [{ label: "Logistics Delay / Hold", type: "delay" }];
      priceText = `$${(r.quote?.totalNzd || 5183).toFixed(2)} NZD`;
      freightText = "Air Express";
      baseHref = "/procurement/exceptions";
    }

    return {
      id: r.referenceNumber,
      initials: makeInit,
      referenceNumber: r.referenceNumber,
      badges,
      partName: r.part.partName,
      vehicleCustomerText: `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} • VIN: ${r.vehicle.vin} • Customer: ${r.customerName}`,
      priceText,
      freightText,
      stageGroup: stage,
      workspaceHref: `${baseHref}?id=${encodeURIComponent(r.referenceNumber)}`,
    };
  });

  // Combined pipeline items ensuring mock items from screenshot are present
  const combinedPipeline = [...DEFAULT_MOCK_PIPELINE];
  livePipelineItems.forEach((item) => {
    if (!combinedPipeline.some((p) => p.referenceNumber === item.referenceNumber)) {
      combinedPipeline.push(item);
    }
  });

  // Filtered items by active stage tab & search query
  const filteredPipelineItems = combinedPipeline.filter((item) => {
    const matchesStage =
      activeStage === "ALL" ||
      (activeStage === "STAGE1" && item.stageGroup === "STAGE1") ||
      (activeStage === "STAGE2" && item.stageGroup === "STAGE2") ||
      (activeStage === "STAGE3" && item.stageGroup === "STAGE3") ||
      (activeStage === "STAGE4" && item.stageGroup === "STAGE4") ||
      (activeStage === "STAGE5" && item.stageGroup === "STAGE5") ||
      (activeStage === "EXCEPTIONS" && item.stageGroup === "EXCEPTION");

    if (!pipelineSearch.trim()) return matchesStage;
    const q = pipelineSearch.toLowerCase();
    return (
      matchesStage &&
      (item.referenceNumber.toLowerCase().includes(q) ||
        item.partName.toLowerCase().includes(q) ||
        item.vehicleCustomerText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ed2025]/20 border border-[#ed2025]/40 text-[#ed2025] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ed2025] animate-pulse" />
            <span>Nagoya &amp; Tokyo Global Sourcing Desk Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Procurement &amp; Global Sourcing Console
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct factory &amp; Tier-1 supplier querying across Japan, Germany, USA and Australia. Capture foreign currency quotations, calculate landed NZD conversions, and place factory Purchase Orders.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/procurement/queue"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-md transition"
            >
              <Compass className="w-4 h-4" />
              <span>Review Sourcing Queue ({sourcingQueue.length || 3})</span>
            </Link>
            <Link
              href="/procurement/suppliers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              <Building2 className="w-4 h-4 text-[#ed2025]" />
              <span>Supplier Directory ({suppliers.length || 5})</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none pr-8 pb-4 hidden lg:block">
          <Compass className="w-64 h-64 text-[#ed2025]" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Sourcing</span>
            <div className="w-9 h-9 rounded-xl bg-[#ed2025]/10 text-[#ed2025] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{sourcingQueue.length || 3}</div>
          <p className="text-[11px] text-slate-500 font-medium">Parts requests requiring supplier quotes</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Quotes Captured</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalQuotesCaptured || 13}</div>
          <p className="text-[11px] text-slate-500 font-medium">Foreign currency quotes logged</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active PO Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeOrders.length || 3}</div>
          <p className="text-[11px] text-slate-500 font-medium">Paid orders ready or placed with suppliers</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Suppliers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{suppliers.length || 5}</div>
          <p className="text-[11px] text-slate-500 font-medium">Verified OEM &amp; aftermarket vendors</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROCUREMENT LIFECYCLE PIPELINE (REPLACES OLD SOURCING QUEUE TABLE)        */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Header Title & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Procurement Lifecycle Pipeline
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any stage to filter active orders across Autohub's door-to-door workflow
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, VIN, part..."
              value={pipelineSearch}
              onChange={(e) => setPipelineSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f172a] transition shadow-xs"
            />
          </div>
        </div>

        {/* 7 Stage Cards Carousel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Card 0: OVERVIEW */}
          <div
            onClick={() => setActiveStage("ALL")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "ALL"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              OVERVIEW
            </div>
            <div>
              <div className="text-2xl font-black">17</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                All Orders
              </div>
            </div>
          </div>

          {/* Card 1: STAGE 1 */}
          <div
            onClick={() => setActiveStage("STAGE1")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "STAGE1"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              STAGE 1
            </div>
            <div>
              <div className="text-2xl font-black">3</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                In Sourcing
              </div>
            </div>
          </div>

          {/* Card 2: STAGE 2 */}
          <div
            onClick={() => setActiveStage("STAGE2")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "STAGE2"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              STAGE 2
            </div>
            <div>
              <div className="text-2xl font-black">1</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Quotes Issued
              </div>
            </div>
          </div>

          {/* Card 3: STAGE 3 */}
          <div
            onClick={() => setActiveStage("STAGE3")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "STAGE3"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              STAGE 3
            </div>
            <div>
              <div className="text-2xl font-black">1</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Awaiting Pay
              </div>
            </div>
          </div>

          {/* Card 4: STAGE 4 */}
          <div
            onClick={() => setActiveStage("STAGE4")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "STAGE4"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              STAGE 4
            </div>
            <div>
              <div className="text-2xl font-black">1</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                PO Release Gate
              </div>
            </div>
          </div>

          {/* Card 5: STAGE 5 */}
          <div
            onClick={() => setActiveStage("STAGE5")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "STAGE5"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              STAGE 5
            </div>
            <div>
              <div className="text-2xl font-black">5</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                In Freight / Port
              </div>
            </div>
          </div>

          {/* Card 6: EXCEPTIONS */}
          <div
            onClick={() => setActiveStage("EXCEPTIONS")}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-24 ${
              activeStage === "EXCEPTIONS"
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              EXCEPTIONS
            </div>
            <div>
              <div className="text-2xl font-black">2</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Sourcing Alert
              </div>
            </div>
          </div>
        </div>

        {/* Sub-header Bar & Items List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">
              Showing {filteredPipelineItems.length} Orders in Active Pipeline
            </span>
            <span className="text-slate-400 font-medium">
              Stage: <strong className="text-slate-900 uppercase">{activeStage}</strong>
            </span>
          </div>

          {/* Pipeline Rows List */}
          <div className="divide-y divide-slate-100 text-xs">
            {filteredPipelineItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                {/* Left: Avatar Initials + Reference + Badges + Title + Subtext */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-200">
                    {item.initials}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        {item.referenceNumber}
                      </span>

                      {item.badges.map((b, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            b.type === "delay"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : b.type === "sourcing"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : b.type === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {b.type === "delay" && (
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                          )}
                          {b.type === "sourcing" && (
                            <Search className="w-3 h-3 text-amber-600" />
                          )}
                          {b.type === "delivered" && (
                            <Check className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>{b.label}</span>
                        </span>
                      ))}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm truncate">
                      {item.partName}
                    </h3>

                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {item.vehicleCustomerText}
                    </p>
                  </div>
                </div>

                {/* Right: Price/Status + Freight Subtext + Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.priceText}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.freightText}
                    </div>
                  </div>

                  <Link
                    href={item.workspaceHref}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sourcing Country Coverage Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Japan Hub (Nagoya)</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">JPY</span>
          </div>
          <p className="text-xs text-slate-500">Toyota, Lexus, Nissan, Honda OEM factory stock. Fast-track Narita air cargo.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Germany Hub (Hamburg)</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">EUR</span>
          </div>
          <p className="text-xs text-slate-500">BMW, Mercedes-Benz, Audi, Porsche Tier-1 direct distributors.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">USA Hub (Los Angeles)</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">USD</span>
          </div>
          <p className="text-xs text-slate-500">Ford, GM, RAM, Tesla &amp; commercial heavy fleet powertrain parts.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Australia (Melbourne)</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">AUD</span>
          </div>
          <p className="text-xs text-slate-500">Trans-Tasman 24–48hr express priority courier bridge to Auckland depot.</p>
        </div>
      </div>
    </div>
  );
}
