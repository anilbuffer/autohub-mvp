"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { getStoredRequests, subscribeToStore } from "@/lib/store";
import { PartRequest, TaxInvoice } from "@/lib/types";

export default function FinanceInvoicesPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedInvoiceReq, setSelectedInvoiceReq] = useState<PartRequest | null>(null);

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      r.referenceNumber.toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.invoice?.invoiceNumber?.toLowerCase().includes(q);

    const isPaid =
      r.invoice?.status === "PAID" ||
      r.paymentStatus === "PAID" ||
      r.status === "PAYMENT_CONFIRMED" ||
      r.status === "ORDERED_FROM_SUPPLIER" ||
      r.status === "SUPPLIER_DISPATCHED" ||
      r.status === "IN_TRANSIT" ||
      r.status === "DELIVERED";
    if (filterStatus === "PAID" && !isPaid) return false;
    if (filterStatus === "PENDING" && isPaid) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#ed2025] border border-red-200">
              Finance &amp; Accounts
            </span>
            <span className="text-xs text-slate-500">Inland Revenue Department (IRD) Compliance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#ed2025]" />
            Buyer Tax Invoices (NZ GST # 134-582-901)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Browse, print, and audit buyer tax invoices with 15% GST breakdown for New Zealand registered trade workshops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/finance/payments"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4 text-[#ed2025]" />
            <span>Remittance Matching</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search (Symmetrical White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, request, or workshop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PAID", "PENDING"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-[#ed2025] text-white font-bold shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st === "ALL" ? "All Invoices" : st === "PAID" ? "Paid Invoices" : "Pending Payment"}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table (Symmetrical White Card) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">Tax Invoice #</th>
              <th className="py-3.5 px-4 font-bold">Customer / Workshop</th>
              <th className="py-3.5 px-4 font-bold">Part Description</th>
              <th className="py-3.5 px-4 font-bold">Date Issued</th>
              <th className="py-3.5 px-4 font-bold text-right">Subtotal</th>
              <th className="py-3.5 px-4 font-bold text-right">GST (15%)</th>
              <th className="py-3.5 px-4 font-bold text-right">Total (NZD)</th>
              <th className="py-3.5 px-4 font-bold text-center">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRequests.map((req) => {
              const invoiceNo = req.invoice?.invoiceNumber || `INV-2026-${req.id.replace("REQ-", "")}`;
              const subtotal = req.quote?.subtotalNzd ?? 1260.0;
              const gst = req.quote?.gstAmountNzd ?? subtotal * 0.15;
              const total = req.quote?.totalNzd ?? (subtotal + gst);
              const isPaid =
                req.invoice?.status === "PAID" ||
                req.paymentStatus === "PAID" ||
                req.status === "PAYMENT_CONFIRMED" ||
                req.status === "ORDERED_FROM_SUPPLIER" ||
                req.status === "SUPPLIER_DISPATCHED" ||
                req.status === "IN_TRANSIT" ||
                req.status === "DELIVERED";

              return (
                <tr key={req.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {invoiceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{req.customerName}</div>
                    <div className="text-[11px] text-slate-500">Ref: {req.referenceNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="truncate max-w-xs text-slate-800">
                      {req.part?.partName || req.part?.descriptionNotes || "OEM Spare Parts"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {req.submittedDate?.slice(0, 10) || "2026-08-31"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 font-medium">
                    ${(subtotal || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    ${(gst || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    ${(total || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isPaid ? "PAID" : "PENDING"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoiceReq(req)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition inline-flex items-center gap-1 ml-auto"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#ed2025]" />
                      <span>View IRD</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* IRD Printable Tax Invoice Modal (Symmetrical White Card) */}
      {selectedInvoiceReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 animate-scaleIn">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ed2025] bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                Official IRD Tax Document Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoiceReq(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Document */}
            <div className="space-y-6 text-sm">
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="text-2xl font-black tracking-tight text-slate-900">
                    PROCUR<span className="text-[#ed2025]">ly</span> by Autohub
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Autohub Global Parts NZ Limited</div>
                  <div className="text-xs text-slate-500">102 Hobson Street, Auckland CBD 1010, New Zealand</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">NZ GST Number: 134-582-901</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 tracking-wider">TAX INVOICE</div>
                  <div className="font-mono text-sm font-bold text-[#ed2025] mt-1">
                    {selectedInvoiceReq.invoice?.invoiceNumber || `INV-2026-${selectedInvoiceReq.id.replace("REQ-", "")}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString("en-NZ")}</div>
                  <div className="text-xs text-slate-500">Due: Net 20th Month</div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Bill To / Buyer:</div>
                  <div className="font-bold text-slate-900 mt-1">{selectedInvoiceReq.customerName}</div>
                  <div className="text-xs text-slate-600">
                    {typeof selectedInvoiceReq.deliveryAddress === "object" && selectedInvoiceReq.deliveryAddress
                      ? `${selectedInvoiceReq.deliveryAddress.street}, ${selectedInvoiceReq.deliveryAddress.city}`
                      : "Auckland Workshop Bay"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Vehicle: {selectedInvoiceReq.vehicle.make} {selectedInvoiceReq.vehicle.model} ({selectedInvoiceReq.vehicle.year})</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Reference:</div>
                  <div className="text-xs text-slate-800 mt-1">Request Ref: <strong className="font-mono">{selectedInvoiceReq.referenceNumber}</strong></div>
                  <div className="text-xs text-slate-800">VIN: {selectedInvoiceReq.vehicle.vin}</div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    Status: {selectedInvoiceReq.invoice?.status || "PAID"}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left text-xs border-t border-b border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b">
                    <th className="py-2.5 px-3 font-bold">Item / Description</th>
                    <th className="py-2.5 px-3 font-bold">Part #</th>
                    <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                    <th className="py-2.5 px-3 text-right font-bold">Unit Price (NZD)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Amount (NZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {selectedInvoiceReq.part?.partName || selectedInvoiceReq.part?.descriptionNotes || "Genuine OEM Part"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {selectedInvoiceReq.part?.oemPartNumber || "OEM-SPARE"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {selectedInvoiceReq.part?.quantity || 1}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">$1,150.00</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">$1,150.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-600">Air Express International Freight &amp; Port Handling</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">FREIGHT-EXP</td>
                    <td className="py-2.5 px-3 text-center font-mono">1</td>
                    <td className="py-2.5 px-3 text-right font-mono">$110.00</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">$110.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Financial Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (Excl. GST):</span>
                    <span className="font-mono font-semibold">$1,260.00 NZD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>NZ GST @ 15.0%:</span>
                    <span className="font-mono font-semibold">$189.00 NZD</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t pt-2 border-slate-300">
                    <span>Total Inc. GST:</span>
                    <span className="font-mono text-[#ed2025] font-black">$1,449.00 NZD</span>
                  </div>
                </div>
              </div>

              {/* Remittance Advice footer */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-900">Direct Bank Remittance Advice:</div>
                <div>Bank: ANZ Bank New Zealand • Account: <strong>01-0205-0812900-00</strong></div>
                <div>Account Name: Autohub Global Parts NZ Ltd • Reference: <strong className="font-mono text-[#ed2025]">{selectedInvoiceReq.referenceNumber}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
