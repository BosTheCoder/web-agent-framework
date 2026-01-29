# Web Agent Framework

Safe, reusable framework for signed-in website automation using Playwright + TypeScript.

## Features

- **Safe by default**: Dry-run mode, manual review before sending
- **Modular architecture**: Core + adapters + orchestrator
- **Claude integration**: Automatic reply drafting via CLI
- **Markdown review**: Edit and approve drafts in your editor
- **Flexible auth**: Storage state or persistent profile

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
pnpm build
```

### 2. Record Authentication

```bash
cd apps/cli

# Option A: Storage state (lightweight)
pnpm dev auth spare-room

# Option B: Persistent profile (more durable)
pnpm dev auth spare-room --profile
```

Follow the browser prompts to login manually.

### 3. Run Orchestrator (Dry-Run)

```bash
pnpm dev run --site spare-room --dry-run
```

This will:
- Fetch unread threads
- Draft replies using Claude
- Store drafts in SQLite

### 4. Review Drafts

```bash
pnpm dev review --site spare-room
```

Opens `data/review-spare-room-YYYY-MM-DD.md` where you can:
- Edit draft text inline
- Delete sections to reject
- Keep as-is to approve

### 5. Send Approved Replies

```bash
pnpm dev send --site spare-room --review-file data/review-spare-room-YYYY-MM-DD.md
```

Requires confirmation before sending.

## Architecture

```
+---------------------------------------------------+
|                  CLI (web-agent)                   |
|         auth | run | review | send                 |
+------------------------+--------------------------+
                         |
          +--------------+--------------+
          |                             |
     +----v-----+             +---------v--------+
     |   Core   |             |   Orchestrator   |
     |  Browser |             |    Workflow       |
     |  Session |             |    Safety         |
     +----+-----+             +---------+--------+
          |                             |
          |                    +--------v---------+
          |                    |   Claude CLI     |
          |                    |   Drafting       |
          |                    +------------------+
          |
     +----v-----------------+
     |      Adapters        |
     |   (Site-specific)    |
     |   - SpareRoom        |
     |   - ...              |
     +----------------------+
```

## Commands

### `auth <site>`

Record authentication for a site.

Options:
- `--profile` - Use persistent profile (default: storage state)
- `--url <url>` - Custom login URL

### `run --site <site>`

Run orchestrator to fetch and draft replies.

Options:
- `--dry-run` - Don't send (default: true)
- `--max-threads <n>` - Max threads to process (default: 10)
- `--auth-mode <mode>` - storage or profile (default: storage)

### `review --site <site>`

Generate markdown review file.

Options:
- `--output <path>` - Custom output path

### `send --site <site> --review-file <path>`

Send approved replies from review file.

Options:
- `--auth-mode <mode>` - storage or profile (default: storage)

## Adding a New Site

Use the `/scaffold-adapter` skill in Claude Code:

1. Run `/scaffold-adapter` in Claude Code
2. Provide site name, URL, description
3. Implement selectors in `packages/adapters/{site}/src/selectors.ts`
4. Implement flows in `packages/adapters/{site}/src/flows.ts`
5. Test with dry-run

See `packages/adapters/spare-room/README.md` for implementation checklist.

## Safety Notes

**Important:**

- Always test with `--dry-run` first
- Review all drafts before sending
- Respect website Terms of Service
- Don't commit `.secrets/` directory
- Update selectors when site UI changes

## Troubleshooting

### Authentication expired

Re-run auth command:
```bash
pnpm dev auth <site>
```

### Selectors not working

1. Open site in browser
2. Inspect elements with DevTools
3. Update `packages/adapters/{site}/src/selectors.ts`
4. Test with dry-run

### Claude drafting fails

Check:
- `prompts/draft_reply.md` template
- Claude CLI is available (`claude --version`)
- Thread context is trimmed properly

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## License

MIT
