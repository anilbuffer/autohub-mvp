"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Star,
  Globe,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  User,
  Package,
  ShieldCheck,
  Check,
  X,
  Grid,
  List,
} from "lucide-react";
import {
  getStoredSuppliers,
  addSupplierProfile,
  subscribeToStore,
} from "@/lib/store";
import { SupplierProfile } from "@/lib/types";

// Supplier Dossier Extended Interface
interface SupplierDossierItem extends SupplierProfile {
  countryCode: string; // e.g. "JP", "US", "DE", "AU"
  subCategory: string; // e.g. "Japanese OEM Genuine", "American Truck & SUV"
  hubDispatchSLA: string; // e.g. "2 business days"
  oemGuaranteeRate: string; // e.g. "99.1%"
  facilityLocation: string;
  commercialTerms: string;
  freightRouting: string;
  packagingStandards: string;
  primaryRep: string;
}

// Default Mock Suppliers matching Image 1 & Image 2
const DEFAULT_MOCK_DOSSIERS: SupplierDossierItem[] = [
  {
    id: "SUP-01",
    name: "Nagoya Auto Direct K.K.",
    country: "Japan",
    countryCode: "JP",
    currency: "JPY",
    exchangeRateToNzd: 0.0108,
    category: "Japanese OEM Genuine",
    subCategory: "Japanese OEM Genuine",
    leadTimeDays: 2,
    hubDispatchSLA: "2 business days",
    rating: 4.9,
    oemGuaranteeRate: "99.4%",
    contactPerson: "Kenji Tanaka",
    primaryRep: "Kenji Tanaka",
    contactEmail: "orders@nagoyaautodirect.jp",
    contactPhone: "+81 52 984 1029",
    facilityLocation: "Nagoya Port Logistics Bay (JP)",
    commercialTerms: "Telegraphic Transfer / Net 20th Trade Account",
    freightRouting: "Air Priority Express & Ocean Container Consolidation",
    packagingStandards: "Export sealed carton with biosecurity tags",
  },
  {
    id: "SUP-02",
    name: "Osaka EuroTech Spares",
    country: "Japan",
    countryCode: "JP",
    currency: "JPY",
    exchangeRateToNzd: 0.0108,
    category: "European & JDM Specialist",
    subCategory: "European & JDM Specialist",
    leadTimeDays: 3,
    hubDispatchSLA: "3 business days",
    rating: 4.8,
    oemGuaranteeRate: "98.8%",
    contactPerson: "Hiroshi Sato",
    primaryRep: "Hiroshi Sato",
    contactEmail: "quotes@osakaeurotech.co.jp",
    contactPhone: "+81 6 6284 3910",
    facilityLocation: "Osaka Kansai Authorized Export Facility",
    commercialTerms: "Direct Bank Transfer / Wire Clearance",
    freightRouting: "Air Freight Priority Express",
    packagingStandards: "Factory sealed OEM wooden crate",
  },
  {
    id: "SUP-03",
    name: "Trans-Pacific Parts Alliance",
    country: "USA",
    countryCode: "US",
    currency: "USD",
    exchangeRateToNzd: 1.68,
    category: "American Truck & SUV",
    subCategory: "American Truck & SUV",
    leadTimeDays: 4,
    hubDispatchSLA: "4 business days",
    rating: 4.7,
    oemGuaranteeRate: "99.1%",
    contactPerson: "Marcus Vance",
    primaryRep: "Marcus Vance",
    contactEmail: "marcus.v@transpacificparts.com",
    contactPhone: "+1 310 555 0194",
    facilityLocation: "USA Authorized Export Facility",
    commercialTerms: "Net 30 Trade Account / Telegraphic Transfer",
    freightRouting: "Air Express & Ocean Ro-Ro / FCL Consolidations",
    packagingStandards: "Heavy-duty export crate & anti-corrosion barrier",
  },
  {
    id: "SUP-04",
    name: "Munich Auto Teile GmbH",
    country: "Germany",
    countryCode: "DE",
    currency: "EUR",
    exchangeRateToNzd: 1.82,
    category: "European Luxury & Performance OEM",
    subCategory: "European Luxury & Performance OEM",
    leadTimeDays: 3,
    hubDispatchSLA: "3 business days",
    rating: 4.95,
    oemGuaranteeRate: "99.7%",
    contactPerson: "Stefan Mueller",
    primaryRep: "Stefan Mueller",
    contactEmail: "export@munichautoteile.de",
    contactPhone: "+49 89 3829 104",
    facilityLocation: "Hamburg Logistics Hub Terminal Bay 3",
    commercialTerms: "SEPA Wire / Trade Account Credit",
    freightRouting: "Air Express Direct Flight (Lufthansa / Air NZ)",
    packagingStandards: "German DIN standard packaging with test report",
  },
];

export default function SupplierDirectoryPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [dossierList, setDossierList] = useState<SupplierDossierItem[]>(
    DEFAULT_MOCK_DOSSIERS
  );
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierDossierItem | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHub, setActiveHub] = useState<
    "ALL" | "Japan" | "Germany" | "USA" | "Australia"
  >("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Add Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Japan");
  const [currency, setCurrency] = useState("JPY");
  const [exchangeRate, setExchangeRate] = useState(0.0108);
  const [category, setCategory] = useState("Japanese OEM Genuine");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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
    const stored = getStoredSuppliers();
    setSuppliers(stored);

    if (stored && stored.length > 0) {
      const liveDossiers: SupplierDossierItem[] = stored.map((s, idx) => {
        let code = "JP";
        if (s.country === "Germany") code = "DE";
        if (s.country === "USA") code = "US";
        if (s.country === "Australia") code = "AU";

        return {
          ...s,
          countryCode: code,
          subCategory: s.category || "OEM Genuine Supplier",
          hubDispatchSLA: `${s.leadTimeDays || 3} business days`,
          oemGuaranteeRate: "99.1%",
          facilityLocation: `${s.country} Authorized Export Facility`,
          commercialTerms: "Net 30 Trade Account / Telegraphic Transfer",
          freightRouting: "Air Express & Ocean Freight Consolidations",
          packagingStandards: "Heavy-duty export crate & anti-corrosion barrier",
          primaryRep: s.contactPerson || "Sourcing Specialist",
        };
      });

      // Merge mock SUP-01 if not present
      const hasMock1 = liveDossiers.some((d) => d.id === "SUP-01");
      if (!hasMock1) {
        setDossierList([...DEFAULT_MOCK_DOSSIERS, ...liveDossiers]);
      } else {
        setDossierList(liveDossiers);
      }
    } else {
      setDossierList(DEFAULT_MOCK_DOSSIERS);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id") || params.get("name");
      if (idParam) {
        const stored = getStoredSuppliers();
        const live: SupplierDossierItem[] = stored.map((s) => {
          let code = "JP";
          if (s.country === "Germany") code = "DE";
          if (s.country === "USA") code = "US";
          if (s.country === "Australia") code = "AU";
          return {
            ...s,
            countryCode: code,
            subCategory: s.category || "OEM Genuine Supplier",
            hubDispatchSLA: `${s.leadTimeDays || 3} business days`,
            oemGuaranteeRate: "99.1%",
            facilityLocation: `${s.country} Authorized Export Facility`,
            commercialTerms: "Net 30 Trade Account / Telegraphic Transfer",
            freightRouting: "Air Express & Ocean Freight Consolidations",
            packagingStandards: "Heavy-duty export crate & anti-corrosion barrier",
            primaryRep: s.contactPerson || "Sourcing Specialist",
          };
        });
        const all = [...DEFAULT_MOCK_DOSSIERS, ...live];
        const match = all.find(
          (d) =>
            d.id.toLowerCase() === idParam.toLowerCase() ||
            d.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) {
          setSelectedSupplier(match);
        }
      }
    }

    return unsub;
  }, []);

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === "Japan") {
      setCurrency("JPY");
      setExchangeRate(0.0108);
      setCategory("Japanese OEM Genuine");
    } else if (c === "Germany") {
      setCurrency("EUR");
      setExchangeRate(1.82);
      setCategory("European Luxury & Performance OEM");
    } else if (c === "USA") {
      setCurrency("USD");
      setExchangeRate(1.68);
      setCategory("American Truck & SUV");
    } else {
      setCurrency("AUD");
      setExchangeRate(1.08);
      setCategory("Trans-Tasman Express Parts");
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    let code = "JP";
    if (country === "Germany") code = "DE";
    if (country === "USA") code = "US";
    if (country === "Australia") code = "AU";

    const newSup: SupplierProfile = {
      id: `SUP-0${dossierList.length + 1}`,
      name,
      country,
      currency,
      exchangeRateToNzd: Number(exchangeRate),
      category,
      leadTimeDays: Number(leadTimeDays),
      rating: 4.8,
      contactPerson,
      contactEmail,
      contactPhone,
    };

    addSupplierProfile(newSup);

    const newDossier: SupplierDossierItem = {
      ...newSup,
      countryCode: code,
      subCategory: category,
      hubDispatchSLA: `${leadTimeDays} business days`,
      oemGuaranteeRate: "99.2%",
      facilityLocation: `${country} Authorized Export Facility`,
      commercialTerms: "Net 30 Trade Account / Telegraphic Transfer",
      freightRouting: "Air Express & Ocean Freight Consolidations",
      packagingStandards: "Heavy-duty export crate & anti-corrosion barrier",
      primaryRep: contactPerson || "Sourcing Specialist",
    };

    setDossierList([newDossier, ...dossierList]);
    setShowAddModal(false);
    showNotification(`Supplier ${name} registered successfully!`);
    setName("");
    setContactPerson("");
    setContactEmail("");
    setContactPhone("");
  };

  // Redirect to Process Quotes for Vendor
  const handleProcessQuotesForVendor = (vendor: SupplierDossierItem) => {
    showNotification(`Navigating to Sourcing Queue for vendor ${vendor.name}...`);
    router.push(`/procurement/queue?vendor=${encodeURIComponent(vendor.name)}`);
  };

  // Filtered dossiers list based on hub tab & search query
  const filteredDossiers = dossierList.filter((d) => {
    const matchesHub =
      activeHub === "ALL" ||
      (activeHub === "Japan" && d.country === "Japan") ||
      (activeHub === "Germany" && d.country === "Germany") ||
      (activeHub === "USA" && d.country === "USA") ||
      (activeHub === "Australia" && d.country === "Australia");

    if (!searchQuery.trim()) return matchesHub;
    const q = searchQuery.toLowerCase();
    return (
      matchesHub &&
      (d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.contactPerson && d.contactPerson.toLowerCase().includes(q)) ||
        d.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounceIn ${
            toast.type === "success"
              ? "bg-[#0f172a] text-white border-slate-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SUPPLIER DOSSIER DETAIL VIEW (WHEN A SUPPLIER IS SELECTED)        */}
      {/* ========================================================================= */}
      {selectedSupplier ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Detail Navigation Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedSupplier(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Supplier Directory</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Supplier ID: <strong className="text-slate-900 font-mono">{selectedSupplier.id}</strong>
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs">
                Contracted Global Partner
              </span>
            </div>
          </div>

          {/* Main Card 1: Vendor Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f172a] text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md">
                {selectedSupplier.countryCode}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ed2025]">
                    {selectedSupplier.subCategory}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Contracted Global Supplier
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedSupplier.name}
                </h1>

                <p className="text-xs text-slate-500 font-medium">
                  Primary export terminal facility located in {selectedSupplier.country} with direct freight routing to New Zealand.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleProcessQuotesForVendor(selectedSupplier)}
              className="px-5 py-3 rounded-2xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-950/30 transition flex-shrink-0"
            >
              <span>Process Quotes for Vendor</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Metric Cards Grid (Key SLAs & Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TRADING CURRENCY */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                TRADING CURRENCY
              </span>
              <div className="text-2xl font-black text-slate-900">
                {selectedSupplier.currency}
              </div>
              <div className="text-[11px] text-slate-500 font-medium font-mono">
                FX Rate: 1 {selectedSupplier.currency} = ${selectedSupplier.exchangeRateToNzd} NZD
              </div>
            </div>

            {/* Card 2: LEAD TIME SLA */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                LEAD TIME SLA
              </span>
              <div className="text-2xl font-black text-slate-900">
                {selectedSupplier.leadTimeDays} <span className="text-sm font-bold text-slate-500">days</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Average dispatch to export terminal
              </div>
            </div>

            {/* Card 3: NETWORK RATING */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                NETWORK RATING
              </span>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span>{selectedSupplier.rating.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Based on fitment accuracy &amp; speed
              </div>
            </div>

            {/* Card 4: OEM GUARANTEE */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                OEM GUARANTEE
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {selectedSupplier.oemGuaranteeRate}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Verified Japanese &amp; European catalog match
              </div>
            </div>
          </div>

          {/* 2 Main Info Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: EXPORT TERMINAL & WAREHOUSING FACILITY */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-4 h-4 text-[#ed2025]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  EXPORT TERMINAL &amp; WAREHOUSING FACILITY
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Facility Location:</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.facilityLocation}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Commercial Terms:</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.commercialTerms}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Freight Routing:</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.freightRouting}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Packaging Standards:</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.packagingStandards}</span>
                </div>
              </div>
            </div>

            {/* Column 2: DESIGNATED OPERATIONS & SOURCING CONTACTS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-[#ed2025]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  DESIGNATED OPERATIONS &amp; SOURCING CONTACTS
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Primary Representative */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      PRIMARY REPRESENTATIVE
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedSupplier.primaryRep}
                    </span>
                  </div>
                  <User className="w-5 h-5 text-slate-400" />
                </div>

                {/* Export PO Email */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      EXPORT PO EMAIL
                    </span>
                    <a
                      href={`mailto:${selectedSupplier.contactEmail}`}
                      className="font-bold text-[#ed2025] hover:underline"
                    >
                      {selectedSupplier.contactEmail}
                    </a>
                  </div>
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>

                {/* Direct Wire Phone */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      DIRECT WIRE / TERMINAL PHONE
                    </span>
                    <a
                      href={`tel:${selectedSupplier.contactPhone}`}
                      className="font-mono font-bold text-slate-900 hover:underline"
                    >
                      {selectedSupplier.contactPhone}
                    </a>
                  </div>
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 1: SUPPLIER DIRECTORY GRID / TABLE VIEW                             */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar (Matching Image 1 Layout) */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name, country, category, contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f172a] focus:bg-white transition"
              />
            </div>

            {/* Country Hub Filter Tabs & View Toggle */}
            <div className="flex flex-wrap items-center justify-between w-full lg:w-auto gap-4">
              {/* Hub Tabs */}
              <div className="p-1 rounded-2xl bg-slate-100/80 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveHub("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeHub === "ALL"
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Hubs
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHub("Japan")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeHub === "Japan"
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Japan
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHub("Germany")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeHub === "Germany"
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Germany
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHub("USA")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeHub === "USA"
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  USA
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHub("Australia")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeHub === "Australia"
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Australia
                </button>
              </div>

              {/* Grid / Table Toggle */}
              <div className="p-1 rounded-2xl bg-slate-100/80 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("GRID")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === "GRID"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("TABLE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === "TABLE"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto lg:ml-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Supplier</span>
              </button>
            </div>
          </div>

          {/* GRID VIEW (Matching Image 1) */}
          {viewMode === "GRID" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDossiers.map((sup) => (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplier(sup)}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-4 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Country Code Box & Rating Pill */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center border border-slate-200">
                        {sup.countryCode}
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{sup.rating.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Vendor Name & Subtitle */}
                    <div>
                      <h3 className="font-black text-base text-slate-900 group-hover:text-[#ed2025] transition leading-tight">
                        {sup.name}
                      </h3>
                      <div className="text-xs font-extrabold text-[#ed2025] mt-1">
                        {sup.subCategory}
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Export Hub Country:</span>
                        <span className="font-bold text-slate-900">{sup.country}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Trading Currency:</span>
                        <span className="font-bold font-mono text-slate-900">
                          {sup.currency} (1 {sup.currency} = ${sup.exchangeRateToNzd} NZD)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Avg Hub Dispatch SLA:</span>
                        <span className="font-bold text-slate-900">{sup.hubDispatchSLA}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: ID & View Dossier Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 text-xs">
                      ID: {sup.id}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplier(sup);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-6">VENDOR NAME &amp; ID</th>
                      <th className="py-4 px-6">CATEGORY</th>
                      <th className="py-4 px-6">HUB &amp; CURRENCY</th>
                      <th className="py-4 px-6">DISPATCH SLA</th>
                      <th className="py-4 px-6">RATING</th>
                      <th className="py-4 px-6 text-right">ACTION</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDossiers.map((sup) => (
                      <tr
                        key={sup.id}
                        onClick={() => setSelectedSupplier(sup)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-black text-slate-900 group-hover:text-[#ed2025] transition">
                            {sup.name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            ID: {sup.id}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-[#ed2025]">
                            {sup.subCategory}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {sup.country} ({sup.countryCode})
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {sup.currency} (FX: {sup.exchangeRateToNzd})
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-slate-800">
                          {sup.hubDispatchSLA}
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{sup.rating.toFixed(2)}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSupplier(sup);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
                          >
                            <span>View Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ed2025]/10 text-[#ed2025] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Register Overseas Supplier Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add genuine parts partner to Autohub procurement network
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Supplier / Business Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Osaka OEM Direct Logistics Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Country of Origin:
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  >
                    <option value="Japan">Japan (Nagoya/Tokyo Hub)</option>
                    <option value="Germany">Germany (Hamburg Hub)</option>
                    <option value="USA">USA (Los Angeles Hub)</option>
                    <option value="Australia">Australia (Melbourne Bridge)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Native Currency:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currency} (FX: ${exchangeRate})`}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Parts Category / Specialty:
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Contact Representative:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kenji Tanaka"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Average Lead Time (Days):
                  </label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    placeholder="orders@supplier.jp"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Direct Phone:
                  </label>
                  <input
                    type="text"
                    placeholder="+81 52 123 4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#ed2025] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-md transition"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
