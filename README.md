GASTROCHEF-PROJET :

📊 ARCHITECTURE DU PROJET

Structure Backend :
───────────────────
Backend/
├── config/
│   └── db.js                  → Connexion MongoDB
├── models/
│   ├── User.js                → Profil joueur
│   ├── Ingredient.js          → Liste des ingrédients
│   ├── Recipe.js              → Recettes avec patterns
│   ├── Stock.js               → Stock par utilisateur
│   ├── Order.js               → Commandes des clients
│   └── Transaction.js         → Historique financier
├── routes/
│   ├── authRoutes.js          → Inscription / Connexion
│   └── recipeRoutes.js        → Gestion des recettes
├── controllers/
│   └── recipeController.js    → Logique métier recettes
├── sockets/
│   └── orderSocket.js         → Gestion temps réel
├── services/
│   ├── financeService.js      → Calculs financiers
│   └── stockService.js        → Gestion du stock
├── middleware/
│   └── auth.js                → Protection JWT
├── scripts/
│   └── seedRecipes.js         → Initialisation BDD
├── .env                       → Variables d'environnement
├── server.js                  → Point d'entrée
└── package.json

Structure Frontend :
────────────────────
Frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.jsx          → Connexion / Inscription
│   │   ├── Lab.jsx            → Page principale (labo + service)
│   │   ├── Service.jsx        → Service (non utilisée)
│   │   └── Dashboard.jsx      → Graphiques (créé mais non intégré)
│   ├── components/
│   │   ├── CraftTable.jsx     → Grille 3x3 drag & drop
│   │   ├── OrdersPanel.jsx    → Liste des commandes
│   │   ├── GameOver.jsx       → Écran de défaite
│   │   └── Navbar.jsx         → Barre navigation (créée non utilisée)
│   ├── hooks/
│   │   ├── useRecipes.js      → Gestion découverte recettes
│   │   ├── useService.js      → Socket.IO pour le service
│   │   └── useTimer.js        → Timers des commandes
│   ├── Styles/
│   │   └── Lab.css            → Design principal
│   ├── App.js                 → Routes et protection
│   └── index.js               → Point d'entrée
└── package.json

- NIVEAU 10/20 : "CUISINIER" (COMPLET)

Authentification JWT :
  ✅ Inscription avec email, mot de passe (haché bcrypt)
  ✅ Connexion avec génération de token JWT
  ✅ Protection des routes (middleware auth)
  ✅ Token valide 7 jours

Le Laboratoire :
  ✅ Interface drag & drop avec grille 3x3
  ✅ 12 ingrédients disponibles :
     Tomate, Mozzarella, Basilic, Œuf, Sel, Pâtes,
     Poivre, Pain, Oignon, Bouillon, Parmesan, Gruyère
  ✅ Algorithme de matching (comparaison pattern)
  ✅ 4 recettes à découvrir :
     - Salade Caprese (Tomate + Mozzarella + Basilic)
     - Carbonara (Pâtes + Œuf + Parmesan)
     - Soupe à l'oignon (Oignon + Bouillon + Gruyère)
     - Œuf au plat (Œuf + Sel + Poivre)
  ✅ Sauvegarde des recettes découvertes en base
  ✅ Livre de recettes consultable

Restrictions Niveau 10 :
  - Stock illimité (pas de gestion de quantité)
  - Pas de notion d'argent
  - Pas de commandes clients


- NIVEAU 13/20 : "CHEF DE PARTIE" (COMPLET)

Service Temps Réel :
  ✅ WebSockets Socket.IO
  ✅ Commandes générées automatiquement toutes les 20 secondes
  ✅ Timer visible par commande (barre de progression)
  ✅ Bouton "Démarrer le service"
  ✅ Bouton "Servir" actif si recette connue + stock suffisant

Système de Satisfaction :
  ✅ Satisfaction de départ : 20 points
  ✅ Servir à temps : +1 point
  ✅ Laisser expirer : -10 points
  ✅ Rejeter : -10 points
  ✅ Game Over si satisfaction < 0
  ✅ Écran Game Over avec bouton "Recommencer"

Gestion des Commandes :
  ✅ Limite de temps par commande (30-60s aléatoire)
  ✅ Expiration automatique
  ✅ Consommation du stock lors du service
  ✅ Vérification du stock avant de servir

Restrictions Niveau 13 :
  - Stock illimité (quantité infinie)
  - Pas encore de notion d'argent


✅ NIVEAU 16/20 : "RESTAURATEUR" (BACKEND COMPLET - FRONTEND PARTIEL)

NOTE IMPORTANTE :
Le backend du niveau 16 est entièrement fonctionnel. Cependant, lors
de l'intégration frontend, des bugs sont apparus et le projet est resté
bloqué à ce stade. Les fonctionnalités backend existent mais ne sont
pas toutes affichées dans l'interface.

Backend Implémenté ✅ :
  ✅ Modèle Transaction (traçage de tous les mouvements d'argent)
  ✅ Fonction createTransaction() dans financeService.js
  ✅ Calcul automatique de la trésorerie
  ✅ Pénalités financières :
     - Laisser expirer une commande : -10€
     - Rejeter une commande : -5€
     - Stock insuffisant : -5€
  ✅ Gains financiers :
     - Servir un plat : +10€ à +15€ (selon la recette)
  ✅ Gestion des quantités d'ingrédients
  ✅ Stock initial : 50 unités de chaque ingrédient à l'inscription
  ✅ Consommation automatique du stock lors du service
  ✅ Vérification du stock avant de servir

Frontend Partiel :
  ❌ Trésorerie calculée backend mais pas affichée en temps réel
  ❌ Dashboard Chart.js créé mais pas intégré
  ❌ Pas d'interface pour acheter des ingrédients
  ❌ Graphiques d'évolution non accessibles
  ❌ Calcul de marge non affiché

Ce qui fonctionne vraiment :
  ✅ Les transactions sont créées en base de données
  ✅ La trésorerie est mise à jour côté serveur
  ✅ Le stock est géré correctement
  ✅ Les pénalités sont appliquées
  ✅ Les gains sont comptabilisés

Problèmes rencontrés :
  - Bugs d'affichage lors de l'intégration frontend
  - Interface bloquée après tentative de debug
  - Composants créés mais non connectés au state global


- MODÈLES DE DONNÉES :

User :
──────
{
  email: String (unique)
  password: String (haché avec bcrypt)
  restaurantName: String (défaut: "Mon Restaurant")
  treasury: Number (défaut: 100)
  satisfaction: Number (défaut: 20)
  discoveredRecipes: [ObjectId] → Recipe
  createdAt: Date
}

Ingredient :
{
  name: String (unique)
  category: String ("vegetable", "dairy", "meat", "spice", etc.)
}

Recipe :
────────
{
  name: String
  pattern: String (ex: "Tomate,Mozzarella,Basilic,,,,,,,")
  ingredients: [{
    ingredient: ObjectId → Ingredient
    quantity: Number
  }]
  salePrice: Number (prix de vente du plat)
  category: String ("entrée", "plat", "dessert")
  difficulty: Number
}

Stock :
{
  userId: ObjectId → User
  ingredient: ObjectId → Ingredient
  quantity: Number (défaut: 50 à l'inscription)
}

Order :
{
  userId: ObjectId → User
  recipe: ObjectId → Recipe
  status: String ("pending", "completed", "expired", "rejected")
  createdAt: Date
  expiresAt: Date
  timeLimit: Number (en secondes)
  completedAt: Date (optionnel)
}

Transaction :
{
  userId: ObjectId → User
  type: String ("income", "expense")
  category: String ("sale", "penalty", "ingredient_purchase")
  amount: Number
  description: String
  relatedOrder: ObjectId → Order (optionnel)
  createdAt: Date
}


- ENDPOINTS API : 

Authentification :
POST   /api/auth/register
Body: { email, password, restaurantName }
Response: { token, user }

POST   /api/auth/login
Body: { email, password }
Response: { token, user }

Recettes :
POST   /api/recipes/test
Headers: { Authorization: Bearer <token> }
Body: { grid: [String] } (9 cases)
Response: { message, discovered: Boolean, recipe }

GET    /api/recipes/discovered
Headers: { Authorization: Bearer <token> }
Response: [Recipe]

GET    /api/recipes/all
Response: [Recipe] (toutes les recettes, debug)


- ÉVÉNEMENTS SOCKET.IO :

Client → Serveur :
- start-service              → Démarre la génération de commandes
- stop-service               → Arrête le service
- process-order              → Servir ou rejeter une commande
  Data: { orderId, action: "serve" | "reject" }

Serveur → Client :
- authenticated              → Confirmation connexion Socket
- new-order                  → Nouvelle commande générée
  Data: { orderId, recipe, timeLimit, expiresAt }
- order-completed            → Commande servie avec succès
  Data: { orderId, message, satisfaction, treasury }
- order-expired              → Commande expirée
  Data: { orderId, message, satisfaction, treasury }
- order-rejected             → Commande rejetée
  Data: { orderId, message, satisfaction, treasury }
- satisfaction-update        → Mise à jour de la jauge
  Data: { satisfaction }
- game-over                  → Fin de partie
  Data: { message }


- GUIDE 

1. Inscription :
   - Ouvrir http://localhost:3000
   - Cliquer sur "Pas de compte ? Inscrivez-vous"
   - Remplir : email, mot de passe
   - Le nom du restaurant est optionnel (défaut: "Mon Restaurant")
   - Valider

2. Découverte de Recettes :
   - Glisser des ingrédients depuis la barre latérale
   - Les déposer dans la grille 3x3
   - Cliquer sur "Tester la recette"
   - Si combinaison valide : recette débloquée !
   - Consulter le livre de recettes en bas

3. Lancer le Service :
   - Découvrir au moins 1 recette avant
   - Cliquer sur "Démarrer le service"
   - Les commandes apparaissent automatiquement
   - Observer le timer qui décrémente

4. Servir une Commande :
   - Vérifier qu'on a la recette + le stock
   - Cliquer sur "Servir" avant l'expiration
   - Satisfaction +1, trésorerie +10€ à +15€
   - Le stock est consommé automatiquement

5. Gérer la Satisfaction :
   - Débute à 20 points
   - Ne pas laisser descendre à 0
   - Servir à temps pour augmenter
   - Éviter les expirations (-10 points)

6. Game Over et Recommencer :
   - Si satisfaction < 0 : écran Game Over
   - Cliquer sur "Recommencer" pour relancer
   - Le compte persiste, seule la session reprend


- BUGS CONNUS

1. Inscription : 
   Problème : Le champ restaurantName peut causer une erreur 400
   Contournement : Valeur par défaut ajoutée dans le modèle User
   Statut : Résolu partiellement

2. Test de Recettes :
   Problème : 400 Bad Request sur /api/recipes/test
   Cause : Grille mal formatée ou validation backend stricte
   Statut : pas résolu
   Workaround : Placer exactement 3 ingrédients dans les 3 premières cases

3. Affichage Trésorerie :
   Problème : Trésorerie calculée backend mais pas affichée frontend
   Cause : Composant TreasuryDisplay créé mais non intégré
   Statut : Backend OK, frontend pas finaliser

4. Interface Globale :
   Problème : CSS ne se charge pas au premier lancement
   Solution : Rafraîchir la page (F5)
   Statut : Mineur

5. Stock Insuffisant :
   Problème : Anciens comptes n'ont pas de stock initial
   Solution : Créer un NOUVEAU compte pour avoir 50 unités de chaque
   Statut : Résolu pour les nouveaux comptes


📊 ÉTAT D'AVANCEMENT

Niveau    | Statut           | Completion | Commentaire
──────────┼──────────────────┼────────────┼────────────────────────────
10/20     | ✅ COMPLET       | 100%       | Auth + Labo fonctionnels
13/20     | ✅ COMPLET       | 100%       | Service temps réel OK
16/20     | ⚠️  PARTIEL      | 70%        | Backend OK, Frontend bloqué
18/20     | ❌ NON COMMENCÉ  | 0%         | Critique gastronomique
20/20     | ❌ NON COMMENCÉ  | 0%         | Docker, FIFO, Responsive

- TECHNOLOGIES UTILISÉES

Backend :
- Node.js v18
- Express.js v4.18
- MongoDB v6.0
- Mongoose v7.5
- Socket.IO v4.6
- JWT (jsonwebtoken v9.0)
- bcryptjs v2.4
- dotenv v16.3

Frontend :
- React v18.2
- React Router DOM v6.16
- Socket.IO Client v4.6
- CSS3 (design custom)


- Développement :
- Backend : Développement complet (auth, recettes, service, finances)
- Frontend : Développement partiel (pages principales, composants)
- Intégration : Bloquée au niveau 16 (problèmes d'affichage)

Note : 
Le backend du niveau 16 était entièrement fonctionnel. Lors de
l'intégration frontend, des bugs d'affichage sont apparus et malgré
les tentatives de debug de mon binôme, l'interface est restée bloquée.
Les fonctionnalités backend (transactions, stock, pénalités) existent
et fonctionnent, mais ne sont pas toutes visibles dans l'interface.
