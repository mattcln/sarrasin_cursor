const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://sarrasin.mattcool.fr',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'positions.json');

// Serve static files (optional: lets the same host serve the static site)
app.use(express.static(path.join(__dirname)));

let positions = {};

// Load persisted positions if present
try {
  if (fs.existsSync(DATA_FILE)) {
    positions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
    console.log('Loaded positions from', DATA_FILE);
  }
} catch (err) {
  console.error('Failed to load positions file:', err);
}

let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(positions, null, 2));
    } catch (err) {
      console.error('Failed to save positions:', err);
    }
    saveTimeout = null;
  }, 1000);
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // Send current state to new client
  socket.emit('state', positions);

  // Handle move events
  socket.on('move', (payload) => {
    if (!payload || !payload.id) return;
    positions[payload.id] = {
      left: payload.left,
      top: payload.top,
      rotation: payload.rotation || 0,
      lastUpdated: Date.now()
    };

    // Broadcast to others
    socket.broadcast.emit('moved', { id: payload.id, ...positions[payload.id] });

    scheduleSave();
  });

  socket.on('resetPositions', () => {
    positions = {};
    io.emit('state', positions);
    scheduleSave();
  });

  socket.on('disconnect', () => {
    // nothing specific for now
  });
});

server.listen(PORT, () => {
  console.log(`Sync server listening on port ${PORT}`);
});
