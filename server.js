const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

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

  // Attach io to global for API routes if needed
  global.__kaamsetu_io = io;

  io.on('connection', (socket) => {
    // Join room for specific booking
    socket.on('booking:join', ({ bookingId, userId, role }) => {
      const room = `booking:${bookingId}`;
      socket.join(room);
      console.log(`[SOCKET] User ${userId} (${role}) joined ${room}`);
    });

    // Worker streams real GPS coordinates
    socket.on('location:update', (data) => {
      const { bookingId, workerProfileId, latitude, longitude, accuracyMeters, heading, speed } = data;
      if (!bookingId || !latitude || !longitude) return;

      const room = `booking:${bookingId}`;

      // Broadcast live coordinate to authorized customer in the room
      io.to(room).emit('location:stream', {
        bookingId,
        workerProfileId,
        latitude,
        longitude,
        accuracyMeters: accuracyMeters || 10,
        heading: heading || 0,
        speed: speed || 0,
        recordedAt: new Date().toISOString(),
      });
    });

    // Realtime Chat message within booking
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
