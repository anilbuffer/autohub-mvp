"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Star,
  Globe,
  Mail,
  Phone,
  Clock,
  DollarSign,
  X,
  Compass,
} from "lucide-react";
import {
  getStoredSuppliers,
  addSupplierProfile,
  subscribeToStore,
} from "@/lib/store";
import { SupplierProfile } from "@/lib/types";

export default function SupplierDirectoryPage() {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Japan");
  const [currency, setCurrency] = useState("JPY");
  const [exchangeRate, setExchangeRate] = useState(0.011);
  const [category, setCategory] = useState("Japanese OEM Genuine & Aftermarket");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const refresh = () => {
    setSuppliers(getStoredSuppliers());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === "Japan") {
      setCurrency("JPY");
      setExchangeRate(0.011);
      setCategory("Japanese OEM Genuine & Aftermarket");
    } else if (c === "Germany") {
      setCurrency("EUR");
      setExchangeRate(1.78);
      setCategory("European Luxury & Performance OEM");
    } else if (c === "USA") {
      setCurrency("USD");
      setExchangeRate(1.64);
      setCategory("American Muscle & Heavy Fleet");
    } else {
      setCurrency("AUD");
      setExchangeRate(1.08);
      setCategory("Trans-Tasman Express Parts");
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: SupplierProfile = {
      id: `SUP-${Date.now()}`,
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
    setShowAddModal(false);
    setName("");
    setContactPerson("");
    setContactEmail("");
    setContactPhone("");
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Overseas Supplier Directory
          </h1>
          <p className="text-xs text-slate-500">
            Tier-1 and OEM suppliers connected to Autohub international consolidation hubs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, country, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          {filteredSuppliers.length} Verified Suppliers
        </span>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-amber-400 transition space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {s.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{s.country}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-amber-700">{s.currency}</span>
                    <span>(FX: {s.exchangeRateToNzd})</span>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{s.rating}</span>
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium">
                {s.category}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                {s.contactPerson && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Rep:</span>
                    <span>{s.contactPerson}</span>
                  </div>
                )}
                {s.contactEmail && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{s.contactEmail}</span>
                  </div>
                )}
                {s.contactPhone && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{s.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Time: <strong className="text-slate-800">{s.leadTimeDays} days</strong></span>
              </span>

              <Link
                href="/procurement/queue"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Request Quote →</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
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
                className="p-1.5 text-slate-400 hover:text-slate-700"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 bg-slate-50"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-slate-900"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
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
