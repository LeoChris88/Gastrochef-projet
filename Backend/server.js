require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');
const financeRoutes = require('./routes/financeRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/stock', stockRoutes);

require('./sockets/orderSocket')(io);

app.get('/', (req, res) => {
  res.send("L'API GastroChef est en cuisine !");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Serveur + Socket.io lancés sur le port ${PORT}`));