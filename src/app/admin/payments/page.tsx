"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Banknote,
  Search,
  CheckCircle2,
  Clock,
  Unlock,
  Lock,
  DollarSign,
  FileText,
  CreditCard,
  Building2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Download,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredCustomers,
  getStoredTransactions,
  recordManualPayment,
  validateAndReleaseCreditOrder,
  generateTaxInvoiceForRequest,
  updatePaymentStatus,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  FinancialTransaction,
  TradeCustomer,
  PaymentStatus,
} from "@/lib/types";

export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ORDERS" | "LEDGER">("ORDERS");
  const [filterPayment, setFilterPayment] = useState<"ALL" | "PENDING" | "PAID">("ALL");

  // Manual Payment Modal
  const [paymentModalReq, setPaymentModalReq] = useState<PartRequest | null>(null);
  const [remitAmount, setRemitAmount] = useState<number>(0);
  const [bankRef, setBankRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Trade Credit Release Modal
  const [creditModalReq, setCreditModalReq] = useState<PartRequest | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [creditError, setCreditError] = useState<string | null>(null);

  const refresh = () => {
    setRequests(getStoredRequests());
    setCustomers(getStoredCustomers());
    setTransactions(getStoredTransactions());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const handleOpenPaymentModal = (req: PartRequest) => {
    setPaymentModalReq(req);
    const due = req.invoice?.totalNzd || req.quote?.totalNzd || 500;
    setRemitAmount(due);
    setBankRef(`ANZ-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes("Direct bank transfer remittance verified against ANZ statement.");
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalReq) return;

    recordManualPayment(
      paymentModalReq.id,
      "BANK_TRANSFER",
      remitAmount,
      bankRef,
      "Clara Jenkins",
      paymentNotes
    );

    setPaymentModalReq(null);
    refresh();
  };

  const handleOpenCreditModal = (req: PartRequest) => {
    setCreditModalReq(req);
    setOverrideReason("");
    setCreditError(null);
  };

  const handleReleaseCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalReq) return;

    const res = validateAndReleaseCreditOrder(
      creditModalReq.id,
      "Clara Jenkins",
      overrideReason || undefined
    );

    if (!res.success) {
      setCreditError(res.message);
    } else {
      setCreditModalReq(null);
      refresh();
    }
  };

  const handleGenerateInvoice = (reqId: string) => {
    generateTaxInvoiceForRequest(reqId, "Clara Jenkins");
    refresh();
  };

  const pendingOrders = requests.filter(
    (r) => r.status === "AWAITING_PAYMENT" || (r.quote && (!r.invoice || r.invoice.status === "PENDING"))
  );
  const paidOrders = requests.filter(
    (r) => r.status === "PAYMENT_CONFIRMED" || r.invoice?.status === "PAID"
  );

  const totalInvoicedNzd = requests.reduce((sum, r) => sum + (r.invoice?.totalNzd || 0), 0);
  const totalSettledNzd = transactions
    .filter((t) => t.type === "PAYMENT_RECEIVED" || t.type === "TRADE_CREDIT_UTILIZED")
    .reduce((sum, t) => sum + t.amountNzd, 0);

  const filteredRequests = requests.filter((r) => {
    const isPayable = r.quote || r.invoice;
    const matchesFilter =
      filterPayment === "ALL" ||
      (filterPayment === "PENDING" && r.status === "AWAITING_PAYMENT") ||
      (filterPayment === "PAID" && (r.status === "PAYMENT_CONFIRMED" || r.invoice?.status === "PAID"));

    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.invoice?.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    return isPayable && matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Treasury &amp; Credit Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Payment &amp; Trade Credit Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record bank transfer remittances, validate trade credit lines (Net 20th Month), generate official NZ tax invoices, and unlock procurement gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ORDERS")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
              activeTab === "ORDERS"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Orders &amp; Invoices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LEDGER")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
              activeTab === "LEDGER"
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Transactions Ledger
          </button>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Invoiced (NZD)
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${totalInvoicedNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Generated NZ tax invoices
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Settled Remittances &amp; Credit
          </span>
          <div className="text-3xl font-black text-emerald-700 font-mono">
            ${totalSettledNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Confirmed payments unlocking procurement
          </span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-amber-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Pending Payment Clearance
          </span>
          <div className="text-3xl font-black text-amber-700 font-mono">
            {pendingOrders.length} <span className="text-xs font-normal text-slate-500">orders</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Awaiting customer bank transfer or credit release
          </span>
        </div>
      </div>

      {activeTab === "ORDERS" ? (
        <>
          {/* Filter Tabs & Search */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order ref, invoice number, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ed2025] transition"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {[
                  { id: "ALL", label: "All Orders", count: requests.filter((r) => r.quote || r.invoice).length },
                  { id: "PENDING", label: "Awaiting Payment", count: pendingOrders.length },
                  { id: "PAID", label: "Payment Confirmed", count: paidOrders.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterPayment(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                      filterPayment === tab.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        filterPayment === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders / Invoices Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Tax Invoice</th>
                    <th className="py-3 px-4">Amount Due</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => {
                      const totalDue = r.invoice?.totalNzd || r.quote?.totalNzd || 0;
                      const isPaid = r.status === "PAYMENT_CONFIRMED" || r.invoice?.status === "PAID";
                      const customer = customers.find((c) => c.id === r.customerId);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            <div>{r.referenceNumber}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {r.part.quantity}x {r.part.partName}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{r.customerName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Credit: ${customer?.billingDetails.creditAvailableNzd.toLocaleString()} avail
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            {r.invoice ? (
                              <div>
                                <span className="font-bold text-blue-700">{r.invoice.invoiceNumber}</span>
                                <div className="text-[10px] text-slate-400">
                                  Due: {new Date(r.invoice.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleGenerateInvoice(r.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                              >
                                + Generate Invoice
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            <div>${totalDue.toFixed(2)} NZD</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              incl 15% GST (${(totalDue * 0.15 / 1.15).toFixed(2)})
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-amber-100 text-amber-900 border-amber-300"
                              }`}
                            >
                              {isPaid ? "PAID / RELEASED" : "AWAITING PAYMENT"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isPaid && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPaymentModal(r)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                                  >
                                    Record Bank Transfer
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenCreditModal(r)}
                                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-xs"
                                  >
                                    Trade Credit Release
                                  </button>
                                </>
                              )}

                              {isPaid && (
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Gate Unlocked</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Transactions Register / Ledger */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              General Financial Transaction Ledger ({transactions.length} entries)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Immutable accounting event records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Order Ref / Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount (NZD)</th>
                  <th className="py-3 px-4">Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === "PAYMENT_RECEIVED"
                            ? "bg-emerald-100 text-emerald-900"
                            : t.type === "TRADE_CREDIT_UTILIZED"
                            ? "bg-purple-100 text-purple-900"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.referenceNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {t.paymentMethod.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      ${t.amountNzd.toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{t.officerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Manual Bank Transfer Remittance Modal */}
      {paymentModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Record Manual Bank Remittance
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Order {paymentModalReq.referenceNumber} • {paymentModalReq.customerName}
              </p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Amount Received ($NZD)</label>
                <input
                  type="number"
                  step="any"
                  value={remitAmount}
                  onChange={(e) => setRemitAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Bank Statement Reference / Hash</label>
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="e.g. ANZ-TXN-904821 or customer payment ref"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Audit Notes / Verification</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gate Unlock Action:</span>
                </div>
                <div>Recording full payment immediately unlocks procurement for supplier PO placement.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Confirm &amp; Unlock Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Credit Facility Validation & Release Modal */}
      {creditModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Validate &amp; Release Trade Credit Order
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Order {creditModalReq.referenceNumber} • {creditModalReq.customerName}
              </p>
            </div>

            {creditError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-semibold text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{creditError}</span>
              </div>
            )}

            <form onSubmit={handleReleaseCreditSubmit} className="space-y-4">
              {(() => {
                const cust = customers.find((c) => c.id === creditModalReq.customerId);
                const orderTotal = creditModalReq.invoice?.totalNzd || creditModalReq.quote?.totalNzd || 0;
                const creditAvail = cust?.billingDetails.creditAvailableNzd || 0;
                const isOverLimit = orderTotal > creditAvail;

                return (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Order Total:</span>
                        <span className="font-bold text-slate-900">${orderTotal.toFixed(2)} NZD</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Customer Available Credit:</span>
                        <span className={`font-bold ${isOverLimit ? "text-rose-600" : "text-emerald-600"}`}>
                          ${creditAvail.toFixed(2)} NZD
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Facility Terms:</span>
                        <span className="font-bold text-slate-900">{cust?.billingDetails.paymentTerms || "NET_20TH_MONTH"}</span>
                      </div>
                    </div>

                    {isOverLimit && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                        <div className="font-bold">⚠️ Credit Limit Exceeded:</div>
                        <div>Order total exceeds available credit line. Managerial override reason is mandatory to approve release.</div>
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        Managerial Override Rationale {isOverLimit && <span className="text-rose-600">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Required if order exceeds limit or facility pending review"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                        required={isOverLimit}
                      />
                    </div>
                  </>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreditModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                >
                  Authorize Credit Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
