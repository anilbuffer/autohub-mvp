"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Plane,
  Anchor,
  Box,
  Percent,
  Check,
  Send,
  ArrowLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredSuppliers,
  addSupplierQuote,
  issueCustomerQuote,
  updateRequestStatus,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  SupplierProfile,
  SupplierQuotation,
  CustomerQuote,
  FreightOption,
} from "@/lib/types";

// Default Mock Fallback Requests matching Image 2 & 1
const DEFAULT_MOCK_QUEUE: PartRequest[] = [
  {
    id: "REQ-AH-P-000140",
    referenceNumber: "AH-P-000140",
    submittedDate: "2026-09-07T10:00:00.000Z",
    updatedDate: "2026-09-07T10:00:00.000Z",
    status: "SOURCING",
    customerId: "CUST-001",
    customerName: "AutoCare Auckland",
    customerContactEmail: "procurement@autocare.co.nz",
    customerNzbn: "9429041234567",
    vehicle: {
      make: "Toyota",
      model: "Land Cruiser Prado",
      year: 2022,
      vin: "JTEBX3FJ5NK190284",
      transmission: "AUTOMATIC",
      variant: "Series N/A",
    },
    part: {
      partName: "KDSS Hydraulic Cylinder Actuator (Front Stabilizer)",
      oemPartNumber: "48810-60040",
      oemNumber: "48810-60040",
      quantity: 1,
      genuinePreference: "GENUINE_ONLY",
      conditionRequirement: "NEW_GENUINE",
      category: "Suspension & Steering",
      descriptionNotes:
        "Urgent OEM genuine KDSS front stabilizer cylinder for customer fleet vehicle. Air freight preferred.",
    },
    deliveryAddress: {
      label: "Main Workshop",
      street: "42 Great South Road",
      suburb: "Epsom",
      city: "Auckland",
      postcode: "1051",
    },
    supplierQuotes: [
      {
        id: "SQTE-01",
        supplierId: "SUP-JAP-01",
        supplierName: "Nagoya Auto Direct K.K.",
        supplierCountry: "Japan",
        quantity: 1,
        partCostCurrency: "JPY",
        partCostForeign: 58000,
        exchangeRateToNzd: 0.0108,
        partCostNzd: 626.4,
        domesticFreightForeign: 3500,
        domesticFreightNzd: 37.8,
        availabilityDays: 2,
        notes:
          "Factory sealed OEM Toyota Japan stock. Ready for Nagoya terminal dispatch.",
      },
      {
        id: "SQTE-02",
        supplierId: "SUP-JAP-02",
        supplierName: "Osaka EuroTech Spares",
        supplierCountry: "Japan",
        quantity: 1,
        partCostCurrency: "JPY",
        partCostForeign: 62000,
        exchangeRateToNzd: 0.0108,
        partCostNzd: 669.6,
        domesticFreightForeign: 3500,
        domesticFreightNzd: 37.8,
        availabilityDays: 3,
        notes: "Genuine OEM box in Osaka warehouse.",
      },
    ],
    messages: [],
    auditLogs: [],
  },
  {
    id: "REQ-AH-P-000141",
    referenceNumber: "AH-P-000141",
    submittedDate: "2026-09-07T14:30:00.000Z",
    updatedDate: "2026-09-07T14:30:00.000Z",
    status: "SOURCING",
    customerId: "CUST-002",
    customerName: "Canterbury Commercial Fleet Services",
    customerContactEmail: "fleet@canterburyfleet.co.nz",
    customerNzbn: "9429038291029",
    vehicle: {
      make: "BMW",
      model: "X5 xDrive30d",
      year: 2021,
      vin: "WBAJU820409E19284",
      transmission: "AUTOMATIC",
    },
    part: {
      partName: "High-Pressure Common Rail Diesel Fuel Pump (Bosch CP4)",
      oemPartNumber: "13518597818",
      oemNumber: "13518597818",
      quantity: 1,
      genuinePreference: "GENUINE_ONLY",
      conditionRequirement: "NEW_GENUINE",
      category: "Fuel Delivery",
      descriptionNotes: "OEM Bosch high pressure pump replacement.",
    },
    deliveryAddress: {
      label: "Fleet Hub",
      street: "12 Moorhouse Ave",
      suburb: "Sydenham",
      city: "Christchurch",
      postcode: "8011",
    },
    supplierQuotes: [
      {
        id: "SQTE-03",
        supplierId: "SUP-GER-01",
        supplierName: "Munich Auto Teile GmbH",
        supplierCountry: "Germany",
        quantity: 1,
        partCostCurrency: "EUR",
        partCostForeign: 540,
        exchangeRateToNzd: 1.82,
        partCostNzd: 982.8,
        domesticFreightForeign: 25,
        domesticFreightNzd: 45.5,
        availabilityDays: 4,
        notes: "Original Bosch factory package with test report.",
      },
      {
        id: "SQTE-04",
        supplierId: "SUP-GER-02",
        supplierName: "Frankfurt OEM Logistics",
        supplierCountry: "Germany",
        quantity: 1,
        partCostCurrency: "EUR",
        partCostForeign: 560,
        exchangeRateToNzd: 1.82,
        partCostNzd: 1019.2,
        domesticFreightForeign: 30,
        domesticFreightNzd: 54.6,
        availabilityDays: 2,
        notes: "Express warehouse pick.",
      },
    ],
    messages: [],
    auditLogs: [],
  },
  {
    id: "REQ-AH-P-000127",
    referenceNumber: "AH-P-000127",
    submittedDate: "2026-04-03T09:15:00.000Z",
    updatedDate: "2026-04-03T09:15:00.000Z",
    status: "SOURCING",
    customerId: "CUST-003",
    customerName: "Canterbury Fleet Services",
    customerContactEmail: "orders@canterburyfleet.co.nz",
    customerNzbn: "9429038291030",
    vehicle: {
      make: "Subaru",
      model: "Outback",
      year: 2023,
      vin: "JF2BT9EC5PH019842",
      transmission: "CVT",
    },
    part: {
      partName: "Electronic Power Steering Rack & Pinion Assembly with Tie Rods",
      oemPartNumber: "34110-AN00A",
      oemNumber: "34110-AN00A",
      quantity: 1,
      genuinePreference: "GENUINE_ONLY",
      conditionRequirement: "NEW_GENUINE",
      category: "Steering",
      descriptionNotes: "Subaru factory genuine rack assembly.",
    },
    deliveryAddress: {
      label: "Main Depot",
      street: "88 Blenheim Road",
      suburb: "Riccarton",
      city: "Christchurch",
      postcode: "8041",
    },
    supplierQuotes: [],
    messages: [],
    auditLogs: [],
  },
];

export default function SourcingQueuePage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(
    null
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Detail View Calculator States
  const [activeSupplierQuoteId, setActiveSupplierQuoteId] = useState<string>("");
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(18);
  const [procurementFeeNzd, setProcurementFeeNzd] = useState<number>(60);
  const [selectedFreightMethod, setSelectedFreightMethod] = useState<
    "AIR_EXPRESS" | "SEA_FREIGHT"
  >("AIR_EXPRESS");
  const [advisoryNote, setAdvisoryNote] = useState(
    "Genuine OEM specification part sourced directly from Japan authorized dealer network."
  );

  // Toast Notification
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Capture Supplier Quote Modal States
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [partCostForeign, setPartCostForeign] = useState<number>(58000);
  const [currency, setCurrency] = useState("JPY");
  const [exchangeRate, setExchangeRate] = useState<number>(0.0108);
  const [domesticFreightForeign, setDomesticFreightForeign] =
    useState<number>(3500);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(2);
  const [quoteNotes, setQuoteNotes] = useState(
    "Factory sealed OEM Toyota Japan stock. Ready for Nagoya terminal dispatch."
  );

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refresh = () => {
    const storedReqs = getStoredRequests();
    if (storedReqs && storedReqs.length > 0) {
      // Merge default mock requests if not present
      const hasMock1 = storedReqs.some((r) => r.referenceNumber === "AH-P-000140");
      if (!hasMock1) {
        setRequests([...DEFAULT_MOCK_QUEUE, ...storedReqs]);
      } else {
        setRequests(storedReqs);
      }
    } else {
      setRequests(DEFAULT_MOCK_QUEUE);
    }

    const storedSuppliers = getStoredSuppliers();
    setSuppliers(storedSuppliers);
    if (storedSuppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(storedSuppliers[0].id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id") || params.get("ref");
      const vendorParam = params.get("vendor");
      if (vendorParam) {
        setSearchQuery(vendorParam);
      }
      if (idParam) {
        const reqList = getStoredRequests();
        const all = reqList && reqList.length > 0 ? [...DEFAULT_MOCK_QUEUE, ...reqList] : DEFAULT_MOCK_QUEUE;
        const match = all.find(r => r.referenceNumber === idParam || r.id === idParam);
        if (match) {
          setSelectedRequest(match);
        }
      }
    }

    return unsub;
  }, []);

  // When selectedRequest changes, initialize default active supplier quote
  useEffect(() => {
    if (selectedRequest && selectedRequest.supplierQuotes.length > 0) {
      setActiveSupplierQuoteId(selectedRequest.supplierQuotes[0].id);
    }
  }, [selectedRequest]);

  // Handle supplier change in Modal
  const handleSupplierSelectChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const found = suppliers.find((s) => s.id === supId);
    if (found) {
      setCurrency(found.currency);
      setExchangeRate(found.exchangeRateToNzd);
      if (found.currency === "JPY") {
        setPartCostForeign(58000);
        setDomesticFreightForeign(3500);
      } else if (found.currency === "EUR") {
        setPartCostForeign(540);
        setDomesticFreightForeign(25);
      } else {
        setPartCostForeign(450);
        setDomesticFreightForeign(35);
      }
    }
  };

  // Submit New Supplier Quote
  const handleSubmitSupplierQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const partCostNzd = partCostForeign * exchangeRate;
    const domesticFreightNzd = domesticFreightForeign * exchangeRate;

    const newQuote: SupplierQuotation = {
      id: `SQTE-${Date.now()}`,
      supplierId: selectedSupplierId || "SUP-JAP-01",
      supplierName: supplier?.name || "Nagoya Auto Direct K.K.",
      supplierCountry: supplier?.country || "Japan",
      quantity: selectedRequest.part.quantity || 1,
      partCostCurrency: currency,
      partCostForeign: Number(partCostForeign),
      exchangeRateToNzd: Number(exchangeRate),
      partCostNzd: Number(partCostNzd),
      domesticFreightForeign: Number(domesticFreightForeign),
      domesticFreightNzd: Number(domesticFreightNzd),
      availabilityDays: Number(leadTimeDays),
      notes: quoteNotes,
    };

    // Update state locally and in store
    addSupplierQuote(selectedRequest.id, newQuote);
    const updatedQuotes = [...selectedRequest.supplierQuotes, newQuote];
    const updatedReq = { ...selectedRequest, supplierQuotes: updatedQuotes };
    setSelectedRequest(updatedReq);
    setActiveSupplierQuoteId(newQuote.id);
    setShowQuoteModal(false);
    showNotification(`Supplier quote from ${newQuote.supplierName} recorded successfully!`);
  };

  // Flag Exception Action
  const handleFlagException = () => {
    if (!selectedRequest) return;
    updateRequestStatus(
      selectedRequest.id,
      "SOURCING_EXCEPTION",
      "Nathan Cole",
      "PROCUREMENT",
      "Flagged sourcing exception for price variance / part availability review"
    );
    showNotification(`Request ${selectedRequest.referenceNumber} flagged as Sourcing Exception.`, "error");
    setSelectedRequest(null);
  };

  // Issue Verified Customer Quote
  const handleIssueQuote = () => {
    if (!selectedRequest) return;

    const activeQuote =
      selectedRequest.supplierQuotes.find((q) => q.id === activeSupplierQuoteId) ||
      selectedRequest.supplierQuotes[0];

    const basePartCostNzd = activeQuote ? activeQuote.partCostNzd : 626.4;
    const domesticFreightNzd = activeQuote ? activeQuote.domesticFreightNzd : 37.8;
    const baseLandedPartNzd = basePartCostNzd + domesticFreightNzd;
    const marginAmountNzd = baseLandedPartNzd * (targetMarginPercent / 100);

    const freightAir: FreightOption = {
      method: "AIR_EXPRESS",
      carrierName: "Priority Airfreight",
      estimatedTransitDays: "3 - 5 business days",
      costNzd: 185.0,
      available: true,
    };

    const freightSea: FreightOption = {
      method: "SEA_FREIGHT",
      carrierName: "Ocean Consolidation",
      estimatedTransitDays: "14 - 18 business days",
      costNzd: 65.0,
      available: true,
    };

    const chosenFreightCost =
      selectedFreightMethod === "AIR_EXPRESS" ? 185.0 : 65.0;

    const subtotalNzd =
      baseLandedPartNzd + marginAmountNzd + procurementFeeNzd + chosenFreightCost;
    const gstAmountNzd = subtotalNzd * 0.15;
    const totalNzd = subtotalNzd + gstAmountNzd;

    const customerQuoteObj: CustomerQuote = {
      id: `QTE-${Date.now()}`,
      quoteNumber: `QTE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      selectedSupplierQuoteId: activeQuote?.id || "SQTE-01",
      basePartCostNzd,
      targetMarginPercentage: targetMarginPercent,
      marginAmountNzd,
      procurementFeeNzd,
      landedCostNzd: baseLandedPartNzd,
      freightOptions: [freightAir, freightSea],
      selectedFreightMethod,
      subtotalNzd,
      gstAmountNzd,
      totalNzd,
      termsAccepted: false,
      status: "ISSUED",
      revisionNotes: advisoryNote,
    };

    issueCustomerQuote(selectedRequest.id, customerQuoteObj);
    showNotification(
      `Verified Customer Quote (${customerQuoteObj.quoteNumber}) issued for $${totalNzd.toFixed(
        2
      )} NZD!`
    );
    setSelectedRequest(null);
  };

  // Calculations for Detail View
  const selectedQuote =
    selectedRequest?.supplierQuotes.find((q) => q.id === activeSupplierQuoteId) ||
    selectedRequest?.supplierQuotes[0];

  const basePartNzdCalc = selectedQuote ? selectedQuote.partCostNzd : 626.4;
  const domesticFreightNzdCalc = selectedQuote ? selectedQuote.domesticFreightNzd : 37.8;
  const baseLandedPartNzd = basePartNzdCalc + domesticFreightNzdCalc; // e.g. 664.20
  const marginAmountNzd = baseLandedPartNzd * (targetMarginPercent / 100); // e.g. 119.56
  const chosenFreightCost = selectedFreightMethod === "AIR_EXPRESS" ? 185.0 : 65.0;
  const subtotalNzd =
    baseLandedPartNzd + marginAmountNzd + procurementFeeNzd + chosenFreightCost; // e.g. 1028.76
  const gstAmountNzd = subtotalNzd * 0.15; // e.g. 154.31
  const totalCustomerQuoteNzd = subtotalNzd + gstAmountNzd; // e.g. 1183.07

  // Filtered requests for table list
  const filteredQueueRequests = requests.filter((r) => {
    const isQueueStatus =
      r.status === "SOURCING" ||
      r.status === "SUBMITTED" ||
      r.status === "QUOTE_PREPARED";

    if (!searchQuery.trim()) return isQueueStatus;
    const q = searchQuery.toLowerCase();
    return (
      isQueueStatus &&
      (r.referenceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.part.partName.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q))
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: SOURCING CONSOLE DETAIL VIEW (WHEN A REQUEST IS SELECTED)        */}
      {/* ========================================================================= */}
      {selectedRequest ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Detail Navigation Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sourcing Queue</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Ref: <strong className="text-slate-900 font-mono">{selectedRequest.referenceNumber}</strong> • Customer: <strong className="text-slate-900">{selectedRequest.customerName}</strong>
              </span>

              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-amber-100 transition"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Sourcing Desk</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Request Specifications & Onboarding Account (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Part & Request Information */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {selectedRequest.referenceNumber}
                    </span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-xs font-bold text-slate-700">
                      Customer: {selectedRequest.customerName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFlagException}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Flag Exception</span>
                  </button>
                </div>

                {/* Main Part Title */}
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {selectedRequest.part.partName}
                </h2>

                {/* 4 Metric Info Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      TARGET VEHICLE
                    </span>
                    <div className="font-bold text-slate-900 leading-tight">
                      {selectedRequest.vehicle.year} {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Series {selectedRequest.vehicle.variant || "N/A"} • {selectedRequest.vehicle.transmission || "AUTOMATIC"}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      VIN / CHASSIS CODE
                    </span>
                    <div className="font-mono font-bold text-slate-900 text-xs leading-tight">
                      {selectedRequest.vehicle.vin}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Verified Japanese JDM Spec
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      PART CATEGORY &amp; SIDE
                    </span>
                    <div className="font-bold text-slate-900 leading-tight">
                      {selectedRequest.part.category}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">
                      Placement: {selectedRequest.part.descriptionNotes || "Urgent OEM genuine fitment."}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      OEM PART NUMBER
                    </span>
                    <div className="font-mono font-bold text-[#ed2025] text-xs leading-tight">
                      {selectedRequest.part.oemPartNumber || selectedRequest.part.oemNumber || "48810-60040"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Genuine catalog match
                    </div>
                  </div>
                </div>

                {/* Customer Sourcing Notes Callout */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">
                    Customer Sourcing Notes:
                  </span>
                  <p className="text-amber-800 italic">
                    "{selectedRequest.part.descriptionNotes || "Urgent OEM genuine KDSS front stabilizer cylinder for customer fleet vehicle. Air freight preferred."}"
                  </p>
                </div>
              </div>

              {/* Card 2: Trade Onboarding Account Sync */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ed2025]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      TRADE ONBOARDING ACCOUNT SYNC
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Synced</span>
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Trading Entity:</span>
                    <span className="font-bold text-slate-900">{selectedRequest.customerName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Legal Business Name:</span>
                    <span className="font-bold text-slate-900">{selectedRequest.customerName} Limited</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">NZBN Number:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedRequest.customerNzbn || "9429041234567"}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Trade Credit Terms:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-200">
                      Approved ($25,000 • Net 20th)
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Goods Inward Address:</span>
                    <span className="font-bold text-slate-800">
                      {typeof selectedRequest.deliveryAddress === "string"
                        ? selectedRequest.deliveryAddress
                        : `${selectedRequest.deliveryAddress?.street || "42 Great South Road"}, ${selectedRequest.deliveryAddress?.city || "Auckland"}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Order Part Quantity:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] border border-rose-200">
                      {selectedRequest.part.quantity} unit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Supplier Quotes & Landed Cost Calculator (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Supplier Quotes Recorded */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#ed2025]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      SUPPLIER QUOTES RECORDED ({selectedRequest.supplierQuotes.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(true)}
                    className="text-xs font-bold text-[#ed2025] hover:text-[#d3181d] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Quote</span>
                  </button>
                </div>

                {/* List of Supplier Quotes */}
                <div className="space-y-3">
                  {selectedRequest.supplierQuotes.map((q) => {
                    const isSelected = q.id === activeSupplierQuoteId;

                    return (
                      <div
                        key={q.id}
                        onClick={() => setActiveSupplierQuoteId(q.id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                          isSelected
                            ? "border-[#ed2025] bg-red-50/10 shadow-xs"
                            : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {q.supplierName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {q.supplierCountry}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                Qty: {q.quantity || 1} pcs
                              </span>
                              {q.supplierName.includes("Nagoya") && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                  Best SLA
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Unit: {q.partCostForeign.toLocaleString()} {q.partCostCurrency} • Lead Time: {q.availabilityDays} days • Notes: {q.notes}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0 font-mono">
                            <div className="text-[11px] font-bold text-slate-500">
                              {q.partCostCurrency} {q.partCostForeign.toLocaleString()}
                            </div>
                            <div className="text-sm font-black text-[#ed2025]">
                              ${q.partCostNzd.toFixed(2)} NZD
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Rate: {q.exchangeRateToNzd}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Landed Cost & Margin Calculator (NZD) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#ed2025]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      LANDED COST &amp; MARGIN CALCULATOR (NZD)
                    </h3>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    Base Part: <strong className="text-slate-900">${basePartNzdCalc.toFixed(2)} NZD</strong>
                  </span>
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Slider 1: Target Gross Margin */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Target Gross Margin:</span>
                      <span className="text-[#ed2025] font-black text-sm">{targetMarginPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      step="1"
                      value={targetMarginPercent}
                      onChange={(e) => setTargetMarginPercent(parseInt(e.target.value))}
                      className="w-full accent-[#ed2025] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>10% (Floor)</span>
                      <span>18% (Target)</span>
                      <span>35% (Premium)</span>
                    </div>
                  </div>

                  {/* Slider 2: Procurement Fee */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Procurement Fee:</span>
                      <span className="text-slate-900 font-black text-sm">${procurementFeeNzd.toFixed(2)} NZD</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      step="5"
                      value={procurementFeeNzd}
                      onChange={(e) => setProcurementFeeNzd(parseInt(e.target.value))}
                      className="w-full accent-slate-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>$30</span>
                      <span>$60 (Std)</span>
                      <span>$150</span>
                    </div>
                  </div>
                </div>

                {/* Freight Options Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Freight Options Included for Customer Selection:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Priority Airfreight */}
                    <div
                      onClick={() => setSelectedFreightMethod("AIR_EXPRESS")}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedFreightMethod === "AIR_EXPRESS"
                          ? "border-[#ed2025] bg-red-50/20 shadow-xs"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-[#ed2025] flex items-center justify-center flex-shrink-0">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Priority Airfreight</div>
                          <div className="text-[10px] text-slate-400">3 - 5 business days</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-900">$185.00 NZD</div>
                    </div>

                    {/* Option 2: Ocean Consolidation */}
                    <div
                      onClick={() => setSelectedFreightMethod("SEA_FREIGHT")}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedFreightMethod === "SEA_FREIGHT"
                          ? "border-[#ed2025] bg-red-50/20 shadow-xs"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Anchor className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Ocean Consolidation</div>
                          <div className="text-[10px] text-slate-400">14 - 18 business days</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-900">$65.00 NZD</div>
                    </div>
                  </div>
                </div>

                {/* Dark Live Terminal Breakdown Box */}
                <div className="bg-[#0f172a] text-slate-200 p-5 rounded-2xl font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base Landed Foreign Part:</span>
                    <span className="text-white">${baseLandedPartNzd.toFixed(2)} NZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Margin Amount ({targetMarginPercent}%):</span>
                    <span className="text-emerald-400 font-bold">+${marginAmountNzd.toFixed(2)} NZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Procurement &amp; Documentation:</span>
                    <span className="text-white">+${procurementFeeNzd.toFixed(2)} NZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Freight ({selectedFreightMethod}):</span>
                    <span className="text-white">+${chosenFreightCost.toFixed(2)} NZD</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">NZ GST (15%):</span>
                    <span className="text-white">+${gstAmountNzd.toFixed(2)} NZD</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-white text-sm">Total Customer Quote (NZD):</span>
                    <span className="font-black text-[#ed2025] text-lg">${totalCustomerQuoteNzd.toFixed(2)} NZD</span>
                  </div>
                </div>

                {/* Advisory Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Sourcing Specialist Advisory Note:
                  </label>
                  <textarea
                    rows={2}
                    value={advisoryNote}
                    onChange={(e) => setAdvisoryNote(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#ed2025]"
                  />
                </div>

                {/* Main Submit Action Button */}
                <button
                  type="button"
                  onClick={handleIssueQuote}
                  className="w-full py-4 px-6 rounded-2xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Issue Verified Customer Quote (${totalCustomerQuoteNzd.toFixed(2)} NZD)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: SOURCING QUEUE TABLE LIST VIEW                                    */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ed2025]/10 text-[#ed2025] border border-[#ed2025]/20">
                  Procurement Desk
                </span>
                <span className="text-xs text-slate-500 font-medium">Global Sourcing Queue</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Compass className="w-6 h-6 text-[#ed2025]" />
                Sourcing Intake Queue &amp; Supplier Quotations
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review incoming parts RFQs from NZ trade customers and record verified overseas supplier quotations.
              </p>
            </div>

            <Link
              href="/procurement/suppliers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-xs w-fit"
            >
              <Building2 className="w-4 h-4 text-[#ed2025]" />
              <span>Manage Suppliers Directory</span>
            </Link>
          </div>

          {/* Search Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by ref, make, part, VIN, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Table Container (Matching Image 2 Layout) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">REFERENCE &amp; DATE</th>
                    <th className="py-4 px-6">REQUESTED PART</th>
                    <th className="py-4 px-6">TARGET VEHICLE &amp; VIN</th>
                    <th className="py-4 px-6">CUSTOMER</th>
                    <th className="py-4 px-6">QUOTES RECORDED</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTION</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredQueueRequests.map((req) => {
                    const quoteCount = req.supplierQuotes?.length || 0;

                    return (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        {/* 1. Reference & Date */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-mono font-black text-slate-900 group-hover:text-[#ed2025] transition">
                            {req.referenceNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(req.submittedDate).toLocaleDateString()}
                          </div>
                        </td>

                        {/* 2. Requested Part */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {req.part.partName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {req.part.oemPartNumber || req.part.oemNumber || "48810-60040"}
                          </div>
                        </td>

                        {/* 3. Target Vehicle & VIN */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            VIN: {req.vehicle.vin}
                          </div>
                        </td>

                        {/* 4. Customer */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">
                            {req.customerName}
                          </div>
                          <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase">
                            {req.part.genuinePreference || "GENUINE_ONLY"}
                          </span>
                        </td>

                        {/* 5. Quotes Recorded */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border ${
                              quoteCount > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {quoteCount} Quotes
                          </span>
                        </td>

                        {/* 6. Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 w-fit">
                            <Search className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sourcing Desk</span>
                          </span>
                        </td>

                        {/* 7. Action */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(req);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs transition shadow-xs active:scale-[0.98]"
                          >
                            <span>Source &amp; Quote</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPTURE SUPPLIER QUOTE MODAL                                              */}
      {/* ========================================================================= */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ed2025]/10 text-[#ed2025] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Capture Supplier Quotation
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Ref: {selectedRequest.referenceNumber} • {selectedRequest.part.partName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplierQuote} className="space-y-4 text-xs">
              {/* Supplier Selection */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Select Overseas Supplier:
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country} • {s.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency & Part Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Part Cost in Foreign Currency:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={partCostForeign}
                      onChange={(e) => setPartCostForeign(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Exchange Rate to NZD:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Domestic Freight & Lead Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Origin Domestic Freight ({currency}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={domesticFreightForeign}
                    onChange={(e) => setDomesticFreightForeign(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Supplier Lead Time (Days):
                  </label>
                  <input
                    type="number"
                    required
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Fitment &amp; Warranty Notes:
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-md transition"
                >
                  Save Supplier Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
