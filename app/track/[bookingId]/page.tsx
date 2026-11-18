'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Crosshair,
  ArrowLeft
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function LiveTrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial tracking data
  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/tracking/${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setTrackingData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    // Initialize Socket.IO client connection
    const socket = io({
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('booking:join', { bookingId, userId: 'customer', role: 'CUSTOMER' });
    });

    // Listen for real-time live coordinate stream
    socket.on('location:stream', (liveUpdate: any) => {
      setTrackingData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          liveLocationAvailable: true,
          currentLocation: {
            latitude: liveUpdate.latitude,
            longitude: liveUpdate.longitude,
            accuracyMeters: liveUpdate.accuracyMeters,
            speed: liveUpdate.speed,
            heading: liveUpdate.heading,
            recordedAt: liveUpdate.recordedAt,
          },
          distanceKm: liveUpdate.distanceKm || prev.distanceKm,
          formattedDistance: liveUpdate.formattedDistance || prev.formattedDistance,
          etaMinutes: liveUpdate.etaMinutes || prev.etaMinutes,
          formattedEta: liveUpdate.formattedEta || prev.formattedEta,
          isStale: false,
          staleWarning: null,
        };
      });
    });

    // Listen for chat messages
    socket.on('chat:received', (msg: any) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Fallback polling every 6 seconds to handle network drops
    const interval = setInterval(fetchTracking, 6000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [bookingId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current) return;

    const payload = {
      bookingId,
      senderId: 'customer',
      senderName: trackingData?.booking?.customer?.fullName || 'Customer',
      senderRole: 'CUSTOMER',
      message: inputMessage.trim(),
    };

    socketRef.current.emit('chat:send', payload);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        bookingId,
        senderId: 'customer',
        senderName: 'You',
        senderRole: 'CUSTOMER',
        message: inputMessage.trim(),
        sentAt: new Date().toISOString(),
      },
    ]);
    setInputMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg font-bold text-text-muted">
        Connecting to live GPS satellite telemetry...
      </div>
    );
  }

  const booking = trackingData?.booking;
  const worker = booking?.assignedWorker;
  const loc = trackingData?.currentLocation;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-bg min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/booking/${bookingId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Booking Details
          </Link>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-status-success animate-ping' : 'bg-status-danger'}`} />
            <span className="text-xs font-bold text-text-secondary">
              {socketConnected ? 'Socket.IO Real-time Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Warnings / Alerts */}
        {trackingData?.staleWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Location last updated {Math.round((Date.now() - new Date(loc?.recordedAt).getTime()) / 60000)} minutes ago.</span>
          </div>
        )}

        {trackingData?.accuracyWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Location accuracy is low (&gt; 100 meters). Waiting for precise GPS fix.</span>
          </div>
        )}

        {!trackingData?.liveLocationAvailable && (
          <div className="p-4 rounded-2xl bg-white border border-border text-center space-y-2">
            <p className="text-forest font-bold text-sm">Live location unavailable.</p>
            <p className="text-xs text-text-muted">
              Worker has not marked &quot;ON THE WAY&quot; yet or GPS permission is awaiting approval.
            </p>
          </div>
        )}

        {/* Main Grid: Interactive Map Simulation + Live Telemetry & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Display Column */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-border shadow-elevated overflow-hidden flex flex-col">
            
            {/* Map Header Status */}
            <div className="bg-forest text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-lime font-bold uppercase tracking-wider block">
                  En Route to Destination • रास्ते में
                </span>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-cta animate-pulse" />
                  <span>ETA: {trackingData?.formattedEta || '25 mins'}</span>
                  <span className="text-xs text-gray-300 font-normal">
                    ({trackingData?.formattedDistance || '3.2 km'} remaining)
                  </span>
                </div>
              </div>

              {loc && (
                <div className="text-right text-[11px] text-gray-300">
                  <div>GPS Accuracy: <strong className="text-white">±{loc.accuracyMeters || 10} m</strong></div>
                  <div>Speed: <strong className="text-white">{loc.speed || 24} km/h</strong></div>
                </div>
              )}
            </div>

            {/* Simulated Live Route Canvas / Visualizer */}
            <div className="relative bg-[#E8ECE9] h-96 w-full flex items-center justify-center overflow-hidden border-b border-border">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4ded5_1px,transparent_1px),linear-gradient(to_bottom,#d4ded5_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Simulated Route Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 120 280 Q 280 180 500 120"
                  fill="none"
                  stroke="#2D6547"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Worker Marker */}
              <div className="absolute left-[120px] top-[280px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-cta text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-cta/30">
                    🛵
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-status-success border-2 border-white"></span>
                </div>
                <span className="mt-1 bg-forest text-lime text-[10px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {worker?.user?.fullName || 'Worker'} (Live)
                </span>
              </div>

              {/* Destination Customer Marker */}
              <div className="absolute left-[500px] top-[120px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="w-9 h-9 rounded-full bg-forest text-lime flex items-center justify-center font-bold shadow-lg ring-4 ring-forest/30">
                  <MapPin className="w-5 h-5 fill-lime text-forest" />
                </div>
                <span className="mt-1 bg-white text-forest text-[10px] font-bold px-2 py-0.5 rounded border border-border shadow whitespace-nowrap">
                  Your Address
                </span>
              </div>

              {/* Center Map Telemetry Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-border flex items-center justify-between text-xs font-semibold z-30">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-forest" />
                  <span>Lat: {loc ? loc.latitude.toFixed(4) : '28.5420'}, Lng: {loc ? loc.longitude.toFixed(4) : '77.3820'}</span>
                </div>
                <span className="text-[11px] text-text-muted">
                  Updated: {loc ? new Date(loc.recordedAt).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>

            {/* Address bar */}
            <div className="p-4 bg-white flex items-center justify-between text-xs">
              <span className="text-text-secondary truncate max-w-md">
                Destination: <strong className="text-forest font-bold">{booking?.addressLine}, {booking?.city}</strong>
              </span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${booking?.customerLatitude},${booking?.customerLongitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-sage font-bold hover:underline shrink-0"
              >
                Open in Google Maps
              </a>
            </div>

          </div>

          {/* Right Column: Worker Profile & Booking Chat */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Worker Card */}
            {worker && (
              <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120'}
                    alt={worker.user?.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-border"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-forest text-base">{worker.user?.fullName}</h3>
                      <ShieldCheck className="w-4 h-4 text-status-success" />
                    </div>
                    <p className="text-xs text-text-secondary">{worker.headline}</p>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                      ★ {worker.ratingAvg} ({worker.ratingCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <a
                    href={`tel:${worker.user?.phoneNumber || '9876543210'}`}
                    className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-4 h-4" /> Call Worker
                  </a>
                </div>
              </div>
            )}

            {/* In-app Booking Chat Box */}
            <div className="bg-white rounded-3xl border border-border shadow-xs flex flex-col h-96">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-bold text-xs text-forest flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-sage" /> In-App Direct Chat
                </span>
                <span className="text-[10px] text-status-success font-bold">Encrypted</span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs">
                {chatMessages.length === 0 && (
                  <p className="text-center text-text-muted text-[11px] py-8">
                    Send a message to your worker for directions or gate entry instructions.
                  </p>
                )}

                {chatMessages.map((m: any, i: number) => {
                  const isMe = m.senderRole === 'CUSTOMER';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-text-muted mb-0.5 font-semibold">
                        {m.senderName}
                      </span>
                      <div
                        className={`p-2.5 rounded-2xl max-w-[80%] leading-relaxed ${
                          isMe
                            ? 'bg-forest text-lime rounded-br-none'
                            : 'bg-bg text-text-primary rounded-bl-none border border-border'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-bg text-xs font-medium focus:outline-none focus:border-forest"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-forest text-lime shadow-xs hover:bg-forest-light"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
