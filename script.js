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

// Socket.IO
const socket = io();

// Stockage des positions initiales
let initialPositions = {};
let isInitialLoad = true;

// Réception des positions initiales
socket.on('initialPositions', (positions) => {
    initialPositions = positions;
    if (isInitialLoad) {
        loadParticipants(); // Recharger les participants avec les positions sauvegardées
        isInitialLoad = false;
    }
});

// Réception des mises à jour de position
socket.on('positionUpdated', (data) => {
    const card = document.querySelector(`.participant-card[data-participant="${data.participant}"]`);
    if (card && !card.classList.contains('dragging')) {
        requestAnimationFrame(() => {
            card.style.left = `${data.x}px`;
            card.style.top = `${data.y}px`;
            card.style.transform = `rotate(${data.rotation}deg)`;
            card.dataset.rotation = data.rotation;
        });
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger les participants
    loadParticipants();
    
    // Charger les FAQ
    loadFAQ();
    
    // Configuration de la navigation
    setupNavigation();
    
    // Configuration du modal
    setupModal();
    
    // Gestion du redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const container = document.getElementById('participants-list');
            const containerRect = container.getBoundingClientRect();
            
            // Vérifier et ajuster la position de chaque carte si nécessaire
            document.querySelectorAll('.participant-card').forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const currentX = parseFloat(card.style.left);
                const currentY = parseFloat(card.style.top);
                
                const maxX = containerRect.width - cardRect.width - 40;
                const maxY = containerRect.height - cardRect.height - 40;
                
                const adjustedX = Math.max(20, Math.min(maxX, currentX));
                const adjustedY = Math.max(20, Math.min(maxY, currentY));
                
                if (adjustedX !== currentX || adjustedY !== currentY) {
                    card.style.left = `${adjustedX}px`;
                    card.style.top = `${adjustedY}px`;
                    
                    // Informer les autres clients du changement
                    socket.emit('updatePosition', {
                        participant: card.dataset.participant,
                        x: adjustedX,
                        y: adjustedY,
                        rotation: card.dataset.rotation || 0
                    });
                }
            });
        }, 250);
    });
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
        card.dataset.participant = participant;
        card.innerHTML = `
            <h3>${participant}</h3>
        `;
        
        // Position absolue : si le serveur a donné une position, l'utiliser,
        // sinon générer une position/rotation aléatoire dans le conteneur.
        const containerRect = container.getBoundingClientRect();
        const cardWidth = 200; // Largeur approximative de la carte
        const cardHeight = 100; // Hauteur approximative de la carte

        const maxX = Math.max(0, containerRect.width - cardWidth - 40);
        const maxY = Math.max(0, containerRect.height - cardHeight - 40);

        const saved = initialPositions[participant];
        let xPos, yPos, rotation;

        if (saved && typeof saved.x === 'number') {
            // Utiliser la position sauvegardée (reçue du serveur)
            xPos = saved.x;
            yPos = saved.y;
            rotation = saved.rotation || 0;
        } else {
            // Position/rotation aléatoire
            xPos = Math.random() * maxX;
            yPos = Math.random() * maxY;
            rotation = (Math.random() - 0.5) * 8;
        }

        card.style.position = 'absolute';
        card.style.left = `${xPos}px`;
        card.style.top = `${yPos}px`;
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
        
        // Calculer les limites par rapport au conteneur en tenant compte des marges
        const margin = 20;
        const minX = margin;
        const maxX = containerRect.width - cardWidth - margin;
        const minY = margin;
        const maxY = containerRect.height - cardHeight - margin;
        
        // Limiter les déplacements avec une petite marge
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
        // Envoyer une dernière mise à jour à la fin du drag (garantir la synchro)
        socket.emit('updatePosition', {
            participant: element.dataset.participant,
            x: xOffset,
            y: yOffset,
            rotation: element.dataset.rotation || 0
        });
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.left = `${xPos}px`;
        el.style.top = `${yPos}px`;
        el.style.transform = `rotate(${el.dataset.rotation || 0}deg)`;

        // Throttle simple pour limiter les émissions réseau quand on bouge rapidement
        // (envoie au maximum toutes les 80ms par élément)
        const now = Date.now();
        el._lastEmit = el._lastEmit || 0;
        if (now - el._lastEmit > 80) {
            socket.emit('updatePosition', {
                participant: el.dataset.participant,
                x: xPos,
                y: yPos,
                rotation: el.dataset.rotation || 0
            });
            el._lastEmit = now;
        }
    }
}

// Générer une équipe aléatoire de 2 personnes
function generateRandomTeam() {
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
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

