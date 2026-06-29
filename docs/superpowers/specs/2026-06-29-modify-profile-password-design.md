# Design : modifyProfileController & passwordController

## Contexte

Deux endpoints `PATCH` déjà déclarés dans `authRoutes.ts` et protégés par `isAuthenticated`. Les controllers sont des stubs vides. Ce spec couvre leur implémentation complète.

## Architecture (Option A — un service par endpoint)

Suit le pattern existant : controller valide l'input → appelle service → service fetch user par token, applique logique métier, retourne `PublicUser`.

---

## PATCH /auth/profile

### Controller (`authController.ts` — `modifyProfileController`)

- Source : `req.token` (injecté par `isAuthenticated`)
- Body : `{ username?, email? }`
- Validation : au moins un des deux champs présent et valide (`isString(username)` ou `isEmail(email)`)
- Erreur si aucun champ valide : `HttpError("Missing or invalid fields", 400)`
- Appelle `authService.modifyProfile(token, { username, email })`
- Retourne `200` + `PublicUser`

### Service (`authService.ts` — `modifyProfile`)

Signature : `modifyProfile(token: string, fields: { username?: string; email?: string }): Promise<PublicUser>`

1. `User.findOne({ token })` → `HttpError("Unauthorized", 401)` si absent
2. Si `email` fourni : `User.findOne({ email })` → `HttpError("Email already in use", 409)` si pris par un autre user (vérifier `_id` différent)
3. `User.findOneAndUpdate({ token }, fields, { new: true })` avec uniquement les champs fournis
4. Retourne `{ _id, email, username, token }`

---

## PATCH /auth/password

### Controller (`authController.ts` — `passwordController`)

- Source : `req.token`
- Body : `{ currentPassword, newPassword }`
- Validation : les deux doivent être `isString`
- Erreur si invalide : `HttpError("Missing or invalid fields", 400)`
- Appelle `authService.changePassword(token, currentPassword, newPassword)`
- Retourne `200` + `PublicUser`

### Service (`authService.ts` — `changePassword`)

Signature : `changePassword(token: string, currentPassword: string, newPassword: string): Promise<PublicUser>`

1. `User.findOne({ token })` → `HttpError("Unauthorized", 401)` si absent
2. `generatePassword(currentPassword, user.salt)` → compare `hash` → `HttpError("Invalid credentials", 401)` si incorrect
3. `generatePassword(newPassword)` → nouveaux `hash`, `salt`, `token`
4. `User.findOneAndUpdate({ token }, { hash, salt, token: newToken }, { new: true })`
5. Retourne `PublicUser` avec le **nouveau token**

> **Token rotation** : le changement de mot de passe invalide l'ancien token. Le client doit stocker le nouveau token retourné.

---

## Fichiers à modifier

| Fichier | Changement |
|---|---|
| `src/controllers/authController.ts` | Implémenter `modifyProfileController` et `passwordController` |
| `src/services/authService.ts` | Ajouter `modifyProfile` et `changePassword` |
