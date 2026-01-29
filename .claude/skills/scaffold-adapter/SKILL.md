---
name: scaffold-adapter
description: Generate new site adapter with boilerplate and TODO markers
---

# Scaffold Adapter

Creates a new adapter package for a website.

## Steps

1. Ask for adapter details:
   - Adapter name (kebab-case, e.g., "example-site")
   - Base URL (e.g., "https://example.com")
   - Brief description

2. Create directory structure:
   ```bash
   mkdir -p packages/adapters/{NAME}/src
   ```

3. Generate package.json (copy from spare-room, update name)

4. Generate tsconfig.json (copy from spare-room)

5. Generate src/selectors.ts with TODO comments:
   ```typescript
   export const SELECTORS = {
     // TODO: Update with actual selectors
   } as const;
   ```

6. Generate src/flows.ts with navigation stubs

7. Generate src/index.ts implementing SiteAdapter interface

8. Generate README.md with:
   - Implementation checklist
   - Selector update guide
   - Testing instructions

9. Run `pnpm install` in adapter directory

10. Add adapter to CLI (apps/cli/src/commands/run.ts and send.ts)

11. Commit with message: "feat(adapters): scaffold {NAME} adapter"
