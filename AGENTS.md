# Watson Dashboard — Build Instructions

## Project
A personalized OpenClaw dashboard for monitoring AI agent activity, costs, emails, nodes, and projects.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (dark mode ONLY)
- Recharts for charts
- SQLite (better-sqlite3) for cost data persistence
- React Query (TanStack Query) for data fetching + auto-refresh

## Key References
- **PRD:** Read `PRD.md` in this repo for full requirements
- **OpenClaw docs:** `/home/xuyang-zhang/clawd/docs/` — READ for API understanding
- **Live gateway:** `http://127.0.0.1:18789` — query for real data
- **Email logs:** `/home/xuyang-zhang/clawd/memory/email-log-*.md` — parse these for email dashboard
- **Content queues:** `/home/xuyang-zhang/clawd/library/` — queue markdown files

## Build Order
1. Scaffold Next.js 15 + shadcn/ui + Tailwind (dark mode)
2. Sidebar layout + top bar with gateway/node status
3. Home page: activity summary, email summary, active sessions
4. Cost center: token tracking, model breakdown, trends
5. Email dashboard: parse log files, table view, filters
6. Agent activity: session list, sub-agent monitor
7. Infrastructure: node health, cron jobs, integration status
8. Content pipeline + projects tracker
9. Cmd+K command palette
10. Polish: loading states, error handling, empty states

## API Data Sources
- `openclaw status --json` → gateway health, node status
- Gateway API at localhost:18789 → sessions, cron, etc.
- Parse markdown files → email logs, content queues
- SQLite → persisted cost data

## Rules
- Dark mode ONLY
- Information-dense UI (Grafana-style density)
- Auto-refresh every 15 seconds
- `npm run build` must pass
- Commit frequently with descriptive messages
- Do NOT modify files in ~/clawd/ or ~/.openclaw/
