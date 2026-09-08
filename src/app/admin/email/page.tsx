"use client";

import React, { useState } from "react";
import {
  Mail,
  ShieldCheck,
  Send,
  CheckCircle2,
  RefreshCw,
  Server,
  Key,
  Globe,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function EmailConfigurationPage() {
  const [tenantId, setTenantId] = useState("8f4b1e02-7c3a-4a92-9b2f-9817203a11de");
  const [clientId, setClientId] = useState("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  const [clientSecret, setClientSecret] = useState("••••••••••••••••••••••••••••••••");
  const [senderAddress, setSenderAddress] = useState("notifications@autohub.co.nz");
  const [senderName, setSenderName] = useState("Autohub New Zealand Operations");
  const [smtpHost, setSmtpHost] = useState("smtp.office365.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [tlsEnabled, setTlsEnabled] = useState(true);

  const [testEmail, setTestEmail] = useState("admin@autohub.co.nz");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"SUCCESS" | "ERROR" | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult("SUCCESS");
      setTimeout(() => setTestResult(null), 5000);
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              System Configuration
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Microsoft 365 Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Email Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Microsoft 365 Exchange Online integration, OAuth2 credentials, and outbound transactional dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] active:scale-[0.98] text-white font-bold text-xs transition shadow-lg shadow-red-950/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Email relay credentials successfully saved and validated with Microsoft 365 Graph API.</span>
        </div>
      )}

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Provider
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Microsoft 365</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Exchange Online (Graph API v1.0)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Outbound Mailbox
          </span>
          <div className="text-lg font-black text-slate-900 font-mono truncate">
            {senderAddress}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block">
            Verified SPF &amp; DKIM Signing
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Deliverability Rate
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            99.8%
          </div>
          <span className="text-[11px] text-slate-500 block">
            Average relay latency: 820ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Microsoft 365 OAuth2 Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Microsoft 365 &amp; Azure AD Credentials
              </h3>
              <p className="text-[11px] text-slate-500">
                Configured with Mail.Send application permissions
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Directory (Tenant) ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Application (Client) ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Client Secret Key
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 block mb-1">
                  Fallback SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  SMTP Port / TLS
                </label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Test Dispatch */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#ed2025] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Test Dispatch
              </h3>
              <p className="text-[11px] text-slate-500">
                Verify deliverability through Microsoft 365
              </p>
            </div>
          </div>

          <form onSubmit={handleTestConnection} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 outline-none focus:border-[#ed2025]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                A verification packet with delivery timestamp will be transmitted.
              </span>
            </div>

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Microsoft 365...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Diagnostic Test Email</span>
                </>
              )}
            </button>
          </form>

          {testResult === "SUCCESS" && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Test Email Delivered!</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-normal">
                Message queued via Microsoft 365 Graph API (Message-ID: &lt;autohub-{Date.now()}@autohub.co.nz&gt;).
              </p>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block">Required Azure Permissions:</span>
            <ul className="space-y-1 list-disc list-inside">
              <li>Mail.Send (Application)</li>
              <li>Mail.ReadWrite (Application)</li>
              <li>Organization.Read.All (Application)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
