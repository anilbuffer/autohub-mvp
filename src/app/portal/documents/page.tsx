"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Receipt,
  Download,
  Printer,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { getStoredRequests, getStoredCustomers, subscribeToStore } from "@/lib/store";
import { PartRequest, TradeCustomer, TaxInvoice } from "@/lib/types";

export default function CustomerDocumentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customer, setCustomer] = useState<TradeCustomer | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | "INVOICES" | "SHIPPING" | "CUSTOMS">("ALL");

  const refresh = () => {
    setRequests(getStoredRequests());
    const custs = getStoredCustomers();
    if (custs.length > 0) setCustomer(custs[0]);
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Collect documents from requests: Invoices, PODs, Customs
  const documents: Array<{
    id: string;
    name: string;
    type: "INVOICES" | "SHIPPING" | "CUSTOMS";
    format: string;
    requestRef: string;
    date: string;
    amount?: number;
    status: string;
    downloadUrl?: string;
  }> = [];

  requests.forEach((r) => {
    if (r.invoice) {
      documents.push({
        id: `DOC-INV-${r.invoice.invoiceNumber}`,
        name: `Tax Invoice ${r.invoice.invoiceNumber}`,
        type: "INVOICES",
        format: "PDF",
        requestRef: r.referenceNumber,
        date: r.invoice.issueDate || r.invoice.dateIssued || r.submittedDate,
        amount: r.invoice.totalNzd,
        status: r.invoice.status,
      });
    }

    if (r.shipment?.trackingNumber) {
      documents.push({
        id: `DOC-POD-${r.shipment.trackingNumber}`,
        name: `Consignment Waybill & POD (${r.shipment.carrier})`,
        type: "SHIPPING",
        format: "PDF",
        requestRef: r.referenceNumber,
        date: r.updatedDate || r.submittedDate,
        status: r.status,
      });
    }

    if (["CUSTOMS_CLEARANCE", "ARRIVED_IN_NZ", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(r.status)) {
      documents.push({
        id: `DOC-CUS-${r.referenceNumber}`,
        name: `NZ Customs Tariff & Clearance Declaration`,
        type: "CUSTOMS",
        format: "PDF",
        requestRef: r.referenceNumber,
        date: r.updatedDate || r.submittedDate,
        status: "CLEARED",
      });
    }
  });

  const filtered = documents.filter((d) => {
    if (category !== "ALL" && d.type !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.requestRef.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Document Vault
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Documents & Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access tax invoices, bills of lading, NZ customs declarations, and dispatch POD vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/portal/invoices"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Tax Invoices Desk</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card-table p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name, invoice # or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed2025]/30 focus:border-[#ed2025]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All Documents", val: "ALL" },
            { label: "Tax Invoices", val: "INVOICES" },
            { label: "Shipping & Waybills", val: "SHIPPING" },
            { label: "Customs Declarations", val: "CUSTOMS" },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setCategory(tab.val as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                category === tab.val
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="portal-card-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="portal-table-head">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Related Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No documents matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-[#ed2025] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="leading-tight">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                            Format: {doc.format} • ID: {doc.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {doc.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#2b4499] font-bold">
                      {doc.requestRef}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(doc.date).toLocaleDateString("en-NZ")}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {doc.type === "INVOICES" ? (
                        <Link
                          href="/portal/invoices"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>View PDF</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert(`Downloading ${doc.name} (PDF)...`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>Download</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
