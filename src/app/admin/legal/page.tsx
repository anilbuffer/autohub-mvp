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
    },
  ]);

  const [newVersionModal, setNewVersionModal] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState("");
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [mandatory, setMandatory] = useState(true);

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
      publishedBy: "Administrator",
      changesSummary: newVersionSummary || "Draft revision under governance review.",
    };

    setPolicies([newPol, ...policies]);
    setNewVersionModal(false);
    setNewVersionNum("");
    setNewVersionSummary("");
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
            Legal &amp; Policies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage versioned Terms &amp; Conditions and Privacy Policy documentation, audit trail, and customer re-acceptance triggers.
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
            onClick={() => setNewVersionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-950/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Version Revision</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
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
            {policies.find((p) => p.type === "TERMS" && p.status === "ACTIVE")?.version}
          </span>
        </button>

        <button
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
            {policies.find((p) => p.type === "PRIVACY" && p.status === "ACTIVE")?.version}
          </span>
        </button>
      </div>

      {/* Active Version Spotlight */}
      {activePolicy && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE IN PRODUCTION
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Version {activePolicy.version}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activePolicy.title}
              </h3>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block">Effective Date:</span>
              <span className="font-bold text-slate-800 font-mono">
                {activePolicy.effectiveDate}
              </span>
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
              {filteredPolicies.map((pol) => (
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
                    {pol.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublish(pol.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow"
                      >
                        Publish to Live
                      </button>
                    )}
                    {pol.status !== "DRAFT" && (
                      <span className="text-[11px] text-slate-400 italic">Published</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Version Modal */}
      {newVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Draft New {activeTab === "TERMS" ? "Terms & Conditions" : "Privacy Policy"} Version
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prepare a revised legal release for compliance review before pushing to production.
              </p>
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
                  rows={4}
                  required
                  placeholder="Detail the revisions, clauses modified, or regulatory reasons..."
                  value={newVersionSummary}
                  onChange={(e) => setNewVersionSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ed2025] focus:ring-red-500 border-slate-300"
                />
                <label htmlFor="mandatoryCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Require customers to accept this revision upon next login
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewVersionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow"
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
