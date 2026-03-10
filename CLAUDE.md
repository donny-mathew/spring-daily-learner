# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start development server at localhost:3000
npm run build      # production build (generates all 55 lecture pages statically)
npm run start      # serve the production build
npx tsc --noEmit   # type-check without emitting
```

No linter or test runner is configured — TypeScript (`npx tsc --noEmit`) is the primary correctness check.

### Optional environment variable

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here   # raises GitHub API rate limit from 60 to 5,000 req/hr
```

## Architecture

**Next.js 15 App Router** with a clear server/client split:

- **Server components + ISR** — pages and API routes fetch data at build time or on a 1-hour revalidation cycle (`export const revalidate = 3600`). No database; external data comes from Spring Blog Atom feed and GitHub Releases API.
- **Client-side persistence** — all user state (read status, lecture completion, streak) lives in `localStorage` under the key `"spring-learner-progress"`. There is no auth and no backend DB.
- **Static lecture pages** — all 55 `/system-design/[slug]` pages are pre-rendered at build via `generateStaticParams()` from `data/curriculum.ts`.

### Data flow

1. `lib/rss.ts` — fetches `https://spring.io/blog.atom` and parses the Atom XML with native regex (no external parser library).
2. `lib/github.ts` — fetches GitHub releases for spring-boot, spring-ai, and spring-framework repos.
3. `lib/aggregator.ts` — merges and deduplicates both sources by item ID (a hash of the URL), sorts newest-first.
4. `app/api/news/route.ts` and `app/api/releases/route.ts` — ISR API routes that call the aggregator and return JSON.
5. `hooks/useNews.ts` — client hook that fetches `/api/news` on the client and feeds the news page.

### Key types (`types/index.ts`)

- `NewsItem` — id, title, summary, url, publishedAt, source, category, isRelease
- `AppProgress` — `newsProgress`, `lectureProgress`, `dailyLog` (all keyed maps in localStorage)
- `CurriculumTopic` — id, slug, title, tier, difficulty, sections (with optional code snippets), interviewQuestions, furtherReading

### SSR hydration guard

`hooks/useProgress.ts` initialises with `defaultProgress()` on the server and loads from `localStorage` only after mount (`useEffect → setHydrated(true)`). Components should gate localStorage-dependent UI behind the `hydrated` flag to avoid hydration mismatches.

### Curriculum data

`data/curriculum.ts` is the single source of truth for all 55 topics. Each `CurriculumTopic` contains full lecture content inline (overview, `LectureSection[]` with optional code blocks, interview questions, and further reading links). Adding a topic here automatically generates a new static route.

## Session Continuity
- Always read `tasks.md` at the start of a session
- Update `tasks.md` with task progress before the session ends
- Mark completed items with [x] and add notes on what was done
