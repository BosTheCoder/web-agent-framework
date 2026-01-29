# Claude Code Repository Rules

This document contains rules and context for working with this repository using Claude Code.

## Repository Overview

**Web Agent Framework** - Safe website automation with Playwright + TypeScript

**Architecture:**
- Core: Browser/session management
- Adapters: Site-specific implementations (SpareRoom, ...)
- Orchestrator: Workflow coordination + safety
- CLI: User-facing commands

## Key Rules

### 1. Never Commit .secrets/

The `.secrets/` directory contains authentication data (cookies, sessions, profiles).

**BLOCKED BY HOOKS:**
- Reading `.secrets/` files
- Adding `.secrets/` files to git
- Printing `.secrets/` contents

### 2. Always Dry-Run First

All orchestrator runs default to `--dry-run`. Never send without:
1. Dry-run execution
2. Manual review
3. Explicit `send` command with confirmation

### 3. Prefer Existing Code Patterns

When adding adapters:
- Copy structure from `packages/adapters/spare-room`
- Use same selector patterns (role > data-testid > class > CSS)
- Follow navigation flow patterns
- Include TODO comments for placeholders

### 4. Use Skills for Common Tasks

- `/scaffold-adapter` - Create new adapter
- `/record-login` - Guide auth recording
- `/run-site` - Execute orchestrator safely

## Common Workflows

### Adding New Adapter

1. Use `/scaffold-adapter` skill
2. Update selectors in `src/selectors.ts`
3. Implement flows in `src/flows.ts`
4. Implement adapter in `src/index.ts`
5. Test with dry-run
6. Document in adapter README

### Updating Selectors (UI Changes)

1. Open site in browser
2. Inspect elements with DevTools
3. Update `selectors.ts` (prefer stable selectors)
4. Test with `pnpm dev run --site <name> --dry-run --max-threads 1`
5. Commit with message: "fix(adapter): update selectors for UI changes"

### Debugging Failed Sends

1. Check Playwright traces: `data/traces/`
2. Check logs: `data/logs/web-agent.log`
3. Check draft status in DB: `data/web-agent.db`
4. Re-test with `--max-threads 1` for focused debugging

## Project Structure

```
/
├── packages/
│   ├── core/              # Browser, session, types
│   ├── orchestrator/      # Workflow, DB, Claude integration
│   └── adapters/
│       └── spare-room/    # SpareRoom adapter
├── apps/
│   └── cli/               # web-agent CLI
├── .claude/
│   ├── settings.json      # Hooks config
│   ├── hooks/             # Format + secrets check
│   └── skills/            # Custom skills
├── prompts/               # Claude prompt templates
├── .secrets/              # Auth data (GITIGNORED)
└── data/                  # SQLite, logs, traces (GITIGNORED)
```

## Common Commands (from apps/cli)

```bash
# Auth
pnpm dev auth spare-room
pnpm dev auth spare-room --profile

# Run
pnpm dev run --site spare-room --dry-run
pnpm dev run --site spare-room --dry-run --max-threads 5

# Review
pnpm dev review --site spare-room

# Send
pnpm dev send --site spare-room --review-file data/review-spare-room-2026-01-29.md
```

## Testing

- Unit tests: `pnpm test` (vitest)
- Manual tests: `pnpm test:manual` (requires real browser)
- Dry-run tests: Use `--dry-run` flag

## Code Style

- TypeScript strict mode
- ESLint + Prettier (enforced by hooks)
- Prefer explicit types over `any`
- Use pino for logging
- Follow existing patterns

## Architecture Diagram (ASCII)

```
User
  │
  v
┌─────────────┐
│  CLI (apps) │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──v──┐  ┌──v────────┐
│Core │  │Orchestrator│
└──┬──┘  └──┬────────┘
   │        │
   │   ┌────v─────┐
   │   │ Claude   │
   │   │   CLI    │
   │   └──────────┘
   │
┌──v────────┐
│ Adapters  │
│(SpareRoom)│
└───────────┘
```

## Tips

- Use Claude Code skills for scaffolding
- Hooks auto-format on save
- Secrets are protected by hooks
- Always commit after each logical unit
- Use descriptive commit messages with Co-Authored-By

## Worktree Directory

Use `.worktrees/` for isolated development (gitignored).
