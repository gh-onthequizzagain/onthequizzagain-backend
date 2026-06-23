# SKILL: Authentification Bakend

# API Authentification- Express.js & MongoDB

## Objectif

Développer une API REST sécurisée d’authentification en respectant les bonnes pratiques Node.js et une architecture en couches.

## Stack technique

- Express.js
- MongoDB
- Mongoose
- Axios
- CORS
- UID2
- CryptoJS
- dotenv

---

# Architecture du projet

```
src/
│
├── controllers/
│   └── authController.js
│
├── services/
│   └── authService.js
│
├── models/
│   └── User.js
│
├── routes/
│   └── authRoutes.js
│
├── middlewares/
│   ├── isAuthenticated.js
│   └── errorHandler.js
│
├── config/
│   ├── database.js
│   └── cors.js
│
├── app.js
│
└── server.js
```

---

# Règles d’architecture

## Controllers

Responsabilités :

- Lire les données de la requête.
- Appeler les services.
- Retourner une réponse HTTP.
- Gérer les erreurs applicatives.

Interdictions :

- Aucune requête MongoDB.
- Aucune logique métier.
- Aucun traitement complexe.

---

## Services

Responsabilités :

- Contenir toute la logique métier.
- Interagir avec les modèles MongoDB.
- Générer les tokens.
- Chiffrer les mots de passe.
- Appeler des APIs externes via Axios.

Interdictions :

- Ne jamais utiliser `req` ou `res`.

---

## Models

Responsabilités :

- Définir les schémas Mongoose.
- Définir les contraintes de validation.
- Définir les index.

---

## Routes

Responsabilités :

- Déclarer les endpoints.
- Associer les middlewares.
- Appeler les contrôleurs.

Interdictions :

- Aucune logique métier.

---

## Middlewares

Responsabilités :

- Authentification.
- Validation.
- Gestion globale des erreurs.
- Journalisation.

---

## Config

Responsabilités :

- Connexion MongoDB.
- Configuration CORS.
- Variables d’environnement.
- Paramètres globaux.

---

# Modèle User

```jsx
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    account: {
      username: {
        type: String,
        required: true,
      },
    },

    token: {
      type: String,
      required: true,
    },

    salt: {
      type: String,
      required: true,
    },

    hash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", UserSchema);
```

---

# Gestion des mots de passe

Avec CryptoJS :

```jsx
const uid2 = require("uid2");
const CryptoJS = require("crypto-js");

const salt = uid2(16);

const hash = CryptoJS.SHA256(password + salt).toString(CryptoJS.enc.Hex);
```

Ne jamais stocker :

```jsx
password: "123456";
```

Toujours stocker :

```jsx
{
  (salt, hash);
}
```

---

# Génération de token

```jsx
const uid2 = require("uid2");

const token = uid2(64);
```

Utilisations :

- Authentification
- Session API
- Réinitialisation de mot de passe

---

# Middleware d’authentification

```jsx
module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authorization.replace("Bearer ", "");

    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};
```

---

# Endpoints d’authentification

## POST /auth/signup

Créer un utilisateur.

Étapes :

1. Vérifier les champs obligatoires.
2. Vérifier l’unicité de l’email.
3. Générer un salt.
4. Générer un hash.
5. Générer un token.
6. Sauvegarder l’utilisateur.
7. Retourner les données publiques.

---

## POST /auth/login

Connecter un utilisateur.

Étapes :

1. Rechercher l’utilisateur.
2. Recalculer le hash.
3. Comparer les hash.
4. Retourner le token.

---

## GET /auth/profile

Retourner le profil connecté.

Protection :

```
Authorization: Bearer TOKEN
```

Middleware :

```jsx
router.get("/auth/profile", isAuthenticated, profileController);
```

---

# Axios

Utiliser Axios pour communiquer avec des APIs externes.

```jsx
const axios = require("axios");

const response = await axios.get("https://api.example.com/users");
```

Toujours utiliser :

```jsx
try {
  const response = await axios.get(url);
} catch (error) {
  console.error(error);
}
```

---

# Méthodes HTTP

| Méthode | Utilisation          |
| ------- | -------------------- |
| GET     | Lecture              |
| POST    | Création             |
| PUT     | Remplacement complet |
| DELETE  | Suppression          |

---

# Codes HTTP

| Code | Signification         |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

# Bonnes pratiques

Toujours :

- Utiliser async/await.
- Utiliser try/catch.
- Valider les entrées utilisateur.
- Utiliser des variables d’environnement.
- Retourner des réponses JSON cohérentes.
- Séparer strictement controllers et services.

Ne jamais :

- Mettre des requêtes MongoDB dans les routes.
- Mettre de la logique métier dans les contrôleurs.
- Stocker des mots de passe en clair.
- Exposer le hash ou le salt dans les réponses API.
- Dupliquer du code.

---

# Objectif final

Produire une API REST :

- Maintenable
- Sécurisée
- Testable
- Évolutive
- Conforme aux standards Express.js et MongoDB
