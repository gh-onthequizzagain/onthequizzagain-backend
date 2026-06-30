# modifyProfile & changePassword Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter `modifyProfileController` (patch partiel username/email) et `passwordController` (vérification ancien MDP + rotation token) selon l'architecture en couches existante.

**Architecture:** Controller valide l'input → appelle le service → service fetch l'user par token, applique la logique métier, retourne `PublicUser`. Deux services à ajouter dans `authService.ts`, deux controllers à remplir dans `authController.ts`.

**Tech Stack:** Express 5, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Mongoose, uid2, crypto-js

## Global Constraints

- Toujours `throw new HttpError(message, statusCode)` — jamais de `res.status().json()` dans les services
- Retourner uniquement `{ _id, email, username, token }` (type `PublicUser`) — jamais `hash`, `salt`
- Valider l'input dans le controller avec les type guards de `src/helpers/validators.ts`
- Utiliser `logInfo / logSuccess / logError` de `src/helpers/log.ts` si besoin de logs (pas `console.log`)
- Pas de suite de tests configurée — vérification manuelle avec curl

---

### Task 1: modifyProfile — service + controller

**Files:**
- Modify: `src/services/authService.ts`
- Modify: `src/controllers/authController.ts`

**Interfaces:**
- Consumes: `User.findOne`, `User.findOneAndUpdate`, `HttpError`, `PublicUser`
- Produces: `authService.modifyProfile(token: string, fields: { username?: string; email?: string }): Promise<PublicUser>`

- [ ] **Step 1: Ajouter `modifyProfile` dans `src/services/authService.ts`**

Ajouter après la fonction `getProfile` existante :

```typescript
export const modifyProfile = async (
  token: string,
  fields: { username?: string; email?: string },
): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  if (fields.email !== undefined) {
    const existing = await User.findOne({ email: fields.email });
    if (existing && !existing._id?.equals(user._id)) {
      throw new HttpError("Email already in use", 409);
    }
  }

  const updated = await User.findOneAndUpdate({ token }, fields, { new: true });
  if (!updated) throw new HttpError("Unauthorized", 401);

  return {
    _id: updated._id,
    email: updated.email,
    username: updated.username,
    token: updated.token,
  };
};
```

- [ ] **Step 2: Implémenter `modifyProfileController` dans `src/controllers/authController.ts`**

Remplacer le stub vide :

```typescript
export const modifyProfileController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { username, email } = req.body;

  if (!isString(username) && !isEmail(email)) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const fields: { username?: string; email?: string } = {};
  if (isString(username)) fields.username = username;
  if (isEmail(email)) fields.email = email;

  const user = await authService.modifyProfile(token, fields);
  res.status(200).json(user);
};
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

```bash
npm run build
```

Attendu : aucune erreur TypeScript.

- [ ] **Step 4: Tester manuellement**

Démarrer le serveur : `npm run dev`

Signup pour obtenir un token :
```bash
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"alice","password":"secret"}' | jq .
```

Modifier uniquement le username :
```bash
curl -s -X PATCH http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"username":"alice2"}' | jq .
```
Attendu : 200, `username` = `"alice2"`, `email` inchangé.

Modifier uniquement l'email :
```bash
curl -s -X PATCH http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"email":"newemail@test.com"}' | jq .
```
Attendu : 200, `email` = `"newemail@test.com"`.

Tenter un email déjà utilisé (créer d'abord un second user avec `newemail@test.com`) :
```bash
curl -s -X PATCH http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"email":"newemail@test.com"}' | jq .
```
Attendu : 409, `{ "message": "Email already in use", "code": 409 }`.

Body vide :
```bash
curl -s -X PATCH http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{}' | jq .
```
Attendu : 400, `{ "message": "Missing or invalid fields", "code": 400 }`.

- [ ] **Step 5: Commit**

```bash
git add src/services/authService.ts src/controllers/authController.ts
git commit -m "feat: implement modifyProfile service and controller"
```

---

### Task 2: changePassword — service + controller

**Files:**
- Modify: `src/services/authService.ts`
- Modify: `src/controllers/authController.ts`

**Interfaces:**
- Consumes: `User.findOne`, `User.findOneAndUpdate`, `generatePassword`, `HttpError`, `PublicUser`
- Produces: `authService.changePassword(token: string, currentPassword: string, newPassword: string): Promise<PublicUser>`

- [ ] **Step 1: Ajouter `changePassword` dans `src/services/authService.ts`**

Ajouter après `modifyProfile` :

```typescript
export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const { hash } = generatePassword(currentPassword, user.salt);
  if (hash !== user.hash) throw new HttpError("Invalid credentials", 401);

  const {
    hash: newHash,
    salt: newSalt,
    token: newToken,
  } = generatePassword(newPassword);

  const updated = await User.findOneAndUpdate(
    { token },
    { hash: newHash, salt: newSalt, token: newToken },
    { new: true },
  );
  if (!updated) throw new HttpError("Unauthorized", 401);

  return {
    _id: updated._id,
    email: updated.email,
    username: updated.username,
    token: updated.token,
  };
};
```

- [ ] **Step 2: Implémenter `passwordController` dans `src/controllers/authController.ts`**

Remplacer le stub vide :

```typescript
export const passwordController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { currentPassword, newPassword } = req.body;

  if (!isString(currentPassword) || !isString(newPassword)) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const user = await authService.changePassword(token, currentPassword, newPassword);
  res.status(200).json(user);
};
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

```bash
npm run build
```

Attendu : aucune erreur TypeScript.

- [ ] **Step 4: Tester manuellement**

Signup pour obtenir un token :
```bash
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"pw@test.com","username":"bob","password":"oldpass"}' | jq .
```

Changer le mot de passe :
```bash
curl -s -X PATCH http://localhost:3000/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"currentPassword":"oldpass","newPassword":"newpass"}' | jq .
```
Attendu : 200, nouveau `token` dans la réponse (différent de l'ancien).

Vérifier que l'ancien token est invalide :
```bash
curl -s -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <ANCIEN_TOKEN>" | jq .
```
Attendu : 401 `{ "message": "Unauthorized", "code": 401 }`.

Se connecter avec le nouveau token :
```bash
curl -s -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <NOUVEAU_TOKEN>" | jq .
```
Attendu : 200, profil de l'user.

Mauvais ancien mot de passe :
```bash
curl -s -X PATCH http://localhost:3000/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <NOUVEAU_TOKEN>" \
  -d '{"currentPassword":"wrongpass","newPassword":"anything"}' | jq .
```
Attendu : 401 `{ "message": "Invalid credentials", "code": 401 }`.

- [ ] **Step 5: Commit**

```bash
git add src/services/authService.ts src/controllers/authController.ts
git commit -m "feat: implement changePassword service and controller with token rotation"
```
