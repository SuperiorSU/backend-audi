const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000; // Adjust as needed

// Serve frontend or static files if needed
app.use(express.static('public'));

// WebSocket server
const wss = new WebSocketServer({ noServer: true });

let panelClients = [];

wss.on('connection', (ws) => {
  console.log('A client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  panelClients.push(ws);
});

// API to trigger LED countdown
app.post('/trigger-countdown', (req, res) => {
  // Broadcast the countdown signal to all connected panel clients
  panelClients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ action: 'startCountdown' }));
    }
  });
  res.status(200).json({ message: 'Countdown triggered' });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Upgrade HTTP server to handle WebSocket requests
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
