# on the quizz again back

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine du projet :

```env
PORT=3000
URI_BD=mongodb://localhost:27017
```

## Commandes

```bash
npm run dev    # Démarre le serveur en mode développement (hot reload)
npm run build  # Compile le TypeScript vers dist/
npm start      # Lance le serveur compilé (nécessite un build avant)
```

## Routes

### Général

| Méthode | Chemin | Auth | Description          |
| ------- | ------ | ---- | -------------------- |
| GET     | `/`    | —    | Message de bienvenue |

### Authentification

| Méthode | Chemin                   | Auth   | Description                           |
| ------- | ------------------------ | ------ | ------------------------------------- |
| POST    | `/auth/signup`           | —      | Créer un compte                       |
| POST    | `/auth/login`            | —      | Se connecter                          |
| GET     | `/auth/profile`          | Bearer | Récupérer son profil                  |
| PATCH   | `/auth/profile`          | Bearer | Modifier son profil (email, username) |
| PATCH   | `/auth/profile/password` | Bearer | Modifier son mot de passe             |
| POST    | `/auth/logout`           | Bearer | Se déconnecter                        |

### Session

Toutes les routes sont protégées par le middleware `isAuthenticated` (header `Authorization: Bearer <token>`).
Toutes retournent un objet `Session`. Les `questions` sont retournées avec l'objet `Question` complet (populate sur `questions.question`).

| Méthode | Chemin                              | Auth   | Description                                        |
| ------- | ----------------------------------- | ------ | -------------------------------------------------- |
| POST    | `/session`                          | Bearer | Créer une session vide pour l'utilisateur connecté |
| GET     | `/session`                          | Bearer | Récupérer la dernière session de l'utilisateur     |
| GET     | `/session/:id`                      | Bearer | Récupérer une session précise                      |
| PATCH   | `/session/:id`                      | Bearer | Mettre à jour les champs de la session             |
| POST    | `/session/:id/question`             | Bearer | Créer une question et l'ajouter à la session       |
| PATCH   | `/session/:id/question/:questionId` | Bearer | Mettre à jour le status d'une question             |
