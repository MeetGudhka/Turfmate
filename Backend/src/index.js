// Entry point for TurfMate backend
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const turfRoutes = require('./routes/turf.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const chatRoutes = require('./routes/chat.routes');
const checkinRoutes = require('./routes/checkin.routes');
const teamRoutes = require('./routes/team.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const ratingRoutes = require('./routes/rating.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

const socketHandler = require('./sockets/socket');

const app = express();
const server = createServer(app);

// Security and middleware setup
const { setupSecurity } = require('./middleware/security.middleware');
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
  },
});
socketHandler(io);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

const PORT = process.env.PORT || 5000;

db.connect()
  .then(() => console.log("✅ PostgreSQL connected successfully!"))
  .catch(err => console.error("❌ PostgreSQL connection error:", err.message));

server.listen(PORT, () => {
  console.log(`✅ TurfMate backend running on port http://localhost:${PORT}`);
});


module.exports = app;