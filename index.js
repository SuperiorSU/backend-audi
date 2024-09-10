// index.js
const express = require('express');
const cors = require('cors'); // Import CORS
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();

// Step 2.2.1: Configure CORS
const allowedOrigins = [
  'https://your-frontend-domain.vercel.app', // Replace with your actual frontend URL
  'http://localhost:3000', // For local development
  // Add other origins if necessary
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json()); // To parse JSON bodies

// Step 2.2.2: WebSocket Server Setup
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let panelClients = [];

wss.on('connection', (ws, req) => {
  console.log('A panel client connected');
  panelClients.push(ws);

  ws.on('message', (message) => {
    console.log('Received message from panel:', message);
    // Handle messages from panel if needed
  });

  ws.on('close', () => {
    console.log('A panel client disconnected');
    panelClients = panelClients.filter(client => client !== ws);
  });
});

// Step 2.2.3: API Endpoint to Trigger Countdown
app.post('/trigger-countdown', (req, res) => {
  console.log('Trigger countdown API called');
  // Broadcast the countdown signal to all connected panel clients
  panelClients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ action: 'startCountdown' }));
    }
  });
  res.status(200).json({ message: 'Countdown triggered' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
