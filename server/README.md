# CommonGround API

Express 5 API for the CommonGround social development events platform.

## Local development

From the repository root, install the npm workspaces and create `server/.env` from `.env.example`:

```bash
npm install
cp server/.env.example server/.env
npm run dev:server
```

The API listens on `http://localhost:4000` by default. Check `GET /health` to confirm that the service is responding. The API requires the same MongoDB database and canonical Better Auth origin configured by the client.

## Security model

- Public reads are available for upcoming events and event details.
- Mutating and personal endpoints require `Authorization: Bearer <Better Auth JWT>`.
- The JWT is verified against the Better Auth JWKS endpoint; the verified subject is the user ID.
- Event ownership is checked in every update and delete query on the server.
- A unique `{ eventId, userId }` index prevents duplicate participation.
- Zod validation rejects invalid event data and dates that are not in the future.
- Helmet, an origin allowlist, JSON payload limits, and rate limiting are enabled.

See the root [README](../README.md) for environment variables, endpoint details, seed data, and deployment instructions.
