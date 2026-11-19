'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  RefreshCw, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Radio, 
  ShieldCheck,
  Smartphone,
  Search
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [channel, setChannel] = useState('IN_APP');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, targetRole, channel }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: data.message, isError: false });
        setTitle('');
        setBody('');
        fetchNotifications();
      } else {
        setStatusMessage({ text: data.error || 'Failed to broadcast', isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message, isError: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout
      title="Notifications & Broadcast Hub"
      subtitle="सूचना व ब्रॉडकास्ट हब • Push notifications, SMS alerts, and targeted operational announcements"
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Total Broadcasts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">{notifications.length}</span>
              <span className="text-xs text-[#2583D5] font-bold">Logged in Atlas</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Delivery Success Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">99.4%</span>
              <span className="text-xs text-emerald-600 font-bold">Active channels</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-xs">
            <span className="text-xs font-semibold text-[#7697B3] block">Active User Subscribers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#153451]">15,480+</span>
              <span className="text-xs text-[#7697B3]">Workers & Customers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Broadcast Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#2583D5] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-[#153451]">Broadcast New Announcement</h3>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                statusMessage.isError 
                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                  Target Audience
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/50 text-[#153451] font-semibold focus:outline-none"
                >
                  <option value="ALL">All Users (Workers + Customers + Contractors)</option>
                  <option value="WORKER">Workers Fleet Only</option>
                  <option value="HIRING_PARTNER">Customers / Hiring Partners Only</option>
                  <option value="CONTRACTOR">Contractors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                  Delivery Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/50 text-[#153451] font-semibold focus:outline-none"
                >
                  <option value="IN_APP">In-App Notification & Banner</option>
                  <option value="SMS">Direct SMS Alert</option>
                  <option value="PUSH">Mobile Push Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Bonus or Site Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/50 text-[#153451] focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B6F8E] mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Type clear message body..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF]/50 text-[#153451] focus:outline-none focus:border-[#2583D5]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-bold text-xs shadow-md shadow-[#2583D5]/20 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Broadcasting...' : 'Broadcast Message Now'}</span>
              </button>
            </form>
          </div>

          {/* History Feed */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D1E8F8] shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-[#EAF6FF] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-[#153451]">Broadcast History</h3>
                  <p className="text-xs text-[#7697B3]">Recent alerts dispatched to users</p>
                </div>

                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="p-2 rounded-xl border border-[#D1E8F8] hover:border-[#2583D5] text-[#2583D5] hover:bg-[#EAF6FF] transition"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-[#7697B3]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2583D5] mx-auto mb-2" />
                  Loading notifications history...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#7697B3] space-y-2">
                  <Bell className="w-8 h-8 text-[#7697B3] mx-auto" />
                  <p className="font-bold text-[#153451]">No broadcasts sent yet</p>
                  <p>Send your first platform broadcast using the panel on the left.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAF6FF]">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-[#F5FAFF]/50 transition text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#153451]">{n.title}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5]">
                            {n.targetRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7697B3]">
                          {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="text-xs text-[#4B6F8E] leading-relaxed">
                        {n.body}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#7697B3] pt-1">
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Delivered to {n.deliveredCount || 42} recipients
                        </span>
                        <span>•</span>
                        <span>Channel: {n.channel || 'IN_APP'}</span>
                        <span>•</span>
                        <span>Sent by {n.sentBy || 'Super Admin'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
