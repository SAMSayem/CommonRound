# CommonGround

**Local action. Shared impact.**

**Live site URL:** `https://your-commonground-project.vercel.app` *(deployment placeholder — replace with your actual Vercel URL after publishing).* 

CommonGround is a community-driven social development events platform. Neighbours can discover local service activities, organise new initiatives, join events, and track their community commitments.

## Features

- Browse upcoming community events with live MongoDB data, search, cause filters, and date sorting.
- Create events with validated titles, descriptions, event types, cover images, locations, and future dates.
- Join events with authenticated participant records and protection against duplicate sign-ups.
- Manage events you created with owner-only update and delete functionality.
- Track joined and past events in a private, date-sorted dashboard.
- Register and sign in with email/password using Better Auth; optional Google OAuth is supported.
- Update your profile photo and display name and view a small activity snapshot.
- Switch between persistent light and dark themes; receive custom toast feedback and loading skeletons.

## Tech

Next.js App Router, React, TypeScript, Better Auth, MongoDB adapter, Express, MongoDB Node driver, Zod, JWT/JWKS (`jose`), and Lucide icons.

See the [root README](../README.md) for local setup, environment variables, API routes, deployment, and the required Git commit plan.
