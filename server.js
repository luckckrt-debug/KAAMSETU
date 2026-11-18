const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

// Helper to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c * 100) / 100;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach io to global for API routes
  global.__kaamsetu_io = io;

  io.on('connection', (socket) => {
    // 1. Join room for specific booking (Customer, Assigned Worker, Admin)
    socket.on('booking:join', ({ bookingId, userId, role }) => {
      if (!bookingId) return;
      const room = `booking:${bookingId}`;
      socket.join(room);
      console.log(`[SOCKET] User ${userId || 'guest'} (${role || 'VIEWER'}) joined ${room}`);
      socket.emit('booking:joined', { bookingId, joinedAt: new Date().toISOString() });
    });

    // 2. Worker presence & dispatch channel
    socket.on('worker:join', ({ workerProfileId, userId }) => {
      if (workerProfileId) {
        socket.join(`worker:${workerProfileId}`);
        socket.join('workers:all');
        console.log(`[SOCKET] Worker ${workerProfileId} connected to dispatch pool`);
      }
    });

    // 3. Admin Live Operations room
    socket.on('admin:join', () => {
      socket.join('admin:operations');
      console.log('[SOCKET] Admin connected to live operations channel');
    });

    // 4. Live Worker GPS Telemetry streaming
    const handleLocationUpdate = (data) => {
      const { bookingId, workerProfileId, latitude, longitude, accuracyMeters, heading, speed } = data;
      if (!latitude || !longitude) return;

      const telemetryPayload = {
        bookingId,
        workerProfileId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracyMeters: accuracyMeters ? Number(accuracyMeters) : 10,
        heading: heading ? Number(heading) : 0,
        speed: speed ? Number(speed) : 24,
        recordedAt: new Date().toISOString(),
      };

      // Broadcast to specific booking room if active job
      if (bookingId) {
        const room = `booking:${bookingId}`;
        io.to(room).emit('worker:location:update', telemetryPayload);
        io.to(room).emit('location:stream', telemetryPayload);
      }

      // Broadcast to Admin Live Operations map
      io.to('admin:operations').emit('worker:location:update', telemetryPayload);
    };

    socket.on('worker:location:update', handleLocationUpdate);
    socket.on('location:update', handleLocationUpdate);

    // 5. Worker Availability & Online Toggle
    socket.on('worker:availability:update', (data) => {
      const { workerProfileId, isOnline, isAvailableNow } = data;
      io.to('admin:operations').emit('worker:availability:update', {
        workerProfileId,
        isOnline,
        isAvailableNow,
        updatedAt: new Date().toISOString(),
      });
    });

    // 6. Booking Lifecycle Transitions
    socket.on('booking:status:updated', (data) => {
      const { bookingId, status } = data;
      if (!bookingId || !status) return;
      const room = `booking:${bookingId}`;
      io.to(room).emit('booking:status:updated', { ...data, updatedAt: new Date().toISOString() });
      io.to(room).emit('booking:status_changed', { ...data, updatedAt: new Date().toISOString() });
      io.to('admin:operations').emit('booking:status:updated', data);
    });

    socket.on('booking:worker:assigned', (data) => {
      const { bookingId } = data;
      if (!bookingId) return;
      io.to(`booking:${bookingId}`).emit('booking:worker:assigned', data);
      io.to('admin:operations').emit('booking:worker:assigned', data);
    });

    socket.on('booking:worker:arrived', (data) => {
      const { bookingId } = data;
      if (!bookingId) return;
      io.to(`booking:${bookingId}`).emit('booking:worker:arrived', data);
      io.to('admin:operations').emit('booking:worker:arrived', data);
    });

    socket.on('booking:cancelled', (data) => {
      const { bookingId } = data;
      if (!bookingId) return;
      io.to(`booking:${bookingId}`).emit('booking:cancelled', data);
      io.to('admin:operations').emit('booking:cancelled', data);
    });

    // 7. Tracking start & stop signals
    socket.on('tracking:started', (data) => {
      const { bookingId } = data;
      if (!bookingId) return;
      io.to(`booking:${bookingId}`).emit('tracking:started', data);
      io.to('admin:operations').emit('tracking:started', data);
    });

    socket.on('tracking:stopped', (data) => {
      const { bookingId } = data;
      if (!bookingId) return;
      io.to(`booking:${bookingId}`).emit('tracking:stopped', data);
      io.to('admin:operations').emit('tracking:stopped', data);
    });

    // 8. Realtime Chat message within booking
    socket.on('chat:send', (data) => {
      const { bookingId, senderId, senderName, senderRole, message, imageUrl } = data;
      if (!bookingId || !message) return;

      const msg = {
        id: `msg-${Date.now()}`,
        bookingId,
        senderId,
        senderName: senderName || 'User',
        senderRole: senderRole || 'CUSTOMER',
        message,
        imageUrl,
        isRead: false,
        sentAt: new Date().toISOString(),
      };

      const room = `booking:${bookingId}`;
      io.to(room).emit('chat:received', msg);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> KAAMSETU Platform running on http://localhost:${port}`);
  });
});
