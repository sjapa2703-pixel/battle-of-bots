require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Battle of Bots API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('sendMessage', (msgData) => {

    io.emit('receiveMessage', msgData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
