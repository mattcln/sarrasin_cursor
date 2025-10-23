# Sarrasin - Site Web Week-end

Site web mystérieux avec effets électriques pour l'organisation d'un week-end.

## Caractéristiques

- **Design sombre** avec effets électriques animés en violet/bleu royal
- **Deux pages** : Accueil avec liste des participants et FAQ interactive
- **Effets visuels dynamiques** : glitch, flash, animations électriques
- **Gif mystérieux** : breizh.gif apparaît et disparaît discrètement toutes les 10 secondes
- **Tirage au sort d'équipes** : fonctionnalité interactive pour générer des équipes de coin-coin
- **Responsive** : optimisé pour mobile et desktop
- **Ambiance mystérieuse** avec thème cyberpunk/électrique

## Structure

- `index.html` - Structure HTML du site
- `styles.css` - Styles CSS avec animations électriques
- `script.js` - Logique JavaScript pour la navigation et les interactions

## Déploiement sur VPS

### Via Nginx

1. Copier les fichiers sur le VPS :
```bash
scp index.html styles.css script.js user@votre-vps:/var/www/html/
```

2. Configurer Nginx pour sarrasin.mattcool.fr :
```nginx
server {
    listen 80;
    server_name sarrasin.mattcool.fr;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

3. Redémarrer Nginx :
```bash
sudo systemctl restart nginx
```

### Via Python (simple)

```bash
python3 -m http.server 8000
```

### Via Node.js (simple)

Installer `http-server` :
```bash
npm install -g http-server
http-server -p 8000
```

### Via Docker

Créer un `Dockerfile` :
```dockerfile
FROM nginx:alpine
COPY index.html styles.css script.js /usr/share/nginx/html/
```

Puis :
```bash
docker build -t sarrasin .
docker run -d -p 80:80 sarrasin
```

## Personnalisation

### Modifier les participants

Éditer le tableau `participants` dans `script.js` :
```javascript
const participants = [
    { name: "Nom", role: "Rôle" },
    // ...
];
```

### Modifier les questions/réponses

Éditer le tableau `faqData` dans `script.js` :
```javascript
const faqData = [
    {
        question: "Votre question ?",
        answer: "Votre réponse."
    },
    // ...
];
```

### Modifier les couleurs

Éditer les variables CSS dans `styles.css` :
```css
:root {
    --electric-blue: #00ffff;
    --electric-purple: #9d00ff;
    --electric-pink: #ff00ff;
    /* ... */
}
```

## Technologies

- HTML5
- CSS3 (animations, transitions)
- JavaScript Vanilla (ES6+)

## Notes

- Le site fonctionne sans dépendances externes
- Tous les effets sont créés avec CSS pur
- Compatible avec tous les navigateurs modernes
