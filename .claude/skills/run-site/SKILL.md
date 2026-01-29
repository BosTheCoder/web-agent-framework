---
name: run-site
description: Run orchestrator for a site in dry-run mode
---

# Run Site

Executes orchestrator for a site with safety checks.

## Steps

1. Ask for site name

2. Verify prerequisites:
   - Check auth exists (`.secrets/{site}.storageState.json` or `.secrets/profiles/{site}/`)
   - Check adapter exists (`packages/adapters/{site}/`)

3. Run in dry-run mode:
   ```bash
   cd apps/cli
   pnpm dev run --site {SITE} --dry-run
   ```

4. Display results:
   - Threads processed
   - Drafts created
   - Errors (if any)

5. If drafts created, offer to generate review:
   ```bash
   pnpm dev review --site {SITE}
   ```

6. Show review file path and next steps:
   ```
   Review file: data/review-{site}-{date}.md

   Next steps:
   1. Open and edit the review file
   2. Delete sections to reject drafts
   3. Edit draft text as needed
   4. Run: pnpm dev send --site {SITE} --review-file {PATH}
   ```
