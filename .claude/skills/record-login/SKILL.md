---
name: record-login
description: Guide user through recording authentication for a site
---

# Record Login

Guides user through authentication recording process.

## Steps

1. Ask for:
   - Site name
   - Login URL
   - Preferred auth mode (storage or profile)

2. Explain process:
   ```
   I'll run the auth command which will:
   1. Open a browser window
   2. Navigate to {URL}
   3. Wait for you to login manually
   4. Save authentication to .secrets/
   ```

3. Run command:
   ```bash
   cd apps/cli
   pnpm dev auth {SITE} --url {URL} [--profile]
   ```

4. After completion, verify file created:
   - Storage mode: `.secrets/{site}.storageState.json`
   - Profile mode: `.secrets/profiles/{site}/`

5. Test authentication:
   ```bash
   pnpm dev run --site {SITE} --dry-run --max-threads 1
   ```

6. If test fails, troubleshoot:
   - Check if login was successful
   - Verify site doesn't require 2FA re-auth
   - Try profile mode if storage mode failed
