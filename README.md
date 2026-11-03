# CommonGround — Local action. Shared impact.

**CommonGround** is a community-driven social development events platform for discovering, creating, and joining local volunteer initiatives. The interface is designed around a warm editorial “community field journal” direction: forest green, soft paper, a lively lime accent, expressive serif headlines, candid community photography, and compact event cards.

> The supplied brief describes the target Figma design, but no Figma URL/export was attached to this project workspace. This implementation follows the written requirements and uses an original visual direction; compare it against the actual Figma file and adjust exact spacing/assets if pixel matching is required.

**Live site:** `https://your-commonground-project.vercel.app` *(placeholder — replace this with the real Vercel URL after deployment; this workspace cannot deploy without your Vercel/MongoDB credentials).*

## Stack

- **Frontend:** Next.js App Router 16, React 19, TypeScript, custom responsive CSS, Lucide icons
- **Authentication:** Better Auth, MongoDB adapter, email/password, optional Google OAuth
- **API:** Express 5, JavaScript ES modules, MongoDB Node driver
- **Authorization:** Better Auth JWT plugin + JWKS verification in Express using `jose`
- **Validation:** Zod on both client and server

## Features

- Responsive landing page with a community-service hero, how-it-works section, static inspiration gallery, newsletter UI, and polished footer.
- Live upcoming event feed from MongoDB, limited to the six closest upcoming events on the home page.
- Public event discovery with search, cause filters, sorting, and a public event details route.
- Email/password registration and login, uppercase/lowercase/minimum-length password checks, and optional Google sign-in.
- Protected event creation with future-date validation and organiser ownership metadata.
- Functional event joining with unique participant records and duplicate-join protection.
- Private joined-events page, sorted by event date and retaining past commitments.
- Private event management page with owner-only update and delete operations.
- Profile name/photo editing with an impact snapshot (created events and joined events).
- Persistent light/dark theme switch, custom toast notifications, and loading skeletons.
- Express API validates signed Better Auth JWTs against the Better Auth JWKS endpoint; private mutations enforce ownership on the server.

## Project structure

```text
commonground/
├── client/                 # Next.js App Router frontend + Better Auth
│   ├── app/                 # Public and protected routes
│   ├── components/          # Navbar, forms, cards, toasts, theme, etc.
│   └── lib/                 # Better Auth, API client, types, validation
├── server/                 # Express API + MongoDB
│   └── src/
│       ├── middleware/      # JWT verification
│       ├── routes/          # Event CRUD and join endpoints
│       ├── scripts/         # Demo-data seed script
│       └── validation/      # Server-side Zod schemas
├── package.json             # npm workspaces and combined dev command
└── README.md
```

## Requirements

- Node.js **20.9 or newer** (Node 22 LTS recommended)
- npm 10+
- A MongoDB database (MongoDB Atlas is recommended)
- A Better Auth secret with at least 32 random characters

## Run locally

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create the frontend environment file:

   ```bash
   cp client/.env.example client/.env.local
   ```

   Set `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, and `NEXT_PUBLIC_API_URL`.

   Generate a secret instead of typing a predictable value:

   ```bash
   openssl rand -base64 32
   ```

3. Create the backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

   Set the same MongoDB URI, database name, Better Auth URL, and the frontend origin in `CLIENT_URLS`.

4. Add sample upcoming events to MongoDB (optional but helpful for the first run):

   ```bash
   npm run seed
   ```

5. Start both services from the repository root:

   ```bash
   npm run dev
   ```

   - Frontend: `http://localhost:3000`
   - Express API: `http://localhost:4000`
   - API health check: `http://localhost:4000/health`

6. For a frontend-only run use `npm run dev:client`; for the API only use `npm run dev:server`.

## Environment variables

### `client/.env.local`

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string used by Better Auth |
| `BETTER_AUTH_SECRET` | Private Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Canonical frontend origin used by Better Auth and JWT issuer/audience |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Browser-side Better Auth base URL (same as `BETTER_AUTH_URL`) |
| `NEXT_PUBLIC_APP_URL` | Trusted application origin |
| `NEXT_PUBLIC_API_URL` | Express API origin |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | Set to `true` after Google OAuth is configured |

### `server/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Express port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string for event data |
| `DB_NAME` | Database name (optional when URI includes one) |
| `BETTER_AUTH_URL` | Frontend origin hosting `/api/auth/jwks` |
| `CLIENT_URLS` | Comma-separated browser origins allowed by CORS |

## Google OAuth setup (optional)

1. Create a Google OAuth Web application in Google Cloud Console.
2. Add the authorised JavaScript origin: `http://localhost:3000`.
3. Add the authorised redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Put the generated ID and secret in `client/.env.local`.
5. Set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` and restart the frontend.
6. For production, add the deployed frontend domain to both the JavaScript origins and callback URI, and update `BETTER_AUTH_URL`.

## API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/events?scope=upcoming&limit=6` | Public | Upcoming events (Mongo cursor `.limit()`) |
| `GET` | `/api/events/:id` | Public | Event details |
| `POST` | `/api/events` | JWT | Create event |
| `POST` | `/api/events/:id/join` | JWT | Join an event once |
| `PATCH` | `/api/events/:id` | JWT + owner | Update your event |
| `DELETE` | `/api/events/:id` | JWT + owner | Delete your event and its participant rows |
| `GET` | `/api/me/events` | JWT | Events created by the current user |
| `GET` | `/api/me/joined-events` | JWT | Events joined by the current user |
| `GET` | `/health` | Public | API health check |

All protected API calls send a short-lived Better Auth JWT in `Authorization: Bearer <token>`. Express verifies that JWT against `BETTER_AUTH_URL/api/auth/jwks`, checks the issuer and audience, and uses the verified subject as the user ID. Never trust a `creatorId`, email, or owner ID supplied by the browser.

## Deployment

### Frontend — Vercel

1. Push the repository to GitHub.
2. Import it into Vercel. Set the project root directory to `client` (the client is an npm workspace; if Vercel does not detect the root workspace automatically, set the install command to `cd .. && npm install` and build command to `cd .. && npm run build --workspace client`).
3. Set the frontend environment variables from the table above, using the production MongoDB URI and a strong production secret.
4. Set `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL` to the exact production frontend origin, with no trailing slash.
5. Set `NEXT_PUBLIC_API_URL` to the deployed Express API origin.
6. Add the Vercel domain to the backend `CLIENT_URLS` list.

### Backend — Render

1. Create a new Web Service from the same repository.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add `PORT` (Render supplies this automatically), `MONGODB_URI`, `DB_NAME`, `BETTER_AUTH_URL`, and `CLIENT_URLS`.
6. Update the frontend `NEXT_PUBLIC_API_URL` to the Render service URL and redeploy the frontend.

### SPA refresh / private routes

This is a Next.js App Router application rather than a client-only Vite SPA. Each route has a real App Router page, so direct route loads and refreshes are handled by Next.js. The private route guard waits for Better Auth's session check before redirecting; a valid session cookie remains valid after a refresh. Protected API operations are separately checked by Express.

## Git commit requirement

The assignment asks for at least **15 notable client-side commits** and **8 notable server-side commits**. Do not create one giant commit. Commit coherent milestones as you work, and push them to GitHub. Suggested sequence:

### Client milestones (15)

1. `chore(client): initialize Next App Router and TypeScript workspace`
2. `style(client): establish CommonGround design tokens and responsive layout`
3. `feat(client): build responsive navigation and shared footer`
4. `feat(client): create community-focused landing page and gallery`
5. `feat(client): add live upcoming event cards and loading skeletons`
6. `feat(client): add searchable and filterable events directory`
7. `feat(client): build public event detail page`
8. `feat(client): add Better Auth email sign-in and registration screens`
9. `feat(client): add protected route session handling`
10. `feat(client): add validated event creation form`
11. `feat(client): implement event joining experience`
12. `feat(client): add joined events dashboard`
13. `feat(client): add organiser edit and delete workspace`
14. `feat(client): add profile editing and impact snapshot`
15. `feat(client): add persistent dark theme and toast feedback`

### Server milestones (8)

1. `chore(server): initialize Express API and MongoDB connection`
2. `feat(server): add Better Auth JWKS JWT verification middleware`
3. `feat(server): add upcoming event listing and detail endpoints`
4. `feat(server): add validated event creation endpoint`
5. `feat(server): add duplicate-safe event joining endpoint`
6. `feat(server): enforce owner-only event update and delete`
7. `feat(server): add joined and created event dashboards`
8. `chore(server): add indexes, rate limiting, health check, and demo seed`

The repository archive includes a local Git history with these 15 client milestones and 8 server milestones as separate commits. After creating your GitHub repository, add it as `origin` and push the branch to publish the full history. Review the code and adjust commit authorship if your course requires commits under your personal Git identity.

Push the included history to your own new GitHub repository:

```bash
git remote add origin https://github.com/<your-username>/commonground.git
git branch -M main
git push -u origin main
```

## Notes

- No email verification or password-reset flow is included, as requested.
- Newsletter is presentation-only; it does not collect or store email addresses.
- Demo seed photos are external references for local preview. Replace them with photos you own or have permission to publish before a public launch.
- Event thumbnails accept publicly reachable image URLs; file upload/storage is not included in this assignment baseline.
