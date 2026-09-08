"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Compass,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  PackageCheck,
  BadgePercent,
  Layers,
  Truck,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  getStoredRequests,
  getStoredCustomers,
  getStoredStaffUsers,
  getAllSystemAuditLogs,
  approveCustomerAccount,
  suspendCustomerAccount,
  reactivateCustomerAccount,
  subscribeToStore,
} from "@/lib/store";
import {
  PartRequest,
  TradeCustomer,
  StaffUser,
  AuditLogEntry,
} from "@/lib/types";

export default function AdministratorOverviewPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customers, setCustomers] = useState<TradeCustomer[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const refresh = () => {
    setRequests(getStoredRequests());
    setCustomers(getStoredCustomers());
    setStaff(getStoredStaffUsers());
    setAuditLogs(getAllSystemAuditLogs());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const pendingCustomers = customers.filter(
    (c) => c.billingDetails.status === "PENDING_APPROVAL"
  );
  const activeCustomers = customers.filter(
    (c) => c.billingDetails.status === "APPROVED"
  );

  const activeRequests = requests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "SOURCING"
  );
  const quotesPrepared = requests.filter(
    (r) => r.status === "QUOTE_PREPARED" || r.status === "AWAITING_CUSTOMER_APPROVAL"
  );
  const awaitingPayment = requests.filter(
    (r) => r.status === "AWAITING_PAYMENT"
  );
  const readyForProcurement = requests.filter(
    (r) => r.status === "PAYMENT_CONFIRMED"
  );
  const inTransitShipments = requests.filter(
    (r) =>
      r.status === "SUPPLIER_DISPATCHED" ||
      r.status === "RECEIVED_AT_SHIPPING_FACILITY" ||
      r.status === "IN_TRANSIT" ||
      r.status === "ARRIVED_IN_NZ" ||
      r.status === "CUSTOMS_CLEARANCE" ||
      r.status === "OUT_FOR_DELIVERY"
  );
  const completedOrders = requests.filter(
    (r) => r.status === "DELIVERED" || r.status === "COMPLETED"
  );

  // Total Landed GMV
  const totalGmv = requests.reduce((sum, r) => {
    return sum + (r.quote?.totalNzd || r.invoice?.totalNzd || 0);
  }, 0);

  const handleApprove = (id: string) => {
    approveCustomerAccount(id, 25000);
    refresh();
  };

  const handleSuspend = (id: string) => {
    suspendCustomerAccount(id, "Administrative credit & compliance verification");
    refresh();
  };

  const handleReactivate = (id: string) => {
    reactivateCustomerAccount(id);
    refresh();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Unified Back-Office
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              MVP Phase 1
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Autohub Operations &amp; Administration Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end management from customer registration through delivered order: sourcing, quotes, freight, payment validation, and logistics tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/requests"
            className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>View All Requests</span>
          </Link>
          <Link
            href="/portal"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Customer Portal</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Operational KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Parts Requests</span>
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {requests.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-red-600">{activeRequests.length} in sourcing</span>
            <span>•</span>
            <span>{quotesPrepared.length} quoted</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Procurement &amp; POs</span>
            <PackageCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {readyForProcurement.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-600">Payment cleared</span>
            <span>•</span>
            <span>Ready for supplier PO</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Consignments in Transit</span>
            <Compass className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {inTransitShipments.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-blue-600">{completedOrders.length} delivered</span>
            <span>•</span>
            <span>Air &amp; Ocean routes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Trade Customers</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {customers.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-purple-600">{pendingCustomers.length} pending review</span>
            <span>•</span>
            <span>{activeCustomers.length} active</span>
          </div>
        </div>
      </div>

      {/* Operational Lifecycle Pipeline Tracker */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ed2025]" />
              End-to-End Operational Lifecycle Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Live inventory of requests progressing through each sequential phase of the Autohub procurement workflow
            </p>
          </div>
          <div className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Total Pipeline Value: ${totalGmv.toLocaleString("en-NZ", { minimumFractionDigits: 2 })} NZD
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <Link
            href="/admin/requests"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">1. Intake</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-red-600 transition">
              {activeRequests.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Sourcing Desk</div>
          </Link>

          <Link
            href="/admin/customer-quotes"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">2. Quotes</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-amber-600 transition">
              {quotesPrepared.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting Review</div>
          </Link>

          <Link
            href="/admin/payments"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">3. Payment</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-purple-600 transition">
              {awaitingPayment.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Bank / Trade Credit</div>
          </Link>

          <Link
            href="/admin/procurement"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">4. Supplier PO</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition">
              {readyForProcurement.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ready to Order</div>
          </Link>

          <Link
            href="/admin/shipments"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">5. Transit</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-blue-600 transition">
              {inTransitShipments.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Port &amp; Customs</div>
          </Link>

          <Link
            href="/admin/requests"
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">6. Delivered</div>
            <div className="text-xl font-black text-slate-900 font-mono group-hover:text-slate-700 transition">
              {completedOrders.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Workshop Depot</div>
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Pending Account Approvals & Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer Account Approvals & Recent Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Customer Approvals Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pending Trade Account Approvals
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {pendingCustomers.length} Pending
                </span>
              </div>
              <Link
                href="/admin/customers"
                className="text-xs font-bold text-[#ed2025] hover:underline flex items-center gap-1"
              >
                <span>View All Accounts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>All registered trade accounts have been reviewed and approved.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {cust.tradingName || cust.legalBusinessName}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded font-mono font-semibold">
                          NZBN: {cust.nzbn}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cust.businessType.replace(/_/g, " ")} • Contact: {cust.primaryContact.name} ({cust.primaryContact.email})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Terms Requested: Net 20th Month • Credit Line: ${cust.billingDetails.creditLimitNzd.toLocaleString()} NZD
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(cust.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuspend(cust.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Parts Requests Sourcing Queue Preview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ed2025]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Active Parts Requests Queue
                </h3>
              </div>
              <Link
                href="/admin/requests"
                className="text-xs font-bold text-[#ed2025] hover:underline flex items-center gap-1"
              >
                <span>Full Request Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {req.referenceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === "SOURCING"
                            ? "bg-amber-100 text-amber-800"
                            : req.status === "PAYMENT_CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : req.status === "IN_TRANSIT"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {req.part.quantity}x {req.part.partName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {req.vehicle.year} {req.vehicle.make} {req.vehicle.model} • {req.customerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-slate-900">
                        {req.quote ? `$${req.quote.totalNzd.toFixed(2)}` : "Awaiting Quote"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(req.submittedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      href="/admin/requests"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Operational Shortcuts & System Audit Logs */}
        <div className="space-y-6">
          {/* Quick Workflow Navigation Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ed2025]" />
              Operational Desks
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin/requests"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Parts Requests</div>
                    <div className="text-[10px] text-slate-400">Review &amp; route intake</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>

              <Link
                href="/admin/supplier-quotes"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Supplier Quotes</div>
                    <div className="text-[10px] text-slate-400">Overseas supplier quotes</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>

              <Link
                href="/admin/customer-quotes"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <BadgePercent className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Customer Quotes</div>
                    <div className="text-[10px] text-slate-400">Margins &amp; landed pricing</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>

              <Link
                href="/admin/procurement"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Procurement POs</div>
                    <div className="text-[10px] text-slate-400">Order from global suppliers</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>

              <Link
                href="/admin/payments"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Payments &amp; Credit</div>
                    <div className="text-[10px] text-slate-400">Bank remittance &amp; terms</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>

              <Link
                href="/admin/shipments"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Shipments Tracking</div>
                    <div className="text-[10px] text-slate-400">Air &amp; sea consignment status</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </Link>
            </div>
          </div>

          {/* Audit Logs Preview Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Audit Trail
                </h3>
              </div>
              <Link
                href="/admin/audit"
                className="text-[11px] font-bold text-[#ed2025] hover:underline"
              >
                Full Trail →
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{log.details || log.newState}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    By {log.actorName} ({log.actorRole})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
