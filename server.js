const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Stocker les positions actuelles des cartes
const cardPositions = {};

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');
    
    // Envoyer les positions actuelles au nouveau client
    socket.emit('initialPositions', cardPositions);
    
    // Recevoir les mises à jour de position
    socket.on('updatePosition', (data) => {
        cardPositions[data.participant] = {
            x: data.x,
            y: data.y,
            rotation: data.rotation
        };
        // Diffuser la mise à jour à tous les autres clients
        socket.broadcast.emit('positionUpdated', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});