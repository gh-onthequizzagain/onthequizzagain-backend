# on the quizz again back

## Routes Ajoutés pour Question et Session

| GET | `/questions/nearby` | Questions proches d'une position. Query : `lng`, `lat`, `public?`. |

| POST | `/sessions` | Démarre une partie. Body : `{ nomTrajet? }`. |

| PATCH | `/sessions/:id` | Enregistre une réponse et met à jour le score. Body : `{ questionId, reponseDonnee, terminer? }`. |

| GET | `/sessions/:id/history` | Historique des parties de l'utilisateur (`:id` = id utilisateur). |

## 4. Détails importants

- **Géolocalisation** (`/questions/nearby`) : la requête utilise une agrégation
  `$geoNear` (distance sphérique en mètres) limitée à `MAX_SEARCH_RADIUS` (50 km), puis un
  `$match` ne conserve que les questions dont la distance réelle est **≤ leur propre
  `rayonDeclenchement`**. Le filtre `public` inclut toujours les questions `"tous"`.
- **Sécurité du scoring** : `bonneReponse` n'est **jamais** renvoyée par `/nearby`
  (`$project: { bonneReponse: 0 }`). La correction est faite côté serveur dans le `PATCH`,
  et `scoreTotal` est recalculé à partir des réponses correctes.
- **Cloisonnement** : une session n'est modifiable que par son propriétaire (403 sinon) ;
  un utilisateur ne peut consulter que son propre historique (403 sinon).
