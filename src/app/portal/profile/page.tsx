"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Check,
} from "lucide-react";
import {
  getStoredCustomers,
  updateCustomerProfile,
  addOrganizationUser,
  removeOrganizationUser,
  subscribeToStore,
} from "@/lib/store";
import { TradeCustomer, CustomerOrgUser } from "@/lib/types";

export default function CompanyProfilePage() {
  const [customer, setCustomer] = useState<TradeCustomer | null>(null);
  const [activeSection, setActiveSection] = useState<"BUSINESS" | "ADDRESSES" | "USERS">("BUSINESS");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Business Details Form
  const [legalName, setLegalName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [nzbn, setNzbn] = useState("");
  const [primaryName, setPrimaryName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");

  // New User Form Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"BUYER" | "FINANCE" | "ORG_ADMIN">("BUYER");

  const refresh = () => {
    const custs = getStoredCustomers();
    if (custs.length > 0) {
      const c = custs[0];
      setCustomer(c);
      setLegalName(c.legalBusinessName);
      setTradingName(c.tradingName || "");
      setNzbn(c.nzbn);
      setPrimaryName(c.primaryContact.name);
      setPrimaryEmail(c.primaryContact.email);
      setPrimaryPhone(c.primaryContact.phone);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => refresh());
    return unsub;
  }, []);

  const handleSaveBusinessDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    updateCustomerProfile({
      legalBusinessName: legalName,
      tradingName: tradingName,
      nzbn: nzbn,
      primaryContact: {
        ...customer.primaryContact,
        name: primaryName,
        email: primaryEmail,
        phone: primaryPhone,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addOrganizationUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
    });

    setUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    refresh();
  };

  const handleRemoveUser = (userId: string) => {
    removeOrganizationUser(userId);
    refresh();
  };

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed2025] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              Organization
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Company Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your verified New Zealand business details, delivery address book, and authorized team members.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Company profile details successfully saved to Autohub registry.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSection("BUSINESS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSection === "BUSINESS"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Details</span>
        </button>

        <button
          onClick={() => setActiveSection("ADDRESSES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSection === "ADDRESSES"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Address Book</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
            {customer.addresses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection("USERS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSection === "USERS"
              ? "bg-[#0f172a] text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
            {customer.users.length}
          </span>
        </button>
      </div>

      {/* Business Details Section */}
      {activeSection === "BUSINESS" && (
        <form onSubmit={handleSaveBusinessDetails} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Commercial Entities
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified with the New Zealand Companies Office &amp; NZBN Registry
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Legal Registered Entity Name
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Trading Name / Workshop Brand
              </label>
              <input
                type="text"
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                New Zealand Business Number (NZBN)
              </label>
              <input
                type="text"
                required
                value={nzbn}
                onChange={(e) => setNzbn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:border-[#ed2025]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Trade Business Classification
              </label>
              <input
                type="text"
                disabled
                value={customer.businessType}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Primary Sourcing Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Direct Phone</label>
                <input
                  type="tel"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Address Book Section */}
      {activeSection === "ADDRESSES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Default Delivery Depot
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{addr.streetAddress}</div>
                  <div className="text-slate-600">
                    {addr.suburb && `${addr.suburb}, `}{addr.city} {addr.postcode}
                  </div>
                  <div className="text-slate-500 font-semibold">{addr.country}</div>
                </div>

                {addr.deliveryInstructions && (
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                    <span className="font-bold text-slate-700 block">Dock Instructions:</span>
                    {addr.deliveryInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management Section */}
      {activeSection === "USERS" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Authorized Organization Users
              </h3>
              <p className="text-[11px] text-slate-500">
                Staff members authorized to request parts, accept quotes, and authorize payments
              </p>
            </div>

            <button
              onClick={() => setUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 text-[11px]">
                        {u.role === "ORG_ADMIN" ? "Company Admin" : u.role === "FINANCE" ? "Finance / Accounts" : "Parts Buyer"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {customer.users.length > 1 && (
                        <button
                          onClick={() => handleRemoveUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Invite Organization Member
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant staff member access to submit requests and manage quotes.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@workshop.co.nz"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Portal Permission Level</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#ed2025]"
                >
                  <option value="BUYER">Parts Buyer (Submit &amp; Track Requests)</option>
                  <option value="FINANCE">Finance (Access Invoices &amp; Authorize Payments)</option>
                  <option value="ORG_ADMIN">Company Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
