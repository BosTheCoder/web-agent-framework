# Web Agent Framework Design

**Date:** 2026-01-29
**Status:** Approved

## Overview

A reusable, safe framework for signed-in website automation using Playwright + TypeScript. The framework enables automated message reading, reply drafting (via Claude), and controlled sending across multiple websites.

## Architecture

### Three-Layer Architecture

1. **Core Layer** (`packages/core`): Browser automation primitives, session management, shared utilities
2. **Adapter Layer** (`packages/adapters/*`): Site-specific implementations of the SiteAdapter interface
3. **Orchestrator Layer** (`packages/orchestrator`): Workflow coordination, safety enforcement, Claude integration

### Key Principle

The orchestrator trusts adapters to handle site-specific concerns but enforces safety at the orchestration level. Adapters can't accidentally send - only the orchestrator's `send` command (after explicit approval) triggers actual sends.

## Technology Stack

- **Language:** TypeScript (Node 20+)
- **Browser Automation:** Playwright
- **CLI:** commander
- **Storage:** SQLite (better-sqlite3)
- **Logging:** pino
- **Package Manager:** pnpm
- **Formatting:** prettier + eslint
- **Testing:** vitest

## Session & Auth Management

### Two Authentication Strategies

1. **storageState.json** (`--auth-mode storage`):
   - Saves cookies/localStorage to `.secrets/{site}.storageState.json`
   - Lightweight, easy to refresh
   - Can expire, may break with some 2FA flows

2. **Persistent Profile** (`--auth-mode profile`):
   - Uses `userDataDir: .secrets/profiles/{site}/`
   - Most durable, handles complex auth
   - Larger disk usage

### Safety

- All auth artifacts in `.secrets/` (gitignored)
- Claude Code hooks block access to `.secrets/`
- Auth commands always headful
- Auth failures → fail loudly, prompt re-auth

## Data Flow

### Main Workflow (`web-agent run --site <name>`)

1. **Fetch:** `adapter.listUnreadThreads()` → `{threadId, preview, timestamp}[]`
2. **Dedupe:** Check SQLite for threads already handled today
3. **Read:** `adapter.readThread(threadId)` → `{messages, metadata}`
4. **Trim:** Keep last 5 messages, strip HTML, limit 500 chars each
5. **Draft:** Call `claude -p` with prompt template
6. **Parse:** Extract JSON, validate schema
7. **Queue:** Insert to SQLite with status `pending`

### Review Workflow (`web-agent review --site <name>`)

- Generates `review-{site}-YYYY-MM-DD.md`
- Lists all pending drafts with context
- User edits file: modify draft text, delete to reject, keep to approve

### Send Workflow (`web-agent send --site <name> --review-file <path>`)

- Parses review markdown
- Extracts approved drafts
- Calls `adapter.sendReply(threadId, text)` for each
- Marks sent in SQLite
- Generates send report

## SiteAdapter Interface

Minimal interface with three methods:

```typescript
interface SiteAdapter {
  listUnreadThreads(): Promise<Thread[]>;
  readThread(threadId: string): Promise<ThreadDetail>;
  sendReply(threadId: string, text: string): Promise<void>;
}
```

Adapters handle their own:
- DOM selectors
- Navigation logic
- Site-specific error handling

## Error Handling & Safety

### Fail-Safe Defaults

- All commands default to `--dry-run`
- `--send` requires explicit flag + review file
- Failed sends marked `failed` (not `sent`) for retry

### Graceful Degradation

- Adapter failures logged and handled appropriately
- Claude drafting failures → mark `requiresReview: true`
- Continue processing other threads on individual failures

### Tracing & Debugging

- Playwright tracing: `data/traces/`
- Screenshots on failures
- Structured logging: `data/logs/web-agent.log`

### Rate Limiting

- Max 10 threads per run (configurable)
- 2-second delay between reads
- 5-second delay between sends

## SQLite Schema

```sql
CREATE TABLE drafts (
  id INTEGER PRIMARY KEY,
  threadId TEXT NOT NULL,
  site TEXT NOT NULL,
  draftText TEXT NOT NULL,
  confidence TEXT,
  requiresReview BOOLEAN DEFAULT 1,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  approvedAt TEXT,
  sentAt TEXT,
  error TEXT,
  UNIQUE(threadId, site, createdAt)
);
```

**Deduplication:** Skip threads with records from last 24 hours (unless `failed`)

## Claude Integration

### Prompt Template

Located at `prompts/draft_reply.md`, instructs Claude to output JSON:

```json
{
  "draft": "reply text",
  "tone": "friendly|professional|brief",
  "confidence": "low|medium|high",
  "questions": ["clarifying questions"],
  "should_send": false
}
```

### Implementation

- Spawn `claude -p` subprocess
- Pass prompt via stdin
- Parse stdout as JSON
- Retry once if parse fails
- Fall back to placeholder if still fails

## Claude Code Integration

### Skills

1. **/scaffold-adapter**: Generate new adapter boilerplate
2. **/record-login**: Create auth script for new site
3. **/run-site**: Execute orchestrator in dry-run mode

### Hooks

- **PostToolUse (Write/Edit):** Run prettier + eslint
- **UserPromptSubmit:** Block access to `.secrets/` files

## Testing Strategy

### Unit Tests (vitest)

- Core session logic
- Orchestrator deduplication
- SQLite queries
- Claude output parsing

### Smoke Tests

- Adapter interface compliance
- CLI argument parsing
- Review markdown generation

### Manual Tests

- Auth flows (require browser interaction)
- Documented as `pnpm test:manual`

## Repository Structure

```
/
├── packages/
│   ├── core/                 # Browser, session, utilities
│   ├── adapters/
│   │   └── spare-room/      # SpareRoom implementation
│   └── orchestrator/        # Workflow coordination
├── apps/
│   └── cli/                 # Command-line interface
├── prompts/
│   └── draft_reply.md       # Claude prompt template
├── .claude/
│   ├── settings.json        # Hooks configuration
│   ├── hooks/               # Hook scripts
│   └── skills/              # Custom skills
├── .secrets/                # Auth data (gitignored)
├── data/                    # SQLite, logs, traces (gitignored)
└── docs/
    └── plans/               # Design documents
```

## Documentation

### README.md

- Quickstart
- Commands reference
- Safety notes
- Troubleshooting

### CLAUDE.md

- Repo rules
- Architecture diagram
- Common workflows
- Skills reference

## Initial Scope: SpareRoom Adapter

- Skeleton implementation with TODO comments
- Placeholder selectors (role/text preferred, CSS fallback)
- Methods: `listUnreadThreads`, `readThread`, `sendReply`
- README with selector update guide

## Next Steps

1. Scaffold repository structure
2. Implement core layer
3. Implement orchestrator
4. Build CLI
5. Create SpareRoom adapter skeleton
6. Write documentation
7. Create Claude Code skills
8. Configure hooks
9. Run end-to-end test
