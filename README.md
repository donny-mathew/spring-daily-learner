# Spring Daily Learner

A personal learning tracker for Spring Boot developers — aggregates daily Spring news, serves a curated system design curriculum, and tracks your learning streak.

**Live Demo:** https://spring-daily-learner-dyaps2cjp-donnys-projects-26202d23.vercel.app

---

## Features

- **Daily News Feed** — aggregates the Spring Blog RSS feed and GitHub release announcements for Spring Boot, Spring AI, and Spring Framework, refreshed hourly via ISR
- **55-Topic System Design Curriculum** — structured across 4 tiers from fundamentals to advanced Spring AI topics, with full lecture content, code snippets, and interview questions
- **Backlog Persistence** — unread items accumulate until you explicitly mark them read; nothing disappears on its own
- **Learning Streak** — tracks daily activity with a 30-day heatmap and streak counter
- **Progress Tracking** — per-item read state, per-lecture completion, and overall curriculum progress ring
- **Dark / Light Theme** — respects system preference with FOUC prevention; toggle persisted to localStorage
- **Mobile Responsive** — sidebar nav on desktop, bottom tab bar on mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| RSS Parsing | rss-parser (server-side) |
| Data Fetching | Next.js ISR (revalidate: 1hr) |
| Persistence | localStorage (no auth, no DB) |
| Deployment | Vercel |

---

## Data Sources

| Source | Category |
|--------|----------|
| [Spring Blog](https://spring.io/blog.atom) | spring-boot / spring-ai / spring-framework |
| [Spring Boot Releases](https://github.com/spring-projects/spring-boot/releases) | spring-boot |
| [Spring AI Releases](https://github.com/spring-projects/spring-ai/releases) | spring-ai |
| [Spring Framework Releases](https://github.com/spring-projects/spring-framework/releases) | spring-framework |

---

## System Design Curriculum

**55 topics across 4 tiers:**

- **Tier 1 — Fundamentals (12 topics):** URL Shortener, Rate Limiter, Key-Value Store, Consistent Hashing, CAP Theorem, REST API Design, Load Balancer, DB Indexing, Caching Strategies, CDN, SQL vs NoSQL, Replication & Sharding
- **Tier 2 — Microservices & Messaging (16 topics):** Service Discovery, API Gateway, Circuit Breaker, Kafka, SAGA Pattern, CQRS, Event Sourcing, Transactional Outbox, and more
- **Tier 3 — Advanced Systems (16 topics):** Distributed Cache, Search System, Real-Time Chat, Payment System, Observability, Zero-Downtime DB Migration, and more
- **Tier 4 — Spring AI & Modern Java (11 topics):** Spring AI Architecture, RAG Pipeline, Vector Database, LLM Orchestration, Virtual Threads, GraalVM Native, and more

---

## Getting Started

```bash
git clone https://github.com/donny-mathew/spring-daily-learner
cd spring-daily-learner
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: GitHub Token

Set a GitHub token to increase API rate limits from 60 to 5,000 requests/hour:

```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

---

## Project Structure

```
app/
├── page.tsx                        # Dashboard (server component, ISR)
├── news/page.tsx                   # Full news feed with category filters
├── system-design/
│   ├── page.tsx                    # Curriculum index (55 topics)
│   └── [slug]/page.tsx             # Static lecture pages
└── api/
    ├── news/route.ts               # ISR: aggregated news feed
    └── releases/route.ts           # ISR: releases only
components/
├── dashboard/                      # DashboardShell, StreakCard, ProgressRing, etc.
├── news/                           # NewsFeed, NewsCard, CategoryFilter
├── system-design/                  # CurriculumList, LectureCard, LectureView
├── layout/                         # Sidebar, TopBar, MobileNav
└── shared/                         # Badge, EmptyState, ReadToggle, ThemeToggle
data/
├── curriculum.ts                   # 55 topics with full content
└── categories.ts                   # Category colors and labels
hooks/
├── useProgress.ts                  # localStorage R/W with SSR hydration guard
├── useStreak.ts                    # Streak + 30-day heatmap computation
└── useNews.ts                      # Client-side news fetcher
lib/
├── rss.ts                          # Spring Blog RSS parser
├── github.ts                       # GitHub releases fetcher
├── aggregator.ts                   # Merge + deduplicate news sources
└── utils.ts                        # generateId, formatRelativeDate, cn, etc.
```

---

## Build & Deploy

```bash
npm run build        # production build — all 55 lecture pages generated statically
npx tsc --noEmit     # zero TypeScript errors
```

Deployed on Vercel with automatic ISR — no manual cache invalidation needed.
