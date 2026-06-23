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

**Request lifecycle**: `server.ts` → `src/routes/` → throw `HttpError` on error → caught by `src/middlewares/error.ts` global handler → JSON response `{ message, code }`.

**Key conventions**:
- Raise errors in route handlers with `throw new HttpError("message", statusCode)` — the global error middleware handles the response.
- Use type guards from `src/helpers/validators.ts` (`isString`, `isEmail`, `isMongoId`, etc.) to validate request input at the boundary.
- Use `src/helpers/log.ts` helpers (`logInfo`, `logSuccess`, `logError`) instead of raw `console.log`.
- Password hashing lives in `src/helpers/auth.ts`: `generatePassword(password)` returns `{ hash, salt, token }`. Pass `salt` back in to verify.
- Shared response types (`JsonResponse<T>`, `MessageResponse`, `MongoId`) live in `src/types/types.ts`.

**MongoDB**: Connection is currently commented out in `server.ts`. To enable, call `connectDB("db_name")` from `src/config/db.ts`. Requires `URI_BD` env var.

**TypeScript**: Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` — index access returns `T | undefined` and optional properties must be explicitly typed.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `URI_BD` | When using MongoDB | MongoDB connection string (without db name) |
| `OPENROUTER_API_KEY` | For `/ia/question` route | API key from openrouter.ai |
