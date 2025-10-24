const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Fichier de persistance simple
const DATA_FILE = '/home/mattcool/sarrasin_cursor/positions.json';

// Stocker les positions actuelles des cartes (chargées depuis le disque si présent)
let cardPositions = {};
try {
    if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        cardPositions = JSON.parse(raw) || {};
        console.log('Positions chargées depuis', DATA_FILE);
    } else {
        console.log('Création du fichier de positions:', DATA_FILE);
        fs.writeFileSync(DATA_FILE, '{}', 'utf8');
    }
} catch (err) {
    console.warn('Impossible de charger les positions depuis le disque:', err.message);
}

// Persistance débounced pour éviter d'écrire trop souvent
let saveTimeout = null;
function scheduleSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            // Créer le dossier parent si nécessaire
            const parentDir = path.dirname(DATA_FILE);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            
            // Sauvegarder avec un fichier temporaire
            fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(cardPositions, null, 2), 'utf8');
            fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
            console.log('Positions sauvegardées dans', DATA_FILE);
        } catch (err) {
            console.error('Erreur en sauvegardant les positions:', err.message);
            console.error('Chemin du fichier:', DATA_FILE);
        }
        saveTimeout = null;
    }, 500);
}

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    // Attendre un petit délai avant d'envoyer les positions initiales
    setTimeout(() => {
        // Envoyer les positions actuelles au nouveau client
        socket.emit('initialPositions', cardPositions);
        console.log('Positions initiales envoyées au nouveau client');
    }, 500);

    // Recevoir les mises à jour de position
    socket.on('updatePosition', (data) => {
        if (!data || !data.participant) return;
        
        // Valider les données reçues
        const x = parseFloat(data.x);
        const y = parseFloat(data.y);
        const rotation = parseFloat(data.rotation || 0);
        
        if (isNaN(x) || isNaN(y) || isNaN(rotation)) {
            console.warn('Données de position invalides reçues:', data);
            return;
        }

        // S'assurer que les valeurs sont positives
        if (x < 0 || y < 0) {
            console.warn('Position négative ignorée:', data);
            return;
        }

        // Mettre à jour les positions
        cardPositions[data.participant] = {
            x: x,
            y: y,
            rotation: rotation
        };

        // Diffuser la mise à jour à tous les autres clients
        const update = {
            participant: data.participant,
            x: x,
            y: y,
            rotation: rotation
        };
        
        socket.broadcast.emit('positionUpdated', update);

        // Enregistrer les positions plus fréquemment
        scheduleSave();

        // Programmer la sauvegarde
        scheduleSave();
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Assurer la sauvegarde au shutdown
function flushAndExit() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(cardPositions, null, 2), 'utf8');
        console.log('Positions sauvegardées avant arrêt');
    } catch (err) {
        console.error('Erreur lors du flush:', err.message);
    }
    process.exit(0);
}

process.on('SIGINT', flushAndExit);
process.on('SIGTERM', flushAndExit);

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});