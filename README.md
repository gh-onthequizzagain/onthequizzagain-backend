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

## Routes Session

Toutes les routes sont protégées par le middleware `isAuthenticated` (header `Authorization: Bearer <token>`).
Toutes retournent un objet `Session`. Les `questions` sont retournées avec l'objet `Question` complet (populate sur `questions.question`).

### `POST /session`

Crée une session vide associée à l'utilisateur connecté.

- **Auth** : requise
- **Params** : aucun
- **Body** : aucun
- **Retour** : la session avec les valeurs par défaut

### `GET /session`

Récupère la dernière session créée de l'utilisateur connecté.

- **Auth** : requise
- **Params** : aucun
- **Body** : aucun
- **Retour** : la session

### `GET /session/:id`

Récupère une session précise de l'utilisateur connecté.

- **Auth** : requise
- **Params** : `id` — id de la session
- **Body** : aucun
- **Retour** : la session

### `PATCH /session/:id`

Met à jour les champs de la session.

- **Auth** : requise
- **Params** : `id` — id de la session
- **Body** (tous optionnels) : `players`, `screen`, `stepIndex`, `title`, `frequency`, `difficulty`, `questionModes`, `hasNotification`
- **Retour** : la session mise à jour

Exemple de body (tout rempli) :

```json
{
  "title": "Balade dans Paris",
  "screen": "inGame",
  "stepIndex": 2,
  "difficulty": "hard",
  "hasNotification": true,
  "frequency": { "type": "distance", "value": 500 },
  "questionModes": ["multipleChoice", "trueFalse"],
  "players": [
    { "name": "matou", "isMainUser": true },
    { "name": "lea", "isMainUser": false },
    { "name": "bob", "isMainUser": false }
  ]
}
```

Valeurs des enums :

- `screen` : `preparation` | `inGame` | `finish`
- `difficulty` : `easy` | `medium` | `hard`
- `frequency.type` : `time` | `distance`
- `questionModes` : `multipleChoice` | `trueFalse`

### `POST /session/:id/question`

Crée une question dans la collection `Question` puis l'ajoute à la session.

- **Auth** : requise
- **Params** : `id` — id de la session
- **Body** : données de la question (`photo`, `locationTitle`, `locationDistance`, `question`, `answers`, `solutionId`, `type`, `coordinate`) + `playerName`
- **Note** : le `status` de la question dans la session est mis à `pending` par défaut
- **Retour** : la session avec la nouvelle question référencée

Exemple de body :

```json
{
  "photo": "https://upload.wikimedia.org/wikipedia/commons/coluche.jpg",
  "locationTitle": "Opio (Alpes-Maritimes)",
  "locationDistance": 0,
  "question": "Quel âge avait Rimbaud ?",
  "answers": [
    { "id": "a1", "text": "18 ans" },
    { "id": "a2", "text": "19 ans" },
    { "id": "a3", "text": "21 ans" }
  ],
  "solutionId": "a3",
  "type": "multipleChoice",
  "coordinate": { "lat": 43.6574426, "lon": 6.9888137 },
  "playerName": "matou"
}
```

### `PATCH /session/:id/question/:questionId`

Met à jour le status d'une question d'une session.

- **Auth** : requise
- **Params** : `id` — id de la session, `questionId` — id de la question
- **Body** : `status` (`pending` | `correctlyFound` | `incorrectlyFound`)
- **Retour** : la session mise à jour

Exemple de body :

```json
{ "status": "correctlyFound" }
```
