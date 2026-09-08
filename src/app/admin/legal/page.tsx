"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  Plus,
  ExternalLink,
  Eye,
  History,
  AlertCircle,
  Save,
  Check,
  Edit2,
  X,
  Trash2,
  FileCode,
} from "lucide-react";

interface PolicyVersion {
  id: string;
  type: "TERMS" | "PRIVACY";
  version: string;
  title: string;
  effectiveDate: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  mandatoryAcceptance: boolean;
  publishedBy: string;
  changesSummary: string;
  content?: string;
}

export default function LegalPoliciesPage() {
  const [activeTab, setActiveTab] = useState<"TERMS" | "PRIVACY">("TERMS");

  const [policies, setPolicies] = useState<PolicyVersion[]>([
    {
      id: "POL-01",
      type: "TERMS",
      version: "v2.4",
      title: "Autohub New Zealand Commercial Trade Terms & Conditions",
      effectiveDate: "2026-01-15",
      status: "ACTIVE",
      mandatoryAcceptance: true,
      publishedBy: "Marcus Vance (Director of Governance)",
      changesSummary: "Updated NZ Consumer Guarantees Act commercial trade exclusions and customs biosecurity demurrage cost terms.",
      content: `1. Commercial Trade Framework
Autohub New Zealand provides wholesale automotive parts procurement, landed freight aggregation, and customs clearance services strictly for registered B2B automotive trade entities.

2. Price Quotations & Landed Cost Breakdown
All landed customer quotations include CIF part cost, air/sea freight tariffs, GST, MPI biosecurity inspection fees, and customs processing fees. Quotations remain firm for 14 calendar days from issue.

3. Payment Terms & Net 20th Credit
Trade credit account holders must settle monthly statement balances on or before the 20th of the following month. Failure to remit on time incurs a 1.5% monthly late interest fee.`,
    },
    {
      id: "POL-02",
      type: "TERMS",
      version: "v2.3",
      title: "Commercial Trade & Sourcing Agreement",
      effectiveDate: "2025-06-01",
      status: "ARCHIVED",
      mandatoryAcceptance: true,
      publishedBy: "Marcus Vance (Director of Governance)",
      changesSummary: "Added Net 20th invoice settlement rules and Japanese yen foreign exchange volatility hedging clause.",
      content: `1. Commercial Sourcing Terms
Initial release of Japanese Yen (JPY) and Euro (EUR) landed cost conversion rules and trade credit terms for New Zealand automotive workshops.`,
    },
    {
      id: "POL-03",
      type: "PRIVACY",
      version: "v1.8",
      title: "Autohub New Zealand Customer Privacy Policy & Data Governance",
      effectiveDate: "2026-02-01",
      status: "ACTIVE",
      mandatoryAcceptance: true,
      publishedBy: "Marcus Vance (Director of Governance)",
      changesSummary: "Updated compliance with NZ Privacy Act 2020 Information Privacy Principles regarding cross-border overseas supplier data transmission.",
      content: `1. Information Privacy Principles Compliance
Autohub New Zealand collects commercial contact details, business registration numbers, and shipping address information strictly for order fulfillment, customs clearance, and invoicing.

2. Cross-Border Supplier Transmission
When processing overseas part requests, customer contact details are masked or transmitted securely to authorized Japanese and European export suppliers solely as required for biosecurity and shipping labels.

3. Security & Data Retention
All user credentials require hardware TOTP MFA authentication. Account audit logs and financial transactional data are retained securely in accordance with New Zealand Inland Revenue Department standards.`,
    },
    {
      id: "POL-04",
      type: "PRIVACY",
      version: "v1.7",
      title: "Enterprise Privacy Notice",
      effectiveDate: "2025-03-10",
      status: "ARCHIVED",
      mandatoryAcceptance: false,
      publishedBy: "Marcus Vance (Director of Governance)",
      changesSummary: "Initial biometric and multi-factor authentication data retention updates.",
      content: `1. Initial Privacy Notice
General privacy disclosure covering user account creation and direct marketing preferences.`,
    },
  ]);

  // Create Modal State
  const [newVersionModal, setNewVersionModal] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState("");
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [newVersionContent, setNewVersionContent] = useState("");
  const [mandatory, setMandatory] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyVersion | null>(null);
  const [editFormData, setEditFormData] = useState({
    version: "",
    title: "",
    effectiveDate: "",
    status: "DRAFT" as "ACTIVE" | "ARCHIVED" | "DRAFT",
    mandatoryAcceptance: true,
    publishedBy: "",
    changesSummary: "",
    content: "",
  });

  const activePolicy = policies.find((p) => p.type === activeTab && p.status === "ACTIVE");
  const filteredPolicies = policies.filter((p) => p.type === activeTab);

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNum.trim()) return;

    const newPol: PolicyVersion = {
      id: `POL-${Date.now()}`,
      type: activeTab,
      version: newVersionNum.startsWith("v") ? newVersionNum : `v${newVersionNum}`,
      title:
        activeTab === "TERMS"
          ? "Autohub New Zealand Commercial Trade Terms & Conditions"
          : "Autohub New Zealand Customer Privacy Policy & Data Governance",
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "DRAFT",
      mandatoryAcceptance: mandatory,
      publishedBy: "Marcus Vance (Director of Governance)",
      changesSummary: newVersionSummary || "Draft revision under governance review.",
      content: newVersionContent || "Draft policy content pending final legal approval.",
    };

    setPolicies([newPol, ...policies]);
    setNewVersionModal(false);
    setNewVersionNum("");
    setNewVersionSummary("");
    setNewVersionContent("");
  };

  const handleOpenEdit = (policy: PolicyVersion) => {
    setEditingPolicy(policy);
    setEditFormData({
      version: policy.version,
      title: policy.title,
      effectiveDate: policy.effectiveDate,
      status: policy.status,
      mandatoryAcceptance: policy.mandatoryAcceptance,
      publishedBy: policy.publishedBy,
      changesSummary: policy.changesSummary,
      content: policy.content || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === editingPolicy.id) {
          return {
            ...p,
            version: editFormData.version.trim(),
            title: editFormData.title.trim(),
            effectiveDate: editFormData.effectiveDate,
            status: editFormData.status,
            mandatoryAcceptance: editFormData.mandatoryAcceptance,
            publishedBy: editFormData.publishedBy.trim() || "Administrator",
            changesSummary: editFormData.changesSummary.trim(),
            content: editFormData.content,
          };
        }
        // If the edited policy was marked ACTIVE, archive other active policies in the same category
        if (editFormData.status === "ACTIVE" && p.type === editingPolicy.type && p.id !== editingPolicy.id && p.status === "ACTIVE") {
          return { ...p, status: "ARCHIVED" };
        }
        return p;
      })
    );

    setEditModalOpen(false);
    setEditingPolicy(null);
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm("Are you sure you want to delete this legal policy revision?")) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handlePublish = (id: string) => {
    setPolicies(
      policies.map((p) => {
        if (p.type === activeTab) {
          if (p.id === id) {
            return { ...p, status: "ACTIVE", effectiveDate: new Date().toISOString().split("T")[0] };
          }
          if (p.status === "ACTIVE") {
            return { ...p, status: "ARCHIVED" };
          }
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Legal &amp; Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Legal &amp; Policies Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage versioned Terms &amp; Conditions and Privacy Policy documentation, edit revision details, and set customer re-acceptance triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={activeTab === "TERMS" ? "/terms" : "/privacy"}
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={() => setNewVersionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Version Revision</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("TERMS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "TERMS"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms &amp; Conditions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono">
            {policies.find((p) => p.type === "TERMS" && p.status === "ACTIVE")?.version || "Draft"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PRIVACY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "PRIVACY"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Privacy Policy</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            {policies.find((p) => p.type === "PRIVACY" && p.status === "ACTIVE")?.version || "Draft"}
          </span>
        </button>
      </div>

      {/* Active Version Spotlight */}
      {activePolicy && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>LIVE IN PRODUCTION</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Version {activePolicy.version}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activePolicy.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleOpenEdit(activePolicy)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#ed2025]" />
                <span>Edit Active Revision</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Enforcement</span>
              <span className="font-bold text-slate-800">
                {activePolicy.mandatoryAcceptance ? "Mandatory Trade Acceptance" : "Voluntary Consent"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Authorized Signatory</span>
              <span className="font-bold text-slate-800 truncate block">
                {activePolicy.publishedBy}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Public Endpoint</span>
              <span className="font-mono text-blue-600 truncate block">
                {activeTab === "TERMS" ? "autohub.co.nz/terms" : "autohub.co.nz/privacy"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Summary of Current Revision:</span>
            <p className="leading-relaxed text-slate-600">{activePolicy.changesSummary}</p>
          </div>

          {activePolicy.content && (
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs space-y-2 font-mono border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#ed2025]" />
                  <span>Document Text Snapshot ({activePolicy.version})</span>
                </span>
                <span>Plain text / clauses</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {activePolicy.content}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Version History Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {activeTab === "TERMS" ? "Terms & Conditions" : "Privacy Policy"} Revision History
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {filteredPolicies.length} total releases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Title &amp; Changes</th>
                <th className="px-5 py-3.5">Effective Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No policy revisions found for this category. Click &quot;New Version Revision&quot; to create a draft.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((pol) => (
                  <tr key={pol.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {pol.version}
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <div className="font-bold text-slate-900">{pol.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {pol.changesSummary}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {pol.effectiveDate}
                    </td>
                    <td className="px-5 py-4">
                      {pol.status === "ACTIVE" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : pol.status === "DRAFT" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          DRAFT
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          ARCHIVED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pol)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                          title="Edit policy revision details"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#ed2025]" />
                          <span>Edit</span>
                        </button>

                        {pol.status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() => handlePublish(pol.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Publish</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeletePolicy(pol.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete policy revision"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT VERSION MODAL ================= */}
      {editModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ed2025] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {editingPolicy.type === "TERMS" ? "Terms & Conditions" : "Privacy Policy"}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    ID: {editingPolicy.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Edit Revision: {editingPolicy.version} — {editingPolicy.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Version Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.version}
                    onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.effectiveDate}
                    onChange={(e) => setEditFormData({ ...editFormData, effectiveDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Revision Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white outline-none focus:border-[#ed2025]"
                  >
                    <option value="ACTIVE">ACTIVE (Live in Production)</option>
                    <option value="DRAFT">DRAFT (Pending Review)</option>
                    <option value="ARCHIVED">ARCHIVED (Superceded)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Authorized Signatory / Publisher
                  </label>
                  <input
                    type="text"
                    value={editFormData.publishedBy}
                    onChange={(e) => setEditFormData({ ...editFormData, publishedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Summary of Changes / Governance Justification
                </label>
                <textarea
                  rows={2}
                  required
                  value={editFormData.changesSummary}
                  onChange={(e) => setEditFormData({ ...editFormData, changesSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center justify-between">
                  <span>Policy Document Body / Clause Content</span>
                  <span className="text-[10px] text-slate-400 font-normal">Plain text / clauses</span>
                </label>
                <textarea
                  rows={6}
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  placeholder="Enter full policy text, clauses, or privacy provisions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] outline-none focus:border-[#ed2025]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editMandatoryCheck"
                  checked={editFormData.mandatoryAcceptance}
                  onChange={(e) => setEditFormData({ ...editFormData, mandatoryAcceptance: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ed2025] focus:ring-red-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="editMandatoryCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Require trade customers to re-accept this revision upon next login
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Policy Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= NEW VERSION MODAL ================= */}
      {newVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Draft New {activeTab === "TERMS" ? "Terms & Conditions" : "Privacy Policy"} Version
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepare a revised legal release for compliance review before pushing to production.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewVersionModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Version Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v2.5 or v1.9"
                  value={newVersionNum}
                  onChange={(e) => setNewVersionNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Summary of Changes / Governance Justification
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the revisions, clauses modified, or regulatory reasons..."
                  value={newVersionSummary}
                  onChange={(e) => setNewVersionSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Draft Policy Content / Clauses
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter full policy text or clauses for this draft..."
                  value={newVersionContent}
                  onChange={(e) => setNewVersionContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] outline-none focus:border-[#ed2025]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ed2025] focus:ring-red-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="mandatoryCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Require customers to accept this revision upon next login
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewVersionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow transition"
                >
                  Create Draft Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
