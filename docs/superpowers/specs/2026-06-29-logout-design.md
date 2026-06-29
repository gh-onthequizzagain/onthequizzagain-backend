# Design : Endpoint de déconnexion

## Contexte

L'application utilise une authentification par token Bearer stocké en base MongoDB. Le token est généré à l'inscription et reste valide jusqu'à sa rotation (ex: changement de mot de passe). Il n'existe pas encore de mécanisme de déconnexion côté serveur.

## Objectif

Ajouter `POST /auth/logout` qui invalide le token actuel en en générant un nouveau en base, rendant l'ancien inutilisable.

## Approche retenue : rotation de token

Générer un nouveau token uid2 et le sauvegarder en DB. L'ancien token devient immédiatement invalide. Cohérent avec le pattern existant dans `changePassword`.

Alternatives rejetées :
- **Mise à null** : schéma Mongoose a `token: required: true`, nécessite refactor du schéma.
- **Blacklist** : complexité inutile pour cette app.

## Implémentation

### Route

```
POST /auth/logout
Authorization: Bearer <token>
```

Protégée par le middleware `isAuthenticated`.

### Service — `authService.ts`

```ts
export const logout = async (token: string): Promise<void> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const { token: newToken } = generatePassword(uid2(16));
  await User.findOneAndUpdate({ token }, { token: newToken });
};
```

### Controller — `authController.ts`

```ts
export const logoutController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);
  await authService.logout(token);
  res.status(200).json({ message: "Logged out successfully" });
};
```

### Route — `authRoutes.ts`

```ts
router.post("/auth/logout", isAuthenticated, logoutController);
```

## Réponses HTTP

| Cas | Code | Body |
|-----|------|------|
| Succès | 200 | `{ message: "Logged out successfully" }` |
| Token manquant / invalide | 401 | `{ message: "Unauthorized", code: 401 }` |

## Fichiers à modifier

1. `src/services/authService.ts` — ajouter `logout`
2. `src/controllers/authController.ts` — ajouter `logoutController`
3. `src/routes/authRoutes.ts` — ajouter la route
