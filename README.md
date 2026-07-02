# ⚙️ On the Quizz Again — Backend

API REST du projet **On the Quizz Again**, une application mobile de quiz géolocalisé.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🏗️ Architecture

```
src/
├── config/
│   └── db.ts                  # Connexion MongoDB
├── controllers/               # Logique métier par domaine
│   ├── authController.ts
│   ├── badgeController.ts
│   ├── iaController.ts
│   ├── questionController.ts
│   └── sessionController.ts
├── helpers/                   # Utilitaires transverses
│   ├── auth.ts                # Hash & vérification de mot de passe
│   ├── log.ts                 # Logger coloré
│   ├── sessionAssert.ts       # Assertions sur l'état d'une session
│   └── validators.ts          # Validation de champs
├── middlewares/
│   ├── error.ts               # Gestionnaire d'erreurs global (HttpError)
│   ├── evaluateBadges.ts      # Attribution automatique des badges
│   └── isAuthenticated.ts     # Vérification du token
├── models/                    # Schémas Mongoose
│   ├── Badge.ts
│   ├── Question.ts
│   ├── Session.ts
│   └── User.ts
├── routes/                    # Déclaration des endpoints
│   ├── authRoutes.ts
│   ├── badgeRoutes.ts
│   ├── iaRoutes.ts
│   ├── questionRoutes.ts
│   └── sessionRoutes.ts
├── services/                  # Accès aux données et logique réutilisable
│   ├── authService.ts
│   ├── badgeService.ts
│   ├── iaService.ts
│   ├── questionService.ts
│   └── sessionService.ts
├── types/
│   ├── express.d.ts           # Extension du type Request (user injecté)
│   └── types.ts               # Types partagés
├── constants.ts
└── server.ts                  # Point d'entrée
```

Le cycle de vie d'une requête suit une **architecture en couches stricte** :

```
server.ts → route → isAuthenticated? → controller → service → HttpError → error middleware → réponse JSON
```

---

## 🛠️ Stack technique

| Outil | Rôle |
|---|---|
| **Node.js** | Runtime JavaScript |
| **Express 5** | Framework HTTP |
| **MongoDB + Mongoose** | Base de données & ODM |
| **TypeScript** | Typage statique strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| **uid2** | Génération de tokens d'authentification |
| **crypto-js** | Hash des mots de passe (salt + hash) |
| **axios** | Appels HTTP vers l'API OpenRouter (IA) |
| **dotenv** | Gestion des variables d'environnement |
| **cors** | Gestion des origines cross-domain |
| **tsx** | Exécution TypeScript en développement |

---

## 🗃️ Modèles de données

### `User`

| Champ | Type | Description |
|---|---|---|
| `email` | String | Adresse email (unique) |
| `username` | String | Nom d'utilisateur |
| `token` | String | Token de session |
| `salt` / `hash` | String | Sécurisation du mot de passe |
| `badges` | EarnedBadge[] | Badges obtenus avec progression |

### `Question`

| Champ | Type | Description |
|---|---|---|
| `type` | `multipleChoice` \| `trueFalse` | Type de question |
| `question` | String | Intitulé de la question |
| `answers` | `{ id, text }[]` | Tableau de réponses |
| `solutionId` | String | Identifiant de la bonne réponse |
| `funFact` | String | Anecdote affichée après réponse |
| `localisation` | GeoJSON Point | Coordonnées GPS du lieu |
| `triggerRadius` | Number | Rayon de déclenchement (en mètres) |
| `targetAudience` | `parent` \| `child` \| `all` | Public cible |
| `locationTitle` | String | Nom du lieu |

> Index `2dsphere` sur `localisation` pour les requêtes géospatiales.

### `Session`

| Champ | Type | Description |
|---|---|---|
| `user` | ObjectId | Référence vers l'utilisateur |
| `players` | `{ name, isMainUser }[]` | Joueurs de la session |
| `screen` | `preparation` \| `inGame` \| `finish` | État de la partie |
| `difficulty` | `easy` \| `medium` \| `hard` | Niveau de difficulté |
| `frequency` | `{ type, value }` | Fréquence d'apparition des questions (distance ou temps) |
| `questionModes` | `multipleChoice[]` \| `trueFalse[]` | Modes de questions autorisés |
| `questions` | SessionQuestion[] | Questions jouées avec statut et joueur associé |
| `totalQuestions` | Number | Nombre total de questions prévu |

### `Badge`

| Champ | Type | Description |
|---|---|---|
| `code` | String | Identifiant unique du badge |
| `name` | String | Nom affiché |
| `description` | String | Condition d'obtention |
| `image` | String | URL de l'image |
| `value` | Number | Seuil de déclenchement |
| `color` | String | Couleur associée |

---

## 🔌 Endpoints

Toutes les routes protégées (✅) nécessitent un header `Authorization: Bearer <token>`.

### Auth — `/auth`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | ❌ | Inscription |
| `POST` | `/auth/login` | ❌ | Connexion |
| `GET` | `/auth/profile` | ✅ | Récupérer le profil |
| `PATCH` | `/auth/profile` | ✅ | Modifier le profil |
| `PATCH` | `/auth/profile/password` | ✅ | Changer le mot de passe |
| `POST` | `/auth/logout` | ✅ | Déconnexion |

### Sessions — `/session`

Toutes les routes retournent un objet `Session` avec les questions peuplées.

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/session` | ✅ | Créer une session |
| `GET` | `/sessions` | ✅ | Lister toutes les sessions |
| `GET` | `/session` | ✅ | Récupérer la dernière session |
| `GET` | `/session/:id` | ✅ | Récupérer une session par id |
| `PATCH` | `/session/:id` | ✅ | Mettre à jour une session |
| `POST` | `/session/:id/question` | ✅ | Ajouter une question à la session |
| `PATCH` | `/session/:id/question/:questionId` | ✅ | Répondre à une question |

### Questions — `/questions`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/questions/nearest` | ✅ | Trouver la question la plus proche des coordonnées GPS |

### Badges — `/badges`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/badges` | ✅ | Lister tous les badges disponibles |

### IA — `/ia`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/ia/question` | ✅ | Générer une question IA basée sur la position GPS |

---

## 🤖 Génération de questions par IA

L'endpoint `/ia/question` génère des questions culturelles à la volée via **OpenRouter** en s'appuyant sur la position GPS du véhicule.

- Le thème (géographie, gastronomie, art, sport, patrimoine…) est tiré aléatoirement parmi 9 catégories
- Le prompt adapte la difficulté selon le public cible (`enfants`, `adolescents`, `adultes`)
- Un système de **fallback automatique** tourne sur 8 modèles gratuits en rotation — si l'un est indisponible ou rate-limité, le suivant prend le relais automatiquement

---

## 🔐 Authentification

Le mot de passe est sécurisé à l'inscription via un `salt` aléatoire et un `hash` calculé avec `crypto-js`. Un `token` unique est généré via `uid2` et stocké en base.

Le middleware `isAuthenticated` extrait le token depuis le header `Authorization: Bearer <token>`, le recherche en base et injecte l'utilisateur dans `req.token` pour les routes protégées.

---

## 🎖️ Système de badges

Le middleware `evaluateBadges` est branché sur les routes de session (création, mise à jour, ajout/réponse à une question). Il s'exécute **avant** le contrôleur et évalue automatiquement si l'utilisateur a débloqué de nouveaux badges selon sa progression.

---

## 🚀 Lancer le projet

### Prérequis

- Node.js ≥ 18
- Une instance MongoDB (locale ou [MongoDB Atlas](https://www.mongodb.com/atlas))
- Une clé API [OpenRouter](https://openrouter.ai/) pour la génération de questions IA

### Installation

```bash
git clone <url-du-repo>
cd onthequizzagain-backend
npm install
```

### Variables d'environnement

```bash
cp .env.example .env
```

Renseignez les valeurs dans `.env` :

```env
URI_BD=mongodb+srv://<user>:<password>@cluster.mongodb.net/onthequizzagain
OPENROUTER_API_KEY=sk-or-...
PORT=3000
```

### Démarrage

```bash
# Développement (rechargement automatique)
npm run dev

# Production
npm run build && npm start
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`).
