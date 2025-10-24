// Données des participants
const participants = [
    "Alice",
    "Alix",
    "Anaïs",
    "Cha",
    "Gabin",
    "Jacques",
    "Jeanne",
    "Lilas",
    "Lucas",
    "Marc",
    "Matt",
    "Momo",
    "Nikeu",
    "Romain",
    "Thib",
    "Tooms",
    "Vincent"
];

// Questions et réponses
const faqData = [
    {
        question: "eEeEE, c'est où trebeurden",
        answer: `
            <p><strong>Warehouse proche Paris, accessible en métro.</strong></p>
            <p><em>rires</em></p>
            
            <p><strong>Adresse :</strong> 8 Rte du Milin ar Lan, 22343 Trébeurden</p>
            
            <p><strong>Train :</strong> Gare de Lannion (3-4h depuis Paris)</p>
            <p>Prévoir ensuite 15 min de gova (ou 40 de vélo pour les plus déter)</p>
            
            <p><strong>Voiture :</strong> ~5-6h depuis St-Germain</p>
        `
    },
    {
        question: "Quand commence et se termine le week-end ?",
        answer: "Au plus tôt le vendredi après-midi et au plus tard le mardi midi."
    },
    {
        question: "C'est quoi les règles du barbu déjà ?",
        answer: `
            <p><strong>As :</strong> Carte bombe : vous gardez la carte en votre possession et l'utilisez quand vous le souhaitez, quand une personne reçoit des gorgées vous pouvez l'utiliser. Les personnes à droite et à gauche de la personne qui boit boivent la moitié, et les personnes encore a côté boivent la moitié de la moitié jusqu'à arrivé a 0. En gros explosion t'as capté</p>
            
            <p><strong>2 :</strong> Le premier a cul sec peut en obliger un à un autre joueur. (le verre doit être rempli à la moitié au moins).</p>
            
            <p><strong>3 :</strong> Dos-à-dos.</p>
            
            <p><strong>4 :</strong> tu te lis avec quelqu'un</p>
            
            <p><strong>5 :</strong> Tout le monde boit.</p>
            
            <p><strong>6 :</strong> Visu : le joueur choisit un objet sur la table et donne la première lettre du mot. Les autres tentent de deviner le mot, le premier a trouver distribue 6.</p>
            
            <p><strong>7 :</strong> Le dernier a lever la main boit.</p>
            
            <p><strong>8 :</strong> Jeu des thèmes : Le premier joueur donne un thème, les autres doivent continuer avec des choses du même thème. Le nombre de tour de ronde effectué = nombre de gorgées bues par le perdant.</p>
            
            <p><strong>9 :</strong> Shi Fu Mi : Le joueur choisit son adversaire, le duel se joue en 3 manches gagnantes, le nombre de points d'écart au carré indique le nombre de gorgées bues par le perdant. Si les deux joueurs arrivent au score de 2-2, les joueurs boivent tous les deux 9 gorgées. Exemple : si un joueur gagne 3-1, le perdant boit 2 gorgées.</p>
            
            <p><strong>10 :</strong> on invente une règle.</p>
            
            <p><strong>Valet :</strong> Waterfall</p>
            
            <p><strong>Dame :</strong> La reine des Te-pu.</p>
            
            <p><strong>Roi :</strong> Duel : Le joueur choisit son adversaire, tous deux piochent une carte, la plus grande gagne. Le nombre de points d'écart indique le nombre de gorgées. Le 10 vaut 0. En cas d'égalité, les deux joueurs se mettent d'accord pour donner 5 gorgées à un autre joueur.</p>
        `
    },
    {
        question: "Je trouve pas de joueurs de coin-coin !?",
        answer: "special", // Indicateur pour une réponse spéciale
        isSpecial: true
    },
    {
        question: "Faut-il avoir un niveau de forme physique particulier ?",
        answer: "Les activités sont accessibles à tous. Si vous avez des limitations physiques, n'hésitez pas à nous en informer et nous adapterons le programme."
    },
    {
        question: "Je dois apporter mes draps ?",
        answer: "Oui stp"
    }
];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Connect to realtime server (if available)
    connectSocket();

    // Charger les participants
    loadParticipants();

    // Charger les FAQ
    loadFAQ();

    // Configuration de la navigation
    setupNavigation();

    // Configuration du modal
    setupModal();
});

// Charger les participants
function loadParticipants() {
    const container = document.getElementById('participants-list');
    container.innerHTML = '';
    
    // Mélanger aléatoirement l'ordre des participants
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    
    shuffledParticipants.forEach((participant, index) => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.innerHTML = `
            <h3>${participant}</h3>
        `;
        // Assign a stable id for sync
        const id = slugify(participant);
        card.dataset.id = id;

        // Position absolue
        const containerRect = container.getBoundingClientRect();
        const cardWidth = 200; // Largeur approximative de la carte
        const cardHeight = 100; // Hauteur approximative de la carte

        const maxX = Math.max(20, containerRect.width - cardWidth - 40);
        const maxY = Math.max(20, containerRect.height - cardHeight - 40);

        // Rotation and position from server if available
        let rotation = (Math.random() - 0.5) * 8;
        let randomX = Math.random() * maxX;
        let randomY = Math.random() * maxY;

        if (window.__serverPositions && window.__serverPositions[id]) {
            const p = window.__serverPositions[id];
            randomX = p.left || randomX;
            randomY = p.top || randomY;
            rotation = p.rotation || rotation;
        }

        card.style.position = 'absolute';
        card.style.left = `${randomX}px`;
        card.style.top = `${randomY}px`;
        card.style.transform = `rotate(${rotation}deg)`;
        card.style.transition = 'transform 0.3s ease';
        
        // Animation au hover
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('dragging')) {
                card.style.transform = `rotate(0deg) scale(1.05)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('dragging')) {
                const currentRotation = card.dataset.rotation || rotation;
                card.style.transform = `rotate(${currentRotation}deg)`;
            }
        });
        
        // Stocker la rotation initiale
        card.dataset.rotation = rotation;
        
        // Ajouter le drag and drop
        makeDraggable(card, container);
        
        container.appendChild(card);

        // If we don't have server positions for this card, register initial position with server
        if (window.socket && window.socket.connected && (!window.__serverPositions || !window.__serverPositions[id])) {
            setTimeout(() => {
                emitMove(card);
            }, 100 + index * 20);
        }
    });
}

// Fonction pour rendre une carte draggable
function makeDraggable(element, container) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    element.addEventListener('mousedown', dragStart);
    element.addEventListener('touchstart', dragStart);
    
    function dragStart(e) {
        e.preventDefault();
        
        // Récupérer la position actuelle de la carte
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculer la position relative au conteneur
        xOffset = rect.left - containerRect.left;
        yOffset = rect.top - containerRect.top;
        
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        if (e.target === element || element.contains(e.target)) {
            isDragging = true;
            element.classList.add('dragging');
            element.style.transition = 'none';
            element.style.zIndex = '1000';
        }
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        
        // Limites : garder la carte dans le conteneur
        const containerRect = container.getBoundingClientRect();
        const cardRect = element.getBoundingClientRect();
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        
        // Calculer les limites par rapport au conteneur
        const minX = 0;
        const maxX = containerRect.width - cardWidth;
        const minY = 0;
        const maxY = containerRect.height - cardHeight;
        
        // Limiter les déplacements
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, element);
    }
    
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    
    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        
        isDragging = false;
        element.classList.remove('dragging');
        element.style.transition = 'transform 0.3s ease';
        element.style.zIndex = '1';

        // Emit new position to server (if connected)
        emitMove(element);
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.left = `${xPos}px`;
        el.style.top = `${yPos}px`;
        el.style.transform = `rotate(${el.dataset.rotation || 0}deg)`;
    }
}

// Générer une équipe aléatoire de 2 personnes
function generateRandomTeam() {
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
}

// ----------------------
// Realtime socket helpers
// ----------------------

function connectSocket() {
    if (!window.io) {
        console.warn('Socket.IO client not loaded');
        return;
    }
    
    try {
        console.log('Tentative connexion socket.io...');
        window.socket = io('/', {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            secure: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('Socket connecté!', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Erreur connexion socket:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket déconnecté:', reason);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Tentative reconnexion #', attemptNumber);
        });
    } catch (err) {
        console.error('Erreur setup socket:', err);
    }

    socket.on('state', (serverPositions) => {
        // store globally for initial load
        window.__serverPositions = serverPositions || {};
        applyServerPositions(serverPositions || {});
    });

    socket.on('moved', (data) => {
        // Update a single card
        if (!data || !data.id) return;
        const el = document.querySelector(`.participant-card[data-id="${data.id}"]`);
        if (el) {
            el.style.left = `${data.left}px`;
            el.style.top = `${data.top}px`;
            el.dataset.rotation = data.rotation || 0;
            el.style.transform = `rotate(${data.rotation || 0}deg)`;
        }
        // keep local store updated
        window.__serverPositions = window.__serverPositions || {};
        window.__serverPositions[data.id] = { left: data.left, top: data.top, rotation: data.rotation };
    });
}

function emitMove(el) {
    if (!window.socket || !window.socket.connected) {
        console.warn('Socket non connecté - impossible d\'envoyer le mouvement');
        return;
    }
    const id = el.dataset.id;
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    const rotation = parseFloat(el.dataset.rotation) || 0;
    const data = { id, left, top, rotation };
    console.log('Envoi mouvement:', data);
    socket.emit('move', data);
}

function applyServerPositions(serverPositions) {
    if (!serverPositions) return;
    document.querySelectorAll('.participant-card').forEach(card => {
        const id = card.dataset.id;
        if (serverPositions[id]) {
            const p = serverPositions[id];
            card.style.left = `${p.left}px`;
            card.style.top = `${p.top}px`;
            card.dataset.rotation = p.rotation || 0;
            card.style.transform = `rotate(${p.rotation || 0}deg)`;
        }
    });
}

function slugify(name) {
    return name.normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

// Charger les FAQ
function loadFAQ() {
    const container = document.getElementById('faq-container');
    container.innerHTML = '';
    
    faqData.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        
        // Vérifier si c'est une question spéciale
        if (item.isSpecial) {
            faqItem.innerHTML = `
                <div class="faq-question">${item.question}</div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        <div id="team-result-${index}"></div>
                        <button class="refresh-btn" data-index="${index}">Nouvelle équipe</button>
                    </div>
                </div>
            `;
            
            // Générer l'équipe initiale
            setTimeout(() => {
                displayTeam(index);
            }, 100);
            
            // Attacher le toggle uniquement sur la question
            const questionElement = faqItem.querySelector('.faq-question');
            questionElement.addEventListener('click', () => {
                toggleFAQ(faqItem);
            });
            
            // Attacher le bouton de rafraîchissement
            const refreshBtn = faqItem.querySelector('.refresh-btn');
            console.log('Refresh button found:', refreshBtn);
            if (refreshBtn) {
                refreshBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked!');
                    const teamIndex = parseInt(refreshBtn.getAttribute('data-index'));
                    console.log('Team index:', teamIndex);
                    displayTeam(teamIndex);
                });
            }
        } else {
            faqItem.innerHTML = `
                <div class="faq-question">${item.question}</div>
                <div class="faq-answer">
                    <div class="faq-answer-content">${item.answer}</div>
                </div>
            `;
            
            // Attacher le toggle uniquement sur la question
            const questionElement = faqItem.querySelector('.faq-question');
            questionElement.addEventListener('click', () => {
                toggleFAQ(faqItem);
                showAnswerModal(item.question, item.answer);
            });
        }
        
        container.appendChild(faqItem);
    });
}

// Afficher une équipe
function displayTeam(index) {
    const team = generateRandomTeam();
    const resultDiv = document.getElementById(`team-result-${index}`);
    
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="team-result">
                <h4 style="color: var(--electric-blue); margin-bottom: 10px;">Dit bonjour à tes nouveaux collègues de coin-coin :</h4>
                ${team.map(member => `<div class="team-member">${member}</div>`).join('')}
            </div>
        `;
    }
}

// Toggle FAQ
function toggleFAQ(element) {
    const isActive = element.classList.contains('active');
    
    // Fermer toutes les autres FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Ouvrir/fermer celle-ci
    if (!isActive) {
        element.classList.add('active');
    }
}

// Afficher le modal avec la réponse
function showAnswerModal(question, answer) {
    const modal = document.getElementById('answer-modal');
    document.getElementById('modal-question').textContent = question;
    document.getElementById('modal-answer').innerHTML = answer;
    modal.classList.add('active');
}

// Configuration de la navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            
            // Mettre à jour les boutons actifs
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Afficher la bonne page
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
            });
            document.getElementById(`${page}-page`).classList.add('active');
        });
    });
}

// Configuration du modal
function setupModal() {
    const modal = document.getElementById('answer-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

