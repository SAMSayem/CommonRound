# CommonGround — Local action. Shared impact.

**CommonGround** is a community-driven social development events platform for discovering, creating, and joining local volunteer initiatives. The interface is designed around a warm editorial “community field journal” direction: forest green, soft paper, a lively lime accent, expressive serif headlines, candid community photography, and compact event cards.


**Live site:** `https://common-round-q3fp.vercel.app/` *(placeholder — replace this with the real Vercel URL after deployment; this workspace cannot deploy without your Vercel/MongoDB credentials).*

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





