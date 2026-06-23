# Changements — Model User & Routes User (auth)

Ce document liste les modifications apportées au **model User** et aux **routes
utilisateur (authentification)**.

---

## 1. Model User (`src/models/User.ts`)

### Problème corrigé

Le middleware `src/middlewares/auth.ts` importait `UserModel` et `UserDocument`
depuis `../models/User`, mais ces deux exports **n'existaient pas** : le fichier
n'exposait qu'un `export default model(...)` et le type `UserType`. Le projet ne
compilait donc pas.

### Changements

| Avant                                                                                | Après                                                                                                      |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `export default model<UserType>("User", UserSchema);` (export par défaut uniquement) | Le modèle est créé **une seule fois**, exporté en **named export** `UserModel` **et** en export par défaut |
| Pas de type document                                                                 | Ajout du type `UserDocument = HydratedDocument<UserType>`                                                  |
| Import de `Types` seul                                                               | Import de `HydratedDocument` en plus                                                                       |

### Exports désormais disponibles

```ts
export type UserType = InferSchemaType<typeof UserSchema> & {
  _id?: Types.ObjectId;
};
export type UserDocument = HydratedDocument<UserType>; // ✅ nouveau
export const UserModel = model<UserType>("User", UserSchema); // ✅ nouveau (named)
export default UserModel; // conservé (utilisé par authService.ts)
```

> ⚠️ Le modèle n'est instancié qu'une fois (`model("User", ...)`) pour éviter
> l'erreur Mongoose `OverwriteModelError`. Le schéma (champs `email`, `username`,
> `token`, `salt`, `hash`, `timestamps`) **n'a pas changé**.

---

## 2. Routes User / Authentification

### 2.1 `src/routes/authRoutes.ts`

| Avant  
| `import isAuthenticated from "../middlewares/isAuthenticated";` (fichier **supprimé**) |

| Après :
| `import { isAuthenticated } from "../middlewares/auth";` (named export) |

Les endpoints restent inchangés :

| Méthode | Route           | Contrôleur          |
| ------- | --------------- | ------------------- |
| POST    | `/auth/signup`  | `signupController`  |
| POST    | `/auth/login`   | `loginController`   |
| GET     | `/auth/profile` | `profileController` |

### 2.2 `src/middlewares/auth.ts`

Le middleware d'authentification attachait uniquement `req.user`. Or le
`profileController` existant lit `req.token`. Pour ne rien casser :

```ts
(req as AuthRequest).user = user;
req.token = token; // ✅ ajouté : on expose aussi le token brut
next();
```

### 2.3 `src/types/express.d.ts`

Ajout de la propriété `user` sur l'objet `Request` d'Express (en plus de
`token`), via `declare global` pour que l'augmentation soit bien prise en compte.

```ts
import type { UserDocument } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: UserDocument; // ✅ nouveau
    }
  }
}
export {};
```

---

## 3. Routes Ajoutés pour Question et Session

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
