'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Building2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Crosshair 
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Address {
  id: string;
  label: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  addressLine: string;
  locality: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export default function CustomerSavedAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      label: 'Home (घर)',
      type: 'HOME',
      addressLine: 'Flat 402, Tower B, Lotus Boulevard',
      locality: 'Sector 100',
      city: 'Noida',
      pincode: '201304',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Office (कार्यालय)',
      type: 'OFFICE',
      addressLine: 'Suite 601, Candor TechSpace, Tower 3',
      locality: 'Sector 62',
      city: 'Noida',
      pincode: '201309',
      isDefault: false,
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Noida');
  const [pincode, setPincode] = useState('201304');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label: label.trim() || 'New Location',
      type: 'OTHER',
      addressLine,
      locality,
      city,
      pincode,
      isDefault: false,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddModal(false);
    setLabel('');
    setAddressLine('');
    setLocality('');
  };

  const setDefault = (id: string) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <DashboardLayout
      role="HIRING_PARTNER"
      title="Saved Service Locations"
      subtitle="घर, कार्यालय व अन्य पते • तत्काल सेवा व जीपीएस डिलीवरी"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl border bg-white shadow-sm transition-all flex flex-col justify-between gap-4 ${
                addr.isDefault ? 'border-[#2583D5] ring-2 ring-[#2583D5]/20' : 'border-[#D1E8F8]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center font-bold">
                      {addr.type === 'HOME' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </span>
                    <h3 className="text-base font-black text-[#153451]">{addr.label}</h3>
                  </div>

                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="text-[11px] font-bold text-[#2583D5] hover:underline"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#153451] font-semibold leading-relaxed pt-1">
                  {addr.addressLine}
                </p>
                <p className="text-xs text-[#7697B3]">
                  {addr.locality}, {addr.city} — {addr.pincode}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAF6FF] flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Ready for 1-Click Dispatch
                </span>

                {!addr.isDefault && (
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold p-1"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#D1E8F8] shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-[#153451]">Add Service Address</h3>
              
              <form onSubmit={handleAddAddress} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#7697B3] block mb-1 uppercase">Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parents House, Workshop"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7697B3] block mb-1 uppercase">Full Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Plot/Apartment number, street"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#7697B3] block mb-1 uppercase">Locality</label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#7697B3] block mb-1 uppercase">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#D1E8F8] text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
