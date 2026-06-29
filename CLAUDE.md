# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled output (requires build first)
```

No test suite is configured yet.

## Architecture

Express 5 + TypeScript backend for a quiz app. Entry point is `src/server.ts`.

**Layered architecture** (strict separation — no skipping layers):
- **Routes** (`src/routes/`): declare endpoints, attach middlewares, call controllers. No logic.
- **Controllers** (`src/controllers/`): validate request input, call services, return HTTP response. No DB access.
- **Services** (`src/services/`): all business logic and Mongoose queries. Never touches `req`/`res`.
- **Models** (`src/models/`): Mongoose schemas only.

**Request lifecycle**: `server.ts` → route → optional `isAuthenticated` middleware → controller → service → throw `HttpError` on error → caught by `src/middlewares/error.ts` → JSON response `{ message, code }`.

**Key conventions**:
- Raise errors anywhere with `throw new HttpError("message", statusCode)` — the global error middleware catches it.
- Validate request input in controllers with type guards from `src/helpers/validators.ts` (`isString`, `isEmail`, `isMongoId`, etc.).
- Use `src/helpers/log.ts` helpers (`logInfo`, `logSuccess`, `logError`) instead of `console.log`.
- Password hashing in `src/helpers/auth.ts`: `generatePassword(password)` returns `{ hash, salt, token }`. Pass `salt` back in to verify: `generatePassword(password, user.salt)`.
- Shared response types (`JsonResponse<T>`, `MessageResponse`, `MongoId`) live in `src/types/types.ts`.
- `PublicUser` type (returned by all auth service functions) lives in `src/services/authService.ts`: `{ _id, email, username, token }`.

**Authentication**:
- `isAuthenticated` middleware (`src/middlewares/isAuthenticated.ts`) extracts `Bearer TOKEN` from `Authorization` header and sets `req.token`.
- `req.token` is typed via `src/types/express.d.ts` (Express namespace augmentation). Add `/// <reference path="../types/express.d.ts" />` at the top of any file that accesses `req.token`.
- Protected routes pass the token down to a service that looks up the user: `User.findOne({ token })`.

**MongoDB**: Active — `connectDB("onthequizzagain")` is called in `server.ts` via `src/config/db.ts`. Requires `URI_BD` env var.

**TypeScript**: Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` — index access returns `T | undefined` and optional properties must be explicitly typed.

## Auth endpoints

| Method | Path | Auth | Status |
|---|---|---|---|
| POST | `/auth/signup` | — | implemented |
| POST | `/auth/login` | — | implemented |
| GET | `/auth/profile` | Bearer | implemented |
| PATCH | `/auth/profile` | Bearer | stub |
| PATCH | `/auth/password` | Bearer | stub |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `URI_BD` | Yes | MongoDB connection string (without db name) |
| `PORT` | No | Server port (defaults to undefined — Express picks a port) |
