'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Users,
  Compass,
  Radio,
  ExternalLink
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { MapMarker } from '@/components/InteractiveMap';
import { PROFESSIONS_LIST } from '@/lib/professions';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full bg-[#E8ECE9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#173D2B]">Loading Operations Map Telemetry...</span>
      </div>
    </div>
  ),
});

export default function AdminOperationsPage() {
  const [operationsData, setOperationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('ALL');
  const [selectedProfession, setSelectedProfession] = useState<string>('ALL');
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<any | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const fetchOperations = async () => {
    try {
      const res = await fetch('/api/admin/operations');
      const data = await res.json();
      if (data.success) {
        setOperationsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();

    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('admin:join');
    });

    // Real-time telemetry feed
    socket.on('worker:location:update', (telemetry: any) => {
      setOperationsData((prev: any) => {
        if (!prev) return prev;
        const updatedWorkers = prev.workers.map((w: any) => {
          if (w.id === telemetry.workerProfileId) {
            return {
              ...w,
              currentLocation: {
                latitude: telemetry.latitude,
                longitude: telemetry.longitude,
                speed: telemetry.speed,
                heading: telemetry.heading,
                accuracyMeters: telemetry.accuracyMeters,
                recordedAt: telemetry.recordedAt,
              },
              isTelemetryStale: false,
            };
          }
          return w;
        });

        return { ...prev, workers: updatedWorkers };
      });
    });

    socket.on('booking:status:updated', () => fetchOperations());
    socket.on('worker:availability:update', () => fetchOperations());

    const interval = setInterval(fetchOperations, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#173D2B]">Initializing Admin Live Operations Center...</p>
        </div>
      </div>
    );
  }

  const workers = operationsData?.workers || [];
  const activeBookings = operationsData?.activeBookings || [];

  // Filter Workers
  const filteredWorkers = workers.filter((w: any) => {
    if (selectedFilterStatus !== 'ALL') {
      if (selectedFilterStatus === 'ON_ROUTE' && w.bookingStatus !== 'WORKER_ON_THE_WAY') return false;
      if (selectedFilterStatus === 'IN_PROGRESS' && w.bookingStatus !== 'WORK_STARTED') return false;
      if (selectedFilterStatus === 'IDLE_ONLINE' && w.bookingStatus !== 'IDLE_ONLINE') return false;
      if (selectedFilterStatus === 'OFFLINE' && w.bookingStatus !== 'OFFLINE') return false;
    }

    if (selectedProfession !== 'ALL') {
      const matchSkill = w.skills?.some(
        (s: any) => s.categoryId?.toLowerCase().includes(selectedProfession.toLowerCase()) ||
                    s.categoryName?.toLowerCase().includes(selectedProfession.toLowerCase())
      );
      if (!matchSkill && !w.headline?.toLowerCase().includes(selectedProfession.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Map Markers
  const candidateMarkers: MapMarker[] = filteredWorkers.map((w: any) => {
    const isEnRoute = w.bookingStatus === 'WORKER_ON_THE_WAY';
    const isInProgress = w.bookingStatus === 'WORK_STARTED';

    return {
      id: w.id,
      lat: w.currentLocation?.latitude || w.latitude || 28.5355,
      lng: w.currentLocation?.longitude || w.longitude || 77.3910,
      title: w.user?.fullName || 'Worker',
      type: 'candidate',
      avatarUrl: w.user?.avatarUrl,
      rating: w.ratingAvg,
      heading: w.currentLocation?.heading || 0,
      onClick: () => setSelectedWorkerDetail(w),
    };
  });

  return (
    <div className="min-h-screen bg-[#F7F7F2] py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white border border-[#D4DED5] text-[#173D2B] hover:bg-[#E8ECE9] shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#173D2B]">
                  Live Operations Command Map
                </h1>
                <span className="bg-[#173D2B] text-[#B7E36A] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Real-time bird's-eye monitoring of workforce dispatch, en-route telemetry, and field jobs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOperations}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#D4DED5] text-xs font-bold text-[#173D2B] hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              socketConnected ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              {socketConnected ? 'WebSocket Online' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* 4 Operations KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Online Available Workers
            </span>
            <div className="text-2xl font-black text-[#173D2B] mt-1">
              {operationsData?.totalWorkersOnline || 0}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Ready for dispatch</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Active Dispatches
            </span>
            <div className="text-2xl font-black text-[#173D2B] mt-1">
              {operationsData?.totalActiveDispatches || 0}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold">Live in market</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Workers En Route (रास्ते में)
            </span>
            <div className="text-2xl font-black text-[#F2A65A] mt-1">
              {operationsData?.jobsOnTheWay || 0}
            </div>
            <span className="text-[10px] text-gray-600 font-semibold">GPS Telemetry broadcasting</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D4DED5] shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Jobs In Progress (कार्यरत)
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {operationsData?.jobsInProgress || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">At customer site</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#D4DED5] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#173D2B] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter By Status:
            </span>
            {['ALL', 'ON_ROUTE', 'IN_PROGRESS', 'IDLE_ONLINE', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                  selectedFilterStatus === status
                    ? 'bg-[#173D2B] text-[#B7E36A]'
                    : 'bg-[#F7F7F2] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#173D2B]">Profession:</span>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="p-1.5 rounded-xl border border-[#D4DED5] text-xs font-semibold focus:outline-none focus:border-[#173D2B] bg-[#F7F7F2]"
            >
              <option value="ALL">All Professions (25)</option>
              {PROFESSIONS_LIST.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Grid: Interactive Operations Map & Active Dispatch List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Map View */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D4DED5] shadow-md overflow-hidden">
            <div className="p-4 bg-[#173D2B] text-white flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#B7E36A] tracking-wider">
                Field Telemetry View ({filteredWorkers.length} workers plotted)
              </span>
              <div className="flex items-center gap-3 text-[11px] text-gray-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;30s Fresh
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> &lt;120s Delayed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Stale
                </span>
              </div>
            </div>

            <InteractiveMap
              centerLat={28.5355}
              centerLng={77.3910}
              zoom={12}
              candidateMarkers={candidateMarkers}
              heightClass="h-[480px] sm:h-[540px]"
            />
          </div>

          {/* Active Dispatches & Selected Worker Inspection Panel */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Selected Worker Telemetry Inspector */}
            {selectedWorkerDetail ? (
              <div className="bg-white rounded-3xl p-5 border-2 border-[#173D2B] shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-[#D4DED5] pb-2">
                  <span className="text-xs font-black uppercase text-[#173D2B] tracking-wider">
                    Worker Telemetry Inspector
                  </span>
                  <button
                    onClick={() => setSelectedWorkerDetail(null)}
                    className="text-xs font-bold text-gray-500 hover:text-black"
                  >
                    Close
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={selectedWorkerDetail.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                    alt={selectedWorkerDetail.user?.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#D4DED5]"
                  />
                  <div>
                    <h3 className="font-black text-[#173D2B] text-sm">
                      {selectedWorkerDetail.user?.fullName}
                    </h3>
                    <p className="text-xs text-gray-600">{selectedWorkerDetail.headline}</p>
                    <span className="text-[11px] text-[#173D2B] font-bold">
                      Status: <strong>{selectedWorkerDetail.bookingStatus}</strong>
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F7F2] rounded-xl border border-[#D4DED5] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Live GPS Coordinate:</span>
                    <strong className="text-[#173D2B]">
                      {selectedWorkerDetail.currentLocation?.latitude?.toFixed(4)},{' '}
                      {selectedWorkerDetail.currentLocation?.longitude?.toFixed(4)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telemetry Status:</span>
                    <strong className={selectedWorkerDetail.isTelemetryStale ? 'text-red-600' : 'text-emerald-700'}>
                      {selectedWorkerDetail.isTelemetryStale ? 'Delayed / Stale' : 'Real-time Live'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Live Speed:</span>
                    <strong className="text-[#173D2B]">
                      {selectedWorkerDetail.currentLocation?.speed || 24} km/h
                    </strong>
                  </div>
                </div>

                {selectedWorkerDetail.activeBookingId && (
                  <Link
                    href={`/track/${selectedWorkerDetail.activeBookingId}`}
                    className="w-full py-2.5 rounded-xl bg-[#173D2B] text-[#B7E36A] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#2D6547] transition"
                  >
                    Open Live Customer Tracking Screen <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : null}

            {/* Active Dispatches List */}
            <div className="bg-white rounded-3xl p-5 border border-[#D4DED5] shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase text-[#173D2B] tracking-wider">
                Live Dispatches ({activeBookings.length})
              </h3>

              {activeBookings.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No active dispatches right now.</p>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {activeBookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-[#F7F7F2] border border-[#D4DED5] hover:border-[#173D2B] transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#173D2B] truncate max-w-[160px]">
                          {b.serviceCategory}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#173D2B] text-[#B7E36A]">
                          {b.status}
                        </span>
                      </div>

                      <p className="text-gray-600 truncate text-[11px]">{b.addressLine}, {b.city}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#D4DED5] text-[11px]">
                        <span className="text-gray-500">
                          Worker: <strong>{b.assignedWorker?.user?.fullName || 'Searching...'}</strong>
                        </span>
                        <Link
                          href={`/track/${b.id}`}
                          className="text-[#173D2B] font-bold hover:underline flex items-center gap-0.5"
                        >
                          Track <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
