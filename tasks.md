# Feature: Google Login & Personalised Experience

> Framework: **Next.js 15 App Router** (API Routes, Server Components, Middleware)
> All server-side services live inside the Next.js app — no separate backend.

---

## Task Dependency Graph

```
#1 NextAuth + Google OAuth ──┬──► #2 Login Page UI ──────────────► #5 Personalised UX
                             │                                          ▲
                             ├──► #6 Route Protection              #4 ─┘
                             │
#3 DB + Prisma Schema ───────┴──► #4 Migrate Progress to DB
```

---

## Tasks

### #1 — Set up NextAuth.js with Google OAuth provider
**Status:** done ✅
**Blocks:** #2, #4, #6
**Done:** Installed `next-auth@beta`. Created `auth.ts` (Google provider), `app/api/auth/[...nextauth]/route.ts`, `.env.local.example`. `AUTH_SECRET` generated; `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` placeholders added to `.env.local`.

Install and configure NextAuth.js (v5 / Auth.js) in the Next.js 15 App Router project.

**Steps:**
- Install `next-auth@beta` and `@auth/prisma-adapter` (or another adapter)
- Create `auth.ts` config at project root with Google provider
- Add `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to `.env.local` (and document in README)
- Add `/app/api/auth/[...nextauth]/route.ts` handler
- Register Google OAuth app in Google Cloud Console (callback URL: `/api/auth/callback/google`)
- Export `{ auth, signIn, signOut }` helpers for use across the app

**Acceptance criteria:**
- `auth()` returns a session object when a user is signed in
- Environment variable names documented in `.env.local.example`

---

### #2 — Create login page UI
**Status:** done ✅
**Blocked by:** #1
**Blocks:** #5
**Done:** Created `app/login/page.tsx` (server component). Centered card with Google "G" logo button using NextAuth `signIn("google")` server action. Authenticated users are redirected via `auth()`. Handles `?callbackUrl` param.

Build the `/login` page matching the existing Java Patterns design system.

**Steps:**
- Create `app/login/page.tsx` as a server component
- Design a centered card with the app logo, tagline, and a "Sign in with Google" button
- Use the Google sign-in button (official branding guidelines) calling NextAuth `signIn("google")`
- Add a redirect: if the user is already authenticated (`auth()` returns session), redirect to `/`
- Handle `?callbackUrl` query param so users are returned to the page they came from after login
- Match existing color palette, typography, and spacing from the Figma Java Patterns design

**Acceptance criteria:**
- Unauthenticated users see the login page
- Clicking "Sign in with Google" triggers the OAuth flow
- Authenticated users visiting `/login` are redirected to home

---

### #3 — Set up database and Prisma schema for user data
**Status:** done ✅
**Blocks:** #4
**Done:** Installed `prisma@6`, `@prisma/client`, `@auth/prisma-adapter`. Defined schema with NextAuth tables (User, Account, Session, VerificationToken) + UserProgress. Migrated to Neon Postgres. Created `lib/prisma.ts` singleton. Wired PrismaAdapter into `auth.ts`.

Introduce a lightweight database to persist per-user progress (replacing anonymous localStorage).

**Steps:**
- Choose a serverless-friendly DB: PlanetScale (MySQL) or Neon (Postgres) — document the choice
- Install `prisma`, `@prisma/client`, and the chosen Auth.js adapter
- Define Prisma schema with:
  - NextAuth required tables: `User`, `Account`, `Session`, `VerificationToken`
  - `UserProgress` table: userId (FK), newsProgress (JSON), lectureProgress (JSON), dailyLog (JSON), updatedAt
- Run `prisma migrate dev` to apply the schema
- Add `DATABASE_URL` to `.env.local` and `.env.local.example`
- Export a `prisma` singleton client in `lib/prisma.ts`

**Acceptance criteria:**
- `npx prisma studio` can connect and show tables
- `prisma generate` runs without errors

---

### #4 — Migrate user progress from localStorage to per-user database
**Status:** done ✅
**Blocked by:** #1, #3
**Blocks:** #5
**Done:** Created `app/api/progress/route.ts` (GET, PATCH, DELETE) and `app/api/progress/migrate/route.ts` (POST — merge anonymous localStorage data into DB). Updated `hooks/useProgress.ts`: authenticated users fetch/PATCH the API with 1-second debounce; anonymous users keep localStorage only.

Replace the localStorage-only progress system with server-persisted, user-scoped progress.

**Steps:**
- Create API routes:
  - `GET /api/progress` — fetch current user's `UserProgress` row (requires session)
  - `PATCH /api/progress` — upsert progress JSON for the current user
  - `POST /api/progress/migrate` — one-time import of anonymous localStorage data on first login
  - `DELETE /api/progress` — wipe all progress for the current user (for settings page)
- Update `hooks/useProgress.ts`:
  - On mount, if user is authenticated fetch from `/api/progress` instead of localStorage
  - On every progress update, optimistically update local state AND send a debounced PATCH to the API
  - Keep localStorage as a fallback cache for offline / unauthenticated users (anonymous progress)
- On first login, offer to migrate any existing anonymous localStorage progress to the user's account
- Remove the raw `localStorage.setItem("spring-learner-progress", ...)` calls from non-hook code

**Acceptance criteria:**
- Progress saved on one device is visible after logging in on another device
- Anonymous (logged-out) usage still works via localStorage
- No hydration mismatch errors (`hydrated` guard preserved)

---

### #5 — Add personalised user experience across the app
**Status:** pending
**Blocked by:** #2, #4

Surface user identity and personalised content throughout the app.

**Steps:**
- **Header / nav**: Add user avatar + name (from Google profile) with a dropdown for Sign Out; show "Sign In" button when unauthenticated
- **Dashboard greeting**: Replace generic heading with "Good morning, {firstName}!" based on time of day
- **Progress summary**: Show a per-user streak, total lectures completed, and news items read
- **Lecture pages**: Ensure per-user completion checkbox state is reflected in UI
- **News page**: Show personalised "Continue reading" or "Up next" recommendations based on read history
- **Settings page** (optional): Allow user to clear their progress or export it as JSON

**Acceptance criteria:**
- User's Google avatar and name appear in the header when signed in
- Dashboard greeting is personalised with first name
- Streak and progress stats are user-specific, not shared across sessions

---

### #6 — Protect authenticated routes and handle session state
**Status:** done ✅
**Blocked by:** #1
**Done:** Created `middleware.ts` — redirects unauthenticated users visiting `/system-design/**` or `/news` to `/login?callbackUrl=...`. Added `components/SessionProvider.tsx` client wrapper; wired into `app/layout.tsx`. Added session callback in `auth.ts` to expose `user.id`. `/` and `/login` remain public.

Add route protection and graceful auth-aware UI states.

**Steps:**
- Add Next.js middleware (`middleware.ts`) to redirect unauthenticated users to `/login` for protected routes (e.g. `/system-design/[slug]`, `/news`)
- Keep `/`, `/login`, and public static assets accessible without auth (or make the whole app accessible with degraded anonymous experience — decide and document)
- Create a `SessionProvider` wrapper in `app/layout.tsx` so client components can call `useSession()`
- Add loading skeletons for auth-dependent UI (avatar, greeting, progress stats) to avoid layout shift
- Handle sign-out: clear local session and redirect to `/login`
- Test edge cases: expired session, revoked Google token, network error during sign-in

**Acceptance criteria:**
- Visiting a protected route while logged out redirects to `/login?callbackUrl=...`
- After sign-out, protected pages are no longer accessible without re-authenticating
- No flicker or hydration errors on page load

---

## Server-side APIs Summary

| Endpoint | Method | Auth required | Task | Notes |
|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | #1 | NextAuth built-in handler |
| `/api/progress` | GET | yes | #4 | Fetch user's progress from DB |
| `/api/progress` | PATCH | yes | #4 | Upsert user's progress in DB |
| `/api/progress/migrate` | POST | yes | #4 | Import anonymous localStorage data on first login |
| `/api/progress` | DELETE | yes | #4 | Wipe user's progress |
| `/api/news` | GET | no | existing | ISR news feed (unchanged) |
| `/api/releases` | GET | no | existing | ISR releases feed (unchanged) |

## External Services Required

- **Google Cloud Console** — OAuth 2.0 credentials, callback URI: `/api/auth/callback/google`
- **Neon (Postgres) or PlanetScale (MySQL)** — serverless DB, connection via `DATABASE_URL`
