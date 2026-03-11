# Watson Dashboard — PRD

**Author:** Xuyang Zhang
**Date:** 2026-03-11
**Status:** Draft
**Tagline:** "Everything Watson does, at a glance."

---

## 1. Why This Exists

Watson (your OpenClaw agent) runs 24/7 on an Ubuntu VM, managing email triage, spawning coding agents, publishing to Rednote, monitoring nodes, and running cron jobs. Today, the only window into all this is Telegram chat. That's fine for quick interactions, but terrible for:

- **"How much am I spending?"** — No idea without checking Anthropic/OpenAI billing manually
- **"What did Watson do while I slept?"** — Scroll through Telegram hoping nothing got buried
- **"Are all my nodes healthy?"** — `openclaw status` via CLI, or hope Watson tells you
- **"Which coding agents are running?"** — Check process lists or ask Watson
- **"What emails came in today?"** — Read the daily log file manually

This dashboard gives you a **single browser tab** that answers all of those instantly.

---

## 2. Your Actual OpenClaw Setup (What We're Building For)

### Infrastructure
| Component | Location | Purpose |
|-----------|----------|---------|
| **OpenClaw Gateway** | Ubuntu VM (port 18789) | Main brain, runs Watson |
| **Mac Studio** | Tailscale 100.70.189.117 | Local AI (Ollama, Whisper STT), Rednote MCP |
| **MacBook Pro** | Node + Chrome Extension | Browser proxy, development |
| **Telegram** | Primary channel | Chat interface with Watson |

### Active Workflows
1. **Gmail Triage** — Real-time email classification (URGENT/ACTION/FYI/NOISE) → Telegram notifications + daily log
2. **Heartbeat System** — Periodic health checks, proactive notifications
3. **Cron Jobs** — Scheduled tasks (email summaries, reminders)
4. **Coding Agent Orchestration** — Spawn Claude Code / Codex for development tasks
5. **Rednote Publishing** — Content → image generation → publish via MCP on Mac Studio
6. **Content Library** — Capture links → summarize → queue for LinkedIn/Rednote

### Planned Workflows
- **AI CRM MVP** — Multi-agent development project with Peter
- **Clone-a-Claw Marketplace** — Next.js + Supabase + Stripe
- **More apps** — Watson-as-orchestrator pattern during China trip
- **AI Adoption Project** — Funded, ready to start

---

## 3. Dashboard Features (Tailored to YOU)

### 3.1 🏠 Home — The Morning Glance

What you see when you open the dashboard after waking up:

**Top Bar (always visible):**
- Gateway status: 🟢 Online | uptime | version
- Node status: Ubuntu ✅ | Mac Studio ✅/❌ | MacBook ✅/❌
- Today's cost: $X.XX
- Current time (CST while in China)

**Activity Summary Card:**
- "While you were away" — count of emails triaged, tasks completed, errors
- Last N important events (not noise)
- Any alerts needing attention (failed cron, node offline, OAuth expiry)

**Email Triage Summary:**
- Today's email breakdown: 🔴 X urgent | 🟡 X action | 🔵 X fyi | ⚪ X noise
- Quick list of non-noise emails with subject + sender
- Link to full daily email log
- "Emails needing response" highlighted

**Active Work:**
- Currently running sessions (main, sub-agents, cron)
- Any coding agents in progress with status + elapsed time

### 3.2 💰 Cost Center

**Daily/Weekly/Monthly Views:**
- Cost by model: Opus, Sonnet, GPT-5.4, local (free)
- Cost by activity: email triage, coding agents, main chat, cron jobs
- Cost trend line (last 30 days)
- Projected monthly spend

**Per-Session Cost:**
- Top 10 most expensive sessions (ever / this week)
- Cost breakdown: input tokens, output tokens, thinking tokens
- Model used per session

**Budget:**
- Set monthly budget
- Current burn rate vs budget
- Alert threshold (e.g., notify at 80%)

**Model Pricing Table:**
- Hardcoded table of model costs (Opus, Sonnet, GPT-5.4, etc.)
- Easy to update when prices change

### 3.3 📧 Email Dashboard

**Today's Triage:**
- Table view of all emails processed today
- Columns: Time | Category (🔴🟡🔵⚪) | From | Subject | Action Taken
- Filter by category
- Click to expand full triage reasoning

**Triage Stats:**
- Accuracy over time (if you provide feedback)
- Category distribution chart
- Most frequent senders
- "Consider unsubscribing" list (senders that are always NOISE)

**Gmail Integration Health:**
- Pub/Sub status
- Last email received timestamp
- OAuth token expiry countdown (7-day warning for Testing mode)
- Error log (parse errors, empty payloads)

### 3.4 🤖 Agent Activity

**Sub-Agent Monitor:**
- All spawned coding agents (Claude Code, Codex)
- Status: running / completed / failed
- Task description, elapsed time, cost so far
- Last N lines of output (tail -f style)
- Actions: view full log, kill, steer

**Session Explorer:**
- All sessions (active + recent)
- Filter by type: main chat, sub-agent, cron, heartbeat
- Session detail: full transcript, token usage, cost
- Search across all session transcripts

**Agent Performance:**
- Success/failure rate
- Average task duration by agent type
- Most common failure reasons

### 3.5 🖥️ Infrastructure

**Node Health Panel:**
- Each node as a card:
  - **Ubuntu Gateway**: uptime, CPU, RAM, disk, PID, version
  - **Mac Studio**: connected/disconnected, capabilities, last heartbeat, Ollama status, STT status, MCP status
  - **MacBook Pro**: connected/disconnected, Chrome extension relay status
- Historical uptime (was Mac Studio down last night?)

**Integration Status:**
- Gmail watcher: 🟢/🔴 + last event
- Telegram: 🟢/🔴 + message count today
- Rednote MCP: 🟢/🔴 + last publish
- Tailscale: node connectivity

**Cron Jobs:**
- List all cron jobs with schedule, last run, next run, last result
- Run history (last 10 executions per job)
- Enable/disable from UI
- One-click "run now"

### 3.6 📝 Content Pipeline

**Queue Overview:**
- LinkedIn queue: X items (drafted/ready/posted)
- Rednote queue: X items by album
- Learn queue: X items

**Recent Posts:**
- Last 5 published items with platform, date, title
- Rednote publish status (success/failed)

**Draft Inbox:**
- Pending drafts awaiting review
- Quick approve → publish workflow

### 3.7 📊 Projects Tracker

**Active Projects:**
- Cards for each active project:
  - **Clone-a-Claw**: repo link, last commit, deploy status
  - **AI CRM**: status, next milestone
  - **AI Adoption**: status, next step
  - **Control Center** (this!): meta/dog-fooding
- Each card shows: last activity, open tasks, recent commits

**Watson-as-Orchestrator View:**
- When coding agents are running for a project:
  - What's being built
  - Progress (commits, files changed)
  - Blockers / decisions needed from Xuyang
  - Estimated time remaining

### 3.8 ⚙️ Settings & Config

- Gateway config viewer (read-only, from openclaw.json)
- Model configuration
- Budget settings
- Notification preferences
- Theme selection (dark themes only)

---

## 4. Architecture

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 15 + React 19 + TypeScript | Modern, fast, SSR |
| **UI** | Tailwind + shadcn/ui | Dark mode, information-dense |
| **Charts** | Recharts | Lightweight, React-native |
| **State** | React Query (TanStack Query) | Auto-refresh, caching, real-time |
| **Backend** | Next.js API routes | Thin proxy to OpenClaw + data aggregation |
| **Database** | SQLite (better-sqlite3) | Local, zero-dep, stores historical cost data + email logs |
| **Real-time** | Polling (15s interval) + optional SSE | Simple, reliable |

### Data Flow

```
Browser (localhost:3000)
    │
    ├── GET /api/dashboard ──► OpenClaw CLI (openclaw status --json)
    ├── GET /api/sessions ──► Gateway API (localhost:18789)
    ├── GET /api/nodes ────► Gateway API
    ├── GET /api/cron ─────► Gateway API
    ├── GET /api/emails ───► Read ~/clawd/memory/email-log-*.md
    ├── GET /api/costs ────► SQLite (aggregated from session data)
    ├── GET /api/content ──► Read ~/clawd/library/ queue files
    └── GET /api/projects ─► Read git status from project dirs
```

### Data Collection Strategy

**Cost data:** Poll `session_status` for each active session periodically, store token counts in SQLite with timestamps. Calculate cost using hardcoded model pricing.

**Email data:** Parse the daily `email-log-YYYY-MM-DD.md` files that Watson already writes. These have structured table format.

**Node health:** Call `openclaw status --json` and parse node connectivity.

**Content pipeline:** Read queue markdown files from `~/clawd/library/`.

---

## 5. Design

### Visual Style
- **Dark mode only** (charcoal/slate background, not pure black)
- **Accent color:** Electric blue (#3B82F6) or emerald (#10B981)
- **Typography:** Inter or system fonts, no custom fonts
- **Density:** Grafana-level information density
- **Cards:** Subtle glass morphism, rounded corners, thin borders
- **Status indicators:** Color-coded dots (🟢🟡🔴) + text

### Layout
```
┌──────────────────────────────────────────────────┐
│  Top Bar: Gateway ✅ | Nodes 3/3 | Cost $2.47    │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│  Sidebar │   Main Content Area                   │
│          │                                       │
│  🏠 Home  │   [Cards / Tables / Charts]           │
│  💰 Costs │                                       │
│  📧 Email │                                       │
│  🤖 Agents│                                       │
│  🖥️ Infra │                                       │
│  📝 Content                                       │
│  📊 Projects                                      │
│  ⚙️ Settings                                      │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

### Key Interactions
- **Auto-refresh:** Every 15 seconds for live data, with visible countdown
- **Click to expand:** Cards expand to show detail views
- **Cmd+K:** Command palette for quick navigation
- **Keyboard shortcuts:** 1-7 for sidebar navigation

---

## 6. Build Phases

### Phase 1: Foundation + Home (get something running)
- [ ] Next.js project scaffolding with shadcn/ui dark theme
- [ ] Sidebar layout with navigation
- [ ] Top bar with gateway/node status
- [ ] Home page: activity summary, email summary, active sessions
- [ ] API routes: `/api/dashboard` (gateway status), `/api/emails` (parse log files)
- [ ] Auto-refresh mechanism
- [ ] `pnpm build` passing

### Phase 2: Cost Center + Email Dashboard
- [ ] SQLite setup for cost data persistence
- [ ] Cost tracking API: poll sessions, store token data
- [ ] Cost dashboard: daily/weekly/monthly views, model breakdown
- [ ] Email dashboard: full table view, filters, stats
- [ ] Gmail health indicators

### Phase 3: Agent Activity + Infrastructure
- [ ] Sub-agent monitor (list, status, logs, kill)
- [ ] Session explorer with transcripts
- [ ] Node health cards with real data
- [ ] Integration status panel
- [ ] Cron job viewer

### Phase 4: Content + Projects + Polish
- [ ] Content pipeline view (queues, drafts, published)
- [ ] Projects tracker cards
- [ ] Cmd+K command palette
- [ ] Loading states, error handling, empty states
- [ ] Performance optimization
- [ ] Final polish pass

---

## 7. What This Is NOT

- Not a replacement for Telegram chat (that stays primary)
- Not a task management tool (use GitHub issues)
- Not trying to control OpenClaw config (read-only, not write)
- Not multi-user (just Xuyang, no auth needed for localhost)

---

## 8. Success = Opening This Tab Every Morning

The dashboard succeeds if Xuyang's morning routine becomes:
1. Open browser tab
2. See overnight summary in 5 seconds
3. Know: costs, email highlights, agent status, node health
4. Decide what to focus on today
5. Close tab, go to Telegram for actual work

That's it. Simple, useful, personal.

---

*"Watson's brain, visible."*
