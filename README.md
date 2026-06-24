# on the quizz again back

## Routes Ajoutés pour Question et Session

| GET | `/questions/nearby` | Questions proches d'une position. Query : `lng`, `lat`, `public?`. |

| POST | `/sessions` | Démarre une partie. Body : `{ routeName? }`. |

| PATCH | `/sessions/:id` | Enregistre une réponse et met à jour le score. Body : `{ questionId, responseGiven, finished? }`. |

| GET | `/sessions/:id/history` | Historique des parties de l'utilisateur (`:id` = id utilisateur). |

## Détails importants

- **Géolocalisation** (`/questions/nearby`) : la requête utilise une agrégation
  `$geoNear` (distance sphérique en mètres) limitée à `MAX_SEARCH_RADIUS` (50 km), puis un
  `$match` ne conserve que les questions dont la distance réelle est **≤ leur propre
  `triggerRadius`**. Le filtre `public` inclut toujours les questions `"tous"`.
- **Sécurité du scoring** : `correctAnswer` n'est **jamais** renvoyée par `/nearby`
  (`$project: { correctAnswer: 0 }`). La correction est faite côté serveur dans le `PATCH`,
  et `totalScore` est recalculé à partir des réponses correctes.
- **Cloisonnement** : une session n'est modifiable que par son propriétaire (403 sinon) ;
  un utilisateur ne peut consulter que son propre historique (403 sinon).

# Modifications des routes Session - 2026-06-24

Suivi des améliorations apportées aux routes/services de session.

## Point 1 : sécurisation du scoring

Fichier modifié : `src/services/sessionService.ts`

### Contexte

La logique de scoring présentait des failles permettant de fausser le `totalScore`
ou de modifier une partie déjà close. Le scoring étant calculé côté serveur, ces
contrôles doivent être faits dans le service.

### `answerQuestion`

- **Partie terminée** : on refuse désormais toute réponse si `session.endDate`
  est défini → `HttpError("Cette partie est déjà terminée", 409)`.
- **Réponse en double** : une même `questionId` ne peut plus être répondue
  plusieurs fois (empêchait de gonfler le score en spammant la bonne réponse)
  → `HttpError("Question déjà répondue", 409)`. La vérification se fait sur
  `session.answeredQuestions` avant d'aller chercher la question en base.

### `endSession`

- **Double clôture** : on refuse de terminer une partie déjà terminée
  (`session.endDate` défini) afin de ne pas écraser la date de fin
  → `HttpError("Cette partie est déjà terminée", 409)`.

### Codes HTTP utilisés

| Cas                    | Code | Message                        |
| ---------------------- | ---- | ------------------------------ |
| Partie déjà terminée   | 409  | Cette partie est déjà terminée |
| Question déjà répondue | 409  | Question déjà répondue         |

---

## Point 2 : routes de lecture

Fichiers modifiés : `src/services/sessionService.ts`,
`src/controllers/sessionController.ts`, `src/routes/sessionRoutes.ts`

### `GET /sessions` — liste paginée

- Service `listSessions(userId, page, limit)` : renvoie les parties de
  l'utilisateur, triées par `startDate` décroissante, plus un bloc `pagination`
  (`page`, `limit`, `total`, `totalPages`). `find` + `countDocuments` lancés en
  parallèle via `Promise.all`.
- Controller `listSessionsController` : lit `?page` et `?limit` dans la query,
  avec garde-fous (`page` ≥ 1, `limit` borné entre 1 et 100, défaut 20).

Réponse :

```json
{
  "sessions": [
    /* ... */
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### `GET /sessions/:id` — détail d'une partie

- Service `getSession(sessionId, userId)` : renvoie la session si elle
  appartient à l'utilisateur, sinon `HttpError("Session introuvable", 404)`.
- Controller `getSessionController` : valide l'`id` (`isMongoId`) → `400` sinon.

### Ordre des routes

`GET /:id` est déclaré **après** `GET /:id/history` pour éviter tout conflit de
matching, et `GET /` après `POST /`.

### Récapitulatif des endpoints session

```
POST   /sessions             → créer une partie
GET    /sessions             → lister (paginé) les parties de l'utilisateur
PATCH  /sessions/:id         → répondre à une question OU terminer
GET    /sessions/:id         → détail d'une partie
GET    /sessions/:id/history → historique + score
```

---
