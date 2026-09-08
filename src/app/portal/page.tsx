"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Clock,
  Box,
  Truck,
  FileText,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getStoredRequests, getStoredCustomers, subscribeToStore } from "@/lib/store";
import { PartRequest, TradeCustomer } from "@/lib/types";

export default function CustomerDashboardPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [customer, setCustomer] = useState<TradeCustomer | null>(null);

  useEffect(() => {
    setRequests(getStoredRequests());
    const custs = getStoredCustomers();
    setCustomer(custs[0] || null);

    const unsub = subscribeToStore(() => {
      setRequests(getStoredRequests());
      const updatedCusts = getStoredCustomers();
      setCustomer(updatedCusts[0] || null);
    });
    return unsub;
  }, []);

  // Live KPI calculation from requests in store
  const activeRequests = requests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED");
  const totalActiveCount = activeRequests.length;

  const awaitingActionRequests = requests.filter(
    (r) =>
      r.status === "AWAITING_CUSTOMER_APPROVAL" ||
      r.status === "AWAITING_PAYMENT" ||
      r.status === "PAYMENT_DISPUTED"
  );
  const awaitingActionCount = awaitingActionRequests.length;

  const inProcurementCount = requests.filter(
    (r) => r.status === "SOURCING" || r.status === "QUOTE_PREPARED" || r.status === "ORDERED_FROM_SUPPLIER"
  ).length;

  const inTransitCount = requests.filter(
    (r) =>
      r.status === "SUPPLIER_DISPATCHED" ||
      r.status === "RECEIVED_AT_SHIPPING_FACILITY" ||
      r.status === "IN_TRANSIT" ||
      r.status === "ARRIVED_IN_NZ" ||
      r.status === "CUSTOMS_CLEARANCE" ||
      r.status === "OUT_FOR_DELIVERY"
  ).length;

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return { label: "Delivered", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" };
      case "AWAITING_CUSTOMER_APPROVAL":
      case "QUOTE_PREPARED":
        return { label: "Quote Ready", statusColor: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
      case "AWAITING_PAYMENT":
        return { label: "Awaiting Payment", statusColor: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
      case "PAYMENT_CONFIRMED":
        return { label: "Approved / Paid", statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200", dotColor: "bg-indigo-500" };
      case "ORDERED_FROM_SUPPLIER":
        return { label: "Ordered From Supplier", statusColor: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500" };
      case "IN_TRANSIT":
      case "SUPPLIER_DISPATCHED":
      case "CUSTOMS_CLEARANCE":
      case "ARRIVED_IN_NZ":
      case "RECEIVED_AT_SHIPPING_FACILITY":
        return { label: "In Transit", statusColor: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" };
      case "OUT_FOR_DELIVERY":
        return { label: "Out For Delivery", statusColor: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" };
      case "PAYMENT_DISPUTED":
      case "SOURCING_EXCEPTION":
        return { label: "Action Needed", statusColor: "bg-rose-50 text-rose-700 border-rose-200", dotColor: "bg-rose-500" };
      default:
        return { label: status.replace(/_/g, " "), statusColor: "bg-slate-50 text-slate-700 border-slate-200", dotColor: "bg-slate-500" };
    }
  };

  // Dynamically derive action items from active store requests
  const actionItems = (awaitingActionRequests.length > 0 ? awaitingActionRequests : requests.slice(0, 2)).map((r) => {
    const isApproval = r.status === "AWAITING_CUSTOMER_APPROVAL";
    const isPayment = r.status === "AWAITING_PAYMENT";
    const val = r.quote?.totalNzd
      ? `$${r.quote.totalNzd.toFixed(2)}`
      : r.invoice?.totalNzd
      ? `$${r.invoice.totalNzd.toFixed(2)}`
      : "$485.00";

    return {
      ref: r.referenceNumber,
      reqId: r.id,
      vehicle: `${r.vehicle.make} ${r.vehicle.model} - ${r.vehicle.year}`,
      part: r.part.partName,
      status: isApproval ? "Quote Ready" : isPayment ? "Payment Pending" : r.status.replace(/_/g, " "),
      statusType: isApproval || isPayment ? "amber" : "rose",
      amount: val,
      buttonText: isApproval ? "REVIEW QUOTE →" : isPayment ? "PAY NOW →" : "VIEW DETAILS →",
      targetPath: `/portal/requests/${r.id}`,
    };
  });

  // Dynamically derive recent requests table from live store
  const recentRequests = requests.slice(0, 6).map((r) => {
    const badge = getStatusBadgeProps(r.status);
    const val = r.quote?.totalNzd
      ? `$${r.quote.totalNzd.toFixed(2)}`
      : r.invoice?.totalNzd
      ? `$${r.invoice.totalNzd.toFixed(2)}`
      : "$485.00";

    const dateStr = r.updatedDate || r.submittedDate
      ? new Date(r.updatedDate || r.submittedDate).toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Live";

    return {
      ref: r.referenceNumber,
      reqId: r.id,
      vehicle: `${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.year}`,
      part: r.part.partName,
      status: badge.label,
      statusColor: badge.statusColor,
      dotColor: badge.dotColor,
      value: val,
      date: dateStr,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ================= TOP GREETING BANNER ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-800 text-[11px] font-bold tracking-wider uppercase">
            <span>APPROVED TRADE CUSTOMER</span>
            <span className="text-blue-300">•</span>
            <span className="font-mono">NZBN: {customer?.nzbn || "9429041234567"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, {customer?.tradingName || "AutoCare Auckland"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Here&apos;s an overview of your procurement activity.
          </p>
        </div>

        <div>
          <Link
            id="dashboard-header-new-request"
            href="/portal/new-request"
            className="px-5 py-3 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NEW PARTS REQUEST</span>
          </Link>
        </div>
      </div>

      {/* ================= 4 KPI STAT CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              ACTIVE REQUESTS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalActiveCount.toString().padStart(2, "0")}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Live Synced
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Awaiting Your Action */}
        <div className={`rounded-2xl p-5 border-2 shadow-sm flex items-start justify-between relative overflow-hidden ${
          awaitingActionCount > 0 ? "bg-amber-50/40 border-amber-300" : "bg-white border-slate-200/80"
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] sm:text-[11px] uppercase font-bold tracking-wider block ${
                awaitingActionCount > 0 ? "text-amber-900" : "text-slate-500"
              }`}>
                AWAITING YOUR ACTION
              </span>
              {awaitingActionCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${
              awaitingActionCount > 0 ? "text-amber-950" : "text-slate-900"
            }`}>
              {awaitingActionCount.toString().padStart(2, "0")}
            </div>
            <span className={`text-[11px] font-semibold block ${
              awaitingActionCount > 0 ? "text-amber-700" : "text-slate-400"
            }`}>
              {awaitingActionCount > 0 ? "Requires attention" : "All cleared"}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            awaitingActionCount > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Procurement */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              IN PROCUREMENT
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {inProcurementCount.toString().padStart(2, "0")}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Currently processed
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: In Transit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
              IN TRANSIT
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {inTransitCount.toString().padStart(2, "0")}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              On the way
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= ACTION REQUIRED WARNING CARD ================= */}
      <div className="bg-amber-50/30 rounded-2xl p-5 sm:p-6 border border-amber-300 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-amber-900">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs">
            !
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-950 leading-tight">
              Action Required
            </h3>
            <p className="text-xs text-amber-800">
              Complete these actions to keep your procurement moving.
            </p>
          </div>
        </div>

        <div className="divide-y divide-amber-200/60 pt-1">
          {actionItems.map((item) => (
            <div
              key={item.ref}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-mono font-bold text-slate-900">
                    {item.ref}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {item.vehicle}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.statusType === "amber"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-red-100 text-[#ed2025] border-red-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.statusType === "amber" ? "bg-amber-500" : "bg-[#ed2025]"
                      }`}
                    />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-800">{item.part}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-slate-500">Amount: </span>
                  <strong className="text-slate-900">{item.amount}</strong>
                </div>
              </div>

              <div>
                <Link
                  href={item.targetPath}
                  className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>{item.buttonText}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BOTTOM SPLIT: RECENT REQUESTS & PROCUREMENT ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Recent Requests
              </h3>
              <p className="text-xs text-slate-500">
                Overview of current parts procurement requests
              </p>
            </div>

            <Link
              href="/portal/requests"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              View All Requests →
            </Link>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-50/90">
                  <th className="py-3 px-3 pl-4 font-bold">REQUEST</th>
                  <th className="py-3 px-3 font-bold">VEHICLE</th>
                  <th className="py-3 px-3 font-bold">PART</th>
                  <th className="py-3 px-3 font-bold">STATUS</th>
                  <th className="py-3 px-3 font-bold">VALUE</th>
                  <th className="py-3 px-3 pr-4 font-bold">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {recentRequests.map((row) => (
                  <tr
                    key={row.ref}
                    className="hover:bg-slate-50/70 transition group cursor-pointer"
                    onClick={() => (window.location.href = `/portal/requests/${row.reqId}`)}
                  >
                    <td className="py-3.5 px-3 pl-4 font-mono font-bold text-slate-900">
                      <Link href={`/portal/requests/${row.reqId}`} className="hover:text-[#ed2025]">
                        {row.ref}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {row.vehicle}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[220px] truncate" title={row.part}>
                      {row.part}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`} />
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                      {row.value}
                    </td>
                    <td className="py-3.5 px-3 pr-4 text-slate-400 whitespace-nowrap font-medium">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 Col): Procurement Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Procurement Activity
              </h3>
              <p className="text-xs text-slate-500">
                Recent status transitions & updates
              </p>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4 pt-2">
              {/* Event 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Today • 10:42 AM
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    Quote generated for AH-P-000123
                  </p>
                  <p className="text-[11px] text-slate-500">
                    OEM Toyota Control Arm issued from Nagoya stock.
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Today • 09:20 AM
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    Payment received for AH-P-000120
                  </p>
                  <p className="text-[11px] text-slate-500">
                    $1,980.00 settled. Purchase order dispatched to Honda supplier.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Yesterday • 04:15 PM
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    Shipment dispatched for AH-P-000118
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Air express priority cargo loaded on flight CX-0284.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Footer Indicator */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MPI Green Lane Active</span>
            </div>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                alert("Autohub Trade Desk Hotline: +64 9 274 5422\nSupport Email: support@procurly.autohub.co.nz");
              }}
              className="text-slate-500 hover:text-slate-900 font-semibold text-[11px] hover:underline"
            >
              Support Desk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
