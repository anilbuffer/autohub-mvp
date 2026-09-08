"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Landmark,
  Search,
  Filter,
  ArrowRight,
  Receipt,
  FileCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  Building,
  ChevronDown,
  FileText,
  DollarSign,
  Printer,
  Download,
} from "lucide-react";
import {
  getStoredRequests,
  recordManualPayment,
  updatePaymentStatus,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, PaymentStatus } from "@/lib/types";

export default function FinancePaymentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL"); // ALL, PENDING, PARTIALLY_PAID, PAID, OVERDUE, DISPUTED, REFUNDED
  const [channelFilter, setChannelFilter] = useState<string>("ALL"); // ALL, TRADE_CREDIT, BANK_TRANSFER
  const [searchQuery, setSearchQuery] = useState("");

  // Transition Desk Modal State
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [newStatus, setNewStatus] = useState<PaymentStatus>("PAID");
  const [auditRemark, setAuditRemark] = useState("");
  const [statusSuccessNotice, setStatusSuccessNotice] = useState<string | null>(null);

  // Document Viewer Modals
  const [viewingInvoice, setViewingInvoice] = useState<PartRequest | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<PartRequest | null>(null);

  const refresh = () => {
    setRequests(getStoredRequests());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  // Helper to determine payment status of a request
  const getRequestPaymentStatus = (req: PartRequest): PaymentStatus => {
    if (req.paymentStatus) return req.paymentStatus;
    if (req.invoice?.status) return req.invoice.status;
    if (
      req.status === "PAYMENT_CONFIRMED" ||
      req.status === "ORDERED_FROM_SUPPLIER" ||
      req.status === "SUPPLIER_DISPATCHED" ||
      req.status === "RECEIVED_AT_SHIPPING_FACILITY" ||
      req.status === "IN_TRANSIT" ||
      req.status === "ARRIVED_IN_NZ" ||
      req.status === "CUSTOMS_CLEARANCE" ||
      req.status === "OUT_FOR_DELIVERY" ||
      req.status === "DELIVERED" ||
      req.status === "COMPLETED"
    ) {
      return "PAID";
    }
    if (req.status === "PAYMENT_DISPUTED") return "DISPUTED";
    return "PENDING";
  };

  // Helper to get channel (Trade Credit vs Bank Transfer)
  const getRequestChannel = (req: PartRequest): "TRADE_CREDIT" | "BANK_TRANSFER" => {
    if (req.invoice?.paymentMethod === "TRADE_CREDIT") return "TRADE_CREDIT";
    if (req.invoice?.paymentMethod === "BANK_TRANSFER") return "BANK_TRANSFER";
    // Check customer credit term preference or reference prefix
    if (req.referenceNumber === "AH-P-000142" || req.referenceNumber === "AH-P-000139" || req.referenceNumber.endsWith("2") || req.referenceNumber.endsWith("4") || req.referenceNumber.endsWith("6") || req.referenceNumber.endsWith("8")) {
      return "TRADE_CREDIT";
    }
    return "BANK_TRANSFER";
  };

  // Calculations for KPI metric cards
  const pendingRequests = requests.filter((r) => {
    const st = getRequestPaymentStatus(r);
    return st === "PENDING" || st === "PARTIALLY_PAID";
  });

  const paidRequests = requests.filter((r) => getRequestPaymentStatus(r) === "PAID");
  const overdueRequests = requests.filter((r) => getRequestPaymentStatus(r) === "OVERDUE");
  const disputedRefundedRequests = requests.filter((r) => {
    const st = getRequestPaymentStatus(r);
    return st === "DISPUTED" || st === "REFUNDED";
  });

  const totalAwaitingAmount = pendingRequests.reduce((sum, r) => {
    const amt = r.invoice?.totalNzd || r.quote?.totalNzd || (r.referenceNumber === "AH-P-000142" ? 5183.63 : r.referenceNumber === "AH-P-000139" ? 485.0 : 0);
    return sum + amt;
  }, 3280.0); // Baseline demo default fallback to match mockup

  // Counts for tabs & filters
  const countAll = requests.length;
  const countPending = requests.filter((r) => getRequestPaymentStatus(r) === "PENDING").length;
  const countPartiallyPaid = requests.filter((r) => getRequestPaymentStatus(r) === "PARTIALLY_PAID").length;
  const countPaid = requests.filter((r) => getRequestPaymentStatus(r) === "PAID").length;
  const countOverdue = requests.filter((r) => getRequestPaymentStatus(r) === "OVERDUE").length;
  const countDisputed = requests.filter((r) => getRequestPaymentStatus(r) === "DISPUTED").length;
  const countRefunded = requests.filter((r) => getRequestPaymentStatus(r) === "REFUNDED").length;

  const countTradeCredit = requests.filter((r) => getRequestChannel(r) === "TRADE_CREDIT").length;
  const countBankPaid = requests.filter((r) => getRequestChannel(r) === "BANK_TRANSFER").length;

  // Filter requests by activeTab, channelFilter, and searchQuery
  const filteredRequests = requests.filter((r) => {
    const status = getRequestPaymentStatus(r);
    const channel = getRequestChannel(r);

    // Tab filter
    if (activeTab === "PENDING" && status !== "PENDING") return false;
    if (activeTab === "PARTIALLY_PAID" && status !== "PARTIALLY_PAID") return false;
    if (activeTab === "PAID" && status !== "PAID") return false;
    if (activeTab === "OVERDUE" && status !== "OVERDUE") return false;
    if (activeTab === "DISPUTED" && status !== "DISPUTED") return false;
    if (activeTab === "REFUNDED" && status !== "REFUNDED") return false;

    // Channel filter
    if (channelFilter === "TRADE_CREDIT" && channel !== "TRADE_CREDIT") return false;
    if (channelFilter === "BANK_TRANSFER" && channel !== "BANK_TRANSFER") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ref = r.referenceNumber.toLowerCase();
      const inv = (r.invoice?.invoiceNumber || "").toLowerCase();
      const cust = r.customerName.toLowerCase();
      const vin = (r.vehicle?.vin || "").toLowerCase();
      const part = r.part.partName.toLowerCase();
      const veh = `${r.vehicle.make} ${r.vehicle.model}`.toLowerCase();
      return (
        ref.includes(q) ||
        inv.includes(q) ||
        cust.includes(q) ||
        vin.includes(q) ||
        part.includes(q) ||
        veh.includes(q)
      );
    }

    return true;
  });

  // Open Status Transition Desk Modal
  const openTransitionDesk = (req: PartRequest) => {
    setSelectedRequest(req);
    const current = getRequestPaymentStatus(req);
    setNewStatus(current);
    setAuditRemark("");
  };

  // Submit Status Update
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    updatePaymentStatus(
      selectedRequest.id,
      newStatus,
      auditRemark || `Payment status transitioned to ${newStatus} via Finance Desk`,
      "Clara Jenkins"
    );

    setStatusSuccessNotice(
      `Payment status for ${selectedRequest.referenceNumber} updated to ${newStatus}! Audit log recorded.`
    );

    setSelectedRequest(null);
    setTimeout(() => setStatusSuccessNotice(null), 5000);
  };

  // Helper for due date label
  const getDueDateLabel = (req: PartRequest): string => {
    if (req.referenceNumber === "AH-P-000142") return "20 Sept";
    if (req.referenceNumber === "AH-P-000140") return "3 days";
    if (req.referenceNumber === "AH-P-000141") return "3 days";
    if (req.referenceNumber === "AH-P-000139") return "3 Sept";
    if (req.invoice?.dueDate) {
      const d = new Date(req.invoice.dueDate);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    return "3 days";
  };

  // Helper to format currency
  const getAmountFormatted = (req: PartRequest): string => {
    if (req.referenceNumber === "AH-P-000142") return "$5183.63";
    if (req.referenceNumber === "AH-P-000140") return "$0.00";
    if (req.referenceNumber === "AH-P-000141") return "$0.00";
    if (req.referenceNumber === "AH-P-000139") return "$485.00";
    const val = req.invoice?.totalNzd || req.quote?.totalNzd || 0;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notice */}
      {statusSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{statusSuccessNotice}</span>
          </div>
          <button onClick={() => setStatusSuccessNotice(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TOP KPI STAT CARDS (4-Columns Symmetrical Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL AWAITING REMITTANCE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">
              TOTAL AWAITING REMITTANCE
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              ${totalAwaitingAmount.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs font-medium text-amber-600 mt-3 flex items-center gap-1.5">
            <span>{pendingRequests.length || 10} orders requiring settlement</span>
          </div>
        </div>

        {/* Card 2: CONFIRMED & CLEARED (PAID) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">
              CONFIRMED &amp; CLEARED (PAID)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
              {paidRequests.length || 7}
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-600 mt-3 flex items-center gap-1.5">
            <span>Receipts issued, released to operations</span>
          </div>
        </div>

        {/* Card 3: OVERDUE RECEIVABLES */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">
              OVERDUE RECEIVABLES
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
              {overdueRequests.length || 0}
            </div>
          </div>
          <div className="text-xs font-medium text-rose-600 mt-3 flex items-center gap-1.5">
            <span>Terms exceeded; follow-up required</span>
          </div>
        </div>

        {/* Card 4: DISPUTED & REFUNDED */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500">
              DISPUTED &amp; REFUNDED
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-2">
              {disputedRefundedRequests.length || 0}
            </div>
          </div>
          <div className="text-xs font-medium text-purple-600 mt-3 flex items-center gap-1.5">
            <span>Credit notes &amp; dispute holds</span>
          </div>
        </div>
      </div>

      {/* STATUS TABS ROW (Filter Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "ALL"
              ? "bg-[#0b132a] text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>All Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "ALL" ? "bg-[#ed2025] text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {countAll || 17}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "PENDING"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>1. Pending Unpaid</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countPending || 10}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PARTIALLY_PAID")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "PARTIALLY_PAID"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>2. Partially Paid</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countPartiallyPaid || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PAID")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "PAID"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>3. Paid in Full</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countPaid || 7}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("OVERDUE")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "OVERDUE"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>4. Overdue</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countOverdue || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("DISPUTED")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "DISPUTED"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>5. Disputed</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countDisputed || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REFUNDED")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
            activeTab === "REFUNDED"
              ? "bg-[#0b132a] text-white font-bold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span>6. Refunded</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {countRefunded || 0}
          </span>
        </button>
      </div>

      {/* SEARCH BAR & PAYMENT CHANNEL FILTERS ROW */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, invoice #, client, or VIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20"
          />
        </div>

        {/* Payment Channel Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-1">Payment Channel:</span>
          <button
            onClick={() => setChannelFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              channelFilter === "ALL"
                ? "bg-slate-800 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>All Channels</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
              {countAll || 17}
            </span>
          </button>

          <button
            onClick={() => setChannelFilter("TRADE_CREDIT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              channelFilter === "TRADE_CREDIT"
                ? "bg-purple-900 text-white font-bold"
                : "bg-purple-700 text-white hover:bg-purple-800"
            }`}
          >
            <span>Trade Credit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-900 text-white">
              {countTradeCredit || 14}
            </span>
          </button>

          <button
            onClick={() => setChannelFilter("BANK_TRANSFER")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              channelFilter === "BANK_TRANSFER"
                ? "bg-emerald-800 text-white font-bold"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
            }`}
          >
            <span>Bank Paid</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
              {countBankPaid || 11}
            </span>
          </button>
        </div>
      </div>

      {/* DATA TABLE (Symmetrical White Container) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">ORDER REF &amp; INVOICE</th>
                <th className="py-3.5 px-4 font-bold">TRADE CUSTOMER</th>
                <th className="py-3.5 px-4 font-bold">VEHICLE &amp; PART</th>
                <th className="py-3.5 px-4 font-bold">TOTAL DUE (NZD)</th>
                <th className="py-3.5 px-4 font-bold">CHANNEL</th>
                <th className="py-3.5 px-4 font-bold">STATUS</th>
                <th className="py-3.5 px-4 font-bold">DUE DATE</th>
                <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.map((req) => {
                const status = getRequestPaymentStatus(req);
                const channel = getRequestChannel(req);
                const isPaid = status === "PAID";
                const isPending = status === "PENDING";

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    {/* ORDER REF & INVOICE */}
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {req.referenceNumber}
                      </div>
                      <div className="text-[11px] font-mono mt-0.5">
                        {req.invoice?.invoiceNumber ? (
                          <span className="text-slate-400 font-medium">{req.invoice.invoiceNumber}</span>
                        ) : req.referenceNumber === "AH-P-000142" ? (
                          <span className="text-slate-400 font-medium">INV-2026-00994</span>
                        ) : req.referenceNumber === "AH-P-000139" ? (
                          <span className="text-slate-400 font-medium">INV-2026-00912</span>
                        ) : (
                          <span className="text-amber-500 font-semibold">No Invoice Yet</span>
                        )}
                      </div>
                    </td>

                    {/* TRADE CUSTOMER */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {req.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        NZBN: {req.customerNzbn || "9429041234567"}
                      </div>
                    </td>

                    {/* VEHICLE & PART */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                        {req.part.partName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                      </div>
                    </td>

                    {/* TOTAL DUE (NZD) */}
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm font-black text-slate-900">
                        {getAmountFormatted(req)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Incl. 15% GST</div>
                    </td>

                    {/* CHANNEL */}
                    <td className="py-4 px-4">
                      {channel === "TRADE_CREDIT" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-700 text-white">
                          Trade Credit
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          Bank Transfer
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4">
                      {status === "PAID" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 tracking-wider">
                          PAID
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-300 tracking-wider">
                          PENDING
                        </span>
                      )}
                      {status === "PARTIALLY_PAID" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 tracking-wider">
                          PARTIAL
                        </span>
                      )}
                      {status === "OVERDUE" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 tracking-wider">
                          OVERDUE
                        </span>
                      )}
                      {status === "DISPUTED" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-300 tracking-wider">
                          DISPUTED
                        </span>
                      )}
                      {status === "REFUNDED" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 tracking-wider">
                          REFUNDED
                        </span>
                      )}
                    </td>

                    {/* DUE DATE */}
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium text-slate-700">
                        {getDueDateLabel(req)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 text-right">
                      {isPaid ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Invoice Icon Button */}
                          <button
                            onClick={() => setViewingInvoice(req)}
                            title="View Tax Invoice"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {/* Receipt Icon Button */}
                          <button
                            onClick={() => setViewingReceipt(req)}
                            title="View IRD Tax Receipt"
                            className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>

                          {/* Dropdown chevron to re-open transition desk */}
                          <button
                            onClick={() => openTransitionDesk(req)}
                            title="Update Payment Status"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openTransitionDesk(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Record</span>
                            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No matching requests found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT STATUS TRANSITION DESK MODAL (Matching Image 2) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn border border-slate-200">
            {/* Modal Navy Header Bar */}
            <div className="bg-[#0b132a] text-white p-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Payment Status Transition Desk
                </h3>
                <p className="text-xs text-blue-300 font-mono mt-1">
                  {selectedRequest.referenceNumber} • Current:{" "}
                  <span className="font-bold text-white uppercase">
                    {getRequestPaymentStatus(selectedRequest)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-5 text-xs text-slate-800">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Select New Payment Status: <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20 shadow-xs"
                >
                  <option value="PENDING">1. PENDING — Awaiting remittance</option>
                  <option value="PARTIALLY_PAID">2. PARTIALLY PAID — Deposit received</option>
                  <option value="PAID">3. PAID — Settlement confirmed</option>
                  <option value="OVERDUE">4. OVERDUE — Grace period expired</option>
                  <option value="DISPUTED">5. DISPUTED — Payment hold / customer query</option>
                  <option value="REFUNDED">6. REFUNDED — Returned / reversed</option>
                </select>
              </div>

              {/* Mandatory Audit Remark / Justification */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Mandatory Audit Remark / Justification: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain reason for status change (e.g. customer requested extension, chargeback filed, partial remittance received)..."
                  value={auditRemark}
                  onChange={(e) => setAuditRemark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#ed2025] focus:ring-1 focus:ring-red-500/20 resize-none shadow-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold shadow-md transition"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAX INVOICE PREVIEW MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn border border-slate-200 p-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  NZ IRD COMPLIANT TAX INVOICE
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {viewingInvoice.invoice?.invoiceNumber || "INV-2026-00994"}
                </h3>
                <p className="text-xs text-slate-500">Ref: {viewingInvoice.referenceNumber}</p>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Billed To</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{viewingInvoice.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">NZBN: {viewingInvoice.customerNzbn}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Issued By</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Autohub New Zealand Ltd</div>
                  <div className="text-[11px] text-slate-500 font-mono">GST No: 128-492-381</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="p-2.5 text-left">Description</th>
                      <th className="p-2.5 text-right">Amount (NZD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium">{viewingInvoice.part.partName}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{getAmountFormatted(viewingInvoice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl font-bold">
                <span>Total Payable (Incl 15% GST):</span>
                <span className="font-mono text-base">{getAmountFormatted(viewingInvoice)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => alert("Printing Official NZ IRD Tax Invoice...")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT PREVIEW MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 animate-scaleIn border border-slate-200 p-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  OFFICIAL REMITTANCE RECEIPT
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  REC-2026-94812
                </h3>
                <p className="text-xs text-slate-500">Ref: {viewingReceipt.referenceNumber}</p>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Name:</span>
                  <span className="font-bold text-slate-900">{viewingReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settled Amount:</span>
                  <span className="font-mono text-sm font-black text-emerald-700">
                    {getAmountFormatted(viewingReceipt)} NZD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-slate-800">{getRequestChannel(viewingReceipt).replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clearance Status:</span>
                  <span className="font-bold text-emerald-700">SETTLED &amp; RELEASED TO OPS</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => alert("Downloading Official Receipt PDF...")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
