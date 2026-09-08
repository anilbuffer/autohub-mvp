"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Lock,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Building2,
  FileText,
} from "lucide-react";
import {
  getStoredRequests,
  addMessageToRequest,
  subscribeToStore,
} from "@/lib/store";
import { PartRequest, MessageItem } from "@/lib/types";

export default function AdminMessagingDeskPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // New message input state
  const [content, setContent] = useState("");
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [attachedFile, setAttachedFile] = useState("");

  const refresh = () => {
    const reqs = getStoredRequests();
    setRequests(reqs);
    if (!selectedReqId && reqs.length > 0) {
      setSelectedReqId(reqs[0].id);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const selectedReq = requests.find((r) => r.id === selectedReqId) || requests[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const finalContent = attachedFile
      ? `${content.trim() ? content.trim() + " " : ""}[Attached File: ${attachedFile}]`
      : content.trim();

    if (!finalContent) return;

    addMessageToRequest(
      selectedReq.id,
      finalContent,
      "Autohub Operations",
      "ADMIN",
      isInternalOnly
    );

    setContent("");
    setAttachedFile("");
    setIsInternalOnly(false);
    refresh();
  };

  const handleQuickTemplate = (text: string) => {
    setContent(text);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.part.partName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Communications Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Operational Messaging &amp; Staff Notes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct real-time communication with trade customers, technical fitment inquiries, and confidential staff internal audit notes.
          </p>
        </div>

        <Link
          href="/portal/messages"
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>Customer Inbox View</span>
        </Link>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
        {/* Left Col: Request Threads Selector */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#ed2025]" />
              Request Threads ({requests.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search thread or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredRequests.map((r) => {
              const isSelected = r.id === selectedReq?.id;
              const lastMsg = r.messages[r.messages.length - 1];

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReqId(r.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer text-xs space-y-1 ${
                    isSelected
                      ? "border-[#ed2025] bg-red-50/30 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{r.referenceNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {r.messages.length} msg{r.messages.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 truncate">
                    {r.part.quantity}x {r.part.partName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {r.customerName}
                  </div>

                  {lastMsg && (
                    <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-100 flex items-center gap-1">
                      {lastMsg.isInternalOnly && (
                        <Lock className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{lastMsg.content}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Communication Thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          {selectedReq ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedReq.referenceNumber}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded-full font-bold">
                      {selectedReq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>{selectedReq.customerName}</strong> • {selectedReq.part.quantity}x {selectedReq.part.partName} ({selectedReq.vehicle.year} {selectedReq.vehicle.make} {selectedReq.vehicle.model})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Internal Mode:</span>
                  <button
                    type="button"
                    onClick={() => setIsInternalOnly(!isInternalOnly)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                      isInternalOnly
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isInternalOnly ? "Staff Note (Hidden from Customer)" : "Public Message"}</span>
                  </button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#fafafa]">
                {selectedReq.messages.map((msg) => {
                  const isStaff = msg.senderRole === "ADMIN";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                        {msg.isInternalOnly && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded text-[10px]">
                            <Lock className="w-2.5 h-2.5" /> Staff Internal Note
                          </span>
                        )}
                        <span className="font-bold text-slate-700">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          msg.isInternalOnly
                            ? "bg-amber-50 text-amber-950 border border-amber-200"
                            : isStaff
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-800 border border-slate-200 shadow-2xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Operational Quick Templates Toolbar */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-medium whitespace-nowrap">Quick Responses:</span>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Official quotation has been finalized and issued for your review.")}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition"
                >
                  Quote Ready
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Consignment has cleared NZ Customs & MPI Biosecurity inspection at Auckland Port.")}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition"
                >
                  Customs Cleared
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Part is onboard with domestic carrier for workshop depot handover today.")}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition"
                >
                  Out for Delivery
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Remittance verified and logged. Procurement purchase order has been unlocked.")}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition"
                >
                  Payment Confirmed
                </button>
              </div>

              {/* Attachment Pill Preview */}
              {attachedFile && (
                <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-[11px]">{attachedFile}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile("")}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sampleFiles = ["oem_parts_diagram_chassis.pdf", "supplier_flight_manifest.pdf", "inspection_photo.jpg"];
                    const chosen = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
                    setAttachedFile(chosen);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isInternalOnly
                      ? "Type confidential internal note (hidden from customer)..."
                      : "Type message to customer..."
                  }
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition ${
                    isInternalOnly
                      ? "bg-amber-50/60 border-amber-300 text-amber-950 placeholder-amber-700/60"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />

                <button
                  type="submit"
                  disabled={!content.trim() && !attachedFile}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a parts request to open communications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
