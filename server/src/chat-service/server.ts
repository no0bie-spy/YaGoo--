const express = require('express');
const http = require('http');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const { setupWebSocket } = require('./wsServer');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);

// Initialize WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
