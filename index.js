const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();

// Enable CORS for all routes
app.use(cors());

const wss = new WebSocketServer({ noServer: true });

let panelClients = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Panel connected');
  panelClients.push(ws);

  // Listen for messages from the WebSocket
  ws.on('message', (message) => {
    console.log('Message from client:', message);

    // Broadcast message to all connected panels
    panelClients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log('Panel disconnected');
    panelClients = panelClients.filter(client => client !== ws);
  });

  // Ping/Pong mechanism to keep connection alive
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong, connection is alive');
  });

  ws.on('close', () => {
    clearInterval(interval);
  });
});

// Handle WebSocket upgrade
const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
