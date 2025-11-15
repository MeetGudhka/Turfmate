// Socket.IO handler with namespaces
const chatService = require('../services/chatService');

const socketHandler = (io) => {
  // Users namespace (for 1:1 or team chat)
  const userNamespace = io.of('/users');
  userNamespace.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send-message', async (data) => {
      const { roomId, userId, message } = data;
      try {
        await chatService.saveMessage(roomId, userId, message);
        userNamespace.to(roomId).emit('receive-message', { userId, message, timestamp: new Date() });
      } catch (err) {
        console.error('Message send error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Tournament rooms
  const tournamentNamespace = io.of('/tournaments');
  // Similar logic can be added

  // Redis adapter for horizontal scaling
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');
  
  const setupRedis = async () => {
    const pubClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      password: process.env.REDIS_PASSWORD
    });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
    subClient.on('error', (err) => console.error('Redis Sub Error:', err));

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO Redis adapter initialized');
    } catch (err) {
      console.error('Redis connection failed:', err);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    setupRedis();
  }
};

module.exports = socketHandler;