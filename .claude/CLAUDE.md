# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (ts-node-dev), port 3000
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled output (requires build first)
```

No test suite or linter is configured.

## Architecture

Express 5 + TypeScript + Mongoose backend for a quiz app ("on the quizz again"). Entry point is `src/server.ts`, which connects to MongoDB, mounts routers, and registers the global error handler **last**.

**Layered architecture** (enforced — see `src/CLAUDE.md` for the full French spec):

```
routes/ → controllers/ → services/ → models/
```

- **routes/** declare endpoints and attach middleware only. No business logic.
- **controllers/** read `req`, validate input, call services, send the HTTP response. No DB queries, no business logic.
- **services/** hold all business logic and Mongoose queries. Never touch `req`/`res`. Return plain data (e.g. `PublicUser`), never raw Mongoose docs — strip `hash`/`salt` before returning.
- **models/** define Mongoose schemas; export an `InferSchemaType`-derived `UserType`.

**Error handling**: Throw `new HttpError("message", statusCode)` (from `src/middlewares/error.ts`) anywhere in the request chain — including inside `async` controllers/services. Express 5 auto-forwards rejected promises to the global handler, which responds `{ message, code }`. The handler echoes the raw error message to the client, so keep `HttpError` messages client-safe.

**Auth flow**: Token-based, no JWT. `generatePassword(password, salt?)` in `src/helpers/auth.ts` returns `{ hash, salt, token }` — SHA256(password+salt) Base64-encoded, salt via `uid2(16)`, token via `uid2(64)`. On signup the token is persisted on the user; login recomputes the hash with the stored salt and compares. The `isAuthenticated` middleware only strips the `Bearer ` prefix and sets `req.token` — it does **not** verify the token. Actual verification happens in the service (`getProfile` looks the token up in the DB). `req.token` is typed via `src/types/express.d.ts`.

**Endpoints**: `POST /auth/signup`, `POST /auth/login`, `GET /auth/profile` (protected). `GET /` is a welcome route; a catch-all returns 404. See `src/routes/`.

## Conventions

- Validate request input at the controller boundary with the type guards in `src/helpers/validators.ts` (`isString`, `isEmail`, `isMongoId`, `isDate`, etc.).
- Use logging helpers from `src/helpers/log.ts` (`logInfo`, `logSuccess`, `logError`, `logBasic`) instead of raw `console.log`.
- Constants (port, color codes) live in `src/constants.ts`. `PORT_SERVER` is currently hardcoded to `3000`.
- **TypeScript strict mode** with `noUncheckedIndexedAccess` (index access returns `T | undefined`) and `exactOptionalPropertyTypes` (optional props must be explicitly typed including `undefined`).

## Database

`connectDB("onthequizzagain")` is called in `src/server.ts` and connects to `${URI_BD}/onthequizzagain`. Note `connectDB` swallows connection errors (only `console.error`), so the server starts even if MongoDB is unreachable — DB-dependent routes will then fail at query time.

## Environment variables

| Variable | Required | Purpose                                              |
| -------- | -------- | ---------------------------------------------------- |
| `URI_BD` | Yes      | MongoDB connection string base (db name is appended) |
