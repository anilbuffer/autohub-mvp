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
  ExternalLink
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Inland Revenue Department (IRD)
            </span>
            <span className="text-xs text-slate-500">NZ GST Act 1985 Compliant</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-400" />
            Official NZ Tax Invoices Register
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse, print, and audit buyer tax invoices with 15% GST breakdown and registered NZ GST # 134-582-901.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/finance/payments"
            className="px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            Remittance Matching
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice #, request, or workshop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PAID", "PENDING"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st === "ALL" ? "All Invoices" : st === "PAID" ? "Paid Invoices" : "Pending Payment"}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Tax Invoice #</th>
              <th className="py-3.5 px-4 font-semibold">Customer / Workshop</th>
              <th className="py-3.5 px-4 font-semibold">Part Description</th>
              <th className="py-3.5 px-4 font-semibold">Date Issued</th>
              <th className="py-3.5 px-4 font-semibold text-right">Subtotal</th>
              <th className="py-3.5 px-4 font-semibold text-right">GST (15%)</th>
              <th className="py-3.5 px-4 font-semibold text-right">Total (NZD)</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal text-xs">
            {filteredRequests.map((req, idx) => {
              const invoiceNo = req.invoice?.invoiceNumber || `INV-2024-${req.id.replace("REQ-", "")}`;
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
                <tr key={req.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {invoiceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{req.customerName}</div>
                    <div className="text-[11px] text-slate-500">Ref: {req.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="truncate max-w-xs text-slate-200">
                      {req.part?.partName || req.part?.descriptionNotes || "OEM Spare Parts"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {req.submittedDate?.slice(0, 10) || "2024-03-28"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ${(subtotal || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-teal-400">
                    ${(gst || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    ${(total || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPaid
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isPaid ? "PAID" : "PENDING"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoiceReq(req)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1 ml-auto"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      View IRD
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* IRD Printable Tax Invoice Modal */}
      {selectedInvoiceReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 animate-scaleIn">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Official IRD Tax Document Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoiceReq(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Document */}
            <div className="space-y-6 text-sm">
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <div className="text-2xl font-black tracking-tight text-slate-900">AUTOHUB GLOBAL PARTS</div>
                  <div className="text-xs text-slate-500 mt-1">Autohub Global Parts NZ Limited</div>
                  <div className="text-xs text-slate-500">102 Hobson Street, Auckland CBD 1010, New Zealand</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">NZ GST Number: 134-582-901</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-800 tracking-wider">TAX INVOICE</div>
                  <div className="font-mono text-sm font-bold text-slate-800 mt-1">
                    {selectedInvoiceReq.invoice?.invoiceNumber || `INV-2024-${selectedInvoiceReq.id.replace("REQ-", "")}`}
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
                      : (selectedInvoiceReq.deliveryAddress as any) || "Auckland Workshop Bay"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Vehicle: {selectedInvoiceReq.vehicle.make} {selectedInvoiceReq.vehicle.model} ({selectedInvoiceReq.vehicle.year})</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Reference:</div>
                  <div className="text-xs text-slate-800 mt-1">Request ID: <strong className="font-mono">{selectedInvoiceReq.id}</strong></div>
                  <div className="text-xs text-slate-800">VIN: {selectedInvoiceReq.vehicle.vin}</div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    Status: {selectedInvoiceReq.invoice?.status || selectedInvoiceReq.paymentStatus || "PAID"}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left text-xs border-t border-b border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b">
                    <th className="py-2.5 px-3">Item / Description</th>
                    <th className="py-2.5 px-3">Part #</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (NZD)</th>
                    <th className="py-2.5 px-3 text-right">Amount (NZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
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
                    <td className="py-2.5 px-3 text-slate-600">Air Express International Freight & Port Handling</td>
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
                    <span className="font-mono text-emerald-800">$1,449.00 NZD</span>
                  </div>
                </div>
              </div>

              {/* Remittance Advice footer */}
              <div className="p-3 bg-slate-50 border rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Direct Bank Remittance Advice:</div>
                <div>Bank: ANZ Bank New Zealand • Account: <strong>01-0205-0812900-00</strong></div>
                <div>Account Name: Autohub Global Parts NZ Ltd • Reference: <strong className="font-mono">{selectedInvoiceReq.id}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
