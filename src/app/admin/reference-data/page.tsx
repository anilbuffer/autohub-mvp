"use client";

import React, { useState } from "react";
import {
  Database,
  Building2,
  Layers,
  Globe,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Car,
  Package,
} from "lucide-react";
import { getStoredSuppliers } from "@/lib/store";

export default function ReferenceDataPage() {
  const [activeTab, setActiveTab] = useState<"BUSINESS_TYPES" | "PART_CATEGORIES" | "SUPPLIERS">("BUSINESS_TYPES");
  const [search, setSearch] = useState("");

  const [businessTypes, setBusinessTypes] = useState([
    { id: "BT-01", code: "RMVT", label: "Registered Motor Vehicle Trader (RMVT)", description: "Licensed auto dealerships selling motor vehicles to public and trade.", defaultCreditLimit: 25000, active: true },
    { id: "BT-02", code: "WORKSHOP", label: "Independent Mechanical Workshop", description: "MTA registered automotive mechanical and collision repairers.", defaultCreditLimit: 15000, active: true },
    { id: "BT-03", code: "FLEET", label: "Commercial Fleet Operator", description: "Enterprises running internal vehicle logistics and delivery fleets.", defaultCreditLimit: 50000, active: true },
    { id: "BT-04", code: "IMPORTER", label: "Specialist Japanese Vehicle Importer", description: "Importers bringing JDM and grey-market vehicles requiring compliance parts.", defaultCreditLimit: 35000, active: true },
  ]);

  const [partCategories, setPartCategories] = useState([
    { id: "CAT-01", name: "Engine & Powertrain", description: "Complete engine assemblies, cylinder heads, crankshafts, turbos", hsCode: "8407.34", tariffRate: "0%" },
    { id: "CAT-02", name: "Transmission & Driveline", description: "Automatic/CVT/manual gearboxes, transfer cases, differentials", hsCode: "8708.40", tariffRate: "0%" },
    { id: "CAT-03", name: "Body & Structural Panels", description: "Quarter panels, bonnets, boot lids, bumpers, doors", hsCode: "8708.29", tariffRate: "0%" },
    { id: "CAT-04", name: "Electrical & Modules (ECU/BCM)", description: "Engine management ECUs, wiring harnesses, hybrid inverters", hsCode: "8537.10", tariffRate: "0%" },
    { id: "CAT-05", name: "Suspension & Steering", description: "Steering racks, air struts, control arms, steering columns", hsCode: "8708.80", tariffRate: "0%" },
    { id: "CAT-06", name: "High-Voltage EV/Hybrid Battery Modules", description: "Lithium-ion & NiMH traction battery packs and battery cells", hsCode: "8507.60", tariffRate: "0%" },
  ]);

  const suppliers = getStoredSuppliers();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              System Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Reference Data Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain foundational reference records for trade business categories, Harmonized Tariff System (HS) part codes, and supplier directories.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("BUSINESS_TYPES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "BUSINESS_TYPES"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Types</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
            {businessTypes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PART_CATEGORIES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "PART_CATEGORIES"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Part Categories</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
            {partCategories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("SUPPLIERS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "SUPPLIERS"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Suppliers</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
            {suppliers.length}
          </span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "BUSINESS_TYPES" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recognized New Zealand Trade Business Types
              </h3>
              <p className="text-[11px] text-slate-500">
                Used for customer registration, credit underwriting, and NZBN verification
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Classification &amp; Description</th>
                  <th className="px-5 py-3.5">Baseline Credit Limit</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessTypes.map((bt) => (
                  <tr key={bt.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {bt.code}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{bt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{bt.description}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-800">
                      ${bt.defaultCreditLimit.toLocaleString()} NZD
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "PART_CATEGORIES" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Automotive Part Categories &amp; NZ Customs HS Codes
              </h3>
              <p className="text-[11px] text-slate-500">
                Determines biosecurity risk levels and New Zealand Customs tariff classifications
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Category Name</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">HS Tariff Code</th>
                  <th className="px-5 py-3.5">Import Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {cat.description}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      {cat.hsCode}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {cat.tariffRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "SUPPLIERS" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Authorized Overseas Suppliers Reference Registry
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified international dismantling yards, OEM wholesale distributors, and logistics hubs
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Supplier Name</th>
                  <th className="px-5 py-3.5">Country / Hub</th>
                  <th className="px-5 py-3.5">Currency</th>
                  <th className="px-5 py-3.5">Rating &amp; Reliability</th>
                  <th className="px-5 py-3.5">Specialties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {sup.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{sup.country}</span>
                      {sup.city && <span className="text-[11px] text-slate-400 block">{sup.city}</span>}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {sup.currency}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-amber-500">
                        <span>★ {sup.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({sup.completedOrders ?? 42} orders)
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {(sup.specialties || [sup.category]).slice(0, 3).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
