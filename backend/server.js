import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { connectRedis } from './src/config/redis.js';
import errorHandler from './src/middleware/error.js';

// Route Imports
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import platformRoutes from './src/routes/platform.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import contestRoutes from './src/routes/contest.routes.js';
import eventRoutes from './src/routes/event.routes.js';
import problemRoutes from './src/routes/problem.routes.js';
import todoRoutes from './src/routes/todo.routes.js';
import reminderRoutes from './src/routes/reminder.routes.js';
import preparationRoutes from './src/routes/preparation.routes.js';
import leaderboardRoutes from './src/routes/leaderboard.routes.js';
import discussionRoutes from './src/routes/discussion.routes.js';
import aiRoutes from './src/routes/ai.routes.js';

// Services & Seeders
import { seedProblemsIfEmpty } from './src/controllers/problem.controller.js';
import { seedEventsIfEmpty } from './src/services/events/eventService.js';
import { initSyncCron } from './src/services/sync/syncEngine.js';

// Load Environment Variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public folder if needed
app.use('/public', express.static('public'));

// Mount Dupilio API routes (supporting both /api/v1 and /api)
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/platforms`, platformRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/contests`, contestRoutes);
  app.use(`${prefix}/events`, eventRoutes);
  app.use(`${prefix}/problems`, problemRoutes);
  app.use(`${prefix}/todos`, todoRoutes);
  app.use(`${prefix}/reminders`, reminderRoutes);
  app.use(`${prefix}/preparation`, preparationRoutes);
  app.use(`${prefix}/leaderboard`, leaderboardRoutes);
  app.use(`${prefix}/discussions`, discussionRoutes);
  app.use(`${prefix}/ai`, aiRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/api');

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Dupilio Core API', time: new Date() });
});

// Centralized error handler
app.use(errorHandler);

// Socket.io for real-time notifications & alerts
io.on('connection', (socket) => {
  console.log(`🔌 [Dupilio Socket] Client connected: ${socket.id}`);

  socket.on('join-user-channel', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`👤 User joined alert channel: user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Dupilio Socket] Client disconnected: ${socket.id}`);
  });
});

// Start Server services
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  await connectRedis();
  await seedProblemsIfEmpty();
  await seedEventsIfEmpty();
  initSyncCron();
  
  server.listen(PORT, () => {
    console.log(`🚀 DUPILIO API Server is running on port ${PORT}`);
  });
};

startServer();

export { app, server, io };
