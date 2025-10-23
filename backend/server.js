const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const categoryRoutes = require('./routes/categories');
const testimonialsRoutes = require('./routes/testimonials');

app.use('/api/projects', projectRoutes);
app.use('/api/login', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', messageRoutes); // POST contact
app.use('/api/categories', categoryRoutes);
app.use('/api/testimonials', testimonialsRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
// Create HTTP server and attach socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const ChatMessage = require('./models/ChatMessage');
const jwt = require('jsonwebtoken');

// Admin-only endpoint to fetch recent chat messages
app.get('/api/chat', async (req, res) => {
  try {
    // expect Authorization: Bearer <token>
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    try { jwt.verify(token, process.env.JWT_SECRET); } catch (e) { return res.status(401).json({ message: 'Invalid token' }); }
    const list = await ChatMessage.find().sort({ createdAt: -1 }).limit(200);
    res.json(list.reverse());
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

let agentsOnline = 0;

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  // if client provided a JWT in handshake auth and it validates, flag socket as agent
  socket.isAgent = false;
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // basic check: decoded exists -> treat as agent
      socket.isAgent = true;
      agentsOnline += 1;
      console.log('Agent socket connected', socket.id, 'agentsOnline', agentsOnline);
    }
  } catch (e) { /* invalid token -> not an agent */ }

  socket.on('agent:online', () => { if (!socket.isAgent) return; agentsOnline += 1; console.log('Agent online', agentsOnline); });
  socket.on('agent:offline', () => { if (!socket.isAgent) return; agentsOnline = Math.max(0, agentsOnline - 1); console.log('Agent offline', agentsOnline); });

  socket.on('chat:message', async (data) => {
    // data: { name, message }
    try {
      const msg = new ChatMessage({ sender: 'user', name: data.name, message: data.message });
      await msg.save();
      io.emit('chat:message', { sender: 'user', name: data.name, message: data.message, createdAt: msg.createdAt });

      // If no agent online, send a simple bot reply
      if (agentsOnline === 0) {
        const botText = `Hi ${data.name || 'there'} — thanks for reaching out! I'll get back to you soon. Meanwhile, please check the Contact page for an email or WhatsApp.`;
        const bot = new ChatMessage({ sender: 'agent', name: 'Isaiah (auto-reply)', message: botText });
        await bot.save();
        io.emit('chat:message', { sender: 'agent', name: 'Isaiah (auto-reply)', message: botText, createdAt: bot.createdAt });
      }
    } catch (err) { console.error('chat save error', err); }
  });

  socket.on('disconnect', () => { console.log('Socket disconnected', socket.id); });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
