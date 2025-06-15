import { config } from 'dotenv';
import express from 'express';
import connectToDB from './connect';
import cors from 'cors';
import mainRoutes from './routes/mainRoutes';
import cookieParser from 'cookie-parser';
import { swaggerSpec, swaggerUi } from './swagger';
import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import env from './Ienv';
import Chat from './models/chat';
import Room from './models/room';

// Load environment variables
config();

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});
const userSocketMap = new Map<string, string>();
// Middleware for Socket.IO authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded !== 'string' && decoded?.userId) {
      socket.data.userId = decoded.userId;
      return next();
    }
  } catch (e) {
    return next(new Error('Unauthorized'));
  }
  return next(new Error('Unauthorized'));
});

// Handle connections
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'User ID:', socket.data.userId);
  const userId = socket.data.userId;
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('ride_accepted', async ({ riderId, rideId }) => {
    const roomSlug = `ride-${rideId}`;

    // Find or create the room in DB
    let room = await Room.findOne({ slug: roomSlug });
    if (!room) {
      room = await Room.create({
        slug: roomSlug,
        adminId: userId, // or whoever should be admin (customer or system)
        chat: [],
      });
    }

    // Join customer to room
    socket.join(roomSlug);

    // Notify rider to join room
    const riderSocketId = userSocketMap.get(riderId);
    if (riderSocketId) {
      io.to(riderSocketId).emit('redirect_to_chat', { roomId: roomSlug });
    }
  });

  socket.on('chat', async ({ roomId, message }) => {
    const chatDoc = await Chat.create({
      roomId,
      message,
      userId,
    });

    await Room.findOneAndUpdate(
      { slug: roomId },
      { $push: { chat: chatDoc._id } },
    );
    io.to(roomId).emit('chat', {
      roomId,
      message,
      userId: socket.data.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database + Server start
connectToDB()
  .then((connectMessage) => {
    console.log(connectMessage);

    app.use(mainRoutes); // Routes

    // ✅ Important: use `httpServer.listen` instead of `app.listen`
    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`Server started on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

export default app;
