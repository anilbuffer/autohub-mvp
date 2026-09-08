"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  DollarSign,
  X,
  CreditCard,
  Building2,
} from "lucide-react";
import { getStoredRequests, getStoredCustomers, subscribeToStore } from "@/lib/store";
import { PartRequest, TradeCustomer, TaxInvoice } from "@/lib/types";

export default function InvoicesAndReceiptsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customer, setCustomer] = useState<TradeCustomer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<{ invoice: TaxInvoice; request: PartRequest } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [search, setSearch] = useState("");

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

  const invoicedRequests = requests.filter((r) => r.invoice);

  const filteredInvoices = invoicedRequests.filter((r) => {
    if (statusFilter === "PAID" && r.invoice?.status !== "PAID") return false;
    if (statusFilter === "PENDING" && r.invoice?.status !== "PENDING") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.invoice?.invoiceNumber.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.part.partName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Accounting &amp; Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Invoices &amp; Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access compliant New Zealand IRD GST tax invoices, official payment receipts, and settlement history.
          </p>
        </div>

        <Link
          href="/portal/payments"
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4 text-slate-500" />
          <span>Go to Payments Desk</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "PAID", "PENDING"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab
                  ? "bg-[#0f172a] text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "ALL" && "All Invoices"}
              {tab === "PAID" && "Paid & Receipts Available"}
              {tab === "PENDING" && "Awaiting Settlement"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#ed2025]"
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tax Invoices &amp; Receipts Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {filteredInvoices.length} total records
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tax invoices found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Reference / Part</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Total (inc. GST)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((r) => {
                  const inv = r.invoice!;
                  const isPaid = inv.status === "PAID";

                  return (
                    <tr key={inv.invoiceNumber || r.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{r.referenceNumber}</div>
                        <div className="text-[11px] text-slate-500">{r.part.partName}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-700">
                        {inv.dateIssued || inv.issueDate}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-700">
                        {inv.dueDate}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        ${inv.totalNzd.toFixed(2)} NZD
                      </td>
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            {inv.status || "PENDING"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedInvoice({ invoice: inv, request: r })}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow"
                        >
                          {isPaid ? "View Receipt" : "View Tax Invoice"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Invoice / Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fadeIn space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ed2025] text-white flex items-center justify-center font-black text-sm">
                  AH
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedInvoice.invoice.status === "PAID"
                      ? "OFFICIAL PAYMENT RECEIPT"
                      : "NEW ZEALAND IRD TAX INVOICE"}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    GST Reg: 128-492-384
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bill To & Metadata */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Billed To (Trade Account):
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {customer?.tradingName || customer?.legalBusinessName}
                </div>
                <div className="text-slate-600">NZBN: {customer?.nzbn}</div>
                <div className="text-slate-600">
                  {customer?.billingDetails?.address ||
                    selectedInvoice.invoice.billingAddress ||
                    (customer?.deliveryAddresses?.[0]
                      ? `${customer.deliveryAddresses[0].street}, ${customer.deliveryAddresses[0].city}`
                      : "Auckland, New Zealand")}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Invoice Details:
                </span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedInvoice.invoice.invoiceNumber}
                </div>
                <div className="text-slate-600">
                  Issued: {selectedInvoice.invoice.dateIssued || selectedInvoice.invoice.issueDate}
                </div>
                <div className="text-slate-600 font-bold">
                  Status: {selectedInvoice.invoice.status}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-right">Amount (NZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">
                        {selectedInvoice.request.part.partName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Ref: {selectedInvoice.request.referenceNumber} • VIN:{" "}
                        {selectedInvoice.request.vehicle.vin}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ${selectedInvoice.invoice.subtotalNzd.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600">
                      New Zealand GST (15%)
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      ${(selectedInvoice.invoice.gstAmountNzd ?? selectedInvoice.invoice.gstNzd ?? 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80 font-bold">
                    <td className="p-3 text-slate-900 text-sm">Total Landed Amount</td>
                    <td className="p-3 text-right font-mono text-[#ed2025] text-sm">
                      ${selectedInvoice.invoice.totalNzd.toFixed(2)} NZD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Settlement Details:</span>
              <p>Autohub Operations Ltd • BNZ Auckland Commercial • 02-0192-0482910-00</p>
              <p>Particulars: {customer?.nzbn} • Reference: {selectedInvoice.invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
